"""Pydantic schemas for API request/response models."""

from .auth import *
from .client import *
from .common import *
from .goal import *
from .holding import *
from .portfolio import *

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
    # Client schemas
    "ClientBase",
    "ClientCreate",
    "ClientUpdate",
    "ClientResponse",
    "ClientList",
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
    # Goal schemas
    "GoalBase",
    "GoalCreate",
    "GoalUpdate",
    "GoalResponse",
    "GoalList",
    "GoalContributionCreate",
    "GoalContributionResponse",
]
