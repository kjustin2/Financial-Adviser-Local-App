"""Authentication schemas for login and user management."""

from datetime import datetime, date
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field

from .common import BaseSchema


class UserLogin(BaseModel):
    """User login request schema."""

    email: EmailStr
    password: str = Field(min_length=8, max_length=100)


class UserRegister(BaseModel):
    """User registration request schema for individual investors."""

    email: EmailStr
    password: str = Field(min_length=8, max_length=100)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    date_of_birth: Optional[date] = Field(None, description="Date of birth for age-based recommendations")
    
    # Individual investor specific fields
    investment_experience: Optional[str] = Field(
        default='intermediate', 
        description="Investment experience level: beginner, intermediate, advanced"
    )
    risk_tolerance: Optional[str] = Field(
        default='moderate',
        description="Risk tolerance: conservative, moderate, aggressive"
    )
    investment_style: Optional[str] = Field(
        None, max_length=50,
        description="Investment style preference: growth, value, balanced, income"
    )
    financial_goals: Optional[List[str]] = Field(
        default_factory=list,
        description="List of financial goals: retirement, growth, income, college_fund, emergency_fund"
    )
    net_worth_range: Optional[str] = Field(
        None,
        description="Net worth range: under_100k, 100k_200k, 200k_500k, 500k_plus"
    )
    time_horizon: Optional[str] = Field(
        default='long_term',
        description="Investment time horizon: short_term, medium_term, long_term"
    )


class UserUpdate(BaseModel):
    """User update request schema for individual investors."""

    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    date_of_birth: Optional[date] = Field(None, description="Date of birth for age-based recommendations")
    
    # Individual investor specific fields
    investment_experience: Optional[str] = Field(None)
    risk_tolerance: Optional[str] = Field(None)
    investment_style: Optional[str] = Field(None, max_length=50)
    financial_goals: Optional[List[str]] = Field(None)
    net_worth_range: Optional[str] = Field(None)
    time_horizon: Optional[str] = Field(None)


class PasswordChange(BaseModel):
    """Password change request schema."""

    current_password: str = Field(min_length=8, max_length=100)
    new_password: str = Field(min_length=8, max_length=100)


class TokenResponse(BaseModel):
    """JWT token response schema."""

    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: "UserResponse"


class UserResponse(BaseSchema):
    """User response schema for individual investors."""

    id: int
    email: EmailStr
    first_name: str
    last_name: str
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    
    # Individual investor profile
    investment_experience: Optional[str] = None
    risk_tolerance: Optional[str] = None
    investment_style: Optional[str] = None
    financial_goals: Optional[str] = None  # JSON string
    net_worth_range: Optional[str] = None
    time_horizon: Optional[str] = None
    
    is_active: bool
    created_at: datetime
    updated_at: datetime

    @property
    def full_name(self) -> str:
        """Get user's full name."""
        return f"{self.first_name} {self.last_name}"

    class Config:
        from_attributes = True


# Forward reference resolution
TokenResponse.model_rebuild()
