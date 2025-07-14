"""Transaction model for recording buy/sell/dividend transactions."""

import enum
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import relationship

from .base import BaseModel


class TransactionType(str, enum.Enum):
    """Transaction type classifications."""

    BUY = "buy"
    SELL = "sell"
    DIVIDEND = "dividend"
    DISTRIBUTION = "distribution"
    TRANSFER_IN = "transfer_in"
    TRANSFER_OUT = "transfer_out"
    SPLIT = "split"
    MERGER = "merger"
    SPINOFF = "spinoff"


class Transaction(BaseModel):
    """Transaction model for recording all portfolio transactions."""

    __tablename__ = "transactions"

    # Portfolio relationship
    portfolio_id = Column(
        Integer, ForeignKey("portfolios.id"), nullable=False, index=True
    )

    # Transaction details
    type = Column(SQLEnum(TransactionType), nullable=False, index=True)
    symbol = Column(String(20), nullable=False, index=True)
    security_name = Column(String(255), nullable=True)
    
    # Transaction amounts
    quantity = Column(Numeric(15, 6), nullable=True)  # Shares/units (null for dividends)
    price = Column(Numeric(15, 4), nullable=True)  # Price per share/unit
    total_amount = Column(Numeric(15, 2), nullable=False)  # Total transaction amount
    fees = Column(Numeric(10, 2), nullable=False, default=0)  # Commission and fees
    
    # Transaction date and identification
    transaction_date = Column(Date, nullable=False, index=True)
    trade_date = Column(Date, nullable=True)  # May differ from transaction date
    settlement_date = Column(Date, nullable=True)
    
    # Additional details
    notes = Column(Text, nullable=True)
    external_transaction_id = Column(String(100), nullable=True)  # Broker transaction ID
    
    # Tax and accounting
    tax_lot_id = Column(String(100), nullable=True)  # For tax-lot matching
    wash_sale = Column(Numeric(10, 2), nullable=True, default=0)  # Wash sale adjustment
    
    # Transfer details (for transfer transactions)
    from_portfolio_id = Column(Integer, ForeignKey("portfolios.id"), nullable=True)
    to_portfolio_id = Column(Integer, ForeignKey("portfolios.id"), nullable=True)

    # Relationships
    portfolio = relationship("Portfolio", foreign_keys=[portfolio_id], back_populates="transactions")
    from_portfolio = relationship("Portfolio", foreign_keys=[from_portfolio_id])
    to_portfolio = relationship("Portfolio", foreign_keys=[to_portfolio_id])

    @property
    def net_amount(self) -> Decimal:
        """Calculate net amount after fees."""
        if self.type in [TransactionType.BUY, TransactionType.TRANSFER_IN]:
            return self.total_amount + self.fees
        else:
            return self.total_amount - self.fees

    @property
    def effective_price(self) -> Optional[Decimal]:
        """Calculate effective price per share including fees."""
        if not self.quantity or self.quantity == 0:
            return None
        return self.net_amount / self.quantity

    @property
    def is_buy_transaction(self) -> bool:
        """Check if this is a buy-type transaction."""
        return self.type in [TransactionType.BUY, TransactionType.TRANSFER_IN]

    @property
    def is_sell_transaction(self) -> bool:
        """Check if this is a sell-type transaction."""
        return self.type in [TransactionType.SELL, TransactionType.TRANSFER_OUT]

    @property
    def is_income_transaction(self) -> bool:
        """Check if this is an income-type transaction."""
        return self.type in [TransactionType.DIVIDEND, TransactionType.DISTRIBUTION]

    def update_holding_after_transaction(self, holding) -> None:
        """Update holding after this transaction is recorded."""
        if self.is_buy_transaction and self.quantity:
            # Add to position
            new_total_cost = (holding.quantity * holding.cost_basis) + (self.quantity * self.effective_price)
            new_quantity = holding.quantity + self.quantity
            holding.cost_basis = new_total_cost / new_quantity if new_quantity > 0 else Decimal('0')
            holding.quantity = new_quantity
            
        elif self.is_sell_transaction and self.quantity:
            # Reduce position
            holding.quantity = max(Decimal('0'), holding.quantity - self.quantity)
            # Cost basis per share remains the same for remaining shares

    def __repr__(self):
        return f"<Transaction(type={self.type}, symbol={self.symbol}, amount=${self.total_amount}, date={self.transaction_date})>"