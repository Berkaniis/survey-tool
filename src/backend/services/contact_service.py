import logging
from typing import List, Optional, Dict, Any, Tuple
from enum import Enum

from sqlmodel import Session, select, func, and_, or_

from ..database import get_session
from ..models.contact import Contact, CampaignContact, ContactStatus
from ..models.campaign import Campaign
from .audit_service import AuditService

logger = logging.getLogger(__name__)


class MergeMode(str, Enum):
    REPLACE = "REPLACE"
    APPEND = "APPEND"


class ContactService:
    """Service for managing contacts and campaign associations."""
    
    def __init__(self):
        self.audit_service = AuditService()
    
    def create_contact(self, email: str, first_name: str = None, last_name: str = None, 
                      extra_data: Dict[str, Any] = None) -> Contact:
        """Create a new contact."""
        for session in get_session():
            contact = Contact(
                email=email,
                first_name=first_name,
                last_name=last_name,
                extra_data=extra_data or {}
            )
            
            session.add(contact)
            session.commit()
            session.refresh(contact)
            
            logger.info(f"Contact created: {email} (ID: {contact.id})")
            return contact
    
    def search_contacts(self, query: str, limit: int = 50) -> List[Contact]:
        """Search contacts by email or name."""
        for session in get_session():
            search_pattern = f"%{query.lower()}%"
            contacts = session.exec(
                select(Contact).where(
                    or_(
                        Contact.email.ilike(search_pattern),
                        Contact.first_name.ilike(search_pattern),
                        Contact.last_name.ilike(search_pattern)
                    )
                ).limit(limit)
            ).all()
            
            return list(contacts)
        
    def get_or_create_contact(self, email: str, first_name: str = None, last_name: str = None, 
                            extra_data: Dict[str, Any] = None) -> Contact:
        """Get existing contact or create new one."""
        for session in get_session():
            # Try to find existing contact
            contact = session.exec(
                select(Contact).where(Contact.email == email)
            ).first()
            
            if contact:
                # Update contact data if provided
                updated = False
                if first_name and contact.first_name != first_name:
                    contact.first_name = first_name
                    updated = True
                if last_name and contact.last_name != last_name:
                    contact.last_name = last_name
                    updated = True
                if extra_data and contact.extra_data != extra_data:
                    contact.extra_data = extra_data
                    updated = True
                    
                if updated:
                    session.add(contact)
                    session.commit()
                    session.refresh(contact)
                    
                return contact
            else:
                # Create new contact
                contact = Contact(
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    extra_data=extra_data
                )
                
                session.add(contact)
                session.commit()
                session.refresh(contact)
                
                logger.info(f"Created new contact: {email}")
                return contact
                
    def add_contact_to_campaign(self, contact_id: int, campaign_id: int, 
                              custom_data: Dict[str, Any] = None) -> CampaignContact:
        """Add a contact to a campaign."""
        for session in get_session():
            # Check if association already exists
            existing = session.exec(
                select(CampaignContact).where(
                    and_(
                        CampaignContact.campaign_id == campaign_id,
                        CampaignContact.contact_id == contact_id
                    )
                )
            ).first()
            
            if existing:
                # Update custom data if provided
                if custom_data:
                    existing.custom_data = custom_data
                    session.add(existing)
                    session.commit()
                    session.refresh(existing)
                return existing
            
            # Create new association
            campaign_contact = CampaignContact(
                campaign_id=campaign_id,
                contact_id=contact_id,
                custom_data=custom_data
            )
            
            session.add(campaign_contact)
            session.commit()
            session.refresh(campaign_contact)
            
            return campaign_contact
            
    def bulk_add_contacts_to_campaign(self, campaign_id: int, contacts_data: List[Dict[str, Any]], 
                                    mode: MergeMode = MergeMode.REPLACE, user_id: int = None) -> Dict[str, int]:
        """Bulk add contacts to a campaign."""
        for session in get_session():
            stats = {
                "added": 0,
                "updated": 0,
                "skipped": 0,
                "errors": 0
            }
            
            # If replace mode, clear existing contacts
            if mode == MergeMode.REPLACE:
                existing_count = session.exec(
                    select(func.count(CampaignContact.contact_id)).where(
                        CampaignContact.campaign_id == campaign_id
                    )
                ).first()
                
                session.exec(
                    select(CampaignContact).where(CampaignContact.campaign_id == campaign_id)
                ).delete()
                
                logger.info(f"Removed {existing_count} existing contacts from campaign {campaign_id}")
                
            # Process each contact
            for contact_data in contacts_data:
                try:
                    email = contact_data.get("email", "").strip().lower()
                    if not email:
                        stats["errors"] += 1
                        continue
                        
                    first_name = contact_data.get("first_name", "").strip()
                    last_name = contact_data.get("last_name", "").strip()
                    
                    # Extract extra data (exclude standard fields)
                    extra_data = {k: v for k, v in contact_data.items() 
                                if k not in ["email", "first_name", "last_name"]}
                    
                    # Get or create contact
                    contact = self.get_or_create_contact(
                        email=email,
                        first_name=first_name,
                        last_name=last_name,
                        extra_data=extra_data if extra_data else None
                    )
                    
                    # Add to campaign
                    campaign_contact = self.add_contact_to_campaign(
                        contact_id=contact.id,
                        campaign_id=campaign_id,
                        custom_data=extra_data if extra_data else None
                    )
                    
                    if campaign_contact:
                        stats["added"] += 1
                    else:
                        stats["updated"] += 1
                        
                except Exception as e:
                    logger.error(f"Error processing contact {contact_data}: {e}")
                    stats["errors"] += 1
                    
            # Update campaign contact count
            total_contacts = session.exec(
                select(func.count(CampaignContact.contact_id)).where(
                    CampaignContact.campaign_id == campaign_id
                )
            ).first()
            
            campaign = session.get(Campaign, campaign_id)
            if campaign:
                campaign.contact_count = total_contacts
                session.add(campaign)
                
            session.commit()
            
            # Log the action
            if user_id:
                self.audit_service.log_campaign_action(
                    action="CONTACTS_IMPORTED",
                    campaign_id=campaign_id,
                    user_id=user_id,
                    details={
                        "mode": mode.value,
                        "stats": stats,
                        "total_contacts": total_contacts
                    }
                )
                
            logger.info(f"Bulk import completed for campaign {campaign_id}: {stats}")
            return stats
            
    def update_contact_status(self, campaign_id: int, contact_id: int, 
                            status: ContactStatus, user_id: int = None,
                            error_message: str = None) -> bool:
        """Update contact status in a campaign."""
        for session in get_session():
            campaign_contact = session.exec(
                select(CampaignContact).where(
                    and_(
                        CampaignContact.campaign_id == campaign_id,
                        CampaignContact.contact_id == contact_id
                    )
                )
            ).first()
            
            if not campaign_contact:
                logger.error(f"Campaign contact not found: {campaign_id}/{contact_id}")
                return False
                
            old_status = campaign_contact.status
            campaign_contact.status = status
            
            # Update timestamps based on status
            from datetime import datetime
            now = datetime.utcnow()
            
            if status == ContactStatus.SENT:
                campaign_contact.sent_at = now
            elif status == ContactStatus.OPENED:
                campaign_contact.opened_at = now
            elif status == ContactStatus.RESPONDED:
                campaign_contact.responded_at = now
            elif status == ContactStatus.BOUNCED:
                campaign_contact.bounced_at = now
            elif status == ContactStatus.OPTOUT:
                campaign_contact.opted_out_at = now
                
            if error_message:
                campaign_contact.error_message = error_message
                
            session.add(campaign_contact)
            session.commit()
            
            # Log the action
            if user_id:
                self.audit_service.log_contact_action(
                    action="CONTACT_STATUS_UPDATED",
                    contact_id=contact_id,
                    user_id=user_id,
                    campaign_id=campaign_id,
                    details={
                        "old_status": old_status.value,
                        "new_status": status.value,
                        "error_message": error_message
                    }
                )
                
            return True
            
    def search_contacts(self, campaign_id: int, query: str = None, 
                       status: ContactStatus = None, limit: int = 100) -> List[Dict[str, Any]]:
        """Search contacts in a campaign."""
        for session in get_session():
            # Build base query
            base_query = select(
                Contact, CampaignContact
            ).join(
                CampaignContact, Contact.id == CampaignContact.contact_id
            ).where(
                CampaignContact.campaign_id == campaign_id
            )
            
            # Add search filter
            if query:
                search_filter = or_(
                    Contact.email.contains(query),
                    Contact.first_name.contains(query),
                    Contact.last_name.contains(query)
                )
                base_query = base_query.where(search_filter)
                
            # Add status filter
            if status:
                base_query = base_query.where(CampaignContact.status == status)
                
            # Add limit
            base_query = base_query.limit(limit)
            
            results = session.exec(base_query).all()
            
            # Format results
            contacts = []
            for contact, campaign_contact in results:
                contacts.append({
                    "id": contact.id,
                    "email": contact.email,
                    "first_name": contact.first_name,
                    "last_name": contact.last_name,
                    "status": campaign_contact.status.value,
                    "sent_at": campaign_contact.sent_at.isoformat() if campaign_contact.sent_at else None,
                    "opened_at": campaign_contact.opened_at.isoformat() if campaign_contact.opened_at else None,
                    "responded_at": campaign_contact.responded_at.isoformat() if campaign_contact.responded_at else None,
                    "error_message": campaign_contact.error_message,
                    "extra_data": contact.extra_data,
                    "custom_data": campaign_contact.custom_data
                })
                
            return contacts
            
    def get_campaign_contact_stats(self, campaign_id: int) -> Dict[str, int]:
        """Get contact statistics for a campaign."""
        for session in get_session():
            stats = {}
            
            # Count by status
            for status in ContactStatus:
                count = session.exec(
                    select(func.count(CampaignContact.contact_id)).where(
                        and_(
                            CampaignContact.campaign_id == campaign_id,
                            CampaignContact.status == status
                        )
                    )
                ).first() or 0
                
                stats[status.value.lower() + "_count"] = count
                
            # Calculate total
            stats["total_count"] = sum(stats.values())
            
            # Calculate response rate
            if stats["sent_count"] > 0:
                stats["response_rate"] = round(
                    (stats["responded_count"] / stats["sent_count"]) * 100, 2
                )
            else:
                stats["response_rate"] = 0.0
                
            return stats