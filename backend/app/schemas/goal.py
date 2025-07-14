"""Goal schemas for financial goals management API."""

from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field

from ..models.goal import GoalCategory, GoalPriority
from .common import BaseSchema


class GoalBase(BaseModel):
    """Base goal schema with common fields."""

    name: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    target_amount: Decimal = Field(gt=0, description="Target amount must be greater than 0")
    target_date: date = Field(description="Target date for achieving the goal")
    category: GoalCategory = GoalCategory.CUSTOM
    priority: GoalPriority = GoalPriority.MEDIUM


class GoalCreate(GoalBase):
    """Schema for creating a new goal."""

    pass


class GoalUpdate(BaseModel):
    """Schema for updating an existing goal."""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    target_amount: Optional[Decimal] = Field(None, gt=0)
    target_date: Optional[date] = None
    current_amount: Optional[Decimal] = Field(None, ge=0)
    category: Optional[GoalCategory] = None
    priority: Optional[GoalPriority] = None


class GoalResponse(BaseSchema):
    """Schema for goal response."""

    id: int
    user_id: int
    name: str
    description: Optional[str] = None
    target_amount: Decimal
    target_date: date
    current_amount: Decimal
    category: GoalCategory
    priority: GoalPriority
    is_active: bool
    created_at: datetime
    updated_at: datetime

    # Calculated fields
    progress_percentage: Decimal = Field(description="Progress percentage towards goal")
    remaining_amount: Decimal = Field(description="Remaining amount to reach goal")


class GoalSummary(BaseSchema):
    """Abbreviated goal information for lists."""

    id: int
    name: str
    target_amount: Decimal
    target_date: date
    current_amount: Decimal
    progress_percentage: Decimal
    category: GoalCategory
    priority: GoalPriority
    is_active: bool


class GoalList(BaseModel):
    """List of goals with summary information."""

    goals: List[GoalSummary]
    total_count: int
    total_target_amount: Decimal
    total_current_amount: Decimal
    average_progress: Decimal = Field(description="Average progress across all goals")
    goals_on_track: int = Field(description="Number of goals progressing well")
    goals_behind: int = Field(description="Number of goals falling behind")