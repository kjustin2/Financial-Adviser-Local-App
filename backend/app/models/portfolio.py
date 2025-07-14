"""Portfolio model for investment portfolios."""

import enum

from decimal import Decimal
from sqlalchemy import JSON, Column, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import relationship

from .base import BaseModel


class PortfolioType(str, enum.Enum):
    """Portfolio type classifications."""

    INVESTMENT = "investment"
    RETIREMENT = "retirement"
    EDUCATION = "education"
    TAXABLE = "taxable"
    TAX_DEFERRED = "tax_deferred"


class RiskLevel(str, enum.Enum):
    """Portfolio risk levels."""

    CONSERVATIVE = "conservative"
    MODERATE = "moderate"
    AGGRESSIVE = "aggressive"


class Portfolio(BaseModel):
    """Portfolio model for managing investment portfolios (simplified)."""

    __tablename__ = "portfolios"

    # User relationship
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Portfolio information (simplified)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    portfolio_type = Column(SQLEnum(PortfolioType), default=PortfolioType.TAXABLE)

    # Relationships
    user = relationship("User", back_populates="portfolios")
    holdings = relationship(
        "Holding", back_populates="portfolio", cascade="all, delete-orphan"
    )
    transactions = relationship(
        "Transaction", 
        back_populates="portfolio", 
        cascade="all, delete-orphan",
        foreign_keys="[Transaction.portfolio_id]"
    )

    @property
    def total_value(self) -> Decimal:
        """Calculate total portfolio value from holdings."""
        if not self.holdings:
            return Decimal("0.00")

        total = Decimal("0.00")
        for holding in self.holdings:
            if holding.is_active and holding.current_price:
                total += holding.quantity * holding.current_price
            elif holding.is_active:
                # Fallback to cost basis if no current price
                total += holding.quantity * holding.cost_basis
        return total

    @property
    def total_cost_basis(self) -> Decimal:
        """Calculate total cost basis of portfolio."""
        if not self.holdings:
            return Decimal("0.00")

        total = Decimal("0.00")
        for holding in self.holdings:
            if holding.is_active:
                total += holding.quantity * holding.cost_basis
        return total

    @property
    def unrealized_gain_loss(self) -> Decimal:
        """Calculate unrealized gain/loss."""
        return self.total_value - self.total_cost_basis

    @property
    def unrealized_return_percent(self) -> Decimal:
        """Calculate unrealized return percentage."""
        if self.total_cost_basis == 0:
            return Decimal("0.00")
        return (self.unrealized_gain_loss / self.total_cost_basis) * 100

    def __repr__(self):
        return f"<Portfolio(name={self.name}, type={self.portfolio_type}, value=${self.total_value})>"
