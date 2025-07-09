"""Goals management API endpoints."""

from datetime import date
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ....api.deps import get_current_user
from ....database import get_db
from ....models.goal import FinancialGoal, GoalContribution
from ....models.user import User
from ....schemas.goal import (
    GoalContributionCreate,
    GoalContributionList,
    GoalContributionResponse,
    GoalCreate,
    GoalList,
    GoalProgress,
    GoalResponse,
    GoalSummary,
    GoalUpdate,
)

router = APIRouter()


@router.get("/", response_model=GoalList)
async def get_goals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    achieved: Optional[bool] = None,
):
    """Get all goals for the current user."""
    query = db.query(FinancialGoal).filter(
        FinancialGoal.user_id == current_user.id, FinancialGoal.is_active is True
    )

    if achieved is not None:
        query = query.filter(FinancialGoal.is_achieved == achieved)

    goals = query.offset(skip).limit(limit).all()

    goal_summaries = []
    total_target_amount = Decimal("0.00")
    total_current_amount = Decimal("0.00")
    progress_sum = Decimal("0.00")

    for goal in goals:
        summary = GoalSummary(
            id=goal.id,
            name=goal.name,
            goal_type=goal.goal_type,
            target_amount=goal.target_amount,
            progress_percent=goal.progress_percent,
            target_date=goal.target_date,
            priority_level=goal.priority_level,
            is_achieved=goal.is_achieved,
            days_remaining=goal.days_remaining,
        )
        goal_summaries.append(summary)
        total_target_amount += goal.target_amount
        total_current_amount += goal.total_current_amount
        progress_sum += goal.progress_percent

    average_progress = Decimal("0.00")
    if len(goals) > 0:
        average_progress = progress_sum / len(goals)

    return GoalList(
        goals=goal_summaries,
        total_count=len(goals),
        total_target_amount=total_target_amount,
        total_current_amount=total_current_amount,
        average_progress=average_progress,
    )


