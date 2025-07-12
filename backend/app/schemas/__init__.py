"""Pydantic schemas for API request/response models."""

from .auth import *
from .common import *
from .holding import *
from .portfolio import *
from .recommendation import *

__all__ = [
    # Common schemas
    "SuccessResponse",
    "ErrorResponse", 
    "PaginatedResponse",
    "StandardResponse",
    # Auth schemas
    "UserLogin",
    "UserRegister",
    "TokenResponse",
    "UserResponse",
    # Portfolio schemas
    "PortfolioBase",
    "PortfolioCreate",
    "PortfolioUpdate",
    "PortfolioResponse",
    "PortfolioList",
    "PortfolioPerformance",
    # Holding schemas
    "HoldingBase",
    "HoldingCreate",
    "HoldingUpdate",
    "HoldingResponse",
    "HoldingList",
    # Recommendation schemas
    "RecommendationResponse",
    "FinancialSummaryResponse",
]
