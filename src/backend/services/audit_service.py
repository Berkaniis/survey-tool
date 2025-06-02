import logging
from datetime import datetime
from typing import Optional, Dict, Any

from sqlmodel import Session

from ..database import get_session
from ..models.audit import AuditLog

logger = logging.getLogger(__name__)


class AuditService:
    """Service for logging and tracking user actions."""
    
    def __init__(self):
        self.logger = logging.getLogger("survey_tool.audit")
        
    def log_action(
        self, 
        action: str,
        user_id: Optional[int] = None,
        entity_type: Optional[str] = None,
        entity_id: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        system_user: Optional[str] = None
    ) -> AuditLog:
        """Log an action to the audit trail."""
        
        try:
            with Session(get_session()) as session:
                audit_entry = AuditLog(
                    user_id=user_id,
                    action=action,
                    entity_type=entity_type,
                    entity_id=entity_id,
                    details=details or {},
                    ip_address=ip_address,
                    user_agent=user_agent,
                    system_user=system_user
                )
                
                session.add(audit_entry)
                session.commit()
                session.refresh(audit_entry)
                
                # Also log to structured logger for external systems
                self.logger.info(
                    "Audit log entry created",
                    extra={
                        "audit_id": audit_entry.id,
                        "user_id": user_id,
                        "action": action,
                        "entity_type": entity_type,
                        "entity_id": entity_id,
                        "details": details,
                        "ip_address": ip_address,
                        "timestamp": audit_entry.timestamp.isoformat()
                    }
                )
                
                return audit_entry
                
        except Exception as e:
            logger.error(f"Failed to create audit log entry: {e}")
            # Don't raise - audit logging should never break the main functionality
            
    def log_campaign_action(
        self, 
        action: str, 
        campaign_id: int, 
        user_id: int,
        details: Optional[Dict[str, Any]] = None
    ) -> None:
        """Convenience method for logging campaign actions."""
        self.log_action(
            action=action,
            user_id=user_id,
            entity_type="Campaign",
            entity_id=campaign_id,
            details=details
        )
        
    def log_contact_action(
        self, 
        action: str, 
        contact_id: int, 
        user_id: int,
        campaign_id: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None
    ) -> None:
        """Convenience method for logging contact actions."""
        action_details = details or {}
        if campaign_id:
            action_details["campaign_id"] = campaign_id
            
        self.log_action(
            action=action,
            user_id=user_id,
            entity_type="Contact",
            entity_id=contact_id,
            details=action_details
        )
        
    def log_email_action(
        self, 
        action: str, 
        wave_id: int, 
        user_id: int,
        details: Optional[Dict[str, Any]] = None
    ) -> None:
        """Convenience method for logging email actions."""
        self.log_action(
            action=action,
            user_id=user_id,
            entity_type="SendWave",
            entity_id=wave_id,
            details=details
        )
        
    def log_system_action(
        self, 
        action: str, 
        system_name: str,
        details: Optional[Dict[str, Any]] = None
    ) -> None:
        """Log system/automated actions."""
        self.log_action(
            action=action,
            system_user=system_name,
            details=details
        )