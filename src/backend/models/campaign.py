from datetime import datetime, date
from typing import Optional, Dict, Any
from enum import Enum

from sqlmodel import SQLModel, Field, JSON, Column


class CampaignStatus(str, Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE" 
    PAUSED = "PAUSED"
    COMPLETED = "COMPLETED"
    ARCHIVED = "ARCHIVED"


class Campaign(SQLModel, table=True):
    """Campaign model for survey campaigns."""
    
    __tablename__ = "campaigns"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=255, index=True)
    owner_id: int = Field(foreign_key="users.id", index=True)
    launch_date: Optional[date] = Field(default=None)
    default_language: str = Field(default="en", max_length=5)
    status: CampaignStatus = Field(default=CampaignStatus.DRAFT, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # JSON metadata field for flexible campaign data
    metadata: Optional[Dict[str, Any]] = Field(
        default=None, 
        sa_column=Column(JSON)
    )
    
    # Statistics (computed fields)
    contact_count: int = Field(default=0)
    sent_count: int = Field(default=0)
    opened_count: int = Field(default=0)
    responded_count: int = Field(default=0)
    bounced_count: int = Field(default=0)
    opted_out_count: int = Field(default=0)
    
    class Config:
        schema_extra = {
            "example": {
                "title": "Q4 2023 Customer Satisfaction",
                "launch_date": "2023-12-01",
                "default_language": "en",
                "status": "DRAFT"
            }
        }