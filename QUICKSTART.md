# Survey Tool - Guide de Démarrage Rapide

## Vue d'ensemble

L'outil de gestion d'enquêtes de satisfaction client est une application desktop autonome permettant de :

- ✅ Importer des listes de contacts depuis Excel
- ✅ Créer et gérer des campagnes d'enquêtes
- ✅ Envoyer des emails via Outlook
- ✅ Suivre les réponses et générer des statistiques
- ✅ Interface multilingue (EN, FR, DE, ES)

## Installation Rapide

### Prérequis

- Windows 10/11 (recommandé)
- Python 3.10 ou supérieur
- Microsoft Outlook installé
- 4 GB RAM minimum, 8 GB recommandé

### 1. Cloner le projet

```bash
git clone <repository-url>
cd survey-tool
```

### 2. Configuration automatique

```bash
# Option 1: Script de développement (recommandé)
python scripts/dev.py setup

# Option 2: Installation manuelle
python -m venv venv
venv\Scripts\activate  # Windows
# ou
source venv/bin/activate  # Linux/Mac

pip install -r requirements.txt
```

### 3. Lancer l'application

```bash
# Développement
python scripts/dev.py run

# Ou directement
cd src
python main.py
```

## Première Utilisation

### 1. Connexion

L'application crée automatiquement un utilisateur admin :
- **Email**: admin@company.com
- **Mot de passe**: admin123

### 2. Créer votre première campagne

1. Cliquez sur "New Campaign" dans le dashboard
2. Entrez un titre descriptif (ex: "Enquête Q4 2023")
3. Sélectionnez la date de lancement
4. Choisissez la langue par défaut

### 3. Importer des contacts

1. Préparez un fichier Excel (.xlsx/.xls) avec au minimum :
   - Colonne "email" (obligatoire)
   - Colonne "first_name" (obligatoire)
   - Colonne "last_name" (obligatoire)
   - Colonnes supplémentaires optionnelles

2. Dans votre campagne, cliquez sur "Import Contacts"
3. Suivez l'assistant d'importation en 3 étapes
4. Vérifiez l'aperçu avant confirmation

### 4. Créer un modèle d'email

1. Allez dans la section "Templates"
2. Cliquez sur "Create Template"
3. Utilisez les variables disponibles :
   - `{first_name}` - Prénom du contact
   - `{last_name}` - Nom du contact
   - `{email}` - Email du contact
   - Plus toutes les colonnes de votre fichier Excel

### 5. Envoyer des emails

1. Dans votre campagne, onglet "Send Emails"
2. Sélectionnez un modèle d'email
3. Choisissez les destinataires (tous ou filtrés)
4. Prévisualisez et confirmez l'envoi

## Structure des Fichiers Excel

Votre fichier Excel doit respecter cette structure minimale :

| email | first_name | last_name | company | department |
|-------|------------|-----------|---------|------------|
| john.doe@company.com | John | Doe | ACME Corp | Sales |
| jane.smith@company.com | Jane | Smith | ACME Corp | Marketing |

### Colonnes obligatoires :
- `email` - Adresse email valide
- `first_name` - Prénom
- `last_name` - Nom de famille

### Colonnes optionnelles :
Vous pouvez ajouter autant de colonnes que nécessaire. Elles seront disponibles comme variables dans vos modèles d'email.

## Configuration Outlook

### Première configuration

1. Assurez-vous qu'Outlook est installé et configuré
2. Ouvrez Outlook au moins une fois avant d'utiliser l'application
3. L'application utilisera le compte Outlook par défaut

### Comptes multiples

Si vous avez plusieurs comptes Outlook :
1. Allez dans Settings > Email
2. Sélectionnez le compte expéditeur par défaut
3. L'application listera tous les comptes disponibles

## Build pour Production

### Créer un exécutable

```bash
# Build standard
python scripts/build.py

# Build avec nettoyage
python scripts/build.py --clean

# Build avec installateur Windows
python scripts/build.py --installer
```

L'exécutable sera créé dans le dossier `dist/`.

### Distribution

1. **Exécutable seul** : `dist/SurveyTool.exe` (portable)
2. **Installateur** : `SurveyTool-Setup.exe` (installation Windows)

## Fonctionnalités Avancées

### Import en mode fusion

- **Remplacer** : Supprime tous les contacts existants
- **Ajouter** : Conserve les contacts existants, ajoute les nouveaux

### Gestion des relances

1. Créez une campagne avec envoi initial
2. Attendez quelques jours
3. Envoyez une relance aux contacts qui n'ont pas répondu
4. Filtrez par statut : "Pending" ou "Sent"

### Export des résultats

- Format Excel (.xlsx) ou CSV
- Inclut tous les statuts et timestamps
- Données anonymisées pour la conformité RGPD

### Audit et traçabilité

- Toutes les actions sont enregistrées
- Logs rotatifs quotidiens
- Historique des modifications
- Sauvegarde automatique de la base de données

## Développement

### Structure du projet

```
survey-tool/
├── src/
│   ├── backend/          # Services Python
│   ├── frontend/         # Interface HTML/CSS/JS
│   └── main.py          # Point d'entrée
├── config/              # Configuration
├── scripts/             # Scripts de build/dev
└── tests/               # Tests automatisés
```

### Commandes de développement

```bash
# Configuration environnement
python scripts/dev.py setup

# Lancer en mode debug
python scripts/dev.py run --debug

# Tests automatisés
python scripts/dev.py test

# Vérification code
python scripts/dev.py lint
```

### Tests

```bash
# Tests unitaires
pytest tests/

# Tests avec couverture
pytest tests/ --cov=src --cov-report=html
```

## Résolution de Problèmes

### Outlook non détecté

1. Vérifiez qu'Outlook est installé et configuré
2. Redémarrez l'application
3. Vérifiez les permissions Windows

### Import Excel échoue

1. Vérifiez le format du fichier (.xlsx/.xls uniquement)
2. Contrôlez que les colonnes obligatoires sont présentes
3. Limitez la taille à 50 MB et 50 000 lignes maximum

### Performance lente

1. Limitez le nombre de contacts par campagne
2. Vérifiez l'espace disque disponible
3. Fermez les autres applications gourmandes

### Erreurs de permissions

1. Lancez l'application en tant qu'administrateur
2. Vérifiez les paramètres antivirus
3. Ajoutez une exception pour l'exécutable

## Support

### Logs et diagnostic

Les logs de l'application se trouvent dans :
- `logs/app.log` - Logs généraux
- `logs/audit.log` - Audit des actions
- `data.db` - Base de données SQLite

### Sauvegarde

La base de données est automatiquement sauvegardée :
- Sauvegarde quotidienne
- Conservation 30 jours
- Export manuel disponible dans Settings

### Contact

Pour le support technique :
1. Consultez les logs d'erreur
2. Préparez les étapes de reproduction
3. Contactez l'équipe de développement

## Conformité et Sécurité

### RGPD

- Droit à l'oubli : Suppression complète des contacts
- Export des données : Fonction d'export individuel
- Consentement : Gestion des opt-out
- Logs anonymisés après 90 jours

### Sécurité

- Mots de passe chiffrés (bcrypt)
- Sessions sécurisées avec timeout
- Audit complet des actions
- Base de données locale chiffrée

---

**Version**: 1.0.0  
**Dernière mise à jour**: Décembre 2024  
**Licence**: MIT