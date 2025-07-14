"""Transaction schemas for API serialization."""

from datetime import date
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, validator

from ..models.transaction import TransactionType


class TransactionBase(BaseModel):
    """Base transaction schema."""
    
    type: TransactionType
    symbol: str = Field(..., max_length=20)
    security_name: Optional[str] = Field(None, max_length=255)
    quantity: Optional[Decimal] = Field(None, ge=0, decimal_places=6)
    price: Optional[Decimal] = Field(None, ge=0, decimal_places=4)
    total_amount: Decimal = Field(..., decimal_places=2)
    fees: Decimal = Field(default=0, ge=0, decimal_places=2)
    transaction_date: date
    trade_date: Optional[date] = None
    settlement_date: Optional[date] = None
    notes: Optional[str] = None
    external_transaction_id: Optional[str] = Field(None, max_length=100)
    tax_lot_id: Optional[str] = Field(None, max_length=100)
    wash_sale: Optional[Decimal] = Field(default=0, decimal_places=2)
    from_portfolio_id: Optional[int] = None
    to_portfolio_id: Optional[int] = None

    @validator('quantity')
    def validate_quantity_for_type(cls, v, values):
        """Validate quantity based on transaction type."""
        if 'type' in values:
            transaction_type = values['type']
            # Quantity required for buy/sell transactions
            if transaction_type in [TransactionType.BUY, TransactionType.SELL, 
                                  TransactionType.TRANSFER_IN, TransactionType.TRANSFER_OUT]:
                if not v or v <= 0:
                    raise ValueError(f'Quantity is required for {transaction_type.value} transactions')
            # Quantity not applicable for dividends/distributions
            elif transaction_type in [TransactionType.DIVIDEND, TransactionType.DISTRIBUTION]:
                if v and v > 0:
                    raise ValueError(f'Quantity should not be specified for {transaction_type.value} transactions')
        return v

    @validator('price')
    def validate_price_for_type(cls, v, values):
        """Validate price based on transaction type."""
        if 'type' in values:
            transaction_type = values['type']
            # Price required for buy/sell transactions
            if transaction_type in [TransactionType.BUY, TransactionType.SELL]:
                if not v or v <= 0:
                    raise ValueError(f'Price is required for {transaction_type.value} transactions')
        return v


class TransactionCreate(TransactionBase):
    """Schema for creating transactions."""
    
    portfolio_id: int = Field(..., gt=0)


class TransactionUpdate(BaseModel):
    """Schema for updating transactions."""
    
    type: Optional[TransactionType] = None
    symbol: Optional[str] = Field(None, max_length=20)
    security_name: Optional[str] = Field(None, max_length=255)
    quantity: Optional[Decimal] = Field(None, ge=0, decimal_places=6)
    price: Optional[Decimal] = Field(None, ge=0, decimal_places=4)
    total_amount: Optional[Decimal] = Field(None, decimal_places=2)
    fees: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    transaction_date: Optional[date] = None
    trade_date: Optional[date] = None
    settlement_date: Optional[date] = None
    notes: Optional[str] = None
    external_transaction_id: Optional[str] = Field(None, max_length=100)
    tax_lot_id: Optional[str] = Field(None, max_length=100)
    wash_sale: Optional[Decimal] = Field(None, decimal_places=2)


class TransactionResponse(TransactionBase):
    """Schema for transaction responses."""
    
    id: int
    portfolio_id: int
    created_at: date
    updated_at: date
    is_active: bool
    
    # Computed properties
    net_amount: Decimal
    effective_price: Optional[Decimal]
    is_buy_transaction: bool
    is_sell_transaction: bool
    is_income_transaction: bool

    class Config:
        from_attributes = True


class TransactionListResponse(BaseModel):
    """Schema for transaction list responses."""
    
    transactions: list[TransactionResponse]
    total_count: int
    page: int
    page_size: int
    has_next: bool
    has_previous: bool