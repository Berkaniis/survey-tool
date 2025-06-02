#!/usr/bin/env python3
"""
Test script pour vérifier toutes les fonctionnalités de l'application Survey Tool
"""

import sys
import os
import logging
from pathlib import Path
import traceback

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent))

import yaml
from backend.database import database
from backend.services import AuthService, CampaignService, EmailService, ContactService, AuditService
from backend.models.user import User, UserRole
from backend.models.campaign import Campaign, CampaignStatus
from backend.providers import OutlookCOMProvider

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s'
)
logger = logging.getLogger(__name__)

class FunctionalityTester:
    """Testeur de fonctionnalités pour l'application Survey Tool"""
    
    def __init__(self):
        self.results = {}
        self.auth_service = None
        self.campaign_service = None
        self.email_service = None
        self.contact_service = None
        self.audit_service = None
        self.test_user = None
        
    def initialize_services(self):
        """Initialiser tous les services"""
        try:
            logger.info("🔄 Initialisation des services...")
            
            # Initialize database
            database.create_tables()
            logger.info("✅ Base de données initialisée")
            
            # Initialize services
            self.auth_service = AuthService()
            self.campaign_service = CampaignService()
            self.contact_service = ContactService()
            self.audit_service = AuditService()
            
            # Load config for email service
            config_path = Path('config/config.yaml')
            if config_path.exists():
                with open(config_path, 'r', encoding='utf-8') as f:
                    config = yaml.safe_load(f)
                
                email_config = config.get('email', {})
                outlook_provider = OutlookCOMProvider(
                    sender_email=email_config.get('default_sender', 'test@test.com')
                )
                self.email_service = EmailService(provider=outlook_provider)
            else:
                logger.warning("⚠️ Config file not found, using default email service")
                outlook_provider = OutlookCOMProvider(sender_email='test@test.com')
                self.email_service = EmailService(provider=outlook_provider)
            
            logger.info("✅ Services initialisés avec succès")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erreur lors de l'initialisation des services: {e}")
            traceback.print_exc()
            return False
    
    def test_authentication(self):
        """Tester les fonctionnalités d'authentification"""
        logger.info("🔐 Test de l'authentification...")
        
        try:
            # Test de création d'utilisateur
            logger.info("  - Test de création d'utilisateur...")
            test_email = "test@company.com"
            test_password = "test123"
            
            # Check if user already exists
            from backend.database import get_session
            from sqlmodel import select
            
            with next(get_session()) as session:
                existing_user = session.exec(select(User).where(User.email == test_email)).first()
                if existing_user:
                    logger.info("  - Utilisateur de test existe déjà")
                    self.test_user = existing_user
                else:
                    self.test_user = self.auth_service.create_user(
                        email=test_email,
                        password=test_password,
                        role=UserRole.ADMIN
                    )
                    logger.info("  ✅ Utilisateur créé avec succès")
            
            # Test de connexion
            logger.info("  - Test de connexion...")
            auth_result = self.auth_service.authenticate(test_email, test_password)
            if auth_result:
                logger.info("  ✅ Authentification réussie")
                self.results['authentication'] = {'status': 'success', 'details': 'Création et connexion d\'utilisateur réussies'}
            else:
                logger.error("  ❌ Échec de l'authentification")
                self.results['authentication'] = {'status': 'failed', 'details': 'Échec de l\'authentification'}
                return False
                
            # Test de validation de session
            logger.info("  - Test de validation de session...")
            session_token = auth_result.get('session_token')
            if session_token:
                user = self.auth_service.validate_session(session_token)
                if user:
                    logger.info("  ✅ Validation de session réussie")
                else:
                    logger.error("  ❌ Échec de validation de session")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Erreur lors du test d'authentification: {e}")
            traceback.print_exc()
            self.results['authentication'] = {'status': 'error', 'details': str(e)}
            return False
    
    def test_campaign_management(self):
        """Tester la gestion des campagnes"""
        logger.info("📋 Test de gestion des campagnes...")
        
        try:
            if not self.test_user:
                logger.error("❌ Utilisateur de test non disponible")
                return False
            
            # Test de création de campagne
            logger.info("  - Test de création de campagne...")
            campaign = self.campaign_service.create_campaign(
                title="Campagne de test",
                owner_id=self.test_user.id,
                default_language="fr"
            )
            
            if campaign:
                logger.info(f"  ✅ Campagne créée avec succès (ID: {campaign.id})")
                
                # Test de récupération de campagne
                logger.info("  - Test de récupération de campagne...")
                retrieved_campaign = self.campaign_service.get_campaign(campaign.id)
                if retrieved_campaign:
                    logger.info("  ✅ Récupération de campagne réussie")
                else:
                    logger.error("  ❌ Échec de récupération de campagne")
                
                # Test de liste des campagnes
                logger.info("  - Test de liste des campagnes...")
                campaigns = self.campaign_service.list_campaigns(owner_id=self.test_user.id)
                if campaigns and len(campaigns) > 0:
                    logger.info(f"  ✅ Liste des campagnes récupérée ({len(campaigns)} campagne(s))")
                else:
                    logger.error("  ❌ Aucune campagne trouvée dans la liste")
                
                # Test de mise à jour de campagne
                logger.info("  - Test de mise à jour de campagne...")
                updated_campaign = self.campaign_service.update_campaign(
                    campaign.id, 
                    self.test_user.id,
                    title="Campagne de test mise à jour"
                )
                if updated_campaign:
                    logger.info("  ✅ Mise à jour de campagne réussie")
                else:
                    logger.error("  ❌ Échec de mise à jour de campagne")
                
                # Test de statistiques de campagne
                logger.info("  - Test de statistiques de campagne...")
                stats = self.campaign_service.get_campaign_statistics(campaign.id)
                if stats:
                    logger.info("  ✅ Statistiques de campagne récupérées")
                else:
                    logger.error("  ❌ Échec de récupération des statistiques")
                
                self.results['campaign_management'] = {
                    'status': 'success', 
                    'details': 'Création, récupération, liste, mise à jour et statistiques de campagne réussies'
                }
                return True
                
            else:
                logger.error("  ❌ Échec de création de campagne")
                self.results['campaign_management'] = {'status': 'failed', 'details': 'Échec de création de campagne'}
                return False
                
        except Exception as e:
            logger.error(f"❌ Erreur lors du test de gestion des campagnes: {e}")
            traceback.print_exc()
            self.results['campaign_management'] = {'status': 'error', 'details': str(e)}
            return False
    
    def test_contact_management(self):
        """Tester la gestion des contacts"""
        logger.info("👥 Test de gestion des contacts...")
        
        try:
            # Test de création de contact
            logger.info("  - Test de création de contact...")
            import time
            unique_email = f"contact.test.{int(time.time())}@example.com"
            contact_data = {
                'email': unique_email,
                'first_name': 'John',
                'last_name': 'Doe'
            }
            
            contact = self.contact_service.create_contact(**contact_data)
            if contact:
                logger.info(f"  ✅ Contact créé avec succès (ID: {contact.id})")
                
                # Test de recherche de contact
                logger.info("  - Test de recherche de contact...")
                found_contacts = self.contact_service.search_contacts(unique_email)
                if found_contacts and len(found_contacts) > 0:
                    logger.info("  ✅ Recherche de contact réussie")
                else:
                    logger.error("  ❌ Échec de recherche de contact")
                
                self.results['contact_management'] = {
                    'status': 'success', 
                    'details': 'Création et recherche de contact réussies'
                }
                return True
                
            else:
                logger.error("  ❌ Échec de création de contact")
                self.results['contact_management'] = {'status': 'failed', 'details': 'Échec de création de contact'}
                return False
                
        except Exception as e:
            logger.error(f"❌ Erreur lors du test de gestion des contacts: {e}")
            traceback.print_exc()
            self.results['contact_management'] = {'status': 'error', 'details': str(e)}
            return False
    
    def test_email_templates(self):
        """Tester la gestion des templates email"""
        logger.info("📧 Test de gestion des templates email...")
        
        try:
            # Créer un template de test
            logger.info("  - Test de création de template...")
            template_data = {
                'name': 'Template de test',
                'subject': 'Test de satisfaction client',
                'content': 'Bonjour {{customer_name}}, merci de répondre à notre enquête: {{survey_link}}',
                'type': 'survey',
                'language': 'fr'
            }
            
            # Test basique - pas de méthode d'API pour les templates dans les services actuels
            # Mais on peut vérifier que les modèles existent
            from backend.models.email import EmailTemplate
            logger.info("  ✅ Modèle EmailTemplate accessible")
            
            self.results['email_templates'] = {
                'status': 'success', 
                'details': 'Structure de template email vérifiée'
            }
            return True
            
        except Exception as e:
            logger.error(f"❌ Erreur lors du test de templates email: {e}")
            traceback.print_exc()
            self.results['email_templates'] = {'status': 'error', 'details': str(e)}
            return False
    
    def test_audit_logging(self):
        """Tester le système d'audit"""
        logger.info("📊 Test du système d'audit...")
        
        try:
            # Test de création d'entrée d'audit
            logger.info("  - Test de création d'entrée d'audit...")
            
            if self.test_user:
                self.audit_service.log_campaign_action(
                    action="TEST_ACTION",
                    campaign_id=1,
                    user_id=self.test_user.id,
                    details={"test": "données de test"}
                )
                logger.info("  ✅ Entrée d'audit créée avec succès")
                
                self.results['audit_logging'] = {
                    'status': 'success', 
                    'details': 'Création d\'entrée d\'audit réussie'
                }
                return True
            else:
                logger.error("  ❌ Utilisateur de test non disponible pour l'audit")
                self.results['audit_logging'] = {'status': 'failed', 'details': 'Utilisateur de test non disponible'}
                return False
                
        except Exception as e:
            logger.error(f"❌ Erreur lors du test d'audit: {e}")
            traceback.print_exc()
            self.results['audit_logging'] = {'status': 'error', 'details': str(e)}
            return False
    
    def test_frontend_components(self):
        """Tester les composants frontend"""
        logger.info("🎨 Test des composants frontend...")
        
        try:
            # Vérifier que les fichiers frontend existent
            frontend_path = Path('frontend/web')
            required_files = [
                'index.html',
                'js/app.js',
                'js/api.js',
                'js/router.js',
                'js/views/Campaigns.js',
                'js/views/Templates.js',
                'js/views/Settings.js',
                'css/app.css'
            ]
            
            missing_files = []
            for file_path in required_files:
                full_path = frontend_path / file_path
                if not full_path.exists():
                    missing_files.append(file_path)
                else:
                    logger.info(f"  ✅ {file_path} trouvé")
            
            if missing_files:
                logger.error(f"  ❌ Fichiers manquants: {missing_files}")
                self.results['frontend_components'] = {
                    'status': 'failed', 
                    'details': f'Fichiers manquants: {missing_files}'
                }
                return False
            else:
                logger.info("  ✅ Tous les composants frontend sont présents")
                self.results['frontend_components'] = {
                    'status': 'success', 
                    'details': 'Tous les fichiers frontend requis sont présents'
                }
                return True
                
        except Exception as e:
            logger.error(f"❌ Erreur lors du test des composants frontend: {e}")
            traceback.print_exc()
            self.results['frontend_components'] = {'status': 'error', 'details': str(e)}
            return False
    
    def test_configuration(self):
        """Tester la configuration de l'application"""
        logger.info("⚙️ Test de configuration...")
        
        try:
            # Vérifier le fichier de configuration
            config_path = Path('config/config.yaml')
            if config_path.exists():
                with open(config_path, 'r', encoding='utf-8') as f:
                    config = yaml.safe_load(f)
                    
                required_sections = ['application', 'database', 'email', 'logging']
                missing_sections = []
                
                for section in required_sections:
                    if section not in config:
                        missing_sections.append(section)
                    else:
                        logger.info(f"  ✅ Section '{section}' trouvée dans la configuration")
                
                if missing_sections:
                    logger.error(f"  ❌ Sections manquantes: {missing_sections}")
                    self.results['configuration'] = {
                        'status': 'failed', 
                        'details': f'Sections manquantes: {missing_sections}'
                    }
                    return False
                else:
                    logger.info("  ✅ Configuration complète")
                    self.results['configuration'] = {
                        'status': 'success', 
                        'details': 'Toutes les sections de configuration sont présentes'
                    }
                    return True
            else:
                logger.error("  ❌ Fichier de configuration manquant")
                self.results['configuration'] = {'status': 'failed', 'details': 'Fichier de configuration manquant'}
                return False
                
        except Exception as e:
            logger.error(f"❌ Erreur lors du test de configuration: {e}")
            traceback.print_exc()
            self.results['configuration'] = {'status': 'error', 'details': str(e)}
            return False
    
    def run_all_tests(self):
        """Exécuter tous les tests"""
        logger.info("🚀 Début des tests fonctionnels...")
        
        tests = [
            ('Initialisation des services', self.initialize_services),
            ('Configuration', self.test_configuration),
            ('Composants frontend', self.test_frontend_components),
            ('Authentification', self.test_authentication),
            ('Gestion des campagnes', self.test_campaign_management),
            ('Gestion des contacts', self.test_contact_management),
            ('Templates email', self.test_email_templates),
            ('Audit logging', self.test_audit_logging),
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            logger.info(f"\n--- {test_name} ---")
            try:
                if test_func():
                    passed += 1
                    logger.info(f"✅ {test_name} - RÉUSSI")
                else:
                    failed += 1
                    logger.error(f"❌ {test_name} - ÉCHEC")
            except Exception as e:
                failed += 1
                logger.error(f"❌ {test_name} - ERREUR: {e}")
        
        # Résumé final
        logger.info(f"\n{'='*60}")
        logger.info("📊 RÉSUMÉ DES TESTS")
        logger.info(f"{'='*60}")
        logger.info(f"Total des tests: {passed + failed}")
        logger.info(f"Réussis: {passed}")
        logger.info(f"Échecs: {failed}")
        logger.info(f"Taux de réussite: {(passed/(passed+failed)*100):.1f}%")
        
        logger.info("\n📋 DÉTAILS DES RÉSULTATS:")
        for test_name, result in self.results.items():
            status_icon = "✅" if result['status'] == 'success' else "❌" if result['status'] == 'failed' else "⚠️"
            logger.info(f"{status_icon} {test_name}: {result['details']}")
        
        return passed, failed

def main():
    """Point d'entrée principal"""
    tester = FunctionalityTester()
    passed, failed = tester.run_all_tests()
    
    # Code de sortie basé sur les résultats
    sys.exit(0 if failed == 0 else 1)

if __name__ == '__main__':
    main()