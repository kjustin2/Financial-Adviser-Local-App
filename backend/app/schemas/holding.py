"""Holding schemas for investment holdings API."""

from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field

# Import enums from models
from ..models.holding import AssetClass, SecurityType
from .common import BaseSchema


class HoldingBase(BaseModel):
    """Base holding schema with common fields."""

    symbol: str = Field(
        min_length=1, max_length=20, description="Security symbol (e.g., AAPL, VTI)"
    )
    security_name: Optional[str] = Field(
        None, max_length=255, description="Full security name"
    )
    security_type: SecurityType
    quantity: Decimal = Field(
        gt=0, decimal_places=6, description="Number of shares/units"
    )
    cost_basis: Decimal = Field(
        gt=0, decimal_places=4, description="Cost per share/unit"
    )
    purchase_date: date = Field(description="Purchase date")
    sector: Optional[str] = Field(
        None, max_length=100, description="Sector classification"
    )
    asset_class: Optional[AssetClass] = None


class HoldingCreate(HoldingBase):
    """Schema for creating a new holding."""

    portfolio_id: int = Field(gt=0, description="Portfolio ID")


class HoldingUpdate(BaseModel):
    """Schema for updating an existing holding."""

    security_name: Optional[str] = Field(None, max_length=255)
    quantity: Optional[Decimal] = Field(None, gt=0, decimal_places=6)
    cost_basis: Optional[Decimal] = Field(None, gt=0, decimal_places=4)
    sector: Optional[str] = Field(None, max_length=100)
    asset_class: Optional[AssetClass] = None


class HoldingResponse(BaseSchema):
    """Schema for holding response."""

    id: int
    portfolio_id: int
    symbol: str
    security_name: Optional[str] = None
    security_type: SecurityType
    quantity: Decimal
    cost_basis: Decimal
    purchase_date: date
    current_price: Optional[Decimal] = None
    last_price_update: Optional[datetime] = None
    sector: Optional[str] = None
    asset_class: Optional[AssetClass] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    # Calculated fields
    total_cost_basis: Decimal = Field(description="Total cost basis")
    current_value: Decimal = Field(description="Current market value")
    unrealized_gain_loss: Decimal = Field(description="Unrealized gain/loss")
    unrealized_gain_loss_percent: Decimal = Field(
        description="Unrealized gain/loss percentage"
    )
    day_change: Optional[Decimal] = Field(None, description="Daily price change")
    day_change_percent: Optional[Decimal] = Field(
        None, description="Daily percentage change"
    )


class HoldingPerformance(BaseModel):
    """Holding performance metrics."""

    holding_id: int
    symbol: str
    current_value: Decimal
    cost_basis: Decimal
    unrealized_gain_loss: Decimal
    unrealized_gain_loss_percent: Decimal
    weight_in_portfolio: Decimal = Field(
        description="Weight as percentage of portfolio"
    )


class HoldingSummary(BaseSchema):
    """Abbreviated holding information for lists."""

    id: int
    symbol: str
    security_name: Optional[str] = None
    security_type: SecurityType
    quantity: Decimal
    current_value: Decimal
    unrealized_gain_loss: Decimal
    unrealized_gain_loss_percent: Decimal
    weight_in_portfolio: Optional[Decimal] = None


class HoldingList(BaseModel):
    """List of holdings with summary information."""

    holdings: List[HoldingSummary]
    total_count: int
    total_value: Decimal
    total_cost_basis: Decimal
    total_unrealized_gain_loss: Decimal


class BulkHoldingCreate(BaseModel):
    """Schema for creating multiple holdings at once."""

    portfolio_id: int = Field(gt=0)
    holdings: List[HoldingBase] = Field(min_items=1, max_items=100)


class HoldingPriceUpdate(BaseModel):
    """Schema for updating holding prices."""

    symbol: str = Field(min_length=1, max_length=20)
    current_price: Decimal = Field(gt=0, decimal_places=4)
    change_amount: Optional[Decimal] = Field(None, decimal_places=4)
    change_percent: Optional[Decimal] = Field(None, decimal_places=4)
    last_updated: datetime = Field(default_factory=datetime.utcnow)
