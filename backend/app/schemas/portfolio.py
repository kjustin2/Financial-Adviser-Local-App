"""Portfolio schemas for portfolio management API."""

from datetime import datetime
from decimal import Decimal
from typing import Dict, List, Optional

from pydantic import BaseModel, Field

# Import enums from models
from ..models.portfolio import PortfolioType, RebalanceFrequency, RiskLevel
from .common import BaseSchema


class PortfolioBase(BaseModel):
    """Base portfolio schema with common fields."""

    name: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    portfolio_type: Optional[PortfolioType] = PortfolioType.INVESTMENT
    target_allocation: Optional[Dict[str, float]] = Field(
        None,
        description="Asset allocation percentages (e.g., {'stocks': 60, 'bonds': 30, 'cash': 10})",
    )
    risk_level: Optional[RiskLevel] = RiskLevel.MODERATE
    benchmark_symbol: Optional[str] = Field(None, max_length=10)
    rebalance_frequency: Optional[RebalanceFrequency] = RebalanceFrequency.QUARTERLY
    rebalance_threshold: Optional[Decimal] = Field(
        Decimal("5.00"),
        ge=Decimal("1.00"),
        le=Decimal("20.00"),
        description="Rebalancing threshold percentage",
    )


class PortfolioCreate(PortfolioBase):
    """Schema for creating a new portfolio."""

    pass


class PortfolioUpdate(BaseModel):
    """Schema for updating an existing portfolio."""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    portfolio_type: Optional[PortfolioType] = None
    target_allocation: Optional[Dict[str, float]] = None
    risk_level: Optional[RiskLevel] = None
    benchmark_symbol: Optional[str] = Field(None, max_length=10)
    rebalance_frequency: Optional[RebalanceFrequency] = None
    rebalance_threshold: Optional[Decimal] = Field(
        None, ge=Decimal("1.00"), le=Decimal("20.00")
    )


class PortfolioResponse(BaseSchema):
    """Schema for portfolio response."""

    id: int
    user_id: int
    name: str
    description: Optional[str] = None
    portfolio_type: PortfolioType
    target_allocation: Optional[Dict[str, float]] = None
    risk_level: RiskLevel
    benchmark_symbol: Optional[str] = None
    rebalance_frequency: RebalanceFrequency
    rebalance_threshold: Decimal
    is_active: bool
    created_at: datetime
    updated_at: datetime

    # Calculated fields
    current_value: Decimal = Field(description="Current market value")
    total_cost_basis: Decimal = Field(description="Total cost basis")
    unrealized_gain_loss: Decimal = Field(description="Unrealized gain/loss")
    unrealized_return_percent: Decimal = Field(
        description="Unrealized return percentage"
    )
    holdings_count: int = Field(description="Number of holdings")


class PortfolioPerformance(BaseSchema):
    """Portfolio performance metrics."""

    portfolio_id: int
    current_value: Decimal
    cost_basis: Decimal
    unrealized_gain_loss: Decimal
    unrealized_return_percent: Decimal
    day_change: Optional[Decimal] = None
    day_change_percent: Optional[Decimal] = None
    ytd_return: Optional[Decimal] = None
    ytd_return_percent: Optional[Decimal] = None
    benchmark_return: Optional[Decimal] = None
    alpha: Optional[Decimal] = None
    beta: Optional[Decimal] = None
    sharpe_ratio: Optional[Decimal] = None


class PortfolioAllocation(BaseModel):
    """Portfolio asset allocation breakdown."""

    asset_class: str
    current_value: Decimal
    target_percent: Optional[float] = None
    current_percent: float
    drift: Optional[float] = None
    needs_rebalancing: bool = False


class PortfolioSummary(BaseSchema):
    """Abbreviated portfolio information for lists."""

    id: int
    name: str
    portfolio_type: PortfolioType
    current_value: Decimal
    unrealized_gain_loss: Decimal
    unrealized_return_percent: Decimal
    holdings_count: int
    last_updated: datetime


class PortfolioList(BaseModel):
    """List of portfolios with summary information."""

    portfolios: List[PortfolioSummary]
    total_count: int
    total_value: Decimal
