from datetime import datetime
from typing import Optional, Dict, Any
from enum import Enum

from sqlmodel import SQLModel, Field, JSON, Column


class ContactStatus(str, Enum):
    PENDING = "PENDING"
    SENT = "SENT"
    OPENED = "OPENED"
    RESPONDED = "RESPONDED"
    BOUNCED = "BOUNCED"
    OPTOUT = "OPTOUT"
    ERROR = "ERROR"


class Contact(SQLModel, table=True):
    """Contact model for email addresses."""
    
    __tablename__ = "contacts"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    first_name: Optional[str] = Field(max_length=100)
    last_name: Optional[str] = Field(max_length=100)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Additional data from Excel import
    extra_data: Optional[Dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSON)
    )
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "email": "john.doe@company.com",
                "first_name": "John",
                "last_name": "Doe",
                "extra_data": {
                    "company": "ACME Corp",
                    "department": "Sales"
                }
            }
        }
    }


class CampaignContact(SQLModel, table=True):
    """Association table between campaigns and contacts with status tracking."""
    
    __tablename__ = "campaign_contacts"
    
    campaign_id: int = Field(foreign_key="campaigns.id", primary_key=True)
    contact_id: int = Field(foreign_key="contacts.id", primary_key=True)
    
    status: ContactStatus = Field(default=ContactStatus.PENDING, index=True)
    
    # Timestamps for tracking
    sent_at: Optional[datetime] = Field(default=None)
    opened_at: Optional[datetime] = Field(default=None)
    responded_at: Optional[datetime] = Field(default=None)
    bounced_at: Optional[datetime] = Field(default=None)
    opted_out_at: Optional[datetime] = Field(default=None)
    
    # Error handling
    error_message: Optional[str] = Field(default=None)
    retry_count: int = Field(default=0)
    
    # Custom data specific to this campaign-contact relationship
    custom_data: Optional[Dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSON)
    )
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)