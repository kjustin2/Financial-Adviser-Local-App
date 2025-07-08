"""Client model for customer information."""

import enum

from sqlalchemy import Column, Date
from sqlalchemy import Enum as SQLEnum
from sqlalchemy import ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from .base import BaseModel


class RiskTolerance(str, enum.Enum):
    """Risk tolerance levels."""

    CONSERVATIVE = "conservative"
    MODERATE = "moderate"
    AGGRESSIVE = "aggressive"


class EmploymentStatus(str, enum.Enum):
    """Employment status options."""

    EMPLOYED = "employed"
    SELF_EMPLOYED = "self_employed"
    UNEMPLOYED = "unemployed"
    RETIRED = "retired"
    STUDENT = "student"


class Client(BaseModel):
    """Client model for financial advisory clients."""

    __tablename__ = "clients"

    # User relationship
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Personal information
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    date_of_birth = Column(Date, nullable=True)

    # Address information
    address_line1 = Column(String(255), nullable=True)
    address_line2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(50), nullable=True)
    zip_code = Column(String(20), nullable=True)
    country = Column(String(100), default="USA")

    # Financial profile
    risk_tolerance = Column(SQLEnum(RiskTolerance), default=RiskTolerance.MODERATE)
    annual_income = Column(Numeric(15, 2), nullable=True)
    net_worth = Column(Numeric(15, 2), nullable=True)
    employment_status = Column(SQLEnum(EmploymentStatus), nullable=True)
    retirement_age = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="clients")
    portfolios = relationship(
        "Portfolio", back_populates="client", cascade="all, delete-orphan"
    )
    financial_goals = relationship(
        "FinancialGoal", back_populates="client", cascade="all, delete-orphan"
    )
    reports = relationship("Report", back_populates="client")
    client_notes = relationship(
        "ClientNote", back_populates="client", cascade="all, delete-orphan"
    )

    @property
    def full_name(self) -> str:
        """Get client's full name."""
        return f"{self.first_name} {self.last_name}"

    @property
    def age(self) -> int | None:
        """Calculate client's age from date of birth."""
        if self.date_of_birth:
            from datetime import date

            today = date.today()
            return (
                today.year
                - self.date_of_birth.year
                - (
                    (today.month, today.day)
                    < (self.date_of_birth.month, self.date_of_birth.day)
                )
            )
        return None

    def __repr__(self):
        return f"<Client(name={self.full_name}, risk={self.risk_tolerance})>"
