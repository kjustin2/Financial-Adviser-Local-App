"""Client schemas for client management API."""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
from .common import BaseSchema

# Import enums from models
from ..models.client import RiskTolerance, EmploymentStatus

class ClientBase(BaseModel):
    """Base client schema with common fields."""
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    date_of_birth: Optional[date] = None
    address_line1: Optional[str] = Field(None, max_length=255)
    address_line2: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=50)
    zip_code: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = Field("USA", max_length=100)
    risk_tolerance: Optional[RiskTolerance] = RiskTolerance.MODERATE
    annual_income: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    net_worth: Optional[Decimal] = Field(None, decimal_places=2)
    employment_status: Optional[EmploymentStatus] = None
    retirement_age: Optional[int] = Field(None, ge=50, le=100)
    notes: Optional[str] = None

class ClientCreate(ClientBase):
    """Schema for creating a new client."""
    pass

class ClientUpdate(BaseModel):
    """Schema for updating an existing client."""
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    date_of_birth: Optional[date] = None
    address_line1: Optional[str] = Field(None, max_length=255)
    address_line2: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=50)
    zip_code: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = Field(None, max_length=100)
    risk_tolerance: Optional[RiskTolerance] = None
    annual_income: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    net_worth: Optional[Decimal] = Field(None, decimal_places=2)
    employment_status: Optional[EmploymentStatus] = None
    retirement_age: Optional[int] = Field(None, ge=50, le=100)
    notes: Optional[str] = None

class ClientResponse(BaseSchema):
    """Schema for client response."""
    id: int
    user_id: int
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: str
    risk_tolerance: RiskTolerance
    annual_income: Optional[Decimal] = None
    net_worth: Optional[Decimal] = None
    employment_status: Optional[EmploymentStatus] = None
    retirement_age: Optional[int] = None
    notes: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    # Computed fields
    full_name: str = Field(description="Client's full name")
    age: Optional[int] = Field(None, description="Client's age")
    total_portfolio_value: Optional[Decimal] = Field(None, description="Total value of all portfolios")
    
    @property
    def full_name_property(self) -> str:
        """Get client's full name."""
        return f"{self.first_name} {self.last_name}"

class ClientSummary(BaseSchema):
    """Abbreviated client information for lists."""
    id: int
    first_name: str
    last_name: str
    email: Optional[str] = None
    risk_tolerance: RiskTolerance
    total_portfolio_value: Optional[Decimal] = None
    portfolios_count: int = 0
    goals_count: int = 0
    last_contact: Optional[datetime] = None

class ClientList(BaseModel):
    """List of clients with summary information."""
    clients: List[ClientSummary]
    total_count: int