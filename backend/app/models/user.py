"""User model for authentication and personal financial management."""

from sqlalchemy import Column, String, Text
from sqlalchemy.orm import relationship

from .base import BaseModel


class User(BaseModel):
    """User model for personal financial management."""

    __tablename__ = "users"

    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)

    # Investment profile for recommendations (simplified)
    investment_experience = Column(
        String(20), nullable=False, default='intermediate'
    )  # beginner, intermediate, advanced
    risk_tolerance = Column(
        String(20), nullable=False, default='moderate'
    )  # conservative, moderate, aggressive
    investment_style = Column(
        String(50), nullable=False, default='balanced'
    )  # conservative, balanced, growth, aggressive
    financial_goals = Column(Text, nullable=True)  # JSON array of goals
    net_worth_range = Column(
        String(20), nullable=False, default='200k_500k'
    )  # under_50k, 50k_200k, 200k_500k, 500k_plus
    time_horizon = Column(
        String(20), nullable=False, default='long_term'
    )  # short_term, medium_term, long_term

    # Relationships - Direct ownership of portfolios
    portfolios = relationship(
        "Portfolio", back_populates="user", cascade="all, delete-orphan"
    )
    reports = relationship(
        "Report", back_populates="user", cascade="all, delete-orphan"
    )

    @property
    def full_name(self) -> str:
        """Get user's full name."""
        return f"{self.first_name} {self.last_name}"

    def __repr__(self):
        return f"<User(email={self.email}, name={self.full_name})>"
