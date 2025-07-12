"""Recommendation schemas for investment advisory API."""

from typing import Dict, List, Optional
from enum import Enum

from pydantic import BaseModel, Field

from .common import BaseSchema


class RecommendationType(str, Enum):
    """Types of investment recommendations."""
    ASSET_ALLOCATION = "asset_allocation"
    REBALANCING = "rebalancing"
    RISK_ADJUSTMENT = "risk_adjustment"
    GOAL_ALIGNMENT = "goal_alignment"
    DIVERSIFICATION = "diversification"
    TAX_OPTIMIZATION = "tax_optimization"


class RecommendationPriority(str, Enum):
    """Priority levels for recommendations."""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class RecommendationResponse(BaseSchema):
    """Schema for individual recommendation response."""
    
    type: RecommendationType
    priority: RecommendationPriority
    title: str = Field(description="Short title for the recommendation")
    description: str = Field(description="Detailed description of the recommendation")
    action: str = Field(description="Specific action the user should take")
    reason: str = Field(description="Why this recommendation is important")
    portfolio_id: Optional[int] = Field(None, description="Associated portfolio ID if applicable")
    goal_id: Optional[int] = Field(None, description="Associated goal ID if applicable")
    target_allocation: Optional[Dict[str, float]] = Field(None, description="Recommended asset allocation percentages")
    estimated_impact: Optional[str] = Field(None, description="Expected impact of following this recommendation")


class RecommendationListResponse(BaseModel):
    """Schema for list of recommendations."""
    
    recommendations: List[RecommendationResponse]
    total_count: int = Field(description="Total number of recommendations")
    high_priority_count: int = Field(description="Number of high priority recommendations")
    medium_priority_count: int = Field(description="Number of medium priority recommendations")
    low_priority_count: int = Field(description="Number of low priority recommendations")


class RecommendationSummary(BaseSchema):
    """Summary of recommendation insights."""
    
    overall_portfolio_health: str = Field(description="Overall assessment of portfolio health")
    key_insights: List[str] = Field(description="Key insights about the user's financial situation")
    next_steps: List[str] = Field(description="Prioritized next steps for the user")
    risk_assessment: str = Field(description="Assessment of current risk profile")