from datetime import datetime
from typing import Optional, Dict, Any
from enum import Enum

from sqlmodel import SQLModel, Field, JSON, Column


class WaveType(str, Enum):
    INITIAL = "INITIAL"
    REMINDER = "REMINDER"


class WaveStatus(str, Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


class MailStatus(str, Enum):
    PENDING = "PENDING"
    SENT = "SENT"
    FAILED = "FAILED"
    BOUNCED = "BOUNCED"


class EmailTemplate(SQLModel, table=True):
    """Email template model for reusable email content."""
    
    __tablename__ = "email_templates"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=255, index=True)
    subject: str = Field(max_length=500)
    body: str = Field()  # HTML content
    language: str = Field(default="en", max_length=5)
    is_default: bool = Field(default=False)
    created_by: int = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Template variables documentation
    variables: Optional[Dict[str, str]] = Field(
        default=None,
        sa_column=Column(JSON),
        description="Available variables and their descriptions"
    )
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "Customer Satisfaction Survey",
                "subject": "Help us improve - {first_name}",
                "body": "<p>Dear {first_name} {last_name},</p><p>Please take our survey...</p>",
                "language": "en",
                "variables": {
                    "first_name": "Contact's first name",
                    "last_name": "Contact's last name",
                    "company": "Contact's company"
                }
            }
        }
    }


class SendWave(SQLModel, table=True):
    """Send wave model for tracking email sending batches."""
    
    __tablename__ = "send_waves"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    campaign_id: int = Field(foreign_key="campaigns.id", index=True)
    wave_type: WaveType = Field(index=True)
    
    # Filtering criteria for this wave
    filter_criteria: Optional[Dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSON)
    )
    
    contact_count: int = Field(default=0)
    initiated_by: int = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = Field(default=None)
    status: WaveStatus = Field(default=WaveStatus.PENDING, index=True)
    
    # Progress tracking
    sent_count: int = Field(default=0)
    failed_count: int = Field(default=0)
    
    # Template used for this wave
    template_id: Optional[int] = Field(foreign_key="email_templates.id")


class MailLog(SQLModel, table=True):
    """Mail log model for tracking individual email sends."""
    
    __tablename__ = "mail_logs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    wave_id: int = Field(foreign_key="send_waves.id", index=True)
    contact_id: int = Field(foreign_key="contacts.id", index=True)
    template_id: Optional[int] = Field(foreign_key="email_templates.id")
    
    status: MailStatus = Field(index=True)
    error_message: Optional[str] = Field(default=None)
    sent_at: datetime = Field(default_factory=datetime.utcnow)
    retry_count: int = Field(default=0)
    
    # Email content snapshot
    subject_sent: Optional[str] = Field(max_length=500)
    body_sent: Optional[str] = Field()
    
    # Outlook specific data
    outlook_message_id: Optional[str] = Field(max_length=255)