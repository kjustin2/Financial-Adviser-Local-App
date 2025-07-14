"""Transaction management API endpoints."""

from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc

from ....api.deps import get_current_user
from ....database import get_db
from ....models.transaction import Transaction, TransactionType
from ....models.holding import Holding
from ....models.portfolio import Portfolio
from ....models.user import User
from ....schemas.transaction import (
    TransactionCreate,
    TransactionResponse,
    TransactionUpdate,
    TransactionListResponse,
)
from ....utils.transactions import db_transaction
from ....utils.logging import get_logger

logger = get_logger("transactions_api")
router = APIRouter()


@router.get("/", response_model=TransactionListResponse)
async def get_transactions(
    portfolio_id: Optional[int] = None,
    transaction_type: Optional[TransactionType] = None,
    symbol: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    """Get transactions for the user with optional filtering."""
    query = (
        db.query(Transaction)
        .join(Portfolio, Transaction.portfolio_id == Portfolio.id)
        .filter(Portfolio.user_id == current_user.id, Transaction.is_active is True)
        .order_by(desc(Transaction.transaction_date), desc(Transaction.created_at))
    )

    # Apply filters
    if portfolio_id:
        query = query.filter(Transaction.portfolio_id == portfolio_id)
    
    if transaction_type:
        query = query.filter(Transaction.type == transaction_type)
        
    if symbol:
        query = query.filter(Transaction.symbol.ilike(f"%{symbol}%"))
        
    if start_date:
        query = query.filter(Transaction.transaction_date >= start_date)
        
    if end_date:
        query = query.filter(Transaction.transaction_date <= end_date)

    # Get total count before pagination
    total_count = query.count()
    
    # Apply pagination
    transactions = query.offset(skip).limit(limit).all()

    # Build response
    transaction_responses = [_build_transaction_response(t) for t in transactions]
    
    return TransactionListResponse(
        transactions=transaction_responses,
        total_count=total_count,
        page=skip // limit + 1,
        page_size=limit,
        has_next=(skip + limit) < total_count,
        has_previous=skip > 0,
    )


@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    transaction_data: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new transaction and update holdings automatically."""
    # Verify the portfolio belongs to the user
    portfolio = (
        db.query(Portfolio)
        .filter(
            Portfolio.id == transaction_data.portfolio_id,
            Portfolio.user_id == current_user.id,
            Portfolio.is_active is True,
        )
        .first()
    )

    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found",
        )

    try:
        with db_transaction(db):
            # Create the transaction
            transaction = Transaction(
                portfolio_id=transaction_data.portfolio_id,
                type=transaction_data.type,
                symbol=transaction_data.symbol,
                security_name=transaction_data.security_name,
                quantity=transaction_data.quantity,
                price=transaction_data.price,
                total_amount=transaction_data.total_amount,
                fees=transaction_data.fees,
                transaction_date=transaction_data.transaction_date,
                trade_date=transaction_data.trade_date,
                settlement_date=transaction_data.settlement_date,
                notes=transaction_data.notes,
                external_transaction_id=transaction_data.external_transaction_id,
                tax_lot_id=transaction_data.tax_lot_id,
                wash_sale=transaction_data.wash_sale,
                from_portfolio_id=transaction_data.from_portfolio_id,
                to_portfolio_id=transaction_data.to_portfolio_id,
            )

            db.add(transaction)
            db.flush()  # Get transaction ID without committing

            # Update holdings based on transaction type
            _update_holdings_for_transaction(db, transaction)

            logger.info(
                f"Transaction created: {transaction.type.value} {transaction.symbol} "
                f"for user {current_user.id}",
                extra={
                    "user_id": current_user.id,
                    "portfolio_id": transaction.portfolio_id,
                    "transaction_id": transaction.id,
                    "symbol": transaction.symbol,
                    "amount": str(transaction.total_amount),
                }
            )

        # Refresh to get updated data
        db.refresh(transaction)
        return _build_transaction_response(transaction)

    except Exception as e:
        logger.error(
            f"Failed to create transaction: {str(e)}",
            extra={
                "user_id": current_user.id,
                "portfolio_id": transaction_data.portfolio_id,
                "symbol": transaction_data.symbol,
            }
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create transaction",
        )


@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific transaction by ID."""
    transaction = (
        db.query(Transaction)
        .join(Portfolio, Transaction.portfolio_id == Portfolio.id)
        .filter(
            Transaction.id == transaction_id,
            Portfolio.user_id == current_user.id,
            Transaction.is_active is True,
        )
        .first()
    )

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )

    return _build_transaction_response(transaction)


