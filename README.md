# Survey Tool - Customer Satisfaction Survey Management

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.10+-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows-lightgrey.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

Application desktop autonome pour la gestion d'enquêtes de satisfaction client avec interface web intégrée et intégration Outlook native.

## 🚀 Fonctionnalités

- ✅ **Import Excel** - Importation de listes de contacts depuis fichiers XLSX/XLS
- ✅ **Gestion de campagnes** - Création et suivi de campagnes d'enquêtes
- ✅ **Intégration Outlook** - Envoi d'emails via Outlook COM (natif Windows)
- ✅ **Templates d'email** - Système de modèles avec substitution de variables
- ✅ **Tableau de bord** - Statistiques et métriques en temps réel
- ✅ **Interface multilingue** - Support EN, FR, DE, ES
- ✅ **Audit complet** - Traçabilité de toutes les actions
- ✅ **Mode hors-ligne** - Fonctionnement autonome sans serveur externe
- ✅ **Conformité RGPD** - Gestion des données personnelles

## 📋 Prérequis

### Système
- **OS**: Windows 10/11 (recommandé)
- **RAM**: 4 GB minimum, 8 GB recommandé
- **Disque**: 500 MB libre minimum, 2 GB recommandé
- **Écran**: 1366x768 minimum, 1920x1080 recommandé

### Logiciels
- **Python**: 3.10 ou supérieur
- **Microsoft Outlook**: 2016 ou supérieur (pour l'envoi d'emails)
- **Git**: Pour le clonage du repository

## 🛠️ Installation

### Option 1: Installation Rapide (Recommandée)

```bash
# 1. Cloner le repository
git clone https://github.com/votre-username/survey-tool.git
cd survey-tool

# 2. Configuration automatique
python scripts/dev.py setup

# 3. Lancer l'application
python scripts/dev.py run
```

### Option 2: Installation Manuelle

```bash
# 1. Cloner le repository
git clone https://github.com/votre-username/survey-tool.git
cd survey-tool

# 2. Créer l'environnement virtuel
python -m venv venv

# 3. Activer l'environnement virtuel
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 4. Installer les dépendances
pip install -r requirements.txt

# 5. Lancer l'application
cd src
python main.py
```

### Option 3: Exécutable Standalone

```bash
# 1. Cloner et installer les dépendances (étapes 1-4 ci-dessus)

# 2. Créer l'exécutable
python scripts/build.py --clean

# 3. L'exécutable se trouve dans dist/SurveyTool.exe
# Double-cliquer pour lancer l'application
```

## 🔧 Configuration

### Première Utilisation

1. **Lancer l'application**
2. **Connexion automatique** avec les identifiants par défaut :
   - Email: `admin@company.com`
   - Mot de passe: `admin123`
3. **Configurer Outlook** (si nécessaire) dans Settings > Email

### Configuration Outlook

1. **Ouvrir Microsoft Outlook** au moins une fois
2. **Configurer un compte email** dans Outlook
3. L'application détectera automatiquement les comptes disponibles
4. **Tester la connexion** via Settings > Email > Test Connection

### Fichier de Configuration

Le fichier `config/config.yaml` contient tous les paramètres :

```yaml
email:
  provider: "outlook_com"
  throttle:
    rate: 30  # emails par minute
  default_sender: "votre.email@company.com"

ui:
  default_language: "en"  # en, fr, de, es
  theme: "light"  # light, dark, system
```

## 📊 Utilisation

### 1. Créer une Campagne

1. Dashboard → **"New Campaign"**
2. Remplir les informations :
   - Titre descriptif
   - Date de lancement
   - Langue par défaut
3. **Sauvegarder**

### 2. Importer des Contacts

1. Préparer un fichier Excel avec les colonnes :
   - `email` (obligatoire)
   - `first_name` (obligatoire) 
   - `last_name` (obligatoire)
   - Autres colonnes optionnelles

2. Dans la campagne → **"Import Contacts"**
3. Suivre l'assistant d'importation
4. Vérifier l'aperçu et confirmer

**Exemple de structure Excel :**

| email | first_name | last_name | company | department |
|-------|------------|-----------|---------|------------|
| john.doe@company.com | John | Doe | ACME Corp | Sales |
| jane.smith@company.com | Jane | Smith | ACME Corp | Marketing |

### 3. Créer des Templates d'Email

1. **Templates** → "Create Template"
2. Utiliser les variables disponibles :
   - `{first_name}` - Prénom
   - `{last_name}` - Nom
   - `{email}` - Email
   - `{company}` - Entreprise (si colonne présente)
   - Toutes vos colonnes Excel personnalisées

**Exemple de template :**
```html
<p>Bonjour {first_name} {last_name},</p>
<p>Nous aimerions connaître votre avis sur nos services chez {company}.</p>
<p>Merci de prendre 5 minutes pour répondre à notre enquête.</p>
```

### 4. Envoyer des Emails

