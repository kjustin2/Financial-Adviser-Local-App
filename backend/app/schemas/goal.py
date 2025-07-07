"""Goal schemas for financial goal tracking API."""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
from .common import BaseSchema

# Import enums from models
from ..models.goal import GoalType, ContributionType

class GoalBase(BaseModel):
    """Base goal schema with common fields."""
    name: str = Field(min_length=1, max_length=255, description="Goal name")
    description: Optional[str] = None
    goal_type: GoalType
    target_amount: Decimal = Field(gt=0, decimal_places=2, description="Target amount to reach")
    target_date: Optional[date] = Field(None, description="Target completion date")
    priority_level: Optional[int] = Field(3, ge=1, le=5, description="Priority level (1=highest, 5=lowest)")
    monthly_contribution: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    expected_return_rate: Optional[Decimal] = Field(
        Decimal("0.07"), 
        ge=0, 
        le=1, 
        decimal_places=4,
        description="Expected annual return rate (as decimal)"
    )
    inflation_rate: Optional[Decimal] = Field(
        Decimal("0.03"),
        ge=0,
        le=1,
        decimal_places=4,
        description="Expected inflation rate (as decimal)"
    )
    notes: Optional[str] = None

class GoalCreate(GoalBase):
    """Schema for creating a new financial goal."""
    client_id: int = Field(gt=0, description="Client ID")
    current_amount: Optional[Decimal] = Field(Decimal("0.00"), ge=0, decimal_places=2)

class GoalUpdate(BaseModel):
    """Schema for updating an existing goal."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    goal_type: Optional[GoalType] = None
    target_amount: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    current_amount: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    target_date: Optional[date] = None
    priority_level: Optional[int] = Field(None, ge=1, le=5)
    monthly_contribution: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    expected_return_rate: Optional[Decimal] = Field(None, ge=0, le=1, decimal_places=4)
    inflation_rate: Optional[Decimal] = Field(None, ge=0, le=1, decimal_places=4)
    notes: Optional[str] = None
    is_achieved: Optional[bool] = None

class GoalResponse(BaseSchema):
    """Schema for goal response."""
    id: int
    client_id: int
    name: str
    description: Optional[str] = None
    goal_type: GoalType
    target_amount: Decimal
    current_amount: Decimal
    target_date: Optional[date] = None
    priority_level: int
    monthly_contribution: Optional[Decimal] = None
    expected_return_rate: Decimal
    inflation_rate: Decimal
    is_achieved: bool
    achievement_date: Optional[date] = None
    notes: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    # Calculated fields
    total_contributions: Decimal = Field(description="Total contributions made")
    total_current_amount: Decimal = Field(description="Current amount including contributions")
    progress_percent: Decimal = Field(description="Progress percentage toward goal")
    remaining_amount: Decimal = Field(description="Amount remaining to reach goal")
    days_remaining: Optional[int] = Field(None, description="Days until target date")
    required_monthly_savings: Optional[Decimal] = Field(None, description="Required monthly savings")

class GoalProgress(BaseModel):
    """Goal progress tracking."""
    goal_id: int
    current_amount: Decimal
    target_amount: Decimal
    progress_percent: Decimal
    contributions_this_month: Decimal
    contributions_this_year: Decimal
    projected_completion_date: Optional[date] = None
    on_track: bool = Field(description="Whether goal is on track")

class GoalSummary(BaseSchema):
    """Abbreviated goal information for lists."""
    id: int
    name: str
    goal_type: GoalType
    target_amount: Decimal
    progress_percent: Decimal
    target_date: Optional[date] = None
    priority_level: int
    is_achieved: bool
    days_remaining: Optional[int] = None

class GoalList(BaseModel):
    """List of goals with summary information."""
    goals: List[GoalSummary]
    total_count: int
    total_target_amount: Decimal
    total_current_amount: Decimal
    average_progress: Decimal

# Goal Contribution Schemas
class GoalContributionBase(BaseModel):
    """Base goal contribution schema."""
    amount: Decimal = Field(gt=0, decimal_places=2, description="Contribution amount")
    contribution_date: date = Field(description="Date of contribution")
    contribution_type: Optional[ContributionType] = ContributionType.MANUAL
    notes: Optional[str] = None

class GoalContributionCreate(GoalContributionBase):
    """Schema for creating a new goal contribution."""
    goal_id: int = Field(gt=0, description="Goal ID")

class GoalContributionUpdate(BaseModel):
    """Schema for updating a goal contribution."""
    amount: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    contribution_date: Optional[date] = None
    contribution_type: Optional[ContributionType] = None
    notes: Optional[str] = None

class GoalContributionResponse(BaseSchema):
    """Schema for goal contribution response."""
    id: int
    goal_id: int
    amount: Decimal
    contribution_date: date
    contribution_type: ContributionType
    notes: Optional[str] = None
    created_at: datetime

class GoalContributionList(BaseModel):
    """List of goal contributions."""
    contributions: List[GoalContributionResponse]
    total_count: int
    total_amount: Decimal