"""Financial goals and contributions models."""

from sqlalchemy import Column, String, Text, Integer, ForeignKey, Numeric, Date, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from .base import BaseModel
import enum

class GoalType(str, enum.Enum):
    """Financial goal types."""
    RETIREMENT = "retirement"
    EDUCATION = "education"
    EMERGENCY_FUND = "emergency_fund"
    MAJOR_PURCHASE = "major_purchase"
    VACATION = "vacation"
    DEBT_PAYOFF = "debt_payoff"
    OTHER = "other"

class ContributionType(str, enum.Enum):
    """Contribution types."""
    MANUAL = "manual"
    AUTOMATIC = "automatic"
    BONUS = "bonus"
    GIFT = "gift"

class FinancialGoal(BaseModel):
    """Financial goal model for tracking client objectives."""
    
    __tablename__ = "financial_goals"
    
    # Client relationship
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False, index=True)
    
    # Goal information
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    goal_type = Column(SQLEnum(GoalType), nullable=False)
    
    # Financial details
    target_amount = Column(Numeric(15, 2), nullable=False)
    current_amount = Column(Numeric(15, 2), default=0)
    target_date = Column(Date, nullable=True)
    priority_level = Column(Integer, default=3)  # 1=highest, 5=lowest
    
    # Planning parameters
    monthly_contribution = Column(Numeric(10, 2), nullable=True)
    expected_return_rate = Column(Numeric(5, 4), default=0.07)  # 7% default
    inflation_rate = Column(Numeric(5, 4), default=0.03)  # 3% default
    
    # Status
    is_achieved = Column(Boolean, default=False)
    achievement_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    
    # Relationships
    client = relationship("Client", back_populates="financial_goals")
    contributions = relationship("GoalContribution", back_populates="goal", cascade="all, delete-orphan")
    
    @property
    def total_contributions(self) -> Numeric:
        """Calculate total contributions made to this goal."""
        if not self.contributions:
            return Numeric("0.00")
        return sum(contrib.amount for contrib in self.contributions)
    
    @property
    def total_current_amount(self) -> Numeric:
        """Calculate total current amount including contributions."""
        return self.current_amount + self.total_contributions
    
    @property
    def progress_percent(self) -> Numeric:
        """Calculate progress percentage toward goal."""
        if self.target_amount == 0:
            return Numeric("0.00")
        return (self.total_current_amount / self.target_amount) * 100
    
    @property
    def remaining_amount(self) -> Numeric:
        """Calculate remaining amount needed to reach goal."""
        return max(Numeric("0.00"), self.target_amount - self.total_current_amount)
    
    @property
    def days_remaining(self) -> int | None:
        """Calculate days remaining until target date."""
        if not self.target_date:
            return None
        
        from datetime import date
        today = date.today()
        delta = self.target_date - today
        return max(0, delta.days)
    
    @property
    def required_monthly_savings(self) -> Numeric | None:
        """Calculate required monthly savings to reach goal."""
        if not self.target_date or self.days_remaining is None:
            return None
        
        if self.days_remaining == 0:
            return self.remaining_amount
        
        months_remaining = self.days_remaining / 30.44  # Average days per month
        if months_remaining <= 0:
            return None
        
        # Simple calculation without interest (can be enhanced)
        return self.remaining_amount / Numeric(str(months_remaining))
    
    def __repr__(self):
        return f"<FinancialGoal(name={self.name}, target=${self.target_amount}, progress={self.progress_percent}%)>"

class GoalContribution(BaseModel):
    """Goal contribution model for tracking progress toward financial goals."""
    
    __tablename__ = "goal_contributions"
    
    # Goal relationship
    goal_id = Column(Integer, ForeignKey("financial_goals.id"), nullable=False, index=True)
    
    # Contribution details
    amount = Column(Numeric(10, 2), nullable=False)
    contribution_date = Column(Date, nullable=False)
    contribution_type = Column(SQLEnum(ContributionType), default=ContributionType.MANUAL)
    notes = Column(Text, nullable=True)
    
    # Relationships
    goal = relationship("FinancialGoal", back_populates="contributions")
    
    def __repr__(self):
        return f"<GoalContribution(amount=${self.amount}, date={self.contribution_date})>"