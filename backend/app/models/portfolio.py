"""Portfolio model for investment portfolios."""

import enum

from sqlalchemy import JSON, Column
from sqlalchemy import Enum as SQLEnum
from sqlalchemy import ForeignKey, Integer, Numeric, String, Text
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


class RebalanceFrequency(str, enum.Enum):
    """Rebalancing frequency options."""

    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    SEMIANNUAL = "semiannual"
    ANNUAL = "annual"


class Portfolio(BaseModel):
    """Portfolio model for managing investment portfolios."""

    __tablename__ = "portfolios"

    # User relationship
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Portfolio information
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    portfolio_type = Column(SQLEnum(PortfolioType), default=PortfolioType.INVESTMENT)

    # Asset allocation target (JSON: {"stocks": 60, "bonds": 30, "cash": 10})
    target_allocation = Column(JSON, nullable=True)

    # Risk and rebalancing settings
    risk_level = Column(SQLEnum(RiskLevel), default=RiskLevel.MODERATE)
    benchmark_symbol = Column(String(10), nullable=True)  # e.g., "SPY" for S&P 500
    rebalance_frequency = Column(
        SQLEnum(RebalanceFrequency), default=RebalanceFrequency.QUARTERLY
    )
    rebalance_threshold = Column(Numeric(5, 2), default=5.00)  # 5% deviation threshold

    # Relationships
    user = relationship("User", back_populates="portfolios")
    holdings = relationship(
        "Holding", back_populates="portfolio", cascade="all, delete-orphan"
    )
    transactions = relationship(
        "Transaction", back_populates="portfolio", cascade="all, delete-orphan"
    )
    reports = relationship("Report", back_populates="portfolio")

    @property
    def total_value(self) -> Numeric:
        """Calculate total portfolio value from holdings."""
        if not self.holdings:
            return Numeric("0.00")

        total = Numeric("0.00")
        for holding in self.holdings:
            if holding.is_active and holding.current_price:
                total += holding.quantity * holding.current_price
            elif holding.is_active:
                # Fallback to cost basis if no current price
                total += holding.quantity * holding.cost_basis
        return total

    @property
    def total_cost_basis(self) -> Numeric:
        """Calculate total cost basis of portfolio."""
        if not self.holdings:
            return Numeric("0.00")

        return sum(
            holding.quantity * holding.cost_basis
            for holding in self.holdings
            if holding.is_active
        )

    @property
    def unrealized_gain_loss(self) -> Numeric:
        """Calculate unrealized gain/loss."""
        return self.total_value - self.total_cost_basis

    @property
    def unrealized_return_percent(self) -> Numeric:
        """Calculate unrealized return percentage."""
        if self.total_cost_basis == 0:
            return Numeric("0.00")
        return (self.unrealized_gain_loss / self.total_cost_basis) * 100

    def __repr__(self):
        return f"<Portfolio(name={self.name}, type={self.portfolio_type}, value=${self.total_value})>"
