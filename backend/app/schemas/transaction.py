from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel


class TransactionType(str, Enum):
    BUY = "buy"
    SELL = "sell"
    DIVIDEND = "dividend"
    SPLIT = "split"
    TRANSFER = "transfer"


class TransactionBase(BaseModel):
    portfolio_id: int
    symbol: str
    transaction_type: TransactionType
    quantity: Decimal
    price: Decimal
    transaction_date: datetime
    notes: Optional[str] = None


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    symbol: Optional[str] = None
    transaction_type: Optional[TransactionType] = None
    quantity: Optional[Decimal] = None
    price: Optional[Decimal] = None
    transaction_date: Optional[datetime] = None
    notes: Optional[str] = None


class TransactionResponse(TransactionBase):
    id: int
    total_value: Decimal
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TransactionList(BaseModel):
    transactions: List[TransactionResponse]
    total: int
    page: int
    per_page: int
