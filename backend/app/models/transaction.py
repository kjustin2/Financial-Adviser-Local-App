"""Transaction model for buy/sell/dividend records."""

import enum

from sqlalchemy import Boolean, Column, Date
from sqlalchemy import Enum as SQLEnum
from sqlalchemy import ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from .base import BaseModel


class TransactionType(str, enum.Enum):
    """Transaction type classifications."""

    BUY = "buy"
    SELL = "sell"
    DIVIDEND = "dividend"
    INTEREST = "interest"
    FEE = "fee"
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"


class TaxLotMethod(str, enum.Enum):
    """Tax lot accounting methods."""

    FIFO = "fifo"  # First In, First Out
    LIFO = "lifo"  # Last In, First Out
    SPECIFIC_ID = "specific_id"
    AVERAGE_COST = "average_cost"


class Transaction(BaseModel):
    """Transaction model for tracking all portfolio transactions."""

    __tablename__ = "transactions"

    # Portfolio and holding relationships
    portfolio_id = Column(
        Integer, ForeignKey("portfolios.id"), nullable=False, index=True
    )
    holding_id = Column(Integer, ForeignKey("holdings.id"), nullable=True)

    # Transaction details
    transaction_type = Column(SQLEnum(TransactionType), nullable=False)
    symbol = Column(String(20), nullable=True)  # For transactions not tied to holdings
    quantity = Column(Numeric(15, 6), nullable=True)
    price = Column(Numeric(15, 4), nullable=True)
    total_amount = Column(Numeric(15, 2), nullable=False)
    fee = Column(Numeric(10, 2), default=0)

    # Dates
    transaction_date = Column(Date, nullable=False, index=True)
    settlement_date = Column(Date, nullable=True)

    # Additional information
    description = Column(Text, nullable=True)
    tax_lot_method = Column(SQLEnum(TaxLotMethod), default=TaxLotMethod.FIFO)
    is_tax_exempt = Column(Boolean, default=False)

    # Relationships
    portfolio = relationship("Portfolio", back_populates="transactions")
    holding = relationship("Holding", back_populates="transactions")

    @property
    def net_amount(self) -> Numeric:
        """Calculate net transaction amount after fees."""
        if self.transaction_type in [TransactionType.BUY, TransactionType.FEE]:
            return -(self.total_amount + self.fee)
        else:
            return self.total_amount - self.fee

    @property
    def is_purchase(self) -> bool:
        """Check if transaction is a purchase."""
        return self.transaction_type in [TransactionType.BUY, TransactionType.DEPOSIT]

    @property
    def is_sale(self) -> bool:
        """Check if transaction is a sale."""
        return self.transaction_type in [
            TransactionType.SELL,
            TransactionType.WITHDRAWAL,
        ]

    @property
    def is_income(self) -> bool:
        """Check if transaction is income (dividend/interest)."""
        return self.transaction_type in [
            TransactionType.DIVIDEND,
            TransactionType.INTEREST,
        ]

    def __repr__(self):
        return f"<Transaction(type={self.transaction_type}, symbol={self.symbol}, amount=${self.total_amount})>"
