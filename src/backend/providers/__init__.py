from .base import IMailProvider, EmailMessage, SendResult
from .outlook_provider import OutlookCOMProvider

__all__ = [
    "IMailProvider",
    "EmailMessage", 
    "SendResult",
    "OutlookCOMProvider"
]