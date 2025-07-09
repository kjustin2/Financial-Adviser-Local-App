from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.portfolio import Portfolio
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.common import SuccessResponse
from app.schemas.transaction import (
    TransactionCreate,
    TransactionList,
    TransactionResponse,
    TransactionUpdate,
)

router = APIRouter()


@router.post("/", response_model=TransactionResponse)
async def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new transaction"""
    # Verify portfolio ownership
    portfolio = (
        db.query(Portfolio)
        .filter(
            Portfolio.id == transaction.portfolio_id,
            Portfolio.user_id == current_user.id,
            Portfolio.is_active == True,
        )
        .first()
    )

    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    db_transaction = Transaction(**transaction.dict())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)

    return db_transaction


@router.get("/", response_model=TransactionList)
async def get_transactions(
    portfolio_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get user's transactions"""
    query = (
        db.query(Transaction)
        .join(Portfolio)
        .filter(Portfolio.user_id == current_user.id, Transaction.is_active == True)
    )

    if portfolio_id:
        query = query.filter(Transaction.portfolio_id == portfolio_id)

    total = query.count()
    transactions = (
        query.order_by(Transaction.transaction_date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return TransactionList(
        transactions=transactions, total=total, page=skip // limit + 1, per_page=limit
    )


@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific transaction"""
    transaction = (
        db.query(Transaction)
        .join(Portfolio)
        .filter(
            Transaction.id == transaction_id,
            Portfolio.user_id == current_user.id,
            Transaction.is_active == True,
        )
        .first()
    )

    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    return transaction


@router.put("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: int,
    transaction: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a transaction"""
    db_transaction = (
        db.query(Transaction)
        .join(Portfolio)
        .filter(
            Transaction.id == transaction_id,
            Portfolio.user_id == current_user.id,
            Transaction.is_active == True,
        )
        .first()
    )

    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    for field, value in transaction.dict(exclude_unset=True).items():
        setattr(db_transaction, field, value)

    db.commit()
    db.refresh(db_transaction)

    return db_transaction


@router.delete("/{transaction_id}", response_model=SuccessResponse)
async def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a transaction"""
    db_transaction = (
        db.query(Transaction)
        .join(Portfolio)
        .filter(
            Transaction.id == transaction_id,
            Portfolio.user_id == current_user.id,
            Transaction.is_active == True,
        )
        .first()
    )

    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    db_transaction.is_active = False
    db.commit()

    return SuccessResponse(message="Transaction deleted successfully")
