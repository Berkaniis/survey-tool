import logging
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

from passlib.context import CryptContext
from sqlmodel import Session, select

from ..database import get_session
from ..models.user import User, UserSession, UserRole
from .audit_service import AuditService

logger = logging.getLogger(__name__)


class AuthError(Exception):
    """Authentication related errors."""
    pass


class AuthService:
    """Authentication and authorization service."""
    
    def __init__(self):
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.audit_service = AuditService()
        
        # Security settings
        self.max_login_attempts = 5
        self.lockout_duration = timedelta(minutes=30)
        self.session_timeout = timedelta(hours=8)
        
    def hash_password(self, password: str) -> str:
        """Hash a password using bcrypt."""
        return self.pwd_context.hash(password)
        
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return self.pwd_context.verify(plain_password, hashed_password)
        
    def create_user(self, email: str, password: str, role: UserRole = UserRole.OPERATOR) -> User:
        """Create a new user."""
        for session in get_session():
            # Check if user already exists
            existing_user = session.exec(
                select(User).where(User.email == email)
            ).first()
            
            if existing_user:
                raise AuthError(f"User with email {email} already exists")
                
            # Create new user
            user = User(
                email=email,
                password_hash=self.hash_password(password),
                role=role
            )
            
            session.add(user)
            session.commit()
            session.refresh(user)
            
            # Log the action
            self.audit_service.log_action(
                user_id=None,
                action="USER_CREATED",
                entity_type="User",
                entity_id=user.id,
                details={"email": email, "role": role.value}
            )
            
            logger.info(f"User created: {email}")
            return user
            
    def authenticate(self, email: str, password: str, ip_address: str = None) -> Dict[str, Any]:
        """Authenticate a user and return session data."""
        for session in get_session():
            user = session.exec(
                select(User).where(User.email == email)
            ).first()
            
            if not user:
                self.audit_service.log_action(
                    user_id=None,
                    action="LOGIN_FAILED",
                    details={"email": email, "reason": "user_not_found"},
                    ip_address=ip_address
                )
                raise AuthError("Invalid credentials")
                
            # Check if user is locked
            if user.locked_until and user.locked_until > datetime.utcnow():
                remaining = (user.locked_until - datetime.utcnow()).total_seconds()
                raise AuthError(f"Account locked. Try again in {int(remaining)} seconds")
                
            # Check if user is active
            if not user.is_active:
                raise AuthError("Account deactivated")
                
            # Verify password
            if not self.verify_password(password, user.password_hash):
                # Increment failed attempts
                user.failed_login_attempts += 1
                
                if user.failed_login_attempts >= self.max_login_attempts:
                    user.locked_until = datetime.utcnow() + self.lockout_duration
                    
                session.add(user)
                session.commit()
                
                self.audit_service.log_action(
                    user_id=user.id,
                    action="LOGIN_FAILED",
                    details={"reason": "invalid_password", "attempts": user.failed_login_attempts},
                    ip_address=ip_address
                )
                
                raise AuthError("Invalid credentials")
                
            # Reset failed attempts on successful login
            user.failed_login_attempts = 0
            user.locked_until = None
            user.last_login = datetime.utcnow()
            
            # Create session
            session_token = self.create_session(user.id, ip_address)
            
            session.add(user)
            session.commit()
            
            self.audit_service.log_action(
                user_id=user.id,
                action="LOGIN_SUCCESS",
                details={"email": email},
                ip_address=ip_address
            )
            
            logger.info(f"User authenticated: {email}")
            
            return {
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "role": user.role.value,
                    "last_login": user.last_login.isoformat() if user.last_login else None
                },
                "session_token": session_token
            }
            
    def create_session(self, user_id: int, ip_address: str = None) -> str:
        """Create a new user session."""
        for session in get_session():
            # Generate secure session token
            session_token = secrets.token_urlsafe(32)
            
            # Create session record
            user_session = UserSession(
                user_id=user_id,
                session_token=session_token,
                expires_at=datetime.utcnow() + self.session_timeout,
                ip_address=ip_address
            )
            
            session.add(user_session)
            session.commit()
            
            return session_token
            
    def validate_session(self, session_token: str) -> Optional[User]:
        """Validate a session token and return the user."""
        for session in get_session():
            user_session = session.exec(
                select(UserSession).where(UserSession.session_token == session_token)
            ).first()
            
            if not user_session:
                return None
                
            # Check if session is expired
            if user_session.expires_at < datetime.utcnow():
                session.delete(user_session)
                session.commit()
                return None
                
            # Update last activity
            user_session.last_activity = datetime.utcnow()
            session.add(user_session)
            
            # Get user
            user = session.exec(
                select(User).where(User.id == user_session.user_id)
            ).first()
            
            if not user or not user.is_active:
                return None
                
            session.commit()
            return user
            
    def logout(self, session_token: str) -> bool:
        """Logout user by invalidating session."""
        for session in get_session():
            user_session = session.exec(
                select(UserSession).where(UserSession.session_token == session_token)
            ).first()
            
            if user_session:
                user_id = user_session.user_id
                session.delete(user_session)
                session.commit()
                
                self.audit_service.log_action(
                    user_id=user_id,
                    action="LOGOUT",
                    details={}
                )
                
                logger.info(f"User logged out: {user_id}")
                return True
                
            return False
            
    def change_password(self, user_id: int, old_password: str, new_password: str) -> bool:
        """Change user password."""
        for session in get_session():
            user = session.get(User, user_id)
            
            if not user:
                raise AuthError("User not found")
                
            # Verify old password
            if not self.verify_password(old_password, user.password_hash):
                raise AuthError("Invalid current password")
                
            # Update password
            user.password_hash = self.hash_password(new_password)
            user.password_changed_at = datetime.utcnow()
            
            session.add(user)
            session.commit()
            
            self.audit_service.log_action(
                user_id=user_id,
                action="PASSWORD_CHANGED",
                details={}
            )
            
            logger.info(f"Password changed for user: {user.email}")
            return True
            
    def cleanup_expired_sessions(self) -> int:
        """Clean up expired sessions and return count of deleted sessions."""
        for session in get_session():
            expired_sessions = session.exec(
                select(UserSession).where(UserSession.expires_at < datetime.utcnow())
            ).all()
            
            count = len(expired_sessions)
            
            for user_session in expired_sessions:
                session.delete(user_session)
                
            session.commit()
            
            if count > 0:
                logger.info(f"Cleaned up {count} expired sessions")
                
            return count