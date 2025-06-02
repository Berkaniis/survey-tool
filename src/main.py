#!/usr/bin/env python3
"""
Customer Satisfaction Survey Tool
Main entry point for the desktop application
"""

import sys
import os
import logging
import argparse
from pathlib import Path

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent))

import webview
import yaml
from backend.database import database
from backend.services import AuthService, CampaignService, EmailService, ContactService, AuditService
from backend.providers import OutlookCOMProvider


def setup_logging(config):
    """Setup logging configuration."""
    logging_config = config.get('logging', {})
    
    # Create logs directory
    log_dir = Path('logs')
    log_dir.mkdir(exist_ok=True)
    
    # Configure logging
    level = getattr(logging, logging_config.get('level', 'INFO').upper())
    
    logging.basicConfig(
        level=level,
        format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
        handlers=[
            logging.FileHandler(log_dir / 'app.log'),
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    # Suppress verbose logging from external libraries
    logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)
    logging.getLogger('urllib3').setLevel(logging.WARNING)


class SurveyToolAPI:
    """API class exposed to the frontend via PyWebView."""
    
    def __init__(self, config):
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Initialize services
        self.auth_service = AuthService()
        self.campaign_service = CampaignService()
        
        # Initialize email provider
        email_config = config.get('email', {})
        outlook_provider = OutlookCOMProvider(
            sender_email=email_config.get('default_sender')
        )
        self.email_service = EmailService(provider=outlook_provider)
        
        self.contact_service = ContactService()
        self.audit_service = AuditService()
        
        # Current user session
        self.current_user = None
        self.session_token = None
        
        self.logger.info("Survey Tool API initialized")
        
    # Authentication methods
    def login(self, email: str, password: str) -> dict:
        """Authenticate user and create session."""
        try:
            result = self.auth_service.authenticate(email, password)
            
            self.current_user = result['user']
            self.session_token = result['session_token']
            
            self.logger.info(f"User logged in: {email}")
            return {"success": True, "data": result}
            
        except Exception as e:
            self.logger.error(f"Login failed for {email}: {e}")
            return {"success": False, "error": str(e)}
            
    def logout(self) -> dict:
        """Logout current user."""
        try:
            if self.session_token:
                self.auth_service.logout(self.session_token)
                
            self.current_user = None
            self.session_token = None
            
            self.logger.info("User logged out")
            return {"success": True}
            
        except Exception as e:
            self.logger.error(f"Logout error: {e}")
            return {"success": False, "error": str(e)}
            
    def get_current_user(self) -> dict:
        """Get current user information."""
        if self.current_user:
            return {"success": True, "data": self.current_user}
        else:
            return {"success": False, "error": "No user logged in"}
            
    def validate_session(self) -> dict:
        """Validate current session."""
        if not self.session_token:
            return {"success": False, "error": "No active session"}
            
        try:
            user = self.auth_service.validate_session(self.session_token)
            if user:
                self.current_user = {
                    "id": user.id,
                    "email": user.email,
                    "role": user.role.value
                }
                return {"success": True, "data": self.current_user}
            else:
                self.current_user = None
                self.session_token = None
                return {"success": False, "error": "Session expired"}
                
        except Exception as e:
            self.logger.error(f"Session validation error: {e}")
            return {"success": False, "error": str(e)}
            
    # Campaign methods
    def get_campaigns(self, params: dict = None) -> dict:
        """Get list of campaigns."""
        try:
            if not self.current_user:
                return {"success": False, "error": "Authentication required"}
                
            params = params or {}
            campaigns = self.campaign_service.list_campaigns(**params)
            
            # Convert to dict for JSON serialization
            campaigns_data = []
            for campaign in campaigns:
                campaigns_data.append({
                    "id": campaign.id,
                    "title": campaign.title,
                    "status": campaign.status.value,
                    "owner_id": campaign.owner_id,
                    "contact_count": campaign.contact_count,
                    "created_at": campaign.created_at.isoformat(),
                    "launch_date": campaign.launch_date.isoformat() if campaign.launch_date else None
                })
                
            return {"success": True, "data": campaigns_data}
            
        except Exception as e:
            self.logger.error(f"Error getting campaigns: {e}")
            return {"success": False, "error": str(e)}
            
    def create_campaign(self, data: dict) -> dict:
        """Create a new campaign."""
        try:
            if not self.current_user:
                return {"success": False, "error": "Authentication required"}
                
            campaign = self.campaign_service.create_campaign(
                title=data['title'],
                owner_id=self.current_user['id'],
                launch_date=data.get('launch_date'),
                default_language=data.get('default_language', 'en')
            )
            
            campaign_data = {
                "id": campaign.id,
                "title": campaign.title,
                "status": campaign.status.value,
                "created_at": campaign.created_at.isoformat()
            }
            
            return {"success": True, "data": campaign_data}
            
        except Exception as e:
            self.logger.error(f"Error creating campaign: {e}")
            return {"success": False, "error": str(e)}
            
    def get_campaign_stats(self, campaign_id: int) -> dict:
        """Get campaign statistics."""
        try:
            stats = self.campaign_service.get_campaign_statistics(campaign_id)
            return {"success": True, "data": stats}
            
        except Exception as e:
            self.logger.error(f"Error getting campaign stats: {e}")
            return {"success": False, "error": str(e)}
            
    # File operations
    def open_file_dialog(self, options: dict = None) -> str:
        """Open file dialog and return selected file path."""
        try:
            options = options or {}
            file_types = options.get('file_types', ['Excel files (*.xlsx;*.xls)|*.xlsx;*.xls'])
            
            result = webview.windows[0].create_file_dialog(
                webview.OPEN_DIALOG,
                allow_multiple=options.get('multiselect', False),
                file_types=file_types
            )
            
            if result and len(result) > 0:
                return result[0] if not options.get('multiselect', False) else result
            else:
                return None
                
        except Exception as e:
            self.logger.error(f"Error opening file dialog: {e}")
            return None
            
    def save_file_dialog(self, options: dict = None) -> str:
        """Open save file dialog and return selected file path."""
        try:
            options = options or {}
            file_types = options.get('file_types', ['Excel files (*.xlsx)|*.xlsx'])
            
            result = webview.windows[0].create_file_dialog(
                webview.SAVE_DIALOG,
                file_types=file_types
            )
            
            return result
            
        except Exception as e:
            self.logger.error(f"Error opening save dialog: {e}")
            return None
            
    # Import methods
    def validate_excel_file(self, file_path: str) -> dict:
        """Validate Excel file for import."""
        try:
            result = self.campaign_service.validate_excel_file(file_path)
            return {"success": True, "data": result}
            
        except Exception as e:
            self.logger.error(f"Error validating Excel file: {e}")
            return {"success": False, "error": str(e)}
            
    def import_excel(self, campaign_id: int, file_path: str, mode: str = 'REPLACE') -> dict:
        """Import contacts from Excel file."""
        try:
            if not self.current_user:
                return {"success": False, "error": "Authentication required"}
                
            # Progress callback for frontend updates
            def progress_callback(current, total):
                try:
                    # Update frontend via JavaScript
                    webview.windows[0].evaluate_js(
                        f'window.progressCallback && window.progressCallback({current}, {total})'
                    )
                except Exception:
                    pass
                    
            result = self.campaign_service.import_excel(
                campaign_id=campaign_id,
                file_path=file_path,
                mode=mode,
                user_id=self.current_user['id'],
                progress_callback=progress_callback
            )
            
            return {"success": True, "data": result}
            
        except Exception as e:
            self.logger.error(f"Error importing Excel: {e}")
            return {"success": False, "error": str(e)}
            
    # System methods
    def get_dashboard_stats(self) -> dict:
        """Get dashboard statistics."""
        try:
            # This would be implemented to gather stats from all services
            stats = {
                "total_campaigns": 0,
                "total_contacts": 0,
                "emails_sent": 0,
                "response_rate": 0.0
            }
            
            return {"success": True, "data": stats}
            
        except Exception as e:
            self.logger.error(f"Error getting dashboard stats: {e}")
            return {"success": False, "error": str(e)}
            
    def check_outlook_connection(self) -> dict:
        """Check Outlook connection status."""
        try:
            is_connected = self.email_service.provider.validate_connection()
            return {"success": True, "data": {"connected": is_connected}}
            
        except Exception as e:
            self.logger.error(f"Error checking Outlook connection: {e}")
            return {"success": False, "error": str(e)}
            
    def get_system_info(self) -> dict:
        """Get system information."""
        try:
            info = {
                "app_name": self.config.get('application', {}).get('name', 'Survey Tool'),
                "version": self.config.get('application', {}).get('version', '1.0.0'),
                "database_size": database.get_database_size(),
                "python_version": sys.version,
                "platform": sys.platform
            }
            
            return {"success": True, "data": info}
            
        except Exception as e:
            self.logger.error(f"Error getting system info: {e}")
            return {"success": False, "error": str(e)}


def load_config():
    """Load application configuration."""
    config_path = Path('config/config.yaml')
    
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            config = yaml.safe_load(f)
        return config
    except FileNotFoundError:
        print(f"Configuration file not found: {config_path}")
        sys.exit(1)
    except yaml.YAMLError as e:
        print(f"Error parsing configuration file: {e}")
        sys.exit(1)


def create_default_user():
    """Create default admin user if none exists."""
    try:
        auth_service = AuthService()
        
        # Check if any users exist
        from backend.database import get_session
        from backend.models.user import User, UserRole
        from sqlmodel import Session, select
        
        with Session(get_session()) as session:
            existing_user = session.exec(select(User)).first()
            
            if not existing_user:
                # Create default admin user
                admin_user = auth_service.create_user(
                    email="admin@company.com",
                    password="admin123",
                    role=UserRole.ADMIN
                )
                
                print(f"Default admin user created: admin@company.com / admin123")
                return admin_user
                
    except Exception as e:
        print(f"Error creating default user: {e}")


def main():
    """Main application entry point."""
    parser = argparse.ArgumentParser(description='Customer Satisfaction Survey Tool')
    parser.add_argument('--debug', action='store_true', help='Enable debug mode')
    parser.add_argument('--port', type=int, default=0, help='Port for development server')
    args = parser.parse_args()
    
    # Load configuration
    config = load_config()
    
    # Setup logging
    setup_logging(config)
    logger = logging.getLogger(__name__)
    
    logger.info("Starting Customer Satisfaction Survey Tool")
    
    try:
        # Initialize database
        database.create_tables()
        logger.info("Database initialized")
        
        # Create default user if needed
        create_default_user()
        
        # Create API instance
        api = SurveyToolAPI(config)
        
        # Determine frontend path
        frontend_path = Path(__file__).parent / 'frontend' / 'web' / 'index.html'
        
        if not frontend_path.exists():
            logger.error(f"Frontend not found at: {frontend_path}")
            sys.exit(1)
            
        # Create PyWebView window
        window = webview.create_window(
            title=config.get('application', {}).get('name', 'Survey Tool'),
            url=str(frontend_path),
            js_api=api,
            width=1280,
            height=800,
            min_size=(1024, 600),
            resizable=True,
            fullscreen=False,
            shadow=True,
            maximized=False
        )
        
        # Start the application
        logger.info("Starting PyWebView...")
        webview.start(
            debug=args.debug,
            port=args.port,
            private_mode=False  # Allow localStorage for settings
        )
        
    except KeyboardInterrupt:
        logger.info("Application interrupted by user")
    except Exception as e:
        logger.error(f"Application error: {e}", exc_info=True)
        sys.exit(1)
    finally:
        logger.info("Application shutting down")


if __name__ == '__main__':
    main()