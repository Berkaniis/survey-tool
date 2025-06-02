from datetime import datetime
from typing import Optional, Dict, Any

from sqlmodel import SQLModel, Field, JSON, Column


class AuditLog(SQLModel, table=True):
    """Audit log model for tracking all user actions."""
    
    __tablename__ = "audit_logs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(foreign_key="users.id", index=True)
    action: str = Field(max_length=50, index=True)
    entity_type: Optional[str] = Field(max_length=50, index=True)
    entity_id: Optional[int] = Field(index=True)
    
    # Action details
    details: Optional[Dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSON)
    )
    
    # Request context
    ip_address: Optional[str] = Field(max_length=45)
    user_agent: Optional[str] = Field()
    timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    # For system actions (automated processes)
    system_user: Optional[str] = Field(max_length=100)
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "action": "CAMPAIGN_CREATED",
                "entity_type": "Campaign",
                "entity_id": 123,
                "details": {
                    "campaign_title": "Q4 2023 Survey",
                    "contact_count": 1500
                },
                "ip_address": "192.168.1.100"
            }
        }
    }