1. Dans la campagne → **"Send Emails"**
2. Sélectionner un template
3. Choisir les destinataires (tous ou filtrés)
4. **Prévisualiser** et confirmer l'envoi

### 5. Suivre les Résultats

- **Dashboard** : Vue d'ensemble des statistiques
- **Campagne Details** : Métriques détaillées
- **Export** : Télécharger les résultats en Excel/CSV

## 📁 Structure du Projet

```
survey-tool/
├── src/
│   ├── backend/              # Services Python
│   │   ├── models/           # Modèles de données SQLite
│   │   ├── services/         # Logique métier
│   │   ├── providers/        # Intégrations (Outlook)
│   │   └── database.py       # Gestionnaire BDD
│   ├── frontend/             # Interface utilisateur
│   │   └── web/              # HTML/CSS/JS
│   └── main.py               # Point d'entrée
├── config/                   # Configuration YAML
├── scripts/                  # Scripts de développement
├── tests/                    # Tests automatisés
├── requirements.txt          # Dépendances Python
└── README.md                 # Ce fichier
```

## 🧪 Développement

### Commandes Utiles

```bash
# Configuration environnement de développement
python scripts/dev.py setup

# Lancer en mode debug
python scripts/dev.py run --debug

# Exécuter les tests
python scripts/dev.py test

# Vérification du code (linting)
python scripts/dev.py lint

# Build pour production
python scripts/build.py --clean --installer
```

### Tests

```bash
# Tests unitaires
pytest tests/

# Tests avec couverture
pytest tests/ --cov=src --cov-report=html

# Tests d'intégration
pytest tests/integration/
```

### Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📦 Build et Distribution

### Créer un Exécutable

```bash
# Build standard
python scripts/build.py

# Build avec nettoyage
python scripts/build.py --clean

# Build avec installateur Windows
python scripts/build.py --installer
```

### Fichiers Générés

- `dist/SurveyTool.exe` - Exécutable portable
- `SurveyTool-Setup.exe` - Installateur Windows (si --installer)

### Distribution

1. **Portable** : Distribuer `SurveyTool.exe` directement
2. **Installateur** : Utiliser `SurveyTool-Setup.exe` pour installation complète

## 🔒 Sécurité et Conformité

### Sécurité

- **Authentification** : Mots de passe chiffrés (bcrypt)
- **Sessions** : Timeout automatique (8h par défaut)
- **Audit** : Traçabilité complète des actions
- **Base de données** : SQLite local chiffré

### Conformité RGPD

- **Droit à l'oubli** : Suppression complète des contacts
- **Portabilité** : Export des données individuelles
- **Consentement** : Gestion des opt-out
- **Logs** : Anonymisation automatique après 90 jours

## 🐛 Résolution de Problèmes

### Problèmes Courants

**Outlook non détecté :**
```bash
# Vérifier qu'Outlook est installé et configuré
# Redémarrer l'application
# Lancer en tant qu'administrateur si nécessaire
```

**Import Excel échoue :**
- Vérifier le format (.xlsx/.xls uniquement)
- Contrôler les colonnes obligatoires (email, first_name, last_name)
- Limiter à 50 MB et 50 000 lignes maximum

**Performance lente :**
- Limiter le nombre de contacts par campagne
- Vérifier l'espace disque disponible
- Fermer les autres applications

### Logs et Diagnostic

Les logs se trouvent dans :
- `logs/app.log` - Logs de l'application
- `logs/audit.log` - Audit des actions utilisateur
- `data.db` - Base de données SQLite

### Support

1. Consulter les logs d'erreur
2. Vérifier la [documentation](QUICKSTART.md)
3. Ouvrir une [issue](https://github.com/votre-username/survey-tool/issues)

## 📈 Performance

### Limites Recommandées

- **Contacts par campagne** : 100 000 max
- **Campagnes actives** : 1 000 max  
- **Envoi d'emails** : 30 par minute (configurable)
- **Taille fichier Excel** : 50 MB max
- **Nombre de lignes Excel** : 50 000 max

### Optimisations

- Import par chunks de 1000 lignes
- Rate limiting automatique des emails
- Index de base de données optimisés
- Logs rotatifs pour économiser l'espace

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🤝 Remerciements

- [PyWebView](https://pywebview.flowrl.com/) - Framework desktop
- [SQLModel](https://sqlmodel.tiangolo.com/) - ORM moderne
- [Pandas](https://pandas.pydata.org/) - Traitement des données
- [PyInstaller](https://pyinstaller.org/) - Packaging exécutable

## 📞 Contact

- **Projet** : [survey-tool](https://github.com/votre-username/survey-tool)
- **Issues** : [GitHub Issues](https://github.com/votre-username/survey-tool/issues)
- **Documentation** : [Guide de démarrage](QUICKSTART.md)

---

**Version** : 1.0.0  
**Dernière mise à jour** : Décembre 2024  
**Statut** : Production Ready ✅