"""Client notes model for advisor-client interactions."""

from sqlalchemy import Column, String, Text, Integer, ForeignKey, Boolean, Date, Enum as SQLEnum
from sqlalchemy.orm import relationship
from .base import BaseModel
import enum

class NoteType(str, enum.Enum):
    """Note type classifications."""
    MEETING = "meeting"
    CALL = "call"
    EMAIL = "email"
    GENERAL = "general"
    FOLLOW_UP = "follow_up"

class ClientNote(BaseModel):
    """Client note model for tracking advisor-client interactions."""
    
    __tablename__ = "client_notes"
    
    # Relationships
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Note information
    note_type = Column(SQLEnum(NoteType), default=NoteType.GENERAL)
    subject = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    
    # Privacy and follow-up
    is_private = Column(Boolean, default=False)
    follow_up_date = Column(Date, nullable=True)
    is_completed = Column(Boolean, default=False)
    
    # Relationships
    client = relationship("Client", back_populates="client_notes")
    user = relationship("User", back_populates="client_notes")
    
    @property
    def needs_follow_up(self) -> bool:
        """Check if note needs follow-up action."""
        if not self.follow_up_date or self.is_completed:
            return False
        
        from datetime import date
        return date.today() >= self.follow_up_date
    
    @property
    def is_overdue(self) -> bool:
        """Check if follow-up is overdue."""
        if not self.follow_up_date or self.is_completed:
            return False
        
        from datetime import date
        return date.today() > self.follow_up_date
    
    def __repr__(self):
        return f"<ClientNote(type={self.note_type}, subject={self.subject}, client_id={self.client_id})>"