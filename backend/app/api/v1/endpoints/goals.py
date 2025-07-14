"""Goals management API endpoints."""

from decimal import Decimal
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ....database import get_db
from ....models.goal import Goal
from ....models.user import User
from ....schemas.goal import (
    GoalCreate,
    GoalList,
    GoalResponse,
    GoalSummary,
    GoalUpdate,
)
from ...deps import get_current_user

router = APIRouter()


@router.get("/", response_model=GoalList)
async def get_goals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    """Get all goals for the current user."""
    goals = (
        db.query(Goal)
        .filter(Goal.user_id == current_user.id, Goal.is_active is True)
        .offset(skip)
        .limit(limit)
        .all()
    )

    goal_summaries = []
    total_target_amount = Decimal("0.00")
    total_current_amount = Decimal("0.00")
    goals_on_track = 0
    goals_behind = 0

    for goal in goals:
        summary = GoalSummary(
            id=goal.id,
            name=goal.name,
            target_amount=goal.target_amount,
            target_date=goal.target_date,
            current_amount=goal.current_amount,
            progress_percentage=goal.progress_percentage,
            category=goal.category,
            priority=goal.priority,
            is_active=goal.is_active,
        )
        goal_summaries.append(summary)
        total_target_amount += goal.target_amount
        total_current_amount += goal.current_amount
        
        # Simple on-track calculation (can be enhanced)
        if goal.progress_percentage >= Decimal("25.0"):  # Arbitrary threshold
            goals_on_track += 1
        else:
            goals_behind += 1

    # Calculate average progress
    average_progress = Decimal("0.00")
    if goals:
        total_progress = sum(goal.progress_percentage for goal in goals)
        average_progress = total_progress / len(goals)

    return GoalList(
        goals=goal_summaries,
        total_count=len(goals),
        total_target_amount=total_target_amount,
        total_current_amount=total_current_amount,
        average_progress=average_progress,
        goals_on_track=goals_on_track,
        goals_behind=goals_behind,
    )


@router.post("/", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
async def create_goal(
    goal_data: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new goal for the current user."""
    goal = Goal(
        user_id=current_user.id,
        name=goal_data.name,
        description=goal_data.description,
        target_amount=goal_data.target_amount,
        target_date=goal_data.target_date,
        category=goal_data.category,
        priority=goal_data.priority,
    )

    db.add(goal)
    db.commit()
    db.refresh(goal)

    return GoalResponse(
        id=goal.id,
        user_id=goal.user_id,
        name=goal.name,
        description=goal.description,
        target_amount=goal.target_amount,
        target_date=goal.target_date,
        current_amount=goal.current_amount,
        category=goal.category,
        priority=goal.priority,
        is_active=goal.is_active,
        created_at=goal.created_at,
        updated_at=goal.updated_at,
        progress_percentage=goal.progress_percentage,
        remaining_amount=goal.remaining_amount,
    )


@router.get("/{goal_id}", response_model=GoalResponse)
async def get_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific goal by ID."""
    goal = (
        db.query(Goal)
        .filter(
            Goal.id == goal_id,
            Goal.user_id == current_user.id,
            Goal.is_active is True,
        )
        .first()
    )

    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found",
        )

    return GoalResponse(
        id=goal.id,
        user_id=goal.user_id,
        name=goal.name,
        description=goal.description,
        target_amount=goal.target_amount,
        target_date=goal.target_date,
        current_amount=goal.current_amount,
        category=goal.category,
        priority=goal.priority,
        is_active=goal.is_active,
        created_at=goal.created_at,
        updated_at=goal.updated_at,
        progress_percentage=goal.progress_percentage,
        remaining_amount=goal.remaining_amount,
    )


@router.put("/{goal_id}", response_model=GoalResponse)
async def update_goal(
    goal_id: int,
    goal_data: GoalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a goal."""
    goal = (
        db.query(Goal)
        .filter(
            Goal.id == goal_id,
            Goal.user_id == current_user.id,
            Goal.is_active is True,
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
    for field, value in update_data.items():
        setattr(goal, field, value)

    db.commit()
    db.refresh(goal)

    return GoalResponse(
        id=goal.id,
        user_id=goal.user_id,
        name=goal.name,
        description=goal.description,
        target_amount=goal.target_amount,
        target_date=goal.target_date,
        current_amount=goal.current_amount,
        category=goal.category,
        priority=goal.priority,
        is_active=goal.is_active,
        created_at=goal.created_at,
        updated_at=goal.updated_at,
        progress_percentage=goal.progress_percentage,
        remaining_amount=goal.remaining_amount,
    )


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a goal (soft delete)."""
    goal = (
        db.query(Goal)
        .filter(
            Goal.id == goal_id,
            Goal.user_id == current_user.id,
            Goal.is_active is True,
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