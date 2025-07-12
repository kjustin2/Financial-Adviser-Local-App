"""Investment recommendation API endpoints."""

from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ....database import get_db
from ....models.portfolio import Portfolio
from ....models.user import User
from ....schemas.recommendation import (
    RecommendationListResponse,
    RecommendationResponse,
    RecommendationSummary,
    RecommendationPriority,
)
from ....services.recommendation import RecommendationService
from ...deps import get_current_user

router = APIRouter()


@router.get("/", response_model=RecommendationListResponse)
async def get_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get personalized investment recommendations for the current user."""
    
    # Get user's portfolios
    portfolios = (
        db.query(Portfolio)
        .filter(Portfolio.user_id == current_user.id, Portfolio.is_active == True)
        .all()
    )
    
    # Generate recommendations (without goals)
    recommendations = RecommendationService.generate_all_recommendations(
        current_user, portfolios, []
    )
    
    # Convert to response format
    recommendation_responses = []
    for rec in recommendations:
        recommendation_responses.append(
            RecommendationResponse(
                type=rec.type.value,
                priority=rec.priority.value,
                title=rec.title,
                description=rec.description,
                action=rec.action,
                reason=rec.reason,
                portfolio_id=rec.portfolio_id,
                goal_id=rec.goal_id,
                target_allocation=rec.target_allocation,
                estimated_impact=rec.estimated_impact,
            )
        )
    
    # Count recommendations by priority
    high_count = sum(1 for r in recommendations if r.priority == RecommendationPriority.HIGH)
    medium_count = sum(1 for r in recommendations if r.priority == RecommendationPriority.MEDIUM)
    low_count = sum(1 for r in recommendations if r.priority == RecommendationPriority.LOW)
    
    return RecommendationListResponse(
        recommendations=recommendation_responses,
        total_count=len(recommendations),
        high_priority_count=high_count,
        medium_priority_count=medium_count,
        low_priority_count=low_count,
    )


@router.get("/summary", response_model=RecommendationSummary)
async def get_recommendation_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a summary of the user's financial situation and key recommendations."""
    
    # Get user's portfolios
    portfolios = (
        db.query(Portfolio)
        .filter(Portfolio.user_id == current_user.id, Portfolio.is_active == True)
        .all()
    )
    
    # Generate recommendations to analyze situation (without goals)
    recommendations = RecommendationService.generate_all_recommendations(
        current_user, portfolios, []
    )
    
    # Analyze portfolio health
    total_portfolio_value = sum(float(p.total_value) for p in portfolios if p.is_active)
    active_portfolios = len(portfolios)
    high_priority_recs = sum(1 for r in recommendations if r.priority == RecommendationPriority.HIGH)
    
    # Generate overall assessment
    if high_priority_recs == 0:
        portfolio_health = "Excellent - Your portfolios are well-aligned with your goals and risk tolerance"
    elif high_priority_recs <= 2:
        portfolio_health = "Good - Minor adjustments could improve your investment strategy"
    elif high_priority_recs <= 4:
        portfolio_health = "Fair - Several important improvements needed for optimal performance"
    else:
        portfolio_health = "Needs Attention - Significant changes recommended to improve your financial strategy"
    
    # Generate key insights
    key_insights = []
    if active_portfolios == 0:
        key_insights.append("You haven't created any investment portfolios yet")
    elif total_portfolio_value > 0:
        key_insights.append(f"Total portfolio value: ${total_portfolio_value:,.2f} across {active_portfolios} portfolio{'s' if active_portfolios != 1 else ''}")
    
    if active_goals == 0:
        key_insights.append("Setting financial goals would help guide your investment strategy")
    else:
        key_insights.append(f"You have {active_goals} active financial goal{'s' if active_goals != 1 else ''}")
    
    # Calculate age and provide age-based insights
    age = RecommendationService.calculate_age_from_birth_date(current_user.date_of_birth)
    if age:
        if age < 30:
            key_insights.append("Your young age allows for aggressive growth strategies")
        elif age < 50:
            key_insights.append("You're in prime earning years - focus on consistent investing")
        elif age < 65:
            key_insights.append("Consider gradually shifting to more conservative investments")
        else:
            key_insights.append("Focus on capital preservation and income generation")
    
    # Generate next steps
    next_steps = []
    high_priority_recs = [r for r in recommendations if r.priority == RecommendationPriority.HIGH]
    for rec in high_priority_recs[:3]:  # Top 3 high priority recommendations
        next_steps.append(rec.action)
    
    if not next_steps:
        medium_priority_recs = [r for r in recommendations if r.priority == RecommendationPriority.MEDIUM]
        for rec in medium_priority_recs[:2]:  # Top 2 medium priority if no high priority
            next_steps.append(rec.action)
    
    if not next_steps:
        next_steps.append("Your portfolio appears well-balanced - continue regular monitoring")
    
    # Generate risk assessment
    user_risk_tolerance = current_user.risk_tolerance or "moderate"
    total_portfolios = len(portfolios)
    
    if total_portfolios == 0:
        risk_assessment = f"Risk tolerance: {user_risk_tolerance.title()} - No active portfolios to assess"
    else:
        aggressive_portfolios = sum(1 for p in portfolios if p.risk_level and p.risk_level.value == "aggressive")
        conservative_portfolios = sum(1 for p in portfolios if p.risk_level and p.risk_level.value == "conservative")
        
        if aggressive_portfolios > conservative_portfolios:
            risk_assessment = f"Current strategy: Growth-focused with {user_risk_tolerance} risk tolerance"
        elif conservative_portfolios > aggressive_portfolios:
            risk_assessment = f"Current strategy: Conservative approach with {user_risk_tolerance} risk tolerance"
        else:
            risk_assessment = f"Current strategy: Balanced approach with {user_risk_tolerance} risk tolerance"
    
    return RecommendationSummary(
        overall_portfolio_health=portfolio_health,
        key_insights=key_insights,
        next_steps=next_steps,
        risk_assessment=risk_assessment,
    )