@router.put("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: int,
    transaction_data: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a transaction. Note: This may affect holdings calculations."""
    transaction = (
        db.query(Transaction)
        .join(Portfolio, Transaction.portfolio_id == Portfolio.id)
        .filter(
            Transaction.id == transaction_id,
            Portfolio.user_id == current_user.id,
            Transaction.is_active is True,
        )
        .first()
    )

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )

    try:
        with db_transaction(db):
            # Store original values for potential holding updates
            original_type = transaction.type
            original_symbol = transaction.symbol
            original_quantity = transaction.quantity

            # Update only provided fields
            update_data = transaction_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(transaction, field, value)

            # If the transaction affects holdings, we need to recalculate
            if (original_type != transaction.type or 
                original_symbol != transaction.symbol or 
                original_quantity != transaction.quantity):
                
                # For simplicity, we'll require manual recalculation
                # In a production system, you might implement more sophisticated logic
                logger.warning(
                    f"Transaction update may affect holdings calculations: {transaction_id}",
                    extra={"transaction_id": transaction_id, "user_id": current_user.id}
                )

        db.refresh(transaction)
        return _build_transaction_response(transaction)

    except Exception as e:
        logger.error(
            f"Failed to update transaction {transaction_id}: {str(e)}",
            extra={"transaction_id": transaction_id, "user_id": current_user.id}
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update transaction",
        )


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a transaction (soft delete). Note: This may affect holdings calculations."""
    transaction = (
        db.query(Transaction)
        .join(Portfolio, Transaction.portfolio_id == Portfolio.id)
        .filter(
            Transaction.id == transaction_id,
            Portfolio.user_id == current_user.id,
            Transaction.is_active is True,
        )
        .first()
    )

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )

    # Soft delete
    transaction.is_active = False
    db.commit()

    logger.info(
        f"Transaction deleted: {transaction_id}",
        extra={"transaction_id": transaction_id, "user_id": current_user.id}
    )

    return None


def _update_holdings_for_transaction(db: Session, transaction: Transaction):
    """Update or create holdings based on transaction."""
    if not transaction.quantity or transaction.quantity <= 0:
        # Skip holding updates for dividend/distribution transactions
        return

    # Find existing holding for this symbol in the portfolio
    existing_holding = (
        db.query(Holding)
        .filter(
            and_(
                Holding.portfolio_id == transaction.portfolio_id,
                Holding.symbol == transaction.symbol,
                Holding.is_active is True,
            )
        )
        .first()
    )

    if transaction.is_buy_transaction:
        if existing_holding:
            # Update existing holding - add to position
            transaction.update_holding_after_transaction(existing_holding)
        else:
            # Create new holding - default to stock type for new holdings
            from ....models.holding import SecurityType
            new_holding = Holding(
                portfolio_id=transaction.portfolio_id,
                symbol=transaction.symbol,
                security_name=transaction.security_name,
                security_type=SecurityType.STOCK,  # Default to stock for transaction-created holdings
                quantity=transaction.quantity,
                cost_basis=transaction.effective_price or transaction.price,
                purchase_date=transaction.transaction_date,
            )
            db.add(new_holding)

    elif transaction.is_sell_transaction:
        if existing_holding:
            # Update existing holding - reduce position
            transaction.update_holding_after_transaction(existing_holding)
            
            # If quantity becomes zero or negative, soft delete the holding
            if existing_holding.quantity <= 0:
                existing_holding.is_active = False
        else:
            # Cannot sell what we don't own
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot sell {transaction.symbol}: no existing holding found",
            )


def _build_transaction_response(transaction: Transaction) -> TransactionResponse:
    """Build a TransactionResponse from a Transaction model."""
    return TransactionResponse(
        id=transaction.id,
        portfolio_id=transaction.portfolio_id,
        type=transaction.type,
        symbol=transaction.symbol,
        security_name=transaction.security_name,
        quantity=transaction.quantity,
        price=transaction.price,
        total_amount=transaction.total_amount,
        fees=transaction.fees,
        transaction_date=transaction.transaction_date,
        trade_date=transaction.trade_date,
        settlement_date=transaction.settlement_date,
        notes=transaction.notes,
        external_transaction_id=transaction.external_transaction_id,
        tax_lot_id=transaction.tax_lot_id,
        wash_sale=transaction.wash_sale,
        from_portfolio_id=transaction.from_portfolio_id,
        to_portfolio_id=transaction.to_portfolio_id,
        created_at=transaction.created_at,
        updated_at=transaction.updated_at,
        is_active=transaction.is_active,
        net_amount=transaction.net_amount,
        effective_price=transaction.effective_price,
        is_buy_transaction=transaction.is_buy_transaction,
        is_sell_transaction=transaction.is_sell_transaction,
        is_income_transaction=transaction.is_income_transaction,
    )