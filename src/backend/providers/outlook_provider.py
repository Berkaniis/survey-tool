import logging
import time
from typing import Optional

from .base import IMailProvider, EmailMessage, SendResult, SendStatus

logger = logging.getLogger(__name__)


class OutlookConnectionError(Exception):
    """Outlook connection related errors."""
    pass


class OutlookCOMProvider(IMailProvider):
    """Outlook COM provider for sending emails through installed Outlook."""
    
    def __init__(self, sender_email: Optional[str] = None):
        self.sender_email = sender_email
        self._outlook = None
        self._last_connection_check = 0
        self._connection_check_interval = 60  # Check connection every 60 seconds
        
    def _get_outlook(self):
        """Get Outlook COM object with caching."""
        current_time = time.time()
        
        # Check if we need to refresh the connection
        if (not self._outlook or 
            current_time - self._last_connection_check > self._connection_check_interval):
            
            try:
                import win32com.client
                import pythoncom
                
                # Initialize COM library for current thread
                pythoncom.CoInitialize()
                
                # Connect to Outlook
                self._outlook = win32com.client.Dispatch("Outlook.Application")
                
                # Test the connection
                namespace = self._outlook.GetNamespace("MAPI")
                if not namespace:
                    raise OutlookConnectionError("Unable to access Outlook MAPI namespace")
                    
                self._last_connection_check = current_time
                logger.info("Outlook COM connection established")
                
            except ImportError as e:
                raise OutlookConnectionError(
                    "pywin32 package is required for Outlook integration. "
                    "Please install it with: pip install pywin32"
                )
            except Exception as e:
                self._outlook = None
                raise OutlookConnectionError(f"Failed to connect to Outlook: {str(e)}")
                
        return self._outlook
        
    def validate_connection(self) -> bool:
        """Validate Outlook connection."""
        try:
            outlook = self._get_outlook()
            if outlook:
                # Try to access the namespace to ensure Outlook is fully functional
                namespace = outlook.GetNamespace("MAPI")
                return namespace is not None
            return False
        except Exception as e:
            logger.error(f"Outlook connection validation failed: {e}")
            return False
            
    def get_provider_name(self) -> str:
        """Get provider name."""
        return "Outlook COM"
        
    def send_email(self, message: EmailMessage) -> SendResult:
        """Send email through Outlook COM."""
        try:
            outlook = self._get_outlook()
            
            # Create mail item (0 = olMailItem)
            mail = outlook.CreateItem(0)
            
            # Set basic properties
            mail.To = message.to
            mail.Subject = message.subject
            mail.HTMLBody = message.body
            
            # Set optional properties
            if message.cc:
                mail.CC = message.cc
                
            if message.bcc:
                mail.BCC = message.bcc
                
            if message.reply_to:
                mail.ReplyTo = message.reply_to
                
            # Set sender if specified
            if self.sender_email:
                try:
                    # Try to set the sender account
                    accounts = outlook.Session.Accounts
                    sender_account = None
                    
                    for account in accounts:
                        if account.SmtpAddress.lower() == self.sender_email.lower():
                            sender_account = account
                            break
                            
                    if sender_account:
                        mail.SendUsingAccount = sender_account
                    else:
                        logger.warning(f"Sender email {self.sender_email} not found in Outlook accounts")
                        
                except Exception as e:
                    logger.warning(f"Could not set sender account: {e}")
                    
            # Add attachments
            for attachment_path in message.attachments:
                try:
                    mail.Attachments.Add(attachment_path)
                except Exception as e:
                    logger.error(f"Failed to add attachment {attachment_path}: {e}")
                    # Continue with sending even if attachment fails
                    
            # Send the email
            mail.Send()
            
            # Get message ID if available
            message_id = None
            try:
                message_id = mail.EntryID
            except Exception:
                # EntryID might not be immediately available
                pass
                
            logger.info(f"Email sent successfully to {message.to}")
            
            return SendResult(
                status=SendStatus.SUCCESS,
                message_id=message_id
            )
            
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Failed to send email to {message.to}: {error_msg}")
            
            # Determine if this is a retryable error
            retryable_errors = [
                "server unavailable",
                "timeout",
                "network",
                "connection",
                "temporary"
            ]
            
            should_retry = any(err in error_msg.lower() for err in retryable_errors)
            
            return SendResult(
                status=SendStatus.RETRY if should_retry else SendStatus.FAILED,
                error_message=error_msg,
                retry_after=30 if should_retry else None
            )
            
    def get_available_accounts(self) -> list:
        """Get list of available Outlook accounts."""
        try:
            outlook = self._get_outlook()
            accounts = []
            
            for account in outlook.Session.Accounts:
                accounts.append({
                    "name": account.DisplayName,
                    "email": account.SmtpAddress,
                    "type": account.AccountType
                })
                
            return accounts
            
        except Exception as e:
            logger.error(f"Failed to get Outlook accounts: {e}")
            return []
            
    def close_connection(self):
        """Clean up Outlook connection."""
        try:
            if self._outlook:
                self._outlook = None
                
            import pythoncom
            pythoncom.CoUninitialize()
            
        except Exception as e:
            logger.error(f"Error closing Outlook connection: {e}")