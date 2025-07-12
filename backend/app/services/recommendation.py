"""Investment recommendation service."""

from decimal import Decimal
from typing import Dict, List, Optional, Tuple
from datetime import datetime, date
from dataclasses import dataclass
from enum import Enum

from ..models.user import User
from ..models.portfolio import Portfolio


class RecommendationType(Enum):
    """Types of investment recommendations."""
    ASSET_ALLOCATION = "asset_allocation"
    REBALANCING = "rebalancing"
    RISK_ADJUSTMENT = "risk_adjustment"
    GOAL_ALIGNMENT = "goal_alignment"
    DIVERSIFICATION = "diversification"
    TAX_OPTIMIZATION = "tax_optimization"


class RecommendationPriority(Enum):
    """Priority levels for recommendations."""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


@dataclass
class Recommendation:
    """Individual investment recommendation."""
    type: RecommendationType
    priority: RecommendationPriority
    title: str
    description: str
    action: str
    reason: str
    portfolio_id: Optional[int] = None
    goal_id: Optional[int] = None
    target_allocation: Optional[Dict[str, float]] = None
    estimated_impact: Optional[str] = None


class RecommendationService:
    """Service for generating personalized investment recommendations."""

    @staticmethod
    def calculate_age_from_birth_date(birth_date: Optional[date]) -> Optional[int]:
        """Calculate age from birth date."""
        if not birth_date:
            return None
        today = date.today()
        return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))

    @staticmethod
    def get_target_allocation_by_age_and_risk(age: Optional[int], risk_level: str) -> Dict[str, float]:
        """
        Get target asset allocation based on age and risk tolerance.
        Uses Rule of 110 as base with risk level adjustments.
        """
        if not age:
            age = 35  # Default age if not provided
        
        # Rule of 110: Stock percentage = 110 - age
        base_stock_percentage = max(20, min(90, 110 - age))
        
        # Adjust based on risk level
        risk_adjustments = {
            "conservative": -15,
            "moderate": 0,
            "aggressive": +15
        }
        
        adjustment = risk_adjustments.get(risk_level.lower(), 0)
        stock_percentage = max(20, min(90, base_stock_percentage + adjustment))
        bond_percentage = max(10, 100 - stock_percentage)
        
        # Further breakdown for diversification
        if stock_percentage >= 70:
            return {
                "domestic_stocks": stock_percentage * 0.6,
                "international_stocks": stock_percentage * 0.3,
                "emerging_markets": stock_percentage * 0.1,
                "bonds": bond_percentage * 0.8,
                "real_estate": bond_percentage * 0.15,
                "cash": bond_percentage * 0.05
            }
        else:
            return {
                "domestic_stocks": stock_percentage * 0.7,
                "international_stocks": stock_percentage * 0.3,
                "bonds": bond_percentage * 0.85,
                "real_estate": bond_percentage * 0.1,
                "cash": bond_percentage * 0.05
            }

    @staticmethod
    def analyze_portfolio_allocation(portfolio: Portfolio) -> Dict[str, float]:
        """Analyze current portfolio allocation."""
        total_value = portfolio.total_value
        if total_value <= 0:
            return {}
        
        allocation = {}
        for holding in portfolio.holdings:
            if holding.is_active and holding.quantity > 0:
                asset_class = holding.asset_class or "other"
                current_value = float(holding.quantity * (holding.current_price or holding.cost_basis))
                
                if asset_class in allocation:
                    allocation[asset_class] += current_value
                else:
                    allocation[asset_class] = current_value
        
        # Convert to percentages
        for asset_class in allocation:
            allocation[asset_class] = (allocation[asset_class] / float(total_value)) * 100
            
        return allocation

    @staticmethod
    def generate_asset_allocation_recommendations(user: User, portfolios: List[Portfolio]) -> List[Recommendation]:
        """Generate asset allocation recommendations based on user profile."""
        recommendations = []
        
        if not portfolios:
            # User has no portfolios - recommend creating one
            age = RecommendationService.calculate_age_from_birth_date(user.date_of_birth)
            risk_level = user.risk_tolerance or "moderate"
            target_allocation = RecommendationService.get_target_allocation_by_age_and_risk(age, risk_level)
            
            recommendations.append(Recommendation(
                type=RecommendationType.ASSET_ALLOCATION,
                priority=RecommendationPriority.HIGH,
                title="Create Your First Investment Portfolio",
                description=f"Based on your age ({age if age else 'mid-30s'}) and {risk_level} risk tolerance, we recommend starting with a diversified portfolio.",
                action="Create a new portfolio with the recommended asset allocation",
                reason="Having a diversified investment portfolio is essential for long-term wealth building",
                target_allocation=target_allocation,
                estimated_impact="Could potentially grow your wealth by 7-10% annually over the long term"
            ))
            return recommendations
        
        # Analyze existing portfolios
        age = RecommendationService.calculate_age_from_birth_date(user.date_of_birth)
        user_risk_level = user.risk_tolerance or "moderate"
        
        for portfolio in portfolios:
            if not portfolio.is_active:
                continue
                
            current_allocation = RecommendationService.analyze_portfolio_allocation(portfolio)
            portfolio_risk_level = portfolio.risk_level.value if portfolio.risk_level else user_risk_level
            target_allocation = RecommendationService.get_target_allocation_by_age_and_risk(age, portfolio_risk_level)
            
            # Check for significant allocation drift
            significant_drifts = []
            for asset_class, target_percent in target_allocation.items():
                current_percent = current_allocation.get(asset_class, 0)
                drift = abs(current_percent - target_percent)
                
                if drift > 10:  # More than 10% drift
                    significant_drifts.append((asset_class, current_percent, target_percent, drift))
            
            if significant_drifts:
                drift_descriptions = []
                for asset_class, current, target, drift in significant_drifts:
                    if current > target:
                        drift_descriptions.append(f"reduce {asset_class.replace('_', ' ')} from {current:.1f}% to {target:.1f}%")
                    else:
                        drift_descriptions.append(f"increase {asset_class.replace('_', ' ')} from {current:.1f}% to {target:.1f}%")
                
                recommendations.append(Recommendation(
                    type=RecommendationType.REBALANCING,
                    priority=RecommendationPriority.HIGH if len(significant_drifts) > 2 else RecommendationPriority.MEDIUM,
                    title=f"Rebalance {portfolio.name}",
                    description=f"Your portfolio has drifted from its target allocation. Consider rebalancing to: {', '.join(drift_descriptions[:2])}{'...' if len(drift_descriptions) > 2 else ''}",
                    action="Sell overweight positions and buy underweight positions to restore target allocation",
                    reason="Regular rebalancing helps maintain your desired risk level and can improve long-term returns",
                    portfolio_id=portfolio.id,
                    target_allocation=target_allocation,
                    estimated_impact="Could improve risk-adjusted returns by 0.5-1.5% annually"
                ))
        
        return recommendations


    @staticmethod
    def generate_risk_recommendations(user: User, portfolios: List[Portfolio]) -> List[Recommendation]:
        """Generate risk-related recommendations."""
        recommendations = []
        
        age = RecommendationService.calculate_age_from_birth_date(user.date_of_birth)
        user_risk_tolerance = user.risk_tolerance or "moderate"
        
        for portfolio in portfolios:
            if not portfolio.is_active:
                continue
            
            portfolio_risk = portfolio.risk_level.value if portfolio.risk_level else "moderate"
            
            # Age-based risk recommendations
            if age and age > 55 and portfolio_risk == "aggressive":
                recommendations.append(Recommendation(
                    type=RecommendationType.RISK_ADJUSTMENT,
                    priority=RecommendationPriority.MEDIUM,
                    title=f"Consider Reducing Risk in {portfolio.name}",
                    description=f"As you approach retirement age ({age}), consider shifting to a more moderate risk level.",
                    action="Gradually increase bond allocation and reduce high-volatility investments",
                    reason="Reducing portfolio volatility helps protect wealth as you near retirement",
                    portfolio_id=portfolio.id,
                    estimated_impact="Lower portfolio volatility while maintaining reasonable growth potential"
                ))
            
            elif age and age < 35 and portfolio_risk == "conservative":
                recommendations.append(Recommendation(
                    type=RecommendationType.RISK_ADJUSTMENT,
                    priority=RecommendationPriority.LOW,
                    title=f"Consider Higher Growth Potential in {portfolio.name}",
                    description=f"At age {age}, you have time to ride out market volatility for potentially higher returns.",
                    action="Consider increasing stock allocation for long-term growth",
                    reason="Younger investors can typically afford more risk for higher potential returns",
                    portfolio_id=portfolio.id,
                    estimated_impact="Could potentially increase long-term returns by 1-3% annually"
                ))
        
        return recommendations

    @staticmethod
    def generate_diversification_recommendations(portfolios: List[Portfolio]) -> List[Recommendation]:
        """Generate diversification recommendations."""
        recommendations = []
        
        for portfolio in portfolios:
            if not portfolio.is_active or portfolio.total_value <= 0:
                continue
            
            holdings_count = len([h for h in portfolio.holdings if h.is_active])
            
            if holdings_count < 3:
                recommendations.append(Recommendation(
                    type=RecommendationType.DIVERSIFICATION,
                    priority=RecommendationPriority.HIGH,
                    title=f"Improve Diversification in {portfolio.name}",
                    description=f"Your portfolio has only {holdings_count} holdings, which may expose you to unnecessary risk.",
                    action="Consider adding ETFs or mutual funds that provide broad market exposure",
                    reason="Diversification helps reduce risk by spreading investments across different assets",
                    portfolio_id=portfolio.id,
                    estimated_impact="Could reduce portfolio volatility by 15-25%"
                ))
            
            # Check for concentration risk
            if holdings_count > 0:
                largest_holding_percent = 0
                for holding in portfolio.holdings:
                    if holding.is_active and holding.quantity > 0:
                        holding_value = float(holding.quantity * (holding.current_price or holding.cost_basis))
                        holding_percent = (holding_value / float(portfolio.total_value)) * 100
                        largest_holding_percent = max(largest_holding_percent, holding_percent)
                
                if largest_holding_percent > 25:
                    recommendations.append(Recommendation(
                        type=RecommendationType.DIVERSIFICATION,
                        priority=RecommendationPriority.MEDIUM,
                        title=f"Reduce Concentration Risk in {portfolio.name}",
                        description=f"Your largest holding represents {largest_holding_percent:.1f}% of your portfolio.",
                        action="Consider reducing the size of your largest position and diversifying into other investments",
                        reason="High concentration in a single investment increases portfolio risk",
                        portfolio_id=portfolio.id,
                        estimated_impact="Reducing concentration can lower portfolio risk without significantly affecting returns"
                    ))
        
        return recommendations

    @classmethod
    def generate_all_recommendations(cls, user: User, portfolios: List[Portfolio], goals: List = None) -> List[Recommendation]:
        """Generate comprehensive investment recommendations for a user (simplified)."""
        recommendations = []
        
        # Generate different types of recommendations
        recommendations.extend(cls.generate_asset_allocation_recommendations(user, portfolios))
        recommendations.extend(cls.generate_risk_recommendations(user, portfolios))
        recommendations.extend(cls.generate_diversification_recommendations(portfolios))
        
        # Sort by priority (HIGH -> MEDIUM -> LOW)
        priority_order = {
            RecommendationPriority.HIGH: 0,
            RecommendationPriority.MEDIUM: 1,
            RecommendationPriority.LOW: 2
        }
        
        recommendations.sort(key=lambda r: priority_order[r.priority])
        
        return recommendations