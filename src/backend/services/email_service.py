import logging
import time
import threading
from datetime import datetime
from typing import List, Optional, Dict, Any, Callable
from queue import Queue, Empty
from dataclasses import dataclass
from enum import Enum

from sqlmodel import Session, select, and_

from ..database import get_session
from ..models.email import EmailTemplate, SendWave, MailLog, WaveType, WaveStatus, MailStatus
from ..models.contact import Contact, CampaignContact, ContactStatus
from ..providers.base import IMailProvider, EmailMessage, SendResult, SendStatus
from ..providers.outlook_provider import OutlookCOMProvider
from .audit_service import AuditService

logger = logging.getLogger(__name__)


@dataclass
class EmailQueueItem:
    """Item in the email sending queue."""
    wave_id: int
    contact_id: int
    template_id: int
    email_data: Dict[str, Any]
    retry_count: int = 0


class RateLimiter:
    """Rate limiter for email sending."""
    
    def __init__(self, rate: int, per_seconds: int = 60):
        self.rate = rate
        self.per_seconds = per_seconds
        self.calls = []
        self.lock = threading.Lock()
        
    def acquire(self) -> bool:
        """Try to acquire a rate limit slot."""
        with self.lock:
            now = time.time()
            
            # Remove old calls
            self.calls = [call_time for call_time in self.calls 
                         if now - call_time < self.per_seconds]
            
            # Check if we can make another call
            if len(self.calls) < self.rate:
                self.calls.append(now)
                return True
                
            return False
            
    def time_until_next_slot(self) -> float:
        """Get time in seconds until next slot is available."""
        with self.lock:
            if len(self.calls) < self.rate:
                return 0.0
                
            oldest_call = min(self.calls)
            return self.per_seconds - (time.time() - oldest_call)


