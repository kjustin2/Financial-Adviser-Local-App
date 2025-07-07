"""User model for authentication and advisor information."""

from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import relationship
from .base import BaseModel

class User(BaseModel):
    """User/Advisor model for authentication."""
    
    __tablename__ = "users"
    
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    firm_name = Column(String(255), nullable=True)
    license_number = Column(String(50), nullable=True)
    phone = Column(String(20), nullable=True)
    
    # Relationships
    clients = relationship("Client", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")
    client_notes = relationship("ClientNote", back_populates="user", cascade="all, delete-orphan")
    
    @property
    def full_name(self) -> str:
        """Get user's full name."""
        return f"{self.first_name} {self.last_name}"
    
    def __repr__(self):
        return f"<User(email={self.email}, name={self.full_name})>"