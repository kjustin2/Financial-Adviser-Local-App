"""Holding model for individual security positions."""

import enum

from sqlalchemy import (
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    UniqueConstraint,
)
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import relationship

from .base import BaseModel


class SecurityType(str, enum.Enum):
    """Security type classifications."""

    STOCK = "stock"
    BOND = "bond"
    ETF = "etf"
    MUTUAL_FUND = "mutual_fund"
    CASH = "cash"
    CRYPTO = "crypto"
    OTHER = "other"


class AssetClass(str, enum.Enum):
    """Asset class classifications."""

    EQUITY = "equity"
    FIXED_INCOME = "fixed_income"
    CASH = "cash"
    ALTERNATIVE = "alternative"
    COMMODITY = "commodity"


class Holding(BaseModel):
    """Holding model for individual security positions in portfolios."""

    __tablename__ = "holdings"
    __table_args__ = (
        UniqueConstraint(
            "portfolio_id", "symbol", "purchase_date", name="_portfolio_symbol_date_uc"
        ),
    )

    # Portfolio relationship
    portfolio_id = Column(
        Integer, ForeignKey("portfolios.id"), nullable=False, index=True
    )

    # Security information
    symbol = Column(String(20), nullable=False, index=True)
    security_name = Column(String(255), nullable=True)
    security_type = Column(SQLEnum(SecurityType), nullable=False)

    # Position information
    quantity = Column(Numeric(15, 6), nullable=False)
    cost_basis = Column(Numeric(15, 4), nullable=False)  # Per share/unit cost basis
    purchase_date = Column(Date, nullable=False)

    # Current market data
    current_price = Column(Numeric(15, 4), nullable=True)
    last_price_update = Column(DateTime, nullable=True)

    # Classification
    sector = Column(String(100), nullable=True)
    asset_class = Column(SQLEnum(AssetClass), nullable=True)

    # Relationships
    portfolio = relationship("Portfolio", back_populates="holdings")
    transactions = relationship("Transaction", back_populates="holding")

    @property
    def total_cost_basis(self) -> Numeric:
        """Calculate total cost basis for this holding."""
        return self.quantity * self.cost_basis

    @property
    def current_value(self) -> Numeric:
        """Calculate current market value of holding."""
        price = self.current_price or self.cost_basis
        return self.quantity * price

    @property
    def unrealized_gain_loss(self) -> Numeric:
        """Calculate unrealized gain/loss for this holding."""
        return self.current_value - self.total_cost_basis

    @property
    def unrealized_gain_loss_percent(self) -> Numeric:
        """Calculate unrealized gain/loss percentage."""
        if self.total_cost_basis == 0:
            return Numeric("0.00")
        return (self.unrealized_gain_loss / self.total_cost_basis) * 100

    @property
    def is_profitable(self) -> bool:
        """Check if holding is currently profitable."""
        return self.unrealized_gain_loss > 0

    def __repr__(self):
        return f"<Holding(symbol={self.symbol}, quantity={self.quantity}, value=${self.current_value})>"
