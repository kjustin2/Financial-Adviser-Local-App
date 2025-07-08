"""Authentication schemas for login and user management."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from .common import BaseSchema


class UserLogin(BaseModel):
    """User login request schema."""

    email: EmailStr
    password: str = Field(min_length=8, max_length=100)


class UserRegister(BaseModel):
    """User registration request schema."""

    email: EmailStr
    password: str = Field(min_length=8, max_length=100)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    firm_name: Optional[str] = Field(None, max_length=255)
    license_number: Optional[str] = Field(None, max_length=50)
    phone: Optional[str] = Field(None, max_length=20)


class UserUpdate(BaseModel):
    """User update request schema."""

    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    firm_name: Optional[str] = Field(None, max_length=255)
    license_number: Optional[str] = Field(None, max_length=50)
    phone: Optional[str] = Field(None, max_length=20)


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
    """User response schema."""

    id: int
    email: EmailStr
    first_name: str
    last_name: str
    firm_name: Optional[str] = None
    license_number: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    @property
    def full_name(self) -> str:
        """Get user's full name."""
        return f"{self.first_name} {self.last_name}"


# Forward reference resolution
TokenResponse.model_rebuild()
