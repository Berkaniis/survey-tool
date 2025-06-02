from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import List, Optional
from enum import Enum


class SendStatus(str, Enum):
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    RETRY = "RETRY"


@dataclass
class EmailMessage:
    """Email message data structure."""
    to: str
    subject: str
    body: str
    attachments: List[str] = field(default_factory=list)
    cc: Optional[str] = None
    bcc: Optional[str] = None
    reply_to: Optional[str] = None
    
    def __post_init__(self):
        # Validate email format
        if not self.to or "@" not in self.to:
            raise ValueError("Invalid recipient email address")
            
        if not self.subject:
            raise ValueError("Subject cannot be empty")
            
        if not self.body:
            raise ValueError("Body cannot be empty")


@dataclass 
class SendResult:
    """Result of an email send operation."""
    status: SendStatus
    message_id: Optional[str] = None
    error_message: Optional[str] = None
    retry_after: Optional[int] = None  # seconds
    
    @property
    def success(self) -> bool:
        return self.status == SendStatus.SUCCESS
        
    @property
    def should_retry(self) -> bool:
        return self.status == SendStatus.RETRY


class IMailProvider(ABC):
    """Abstract interface for email providers."""
    
    @abstractmethod
    def send_email(self, message: EmailMessage) -> SendResult:
        """Send an email message."""
        pass
    
    @abstractmethod
    def validate_connection(self) -> bool:
        """Validate that the email provider is available and configured."""
        pass
    
    @abstractmethod
    def get_provider_name(self) -> str:
        """Get the name of this email provider."""
        pass
    
    def test_send(self, recipient: str) -> SendResult:
        """Send a test email to verify connectivity."""
        test_message = EmailMessage(
            to=recipient,
            subject="Test Email from Survey Tool",
            body="<p>This is a test email to verify email connectivity.</p><p>If you receive this, the email configuration is working correctly.</p>"
        )
        
        return self.send_email(test_message)