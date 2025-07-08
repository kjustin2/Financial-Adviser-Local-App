"""Report model for generated financial reports."""

import enum

from sqlalchemy import JSON, Boolean, Column, DateTime
from sqlalchemy import Enum as SQLEnum
from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .base import BaseModel


class ReportType(str, enum.Enum):
    """Report type classifications."""

    PORTFOLIO_SUMMARY = "portfolio_summary"
    PERFORMANCE = "performance"
    ALLOCATION = "allocation"
    GOAL_PROGRESS = "goal_progress"
    CUSTOM = "custom"


class FileFormat(str, enum.Enum):
    """Report file format options."""

    PDF = "pdf"
    CSV = "csv"
    XLSX = "xlsx"


class ScheduleFrequency(str, enum.Enum):
    """Report scheduling frequency."""

    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"


class Report(BaseModel):
    """Report model for tracking generated financial reports."""

    __tablename__ = "reports"

    # Relationships
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    portfolio_id = Column(
        Integer, ForeignKey("portfolios.id"), nullable=True, index=True
    )

    # Report information
    report_type = Column(SQLEnum(ReportType), nullable=False)
    report_name = Column(String(255), nullable=False)

    # Configuration and output
    parameters = Column(JSON, nullable=True)  # Report configuration/filters
    file_path = Column(String(500), nullable=True)
    file_format = Column(SQLEnum(FileFormat), default=FileFormat.PDF)

    # Timing
    generated_at = Column(DateTime, nullable=False)
    expires_at = Column(DateTime, nullable=True)

    # Scheduling
    is_scheduled = Column(Boolean, default=False)
    schedule_frequency = Column(SQLEnum(ScheduleFrequency), nullable=True)

    # Relationships
    user = relationship("User", back_populates="reports")
    portfolio = relationship("Portfolio", back_populates="reports")

    @property
    def is_expired(self) -> bool:
        """Check if report has expired."""
        if not self.expires_at:
            return False

        from datetime import datetime

        return datetime.utcnow() > self.expires_at

    @property
    def file_exists(self) -> bool:
        """Check if report file exists on disk."""
        if not self.file_path:
            return False

        from pathlib import Path

        return Path(self.file_path).exists()

    def __repr__(self):
        return f"<Report(name={self.report_name}, type={self.report_type}, format={self.file_format})>"
