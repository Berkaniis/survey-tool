import logging
from pathlib import Path
from typing import Generator

from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlmodel import Session, SQLModel

from .models import (
    User, UserSession, Campaign, Contact, CampaignContact,
    EmailTemplate, SendWave, MailLog, AuditLog
)

logger = logging.getLogger(__name__)


class Database:
    """Database manager for SQLite operations."""
    
    def __init__(self, database_url: str = "sqlite:///./data.db"):
        self.database_url = database_url
        self.engine = create_engine(
            database_url,
            echo=False,  # Set to True for SQL debugging
            connect_args={
                "check_same_thread": False,  # Allow multiple threads
                "timeout": 30,  # 30 seconds timeout
            }
        )
        
        # Enable WAL mode and other optimizations
        self._configure_sqlite()
        
    def _configure_sqlite(self) -> None:
        """Configure SQLite for optimal performance."""
        
        @event.listens_for(Engine, "connect")
        def set_sqlite_pragma(dbapi_connection, connection_record):
            if 'sqlite' in str(dbapi_connection):
                cursor = dbapi_connection.cursor()
                # Enable WAL mode for better concurrency
                cursor.execute("PRAGMA journal_mode=WAL")
                # Enable foreign key constraints
                cursor.execute("PRAGMA foreign_keys=ON")
                # Optimize for speed
                cursor.execute("PRAGMA synchronous=NORMAL")
                cursor.execute("PRAGMA cache_size=10000")
                cursor.execute("PRAGMA temp_store=MEMORY")
                cursor.close()
                
    def create_tables(self) -> None:
        """Create all database tables."""
        try:
            SQLModel.metadata.create_all(self.engine)
            logger.info("Database tables created successfully")
        except Exception as e:
            logger.error(f"Failed to create database tables: {e}")
            raise
            
    def get_session(self) -> Generator[Session, None, None]:
        """Get database session with automatic cleanup."""
        session = Session(self.engine)
        try:
            yield session
        except Exception as e:
            session.rollback()
            logger.error(f"Database session error: {e}")
            raise
        finally:
            session.close()
            
    def backup_database(self, backup_path: str) -> bool:
        """Create a backup of the database."""
        try:
            import shutil
            source_path = self.database_url.replace("sqlite:///", "")
            shutil.copy2(source_path, backup_path)
            logger.info(f"Database backed up to {backup_path}")
            return True
        except Exception as e:
            logger.error(f"Database backup failed: {e}")
            return False
            
    def vacuum_database(self) -> bool:
        """Vacuum the database to reclaim space."""
        try:
            with Session(self.engine) as session:
                session.exec("VACUUM")
                session.commit()
            logger.info("Database vacuumed successfully")
            return True
        except Exception as e:
            logger.error(f"Database vacuum failed: {e}")
            return False
            
    def get_database_size(self) -> int:
        """Get the database file size in bytes."""
        try:
            db_path = self.database_url.replace("sqlite:///", "")
            return Path(db_path).stat().st_size
        except Exception as e:
            logger.error(f"Failed to get database size: {e}")
            return 0


# Global database instance
database = Database()


def get_database() -> Database:
    """Get the global database instance."""
    return database


def get_session() -> Generator[Session, None, None]:
    """Get database session - convenience function."""
    yield from database.get_session()