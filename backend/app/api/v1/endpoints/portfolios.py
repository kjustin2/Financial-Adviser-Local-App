"""Portfolio management API endpoints."""

from decimal import Decimal
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ....database import get_db
from ....models.portfolio import Portfolio
from ....models.user import User
from ....schemas.portfolio import (
    PortfolioAllocation,
    PortfolioCreate,
    PortfolioList,
    PortfolioPerformance,
    PortfolioResponse,
    PortfolioSummary,
    PortfolioUpdate,
)
from ...deps import get_current_user

router = APIRouter()


@router.get("/", response_model=PortfolioList)
async def get_portfolios(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    """Get all portfolios for the current user."""
    portfolios = (
        db.query(Portfolio)
        .filter(Portfolio.user_id == current_user.id, Portfolio.is_active is True)
        .offset(skip)
        .limit(limit)
        .all()
    )

    portfolio_summaries = []
    total_value = Decimal("0.00")

    for portfolio in portfolios:
        summary = PortfolioSummary(
            id=portfolio.id,
            name=portfolio.name,
            portfolio_type=portfolio.portfolio_type,
            current_value=portfolio.total_value,
            unrealized_gain_loss=portfolio.unrealized_gain_loss,
            unrealized_return_percent=portfolio.unrealized_return_percent,
            holdings_count=len([h for h in portfolio.holdings if h.is_active]),
            last_updated=portfolio.updated_at,
        )
        portfolio_summaries.append(summary)
        total_value += portfolio.total_value

    return PortfolioList(
        portfolios=portfolio_summaries,
        total_count=len(portfolios),
        total_value=total_value,
    )


@router.post("/", response_model=PortfolioResponse, status_code=status.HTTP_201_CREATED)
async def create_portfolio(
    portfolio_data: PortfolioCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new portfolio for the current user."""
    portfolio = Portfolio(
        user_id=current_user.id,
        name=portfolio_data.name,
        description=portfolio_data.description,
        portfolio_type=portfolio_data.portfolio_type,
        target_allocation=portfolio_data.target_allocation,
        risk_level=portfolio_data.risk_level,
        benchmark_symbol=portfolio_data.benchmark_symbol,
        rebalance_frequency=portfolio_data.rebalance_frequency,
        rebalance_threshold=portfolio_data.rebalance_threshold,
    )

    db.add(portfolio)
    db.commit()
    db.refresh(portfolio)

    return PortfolioResponse(
        id=portfolio.id,
        user_id=portfolio.user_id,
        name=portfolio.name,
        description=portfolio.description,
        portfolio_type=portfolio.portfolio_type,
        target_allocation=portfolio.target_allocation,
        risk_level=portfolio.risk_level,
        benchmark_symbol=portfolio.benchmark_symbol,
        rebalance_frequency=portfolio.rebalance_frequency,
        rebalance_threshold=portfolio.rebalance_threshold,
        is_active=portfolio.is_active,
        created_at=portfolio.created_at,
        updated_at=portfolio.updated_at,
        current_value=portfolio.total_value,
        total_cost_basis=portfolio.total_cost_basis,
        unrealized_gain_loss=portfolio.unrealized_gain_loss,
        unrealized_return_percent=portfolio.unrealized_return_percent,
        holdings_count=len([h for h in portfolio.holdings if h.is_active]),
    )


@router.get("/{portfolio_id}", response_model=PortfolioResponse)
async def get_portfolio(
    portfolio_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific portfolio by ID."""
    portfolio = (
        db.query(Portfolio)
        .filter(
            Portfolio.id == portfolio_id,
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

    return PortfolioResponse(
        id=portfolio.id,
        user_id=portfolio.user_id,
        name=portfolio.name,
        description=portfolio.description,
        portfolio_type=portfolio.portfolio_type,
        target_allocation=portfolio.target_allocation,
        risk_level=portfolio.risk_level,
        benchmark_symbol=portfolio.benchmark_symbol,
        rebalance_frequency=portfolio.rebalance_frequency,
        rebalance_threshold=portfolio.rebalance_threshold,
        is_active=portfolio.is_active,
        created_at=portfolio.created_at,
        updated_at=portfolio.updated_at,
        current_value=portfolio.total_value,
        total_cost_basis=portfolio.total_cost_basis,
        unrealized_gain_loss=portfolio.unrealized_gain_loss,
        unrealized_return_percent=portfolio.unrealized_return_percent,
        holdings_count=len([h for h in portfolio.holdings if h.is_active]),
    )


@router.put("/{portfolio_id}", response_model=PortfolioResponse)
async def update_portfolio(
    portfolio_id: int,
    portfolio_data: PortfolioUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a portfolio."""
    portfolio = (
        db.query(Portfolio)
        .filter(
            Portfolio.id == portfolio_id,
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

    # Update only provided fields
    update_data = portfolio_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(portfolio, field, value)

    db.commit()
    db.refresh(portfolio)

    return PortfolioResponse(
        id=portfolio.id,
        user_id=portfolio.user_id,
        name=portfolio.name,
        description=portfolio.description,
        portfolio_type=portfolio.portfolio_type,
        target_allocation=portfolio.target_allocation,
        risk_level=portfolio.risk_level,
        benchmark_symbol=portfolio.benchmark_symbol,
        rebalance_frequency=portfolio.rebalance_frequency,
        rebalance_threshold=portfolio.rebalance_threshold,
        is_active=portfolio.is_active,
        created_at=portfolio.created_at,
        updated_at=portfolio.updated_at,
        current_value=portfolio.total_value,
        total_cost_basis=portfolio.total_cost_basis,
        unrealized_gain_loss=portfolio.unrealized_gain_loss,
        unrealized_return_percent=portfolio.unrealized_return_percent,
        holdings_count=len([h for h in portfolio.holdings if h.is_active]),
    )


@router.delete("/{portfolio_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_portfolio(
    portfolio_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a portfolio (soft delete)."""
    portfolio = (
        db.query(Portfolio)
        .filter(
            Portfolio.id == portfolio_id,
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

    # Soft delete
    portfolio.is_active = False
    db.commit()

    return None


@router.get("/{portfolio_id}/performance", response_model=PortfolioPerformance)
async def get_portfolio_performance(
    portfolio_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get portfolio performance metrics."""
    portfolio = (
        db.query(Portfolio)
        .filter(
            Portfolio.id == portfolio_id,
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

    # Basic performance metrics (can be enhanced with service layer)
    return PortfolioPerformance(
        portfolio_id=portfolio.id,
        current_value=portfolio.total_value,
        cost_basis=portfolio.total_cost_basis,
        unrealized_gain_loss=portfolio.unrealized_gain_loss,
        unrealized_return_percent=portfolio.unrealized_return_percent,
        # Advanced metrics would be calculated by service layer
        day_change=None,
        day_change_percent=None,
        ytd_return=None,
        ytd_return_percent=None,
        benchmark_return=None,
        alpha=None,
        beta=None,
        sharpe_ratio=None,
    )


@router.get("/{portfolio_id}/allocation", response_model=List[PortfolioAllocation])
async def get_portfolio_allocation(
    portfolio_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get portfolio asset allocation breakdown."""
    portfolio = (
        db.query(Portfolio)
        .filter(
            Portfolio.id == portfolio_id,
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

    # Calculate allocation breakdown
    allocation_data = []
    total_value = portfolio.total_value

    if total_value > 0:
        # Group holdings by asset class (simplified)
        asset_classes = {}
        for holding in portfolio.holdings:
            if holding.is_active:
                asset_class = holding.asset_class or "Unknown"
                if asset_class not in asset_classes:
                    asset_classes[asset_class] = Decimal("0.00")
                asset_classes[asset_class] += holding.quantity * (
                    holding.current_price or holding.cost_basis
                )

        for asset_class, current_value in asset_classes.items():
            current_percent = float((current_value / total_value) * 100)
            target_percent = None
            drift = None

            if (
                portfolio.target_allocation
                and asset_class.lower() in portfolio.target_allocation
            ):
                target_percent = portfolio.target_allocation[asset_class.lower()]
                drift = current_percent - target_percent

            allocation_data.append(
                PortfolioAllocation(
                    asset_class=asset_class,
                    current_value=current_value,
                    target_percent=target_percent,
                    current_percent=current_percent,
                    drift=drift,
                    needs_rebalancing=drift is not None
                    and abs(drift) > float(portfolio.rebalance_threshold),
                )
            )

    return allocation_data