@router.post("/", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
async def create_goal(
    goal_data: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new financial goal."""
    goal = FinancialGoal(
        user_id=current_user.id,
        name=goal_data.name,
        description=goal_data.description,
        goal_type=goal_data.goal_type,
        target_amount=goal_data.target_amount,
        current_amount=goal_data.current_amount or Decimal("0.00"),
        target_date=goal_data.target_date,
        priority_level=goal_data.priority_level,
        monthly_contribution=goal_data.monthly_contribution,
        expected_return_rate=goal_data.expected_return_rate,
        inflation_rate=goal_data.inflation_rate,
        notes=goal_data.notes,
    )

    db.add(goal)
    db.commit()
    db.refresh(goal)

    return _build_goal_response(goal)


@router.get("/{goal_id}", response_model=GoalResponse)
async def get_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific goal by ID."""
    goal = (
        db.query(FinancialGoal)
        .filter(
            FinancialGoal.id == goal_id,
            FinancialGoal.user_id == current_user.id,
            FinancialGoal.is_active is True,
        )
        .first()
    )

    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found",
        )

    return _build_goal_response(goal)


@router.put("/{goal_id}", response_model=GoalResponse)
async def update_goal(
    goal_id: int,
    goal_data: GoalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a goal."""
    goal = (
        db.query(FinancialGoal)
        .filter(
            FinancialGoal.id == goal_id,
            FinancialGoal.user_id == current_user.id,
            FinancialGoal.is_active is True,
        )
        .first()
    )

    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found",
        )

    # Update only provided fields
    update_data = goal_data.dict(exclude_unset=True)

    # Handle achievement status
    if (
        "is_achieved" in update_data
        and update_data["is_achieved"]
        and not goal.is_achieved
    ):
        update_data["achievement_date"] = date.today()
    elif "is_achieved" in update_data and not update_data["is_achieved"]:
        update_data["achievement_date"] = None

    for field, value in update_data.items():
        setattr(goal, field, value)

    db.commit()
    db.refresh(goal)

    return _build_goal_response(goal)


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a goal (soft delete)."""
    goal = (
        db.query(FinancialGoal)
        .filter(
            FinancialGoal.id == goal_id,
            FinancialGoal.user_id == current_user.id,
            FinancialGoal.is_active is True,
        )
        .first()
    )

    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found",
        )

    # Soft delete
    goal.is_active = False
    db.commit()

    return None


@router.get("/{goal_id}/progress", response_model=GoalProgress)
async def get_goal_progress(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get detailed progress information for a goal."""
    goal = (
        db.query(FinancialGoal)
        .filter(
            FinancialGoal.id == goal_id,
            FinancialGoal.user_id == current_user.id,
            FinancialGoal.is_active is True,
        )
        .first()
    )

    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found",
        )

    # Calculate contributions for this month and year
    from datetime import datetime

    today = datetime.now().date()
    first_of_month = today.replace(day=1)
    first_of_year = today.replace(month=1, day=1)

    contributions_this_month = (
        db.query(GoalContribution)
        .filter(
            GoalContribution.goal_id == goal.id,
            GoalContribution.contribution_date >= first_of_month,
        )
        .all()
    )

    contributions_this_year = (
        db.query(GoalContribution)
        .filter(
            GoalContribution.goal_id == goal.id,
            GoalContribution.contribution_date >= first_of_year,
        )
        .all()
    )

    month_total = sum(c.amount for c in contributions_this_month)
    year_total = sum(c.amount for c in contributions_this_year)

    # Calculate if on track (simplified)
    on_track = True
    if goal.target_date and goal.monthly_contribution:
        required_monthly = goal.required_monthly_savings
        if required_monthly and month_total < required_monthly:
            on_track = False

    # Project completion date (simplified calculation)
    projected_completion_date = None
    if goal.monthly_contribution and goal.remaining_amount > 0:
        months_needed = goal.remaining_amount / goal.monthly_contribution
        from datetime import timedelta

        projected_completion_date = today + timedelta(days=int(months_needed * 30.44))

    return GoalProgress(
        goal_id=goal.id,
        current_amount=goal.total_current_amount,
        target_amount=goal.target_amount,
        progress_percent=goal.progress_percent,
        contributions_this_month=month_total,
        contributions_this_year=year_total,
        projected_completion_date=projected_completion_date,
        on_track=on_track,
    )


# Goal Contributions endpoints
@router.get("/{goal_id}/contributions", response_model=GoalContributionList)
async def get_goal_contributions(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    """Get all contributions for a specific goal."""
    # Verify goal exists and belongs to user
    goal = (
        db.query(FinancialGoal)
        .filter(
            FinancialGoal.id == goal_id,
            FinancialGoal.user_id == current_user.id,
            FinancialGoal.is_active is True,
        )
        .first()
    )

    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found",
        )

    contributions = (
        db.query(GoalContribution)
        .filter(GoalContribution.goal_id == goal_id)
        .order_by(GoalContribution.contribution_date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    contribution_responses = [
        GoalContributionResponse(
            id=contrib.id,
            goal_id=contrib.goal_id,
            amount=contrib.amount,
            contribution_date=contrib.contribution_date,
            contribution_type=contrib.contribution_type,
            notes=contrib.notes,
            created_at=contrib.created_at,
        )
        for contrib in contributions
    ]

    total_amount = sum(c.amount for c in contributions)

    return GoalContributionList(
        contributions=contribution_responses,
        total_count=len(contributions),
        total_amount=total_amount,
    )


@router.post(
    "/{goal_id}/contributions",
    response_model=GoalContributionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_goal_contribution(
    goal_id: int,
    contribution_data: GoalContributionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a contribution to a goal."""
    # Verify goal exists and belongs to user
    goal = (
        db.query(FinancialGoal)
        .filter(
            FinancialGoal.id == goal_id,
            FinancialGoal.user_id == current_user.id,
            FinancialGoal.is_active is True,
        )
        .first()
    )

    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found",
        )

    # Verify the goal_id in the data matches the URL parameter
    if contribution_data.goal_id != goal_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Goal ID mismatch",
        )

    contribution = GoalContribution(
        goal_id=goal_id,
        amount=contribution_data.amount,
        contribution_date=contribution_data.contribution_date,
        contribution_type=contribution_data.contribution_type,
        notes=contribution_data.notes,
    )

    db.add(contribution)
    db.commit()
    db.refresh(contribution)

    return GoalContributionResponse(
        id=contribution.id,
        goal_id=contribution.goal_id,
        amount=contribution.amount,
        contribution_date=contribution.contribution_date,
        contribution_type=contribution.contribution_type,
        notes=contribution.notes,
        created_at=contribution.created_at,
    )


def _build_goal_response(goal: FinancialGoal) -> GoalResponse:
    """Build a GoalResponse from a FinancialGoal model."""
    return GoalResponse(
        id=goal.id,
        user_id=goal.user_id,
        name=goal.name,
        description=goal.description,
        goal_type=goal.goal_type,
        target_amount=goal.target_amount,
        current_amount=goal.current_amount,
        target_date=goal.target_date,
        priority_level=goal.priority_level,
        monthly_contribution=goal.monthly_contribution,
        expected_return_rate=goal.expected_return_rate,
        inflation_rate=goal.inflation_rate,
        is_achieved=goal.is_achieved,
        achievement_date=goal.achievement_date,
        notes=goal.notes,
        is_active=goal.is_active,
        created_at=goal.created_at,
        updated_at=goal.updated_at,
        total_contributions=goal.total_contributions,
        total_current_amount=goal.total_current_amount,
        progress_percent=goal.progress_percent,
        remaining_amount=goal.remaining_amount,
        days_remaining=goal.days_remaining,
        required_monthly_savings=goal.required_monthly_savings,
    )