class EmailService:
    """Service for managing email sending operations."""
    
    def __init__(self, provider: IMailProvider = None):
        self.provider = provider or OutlookCOMProvider()
        self.audit_service = AuditService()
        
        # Email queue and processing
        self.email_queue = Queue()
        self.is_processing = False
        self.processing_thread = None
        
        # Rate limiting (30 emails per minute by default)
        self.rate_limiter = RateLimiter(rate=30, per_seconds=60)
        
        # Retry settings
        self.max_retries = 3
        self.retry_delays = [30, 120, 300]  # 30s, 2min, 5min
        
    def create_template(self, name: str, subject: str, body: str, 
                       language: str = "en", created_by: int = None,
                       variables: Dict[str, str] = None) -> EmailTemplate:
        """Create a new email template."""
        with Session(get_session()) as session:
            template = EmailTemplate(
                name=name,
                subject=subject,
                body=body,
                language=language,
                created_by=created_by,
                variables=variables
            )
            
            session.add(template)
            session.commit()
            session.refresh(template)
            
            logger.info(f"Email template created: {name}")
            return template
            
    def get_template(self, template_id: int) -> Optional[EmailTemplate]:
        """Get email template by ID."""
        with Session(get_session()) as session:
            return session.get(EmailTemplate, template_id)
            
    def list_templates(self, language: str = None) -> List[EmailTemplate]:
        """List available email templates."""
        with Session(get_session()) as session:
            query = select(EmailTemplate)
            
            if language:
                query = query.where(EmailTemplate.language == language)
                
            query = query.order_by(EmailTemplate.name)
            return session.exec(query).all()
            
    def substitute_variables(self, template: str, contact_data: Dict[str, Any]) -> str:
        """Substitute variables in template with contact data."""
        result = template
        
        # Standard variables
        standard_vars = {
            'first_name': contact_data.get('first_name', ''),
            'last_name': contact_data.get('last_name', ''),
            'email': contact_data.get('email', ''),
            'full_name': f"{contact_data.get('first_name', '')} {contact_data.get('last_name', '')}".strip()
        }
        
        # Add extra data variables
        extra_data = contact_data.get('extra_data', {}) or {}
        custom_data = contact_data.get('custom_data', {}) or {}
        
        all_vars = {**standard_vars, **extra_data, **custom_data}
        
        # Perform substitution
        for var_name, var_value in all_vars.items():
            placeholder = f"{{{var_name}}}"
            result = result.replace(placeholder, str(var_value) if var_value is not None else '')
            
        return result
        
    def preview_email(self, template_id: int, contact_id: int) -> Dict[str, str]:
        """Preview an email with variable substitution."""
        with Session(get_session()) as session:
            template = session.get(EmailTemplate, template_id)
            contact = session.get(Contact, contact_id)
            
            if not template or not contact:
                raise ValueError("Template or contact not found")
                
            contact_data = {
                'first_name': contact.first_name,
                'last_name': contact.last_name,
                'email': contact.email,
                'extra_data': contact.extra_data
            }
            
            return {
                'subject': self.substitute_variables(template.subject, contact_data),
                'body': self.substitute_variables(template.body, contact_data)
            }
            
    def create_send_wave(self, campaign_id: int, wave_type: WaveType, 
                        template_id: int, initiated_by: int,
                        filter_criteria: Dict[str, Any] = None) -> SendWave:
        """Create a new send wave."""
        with Session(get_session()) as session:
            # Count contacts that match the filter
            contact_query = select(CampaignContact).where(
                CampaignContact.campaign_id == campaign_id
            )
            
            # Apply filters
            if filter_criteria:
                status_filter = filter_criteria.get('status')
                if status_filter:
                    contact_query = contact_query.where(
                        CampaignContact.status == ContactStatus(status_filter)
                    )
                    
            contacts = session.exec(contact_query).all()
            contact_count = len(contacts)
            
            # Create send wave
            wave = SendWave(
                campaign_id=campaign_id,
                wave_type=wave_type,
                template_id=template_id,
                filter_criteria=filter_criteria,
                contact_count=contact_count,
                initiated_by=initiated_by
            )
            
            session.add(wave)
            session.commit()
            session.refresh(wave)
            
            # Log the action
            self.audit_service.log_email_action(
                action="SEND_WAVE_CREATED",
                wave_id=wave.id,
                user_id=initiated_by,
                details={
                    "wave_type": wave_type.value,
                    "contact_count": contact_count,
                    "template_id": template_id
                }
            )
            
            logger.info(f"Send wave created: {wave.id} for campaign {campaign_id}")
            return wave
            
    def start_send_wave(self, wave_id: int, progress_callback: Callable = None) -> bool:
        """Start sending emails for a wave."""
        with Session(get_session()) as session:
            wave = session.get(SendWave, wave_id)
            
            if not wave:
                logger.error(f"Send wave not found: {wave_id}")
                return False
                
            if wave.status != WaveStatus.PENDING:
                logger.error(f"Send wave {wave_id} is not in pending status")
                return False
                
            # Update wave status
            wave.status = WaveStatus.RUNNING
            session.add(wave)
            session.commit()
            
            try:
                # Get contacts for this wave
                contacts_query = select(
                    Contact, CampaignContact
                ).join(
                    CampaignContact, Contact.id == CampaignContact.contact_id
                ).where(
                    CampaignContact.campaign_id == wave.campaign_id
                )
                
                # Apply filters
                if wave.filter_criteria:
                    status_filter = wave.filter_criteria.get('status')
                    if status_filter:
                        contacts_query = contacts_query.where(
                            CampaignContact.status == ContactStatus(status_filter)
                        )
                        
                contacts = session.exec(contacts_query).all()
                
                # Queue emails for sending
                total_queued = 0
                for contact, campaign_contact in contacts:
                    contact_data = {
                        'first_name': contact.first_name,
                        'last_name': contact.last_name,
                        'email': contact.email,
                        'extra_data': contact.extra_data,
                        'custom_data': campaign_contact.custom_data
                    }
                    
                    queue_item = EmailQueueItem(
                        wave_id=wave_id,
                        contact_id=contact.id,
                        template_id=wave.template_id,
                        email_data=contact_data
                    )
                    
                    self.email_queue.put(queue_item)
                    total_queued += 1
                    
                logger.info(f"Queued {total_queued} emails for wave {wave_id}")
                
                # Start processing if not already running
                if not self.is_processing:
                    self._start_email_processing(progress_callback)
                    
                return True
                
            except Exception as e:
                logger.error(f"Failed to start send wave {wave_id}: {e}")
                
                # Update wave status to failed
                wave.status = WaveStatus.FAILED
                session.add(wave)
                session.commit()
                
                return False
                
    def _start_email_processing(self, progress_callback: Callable = None):
        """Start email processing thread."""
        if self.is_processing:
            return
            
        self.is_processing = True
        self.processing_thread = threading.Thread(
            target=self._process_email_queue,
            args=(progress_callback,),
            daemon=True
        )
        self.processing_thread.start()
        
    def _process_email_queue(self, progress_callback: Callable = None):
        """Process emails from the queue."""
        logger.info("Email processing thread started")
        
        try:
            while self.is_processing or not self.email_queue.empty():
                try:
                    # Get next email with timeout
                    item = self.email_queue.get(timeout=5)
                    
                    # Wait for rate limit
                    while not self.rate_limiter.acquire():
                        wait_time = self.rate_limiter.time_until_next_slot()
                        if wait_time > 0:
                            time.sleep(min(wait_time, 1.0))
                            
                    # Process the email
                    success = self._send_single_email(item)
                    
                    # Update progress
                    if progress_callback:
                        try:
                            progress_callback(item.wave_id, success)
                        except Exception as e:
                            logger.error(f"Progress callback error: {e}")
                            
                    self.email_queue.task_done()
                    
                except Empty:
                    # No items in queue, continue loop
                    continue
                except Exception as e:
                    logger.error(f"Error processing email queue: {e}")
                    
        finally:
            self.is_processing = False
            logger.info("Email processing thread stopped")
            
    def _send_single_email(self, item: EmailQueueItem) -> bool:
        """Send a single email and log the result."""
        try:
            with Session(get_session()) as session:
                # Get template
                template = session.get(EmailTemplate, item.template_id)
                if not template:
                    logger.error(f"Template not found: {item.template_id}")
                    return False
                    
                # Create email message
                subject = self.substitute_variables(template.subject, item.email_data)
                body = self.substitute_variables(template.body, item.email_data)
                
                email_message = EmailMessage(
                    to=item.email_data['email'],
                    subject=subject,
                    body=body
                )
                
                # Send email
                result = self.provider.send_email(email_message)
                
                # Log the attempt
                mail_log = MailLog(
                    wave_id=item.wave_id,
                    contact_id=item.contact_id,
                    template_id=item.template_id,
                    status=MailStatus.SENT if result.success else MailStatus.FAILED,
                    error_message=result.error_message,
                    retry_count=item.retry_count,
                    subject_sent=subject,
                    body_sent=body,
                    outlook_message_id=result.message_id
                )
                
                session.add(mail_log)
                
                # Update contact status
                if result.success:
                    # Update campaign contact status
                    campaign_contact = session.exec(
                        select(CampaignContact).where(
                            and_(
                                CampaignContact.campaign_id == session.get(SendWave, item.wave_id).campaign_id,
                                CampaignContact.contact_id == item.contact_id
                            )
                        )
                    ).first()
                    
                    if campaign_contact:
                        campaign_contact.status = ContactStatus.SENT
                        campaign_contact.sent_at = datetime.utcnow()
                        session.add(campaign_contact)
                        
                elif result.should_retry and item.retry_count < self.max_retries:
                    # Queue for retry
                    item.retry_count += 1
                    delay = self.retry_delays[min(item.retry_count - 1, len(self.retry_delays) - 1)]
                    
                    # Schedule retry (simplified - in production, use a proper scheduler)
                    threading.Timer(delay, lambda: self.email_queue.put(item)).start()
                    logger.info(f"Email queued for retry {item.retry_count} in {delay}s")
                    
                session.commit()
                
                if result.success:
                    logger.info(f"Email sent successfully to {item.email_data['email']}")
                    return True
                else:
                    logger.error(f"Failed to send email to {item.email_data['email']}: {result.error_message}")
                    return False
                    
        except Exception as e:
            logger.error(f"Error sending email: {e}")
            return False
            
    def stop_processing(self):
        """Stop email processing."""
        self.is_processing = False
        if self.processing_thread:
            self.processing_thread.join(timeout=10)
            
    def get_wave_status(self, wave_id: int) -> Dict[str, Any]:
        """Get status of a send wave."""
        with Session(get_session()) as session:
            wave = session.get(SendWave, wave_id)
            
            if not wave:
                return {}
                
            # Count sent emails
            sent_count = session.exec(
                select(MailLog).where(
                    and_(
                        MailLog.wave_id == wave_id,
                        MailLog.status == MailStatus.SENT
                    )
                )
            ).all()
            
            failed_count = session.exec(
                select(MailLog).where(
                    and_(
                        MailLog.wave_id == wave_id,
                        MailLog.status == MailStatus.FAILED
                    )
                )
            ).all()
            
            return {
                "wave_id": wave_id,
                "status": wave.status.value,
                "contact_count": wave.contact_count,
                "sent_count": len(sent_count),
                "failed_count": len(failed_count),
                "created_at": wave.created_at.isoformat(),
                "completed_at": wave.completed_at.isoformat() if wave.completed_at else None
            }