"""Market data model for caching stock prices and financial data."""

from sqlalchemy import Column, String, Numeric, BigInteger, Date, DateTime, PrimaryKeyConstraint
from .base import Base
from datetime import datetime

class MarketData(Base):
    """Market data model for caching real-time financial information."""
    
    __tablename__ = "market_data"
    __table_args__ = (
        PrimaryKeyConstraint('symbol', 'data_date'),
    )
    
    # Primary key fields
    symbol = Column(String(20), nullable=False, index=True)
    data_date = Column(Date, nullable=False)
    
    # Price information
    price = Column(Numeric(15, 4), nullable=False)
    change_amount = Column(Numeric(15, 4), nullable=True)
    change_percent = Column(Numeric(8, 4), nullable=True)
    
    # Market information
    volume = Column(BigInteger, nullable=True)
    market_cap = Column(BigInteger, nullable=True)
    
    # Financial metrics
    pe_ratio = Column(Numeric(8, 2), nullable=True)
    dividend_yield = Column(Numeric(5, 4), nullable=True)
    beta = Column(Numeric(6, 4), nullable=True)
    
    # 52-week data
    fifty_two_week_high = Column(Numeric(15, 4), nullable=True)
    fifty_two_week_low = Column(Numeric(15, 4), nullable=True)
    
    # Metadata
    last_updated = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    @property
    def is_up(self) -> bool:
        """Check if price is up from previous close."""
        return self.change_amount is not None and self.change_amount > 0
    
    @property
    def is_down(self) -> bool:
        """Check if price is down from previous close."""
        return self.change_amount is not None and self.change_amount < 0
    
    @property
    def formatted_change(self) -> str:
        """Get formatted price change string."""
        if self.change_amount is None or self.change_percent is None:
            return "N/A"
        
        sign = "+" if self.change_amount >= 0 else ""
        return f"{sign}${self.change_amount} ({sign}{self.change_percent}%)"
    
    def __repr__(self):
        return f"<MarketData(symbol={self.symbol}, price=${self.price}, date={self.data_date})>"