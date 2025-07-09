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

    # Personal financial information
    date_of_birth = Column(String(10), nullable=True)  # YYYY-MM-DD format
    annual_income = Column(String(20), nullable=True)  # Encrypted
    risk_tolerance = Column(
        String(20), nullable=True
    )  # conservative, moderate, aggressive
    investment_experience = Column(
        String(20), nullable=True
    )  # beginner, intermediate, advanced
    financial_goals = Column(Text, nullable=True)  # General financial objectives

    # Relationships - Direct ownership of portfolios
    portfolios = relationship(
        "Portfolio", back_populates="user", cascade="all, delete-orphan"
    )
    reports = relationship(
        "Report", back_populates="user", cascade="all, delete-orphan"
    )
    goals = relationship(
        "FinancialGoal", back_populates="user", cascade="all, delete-orphan"
    )

    @property
    def full_name(self) -> str:
        """Get user's full name."""
        return f"{self.first_name} {self.last_name}"

    def __repr__(self):
        return f"<User(email={self.email}, name={self.full_name})>"
