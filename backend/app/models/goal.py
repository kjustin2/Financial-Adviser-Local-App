"""Goal model for financial goals tracking."""

import enum
from decimal import Decimal
from sqlalchemy import Column, ForeignKey, Integer, Numeric, String, Text, Date
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import relationship

from .base import BaseModel


class GoalCategory(str, enum.Enum):
    """Goal category classifications."""

    RETIREMENT = "retirement"
    EDUCATION = "education"
    HOUSE = "house"
    VACATION = "vacation"
    EMERGENCY = "emergency"
    CUSTOM = "custom"


class GoalPriority(str, enum.Enum):
    """Goal priority levels."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Goal(BaseModel):
    """Goal model for financial goal tracking."""

    __tablename__ = "goals"

    # User relationship
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Goal information
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    target_amount = Column(Numeric(15, 2), nullable=False)
    target_date = Column(Date, nullable=False)
    current_amount = Column(Numeric(15, 2), default=Decimal("0.00"))
    category = Column(SQLEnum(GoalCategory), default=GoalCategory.CUSTOM)
    priority = Column(SQLEnum(GoalPriority), default=GoalPriority.MEDIUM)

    # Relationships
    user = relationship("User", back_populates="goals")

    @property
    def progress_percentage(self) -> Decimal:
        """Calculate progress percentage towards goal."""
        if self.target_amount <= 0:
            return Decimal("0.00")
        return (self.current_amount / self.target_amount) * 100

    @property
    def remaining_amount(self) -> Decimal:
        """Calculate remaining amount to reach goal."""
        return max(self.target_amount - self.current_amount, Decimal("0.00"))

    def __repr__(self):
        return f"<Goal(name={self.name}, target=${self.target_amount}, progress={self.progress_percentage:.1f}%)>"