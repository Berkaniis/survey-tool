from datetime import datetime
from typing import Optional
from enum import Enum

from sqlmodel import SQLModel, Field


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    OPERATOR = "OPERATOR"


class User(SQLModel, table=True):
    """User model for authentication and authorization."""
    
    __tablename__ = "users"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    password_hash: str = Field(max_length=255)
    role: UserRole = Field(default=UserRole.OPERATOR)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = Field(default=None)
    is_active: bool = Field(default=True)
    
    # Security fields
    failed_login_attempts: int = Field(default=0)
    locked_until: Optional[datetime] = Field(default=None)
    password_changed_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        schema_extra = {
            "example": {
                "email": "admin@company.com",
                "role": "ADMIN",
                "is_active": True
            }
        }


class UserSession(SQLModel, table=True):
    """User session model for session management."""
    
    __tablename__ = "user_sessions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    session_token: str = Field(unique=True, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
    last_activity: datetime = Field(default_factory=datetime.utcnow)
    ip_address: Optional[str] = Field(max_length=45)
    user_agent: Optional[str] = Field(max_length=500)