"""Common Pydantic schemas and base classes."""

from pydantic import BaseModel, Field
from typing import Generic, TypeVar, List, Any, Optional
from datetime import datetime

T = TypeVar('T')

class StandardResponse(BaseModel, Generic[T]):
    """Standard API response format."""
    success: bool = True
    data: T
    message: str = "Operation completed successfully"
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class SuccessResponse(BaseModel):
    """Success response without data."""
    success: bool = True
    message: str = "Operation completed successfully"
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ErrorDetail(BaseModel):
    """Error detail information."""
    code: str
    message: str
    details: Optional[Any] = None

class ErrorResponse(BaseModel):
    """Error response format."""
    success: bool = False
    error: ErrorDetail
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class PaginationInfo(BaseModel):
    """Pagination metadata."""
    page: int = Field(ge=1, description="Current page number")
    size: int = Field(ge=1, le=100, description="Items per page")
    total: int = Field(ge=0, description="Total number of items")
    pages: int = Field(ge=0, description="Total number of pages")

class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response format."""
    success: bool = True
    data: List[T]
    pagination: PaginationInfo
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class BaseSchema(BaseModel):
    """Base schema with common configuration."""
    
    class Config:
        from_attributes = True
        str_strip_whitespace = True
        validate_assignment = True