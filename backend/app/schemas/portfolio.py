"""Portfolio schemas for portfolio management API (simplified)."""

from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field

# Import enums from models
from ..models.portfolio import PortfolioType
from .common import BaseSchema


class PortfolioBase(BaseModel):
    """Base portfolio schema with common fields (simplified)."""

    name: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    portfolio_type: Optional[PortfolioType] = PortfolioType.TAXABLE


class PortfolioCreate(PortfolioBase):
    """Schema for creating a new portfolio."""

    pass


class PortfolioUpdate(BaseModel):
    """Schema for updating an existing portfolio (simplified)."""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    portfolio_type: Optional[PortfolioType] = None


class PortfolioResponse(BaseSchema):
    """Schema for portfolio response (simplified)."""

    id: int
    user_id: int
    name: str
    description: Optional[str] = None
    portfolio_type: PortfolioType
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
    """Portfolio performance metrics (simplified)."""

    portfolio_id: int
    current_value: Decimal
    cost_basis: Decimal
    unrealized_gain_loss: Decimal
    unrealized_return_percent: Decimal


class PortfolioAllocation(BaseModel):
    """Portfolio allocation breakdown (simplified)."""

    symbol: str
    current_value: Decimal
    current_percent: float


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
    total_gain_loss: Decimal = Field(description="Total unrealized gain/loss across all portfolios")
    total_return_percent: Decimal = Field(description="Total return percentage across all portfolios")
    portfolios_count: int = Field(description="Number of active portfolios")
