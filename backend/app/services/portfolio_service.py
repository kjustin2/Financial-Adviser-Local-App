"""Portfolio service for business logic and calculations."""

from decimal import Decimal
from typing import Dict, List, Optional

from sqlalchemy.orm import Session

from ..models.holding import Holding
from ..models.portfolio import Portfolio
from ..models.transaction import Transaction


class PortfolioService:
    """Service for portfolio-related business logic."""

    def __init__(self, db: Session):
        self.db = db

    def calculate_portfolio_performance(
        self, portfolio: Portfolio
    ) -> Dict[str, Decimal]:
        """Calculate comprehensive portfolio performance metrics."""
        if not portfolio.holdings:
            return {
                "current_value": Decimal("0.00"),
                "cost_basis": Decimal("0.00"),
                "unrealized_gain_loss": Decimal("0.00"),
                "unrealized_return_percent": Decimal("0.00"),
            }

        current_value = portfolio.total_value
        cost_basis = portfolio.total_cost_basis
        unrealized_gain_loss = portfolio.unrealized_gain_loss
        unrealized_return_percent = portfolio.unrealized_return_percent

        return {
            "current_value": current_value,
            "cost_basis": cost_basis,
            "unrealized_gain_loss": unrealized_gain_loss,
            "unrealized_return_percent": unrealized_return_percent,
        }

    def calculate_asset_allocation(self, portfolio: Portfolio) -> List[Dict[str, any]]:
        """Calculate current asset allocation breakdown."""
        if not portfolio.holdings:
            return []

        total_value = portfolio.total_value
        if total_value == 0:
            return []

        # Group holdings by asset class
        asset_classes = {}
        for holding in portfolio.holdings:
            if not holding.is_active:
                continue

            asset_class = (
                holding.asset_class.value if holding.asset_class else "Unknown"
            )
            current_value = holding.current_value

            if asset_class not in asset_classes:
                asset_classes[asset_class] = {
                    "current_value": Decimal("0.00"),
                    "holdings_count": 0,
                }

            asset_classes[asset_class]["current_value"] += current_value
            asset_classes[asset_class]["holdings_count"] += 1

        # Calculate percentages and compare to targets
        allocation_data = []
        for asset_class, data in asset_classes.items():
            current_value = data["current_value"]
            current_percent = float((current_value / total_value) * 100)

            # Get target percentage from portfolio target allocation
            target_percent = None
            drift = None
            needs_rebalancing = False

            if portfolio.target_allocation:
                # Look for matching asset class in target allocation
                for key, target in portfolio.target_allocation.items():
                    if key.lower() == asset_class.lower():
                        target_percent = float(target)
                        drift = current_percent - target_percent
                        needs_rebalancing = abs(drift) > float(
                            portfolio.rebalance_threshold
                        )
                        break

            allocation_data.append(
                {
                    "asset_class": asset_class,
                    "current_value": current_value,
                    "current_percent": current_percent,
                    "target_percent": target_percent,
                    "drift": drift,
                    "needs_rebalancing": needs_rebalancing,
                    "holdings_count": data["holdings_count"],
                }
            )

        # Sort by current value descending
        allocation_data.sort(key=lambda x: x["current_value"], reverse=True)

        return allocation_data

    def get_rebalancing_recommendations(
        self, portfolio: Portfolio
    ) -> List[Dict[str, any]]:
        """Get recommendations for portfolio rebalancing."""
        allocation_data = self.calculate_asset_allocation(portfolio)
        recommendations = []

        for allocation in allocation_data:
            if allocation["needs_rebalancing"] and allocation["drift"] is not None:
                if allocation["drift"] > 0:
                    action = "SELL"
                    description = f"Reduce {allocation['asset_class']} allocation by {abs(allocation['drift']):.1f}%"
                else:
                    action = "BUY"
                    description = f"Increase {allocation['asset_class']} allocation by {abs(allocation['drift']):.1f}%"

                recommendations.append(
                    {
                        "asset_class": allocation["asset_class"],
                        "action": action,
                        "current_percent": allocation["current_percent"],
                        "target_percent": allocation["target_percent"],
                        "drift_percent": allocation["drift"],
                        "description": description,
                    }
                )

        return recommendations

    def calculate_diversification_score(self, portfolio: Portfolio) -> Dict[str, any]:
        """Calculate portfolio diversification metrics."""
        if not portfolio.holdings:
            return {
                "score": 0.0,
                "holdings_count": 0,
                "sector_count": 0,
                "largest_holding_percent": 0.0,
                "concentration_risk": "N/A",
            }

        active_holdings = [h for h in portfolio.holdings if h.is_active]
        holdings_count = len(active_holdings)

        if holdings_count == 0:
            return {
                "score": 0.0,
                "holdings_count": 0,
                "sector_count": 0,
                "largest_holding_percent": 0.0,
                "concentration_risk": "N/A",
            }

        total_value = portfolio.total_value

        # Calculate sector diversification
        sectors = set()
        largest_holding_value = Decimal("0.00")

        for holding in active_holdings:
            if holding.sector:
                sectors.add(holding.sector)

            holding_value = holding.current_value
            if holding_value > largest_holding_value:
                largest_holding_value = holding_value

        sector_count = len(sectors)
        largest_holding_percent = (
            float((largest_holding_value / total_value * 100))
            if total_value > 0
            else 0.0
        )

        # Simple diversification score (0-100)
        score = 0.0

        # Holdings count factor (max 40 points)
        if holdings_count >= 20:
            score += 40
        else:
            score += holdings_count * 2

        # Sector count factor (max 30 points)
        if sector_count >= 10:
            score += 30
        else:
            score += sector_count * 3

        # Concentration factor (max 30 points)
        if largest_holding_percent <= 5:
            score += 30
        elif largest_holding_percent <= 10:
            score += 20
        elif largest_holding_percent <= 20:
            score += 10

        # Determine concentration risk level
        if largest_holding_percent > 25:
            concentration_risk = "High"
        elif largest_holding_percent > 15:
            concentration_risk = "Medium"
        else:
            concentration_risk = "Low"

        return {
            "score": min(100.0, score),
            "holdings_count": holdings_count,
            "sector_count": sector_count,
            "largest_holding_percent": largest_holding_percent,
            "concentration_risk": concentration_risk,
        }

    def get_portfolio_summary_stats(self, portfolio: Portfolio) -> Dict[str, any]:
        """Get comprehensive portfolio summary statistics."""
        performance = self.calculate_portfolio_performance(portfolio)
        allocation = self.calculate_asset_allocation(portfolio)
        diversification = self.calculate_diversification_score(portfolio)
        rebalancing = self.get_rebalancing_recommendations(portfolio)

        return {
            "performance": performance,
            "asset_allocation": allocation,
            "diversification": diversification,
            "rebalancing_recommendations": rebalancing,
            "needs_rebalancing": len(rebalancing) > 0,
        }
