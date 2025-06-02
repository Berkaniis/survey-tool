import logging
from datetime import datetime, date
from typing import List, Optional, Dict, Any
from pathlib import Path

import pandas as pd
from sqlmodel import Session, select, func, and_

from ..database import get_session
from ..models.campaign import Campaign, CampaignStatus
from ..models.contact import Contact, CampaignContact, ContactStatus
from .contact_service import ContactService, MergeMode
from .audit_service import AuditService

logger = logging.getLogger(__name__)


class ImportError(Exception):
    """Excel import related errors."""
    pass


class CampaignService:
    """Service for managing survey campaigns."""
    
    def __init__(self):
        self.contact_service = ContactService()
        self.audit_service = AuditService()
        
        # Import constraints
        self.max_file_size = 50 * 1024 * 1024  # 50 MB
        self.max_rows = 50000
        self.required_columns = ["email", "first_name", "last_name"]
        
    def create_campaign(self, title: str, owner_id: int, launch_date: date = None,
                       default_language: str = "en", metadata: Dict[str, Any] = None) -> Campaign:
        """Create a new campaign."""
        with Session(get_session()) as session:
            campaign = Campaign(
                title=title,
                owner_id=owner_id,
                launch_date=launch_date,
                default_language=default_language,
                metadata=metadata
            )
            
            session.add(campaign)
            session.commit()
            session.refresh(campaign)
            
            # Log the action
            self.audit_service.log_campaign_action(
                action="CAMPAIGN_CREATED",
                campaign_id=campaign.id,
                user_id=owner_id,
                details={
                    "title": title,
                    "launch_date": launch_date.isoformat() if launch_date else None,
                    "language": default_language
                }
            )
            
            logger.info(f"Campaign created: {title} (ID: {campaign.id})")
            return campaign
            
    def get_campaign(self, campaign_id: int) -> Optional[Campaign]:
        """Get a campaign by ID."""
        with Session(get_session()) as session:
            return session.get(Campaign, campaign_id)
            
    def list_campaigns(self, owner_id: int = None, status: CampaignStatus = None,
                      limit: int = 100, offset: int = 0) -> List[Campaign]:
        """List campaigns with optional filters."""
        with Session(get_session()) as session:
            query = select(Campaign)
            
            if owner_id:
                query = query.where(Campaign.owner_id == owner_id)
                
            if status:
                query = query.where(Campaign.status == status)
                
            query = query.order_by(Campaign.created_at.desc()).limit(limit).offset(offset)
            
            return session.exec(query).all()
            
    def update_campaign(self, campaign_id: int, user_id: int, **updates) -> Optional[Campaign]:
        """Update a campaign."""
        with Session(get_session()) as session:
            campaign = session.get(Campaign, campaign_id)
            
            if not campaign:
                return None
                
            old_data = {
                "title": campaign.title,
                "status": campaign.status.value,
                "launch_date": campaign.launch_date.isoformat() if campaign.launch_date else None
            }
            
            # Update fields
            for field, value in updates.items():
                if hasattr(campaign, field):
                    setattr(campaign, field, value)
                    
            campaign.updated_at = datetime.utcnow()
            
            session.add(campaign)
            session.commit()
            session.refresh(campaign)
            
            # Log the action
            self.audit_service.log_campaign_action(
                action="CAMPAIGN_UPDATED",
                campaign_id=campaign_id,
                user_id=user_id,
                details={
                    "old_data": old_data,
                    "updates": updates
                }
            )
            
            return campaign
            
    def validate_excel_file(self, file_path: str) -> Dict[str, Any]:
        """Validate Excel file before import."""
        try:
            # Check file exists
            path = Path(file_path)
            if not path.exists():
                raise ImportError("File does not exist")
                
            # Check file size
            if path.stat().st_size > self.max_file_size:
                raise ImportError(f"File too large. Maximum size is {self.max_file_size // (1024*1024)} MB")
                
            # Check file extension
            if path.suffix.lower() not in ['.xlsx', '.xls']:
                raise ImportError("Invalid file format. Only Excel files (.xlsx, .xls) are supported")
                
            # Try to read the file
            try:
                # Read first few rows to validate structure
                df = pd.read_excel(file_path, nrows=10)
            except Exception as e:
                raise ImportError(f"Unable to read Excel file: {str(e)}")
                
            # Check required columns
            missing_columns = set(self.required_columns) - set(df.columns)
            if missing_columns:
                raise ImportError(f"Missing required columns: {', '.join(missing_columns)}")
                
            # Get total row count
            df_full = pd.read_excel(file_path)
            row_count = len(df_full)
            
            if row_count > self.max_rows:
                raise ImportError(f"Too many rows. Maximum is {self.max_rows}")
                
            # Validate email format in sample
            if 'email' in df.columns:
                invalid_emails = df[df['email'].isna() | (df['email'].str.strip() == '')].index.tolist()
                if invalid_emails:
                    logger.warning(f"Found {len(invalid_emails)} rows with invalid emails")
                    
            return {
                "valid": True,
                "row_count": row_count,
                "columns": list(df_full.columns),
                "preview": df.head().to_dict('records')
            }
            
        except ImportError:
            raise
        except Exception as e:
            raise ImportError(f"File validation failed: {str(e)}")
            
    def import_excel(self, campaign_id: int, file_path: str, mode: MergeMode = MergeMode.REPLACE,
                    user_id: int = None, progress_callback=None) -> Dict[str, Any]:
        """Import contacts from Excel file."""
        try:
            # Validate file first
            validation_result = self.validate_excel_file(file_path)
            
            logger.info(f"Starting Excel import for campaign {campaign_id}: {file_path}")
            
            # Read Excel file in chunks for memory efficiency
            chunk_size = 1000
            chunks = pd.read_excel(file_path, chunksize=chunk_size)
            
            all_contacts = []
            total_processed = 0
            
            # Process chunks
            for chunk_num, chunk in enumerate(chunks):
                # Clean data
                chunk = self._clean_excel_data(chunk)
                
                # Convert to dict records
                contacts_data = chunk.to_dict('records')
                all_contacts.extend(contacts_data)
                
                total_processed += len(contacts_data)
                
                # Report progress
                if progress_callback:
                    progress_callback(total_processed, validation_result["row_count"])
                    
                logger.info(f"Processed chunk {chunk_num + 1}, total rows: {total_processed}")
                
            # Bulk add contacts to campaign
            stats = self.contact_service.bulk_add_contacts_to_campaign(
                campaign_id=campaign_id,
                contacts_data=all_contacts,
                mode=mode,
                user_id=user_id
            )
            
            # Update campaign status
            with Session(get_session()) as session:
                campaign = session.get(Campaign, campaign_id)
                if campaign and campaign.status == CampaignStatus.DRAFT:
                    campaign.status = CampaignStatus.ACTIVE
                    session.add(campaign)
                    session.commit()
                    
            result = {
                "success": True,
                "file_info": {
                    "filename": Path(file_path).name,
                    "total_rows": validation_result["row_count"],
                    "columns": validation_result["columns"]
                },
                "import_stats": stats
            }
            
            logger.info(f"Excel import completed for campaign {campaign_id}: {stats}")
            return result
            
        except Exception as e:
            logger.error(f"Excel import failed for campaign {campaign_id}: {e}")
            
            # Log the error
            if user_id:
                self.audit_service.log_campaign_action(
                    action="IMPORT_FAILED",
                    campaign_id=campaign_id,
                    user_id=user_id,
                    details={
                        "file_path": file_path,
                        "error": str(e)
                    }
                )
                
            raise ImportError(f"Import failed: {str(e)}")
            
    def _clean_excel_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean and validate Excel data."""
        # Remove completely empty rows
        df = df.dropna(how='all')
        
        # Clean email column
        if 'email' in df.columns:
            df['email'] = df['email'].astype(str).str.strip().str.lower()
            # Remove rows with invalid emails
            df = df[df['email'].str.contains('@', na=False)]
            df = df[df['email'] != '']
            
        # Clean name columns
        for col in ['first_name', 'last_name']:
            if col in df.columns:
                df[col] = df[col].astype(str).str.strip()
                df[col] = df[col].replace('nan', '')
                
        # Remove duplicates based on email
        df = df.drop_duplicates(subset=['email'], keep='first')
        
        return df
        
    def get_campaign_statistics(self, campaign_id: int) -> Dict[str, Any]:
        """Get comprehensive statistics for a campaign."""
        contact_stats = self.contact_service.get_campaign_contact_stats(campaign_id)
        
        with Session(get_session()) as session:
            campaign = session.get(Campaign, campaign_id)
            
            if not campaign:
                return {}
                
            # Get send wave count
            wave_count = session.exec(
                select(func.count()).select_from(
                    select().distinct().where()
                )
            ).first() or 0
            
            return {
                "campaign_info": {
                    "id": campaign.id,
                    "title": campaign.title,
                    "status": campaign.status.value,
                    "created_at": campaign.created_at.isoformat(),
                    "launch_date": campaign.launch_date.isoformat() if campaign.launch_date else None
                },
                "contact_stats": contact_stats,
                "email_stats": {
                    "waves_sent": wave_count,
                    "last_sent": None  # TODO: Get from SendWave table
                }
            }
            
    def export_campaign_results(self, campaign_id: int, format: str = "xlsx") -> str:
        """Export campaign results to file."""
        with Session(get_session()) as session:
            # Get campaign data with contacts
            query = select(
                Contact.email,
                Contact.first_name,
                Contact.last_name,
                CampaignContact.status,
                CampaignContact.sent_at,
                CampaignContact.opened_at,
                CampaignContact.responded_at,
                CampaignContact.bounced_at,
                CampaignContact.opted_out_at,
                CampaignContact.error_message
            ).join(
                CampaignContact, Contact.id == CampaignContact.contact_id
            ).where(
                CampaignContact.campaign_id == campaign_id
            )
            
            results = session.exec(query).all()
            
            # Convert to DataFrame
            df = pd.DataFrame([
                {
                    "Email": result.email,
                    "First Name": result.first_name,
                    "Last Name": result.last_name,
                    "Status": result.status.value,
                    "Sent At": result.sent_at.isoformat() if result.sent_at else "",
                    "Opened At": result.opened_at.isoformat() if result.opened_at else "",
                    "Responded At": result.responded_at.isoformat() if result.responded_at else "",
                    "Bounced At": result.bounced_at.isoformat() if result.bounced_at else "",
                    "Opted Out At": result.opted_out_at.isoformat() if result.opted_out_at else "",
                    "Error Message": result.error_message or ""
                }
                for result in results
            ])
            
            # Generate filename
            campaign = session.get(Campaign, campaign_id)
            safe_title = "".join(c for c in campaign.title if c.isalnum() or c in " -_").strip()
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"campaign_{safe_title}_{timestamp}.{format}"
            
            # Export to file
            if format.lower() == "xlsx":
                df.to_excel(filename, index=False)
            elif format.lower() == "csv":
                df.to_csv(filename, index=False)
            else:
                raise ValueError(f"Unsupported export format: {format}")
                
            logger.info(f"Campaign results exported to {filename}")
            return filename
            
    def delete_campaign(self, campaign_id: int, user_id: int) -> bool:
        """Delete a campaign and all associated data."""
        with Session(get_session()) as session:
            campaign = session.get(Campaign, campaign_id)
            
            if not campaign:
                return False
                
            # Log the action before deletion
            self.audit_service.log_campaign_action(
                action="CAMPAIGN_DELETED",
                campaign_id=campaign_id,
                user_id=user_id,
                details={
                    "title": campaign.title,
                    "contact_count": campaign.contact_count
                }
            )
            
            # Delete cascade will handle related records
            session.delete(campaign)
            session.commit()
            
            logger.info(f"Campaign deleted: {campaign.title} (ID: {campaign_id})")
            return True