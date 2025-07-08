"""Holdings management API endpoints."""

from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ....api.deps import get_current_user
from ....database import get_db
from ....models.holding import Holding
from ....models.portfolio import Portfolio
from ....models.user import User
from ....schemas.holding import (
    BulkHoldingCreate,
    HoldingCreate,
    HoldingList,
    HoldingPerformance,
    HoldingPriceUpdate,
    HoldingResponse,
    HoldingSummary,
    HoldingUpdate,
)

router = APIRouter()


@router.get("/", response_model=HoldingList)
async def get_holdings(
    portfolio_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    """Get all holdings for the user, optionally filtered by portfolio."""
    query = (
        db.query(Holding)
        .join(Portfolio)
        .filter(Portfolio.user_id == current_user.id, Holding.is_active == True)
    )

    if portfolio_id:
        query = query.filter(Holding.portfolio_id == portfolio_id)

    holdings = query.offset(skip).limit(limit).all()

    holding_summaries = []
    total_value = Decimal("0.00")
    total_cost_basis = Decimal("0.00")
    total_unrealized_gain_loss = Decimal("0.00")

    for holding in holdings:
        current_value = holding.current_value
        cost_basis = holding.total_cost_basis
        unrealized_gain_loss = holding.unrealized_gain_loss

        summary = HoldingSummary(
            id=holding.id,
            symbol=holding.symbol,
            security_name=holding.security_name,
            security_type=holding.security_type,
            quantity=holding.quantity,
            current_value=current_value,
            unrealized_gain_loss=unrealized_gain_loss,
            unrealized_gain_loss_percent=holding.unrealized_gain_loss_percent,
            weight_in_portfolio=None,  # Calculate later if needed
        )
        holding_summaries.append(summary)
        total_value += current_value
        total_cost_basis += cost_basis
        total_unrealized_gain_loss += unrealized_gain_loss

    return HoldingList(
        holdings=holding_summaries,
        total_count=len(holdings),
        total_value=total_value,
        total_cost_basis=total_cost_basis,
        total_unrealized_gain_loss=total_unrealized_gain_loss,
    )


@router.post("/", response_model=HoldingResponse, status_code=status.HTTP_201_CREATED)
async def create_holding(
    holding_data: HoldingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new holding."""
    # Verify the portfolio belongs to the user
    portfolio = (
        db.query(Portfolio)
        .filter(
            Portfolio.id == holding_data.portfolio_id,
            Portfolio.user_id == current_user.id,
            Portfolio.is_active == True,
        )
        .first()
    )

    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found",
        )

    # Check if holding with same symbol already exists in portfolio
    existing_holding = (
        db.query(Holding)
        .filter(
            Holding.portfolio_id == holding_data.portfolio_id,
            Holding.symbol == holding_data.symbol,
            Holding.is_active == True,
        )
        .first()
    )

    if existing_holding:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Holding with symbol {holding_data.symbol} already exists in this portfolio",
        )

    holding = Holding(
        portfolio_id=holding_data.portfolio_id,
        symbol=holding_data.symbol,
        security_name=holding_data.security_name,
        security_type=holding_data.security_type,
        quantity=holding_data.quantity,
        cost_basis=holding_data.cost_basis,
        purchase_date=holding_data.purchase_date,
        sector=holding_data.sector,
        asset_class=holding_data.asset_class,
    )

    db.add(holding)
    db.commit()
    db.refresh(holding)

    return _build_holding_response(holding)


@router.get("/{holding_id}", response_model=HoldingResponse)
async def get_holding(
    holding_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific holding by ID."""
    holding = (
        db.query(Holding)
        .join(Portfolio)
        .filter(
            Holding.id == holding_id,
            Portfolio.user_id == current_user.id,
            Holding.is_active == True,
        )
        .first()
    )

    if not holding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Holding not found",
        )

    return _build_holding_response(holding)


@router.put("/{holding_id}", response_model=HoldingResponse)
async def update_holding(
    holding_id: int,
    holding_data: HoldingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a holding."""
    holding = (
        db.query(Holding)
        .join(Portfolio)
        .filter(
            Holding.id == holding_id,
            Portfolio.user_id == current_user.id,
            Holding.is_active == True,
        )
        .first()
    )

    if not holding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Holding not found",
        )

    # Update only provided fields
    update_data = holding_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(holding, field, value)

    db.commit()
    db.refresh(holding)

    return _build_holding_response(holding)


@router.delete("/{holding_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_holding(
    holding_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a holding (soft delete)."""
    holding = (
        db.query(Holding)
        .join(Portfolio)
        .filter(
            Holding.id == holding_id,
            Portfolio.user_id == current_user.id,
            Holding.is_active == True,
        )
        .first()
    )

    if not holding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Holding not found",
        )

    # Soft delete
    holding.is_active = False
    db.commit()

    return None


@router.post(
    "/bulk", response_model=List[HoldingResponse], status_code=status.HTTP_201_CREATED
)
async def create_bulk_holdings(
    bulk_data: BulkHoldingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create multiple holdings at once."""
    # Verify the portfolio belongs to the user
    portfolio = (
        db.query(Portfolio)
        .filter(
            Portfolio.id == bulk_data.portfolio_id,
            Portfolio.user_id == current_user.id,
            Portfolio.is_active == True,
        )
        .first()
    )

    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found",
        )

    # Check for duplicate symbols
    symbols = [h.symbol for h in bulk_data.holdings]
    if len(symbols) != len(set(symbols)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Duplicate symbols found in holdings list",
        )

    # Check for existing holdings with same symbols
    existing_holdings = (
        db.query(Holding)
        .filter(
            Holding.portfolio_id == bulk_data.portfolio_id,
            Holding.symbol.in_(symbols),
            Holding.is_active == True,
        )
        .all()
    )

    if existing_holdings:
        existing_symbols = [h.symbol for h in existing_holdings]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Holdings with symbols {existing_symbols} already exist in this portfolio",
        )

    # Create all holdings
    created_holdings = []
    for holding_data in bulk_data.holdings:
        holding = Holding(
            portfolio_id=bulk_data.portfolio_id,
            symbol=holding_data.symbol,
            security_name=holding_data.security_name,
            security_type=holding_data.security_type,
            quantity=holding_data.quantity,
            cost_basis=holding_data.cost_basis,
            purchase_date=holding_data.purchase_date,
            sector=holding_data.sector,
            asset_class=holding_data.asset_class,
        )
        db.add(holding)
        created_holdings.append(holding)

    db.commit()

    # Refresh all holdings and return response
    responses = []
    for holding in created_holdings:
        db.refresh(holding)
        responses.append(_build_holding_response(holding))

    return responses


@router.get("/{holding_id}/performance", response_model=HoldingPerformance)
async def get_holding_performance(
    holding_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get performance metrics for a specific holding."""
    holding = (
        db.query(Holding)
        .join(Portfolio)
        .filter(
            Holding.id == holding_id,
            Portfolio.user_id == current_user.id,
            Holding.is_active == True,
        )
        .first()
    )

    if not holding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Holding not found",
        )

    # Calculate weight in portfolio
    portfolio_value = holding.portfolio.total_value
    weight_in_portfolio = Decimal("0.00")
    if portfolio_value > 0:
        weight_in_portfolio = (holding.current_value / portfolio_value) * 100

    return HoldingPerformance(
        holding_id=holding.id,
        symbol=holding.symbol,
        current_value=holding.current_value,
        cost_basis=holding.total_cost_basis,
        unrealized_gain_loss=holding.unrealized_gain_loss,
        unrealized_gain_loss_percent=holding.unrealized_gain_loss_percent,
        weight_in_portfolio=weight_in_portfolio,
    )


@router.put("/{holding_id}/price", response_model=HoldingResponse)
async def update_holding_price(
    holding_id: int,
    price_data: HoldingPriceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update the current price of a holding."""
    holding = (
        db.query(Holding)
        .join(Portfolio)
        .filter(
            Holding.id == holding_id,
            Portfolio.user_id == current_user.id,
            Holding.is_active == True,
        )
        .first()
    )

    if not holding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Holding not found",
        )

    # Verify symbol matches
    if holding.symbol != price_data.symbol:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Symbol mismatch",
        )

    # Update price information
    holding.current_price = price_data.current_price
    holding.last_price_update = price_data.last_updated

    db.commit()
    db.refresh(holding)

    return _build_holding_response(holding)


def _build_holding_response(holding: Holding) -> HoldingResponse:
    """Build a HoldingResponse from a Holding model."""
    return HoldingResponse(
        id=holding.id,
        portfolio_id=holding.portfolio_id,
        symbol=holding.symbol,
        security_name=holding.security_name,
        security_type=holding.security_type,
        quantity=holding.quantity,
        cost_basis=holding.cost_basis,
        purchase_date=holding.purchase_date,
        current_price=holding.current_price,
        last_price_update=holding.last_price_update,
        sector=holding.sector,
        asset_class=holding.asset_class,
        is_active=holding.is_active,
        created_at=holding.created_at,
        updated_at=holding.updated_at,
        total_cost_basis=holding.total_cost_basis,
        current_value=holding.current_value,
        unrealized_gain_loss=holding.unrealized_gain_loss,
        unrealized_gain_loss_percent=holding.unrealized_gain_loss_percent,
        day_change=None,  # Would be calculated from market data
        day_change_percent=None,  # Would be calculated from market data
    )
