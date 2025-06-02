# Guide d'Installation Complet - Survey Tool

## 🚀 Installation Rapide (Recommandée)

### Étape 1: Cloner le Repository

```bash
git clone https://github.com/Berkaniis/survey-tool.git
cd survey-tool
```

### Étape 2: Configuration Automatique

```bash
python scripts/dev.py setup
```

Cette commande va :
- ✅ Créer un environnement virtuel Python
- ✅ Installer toutes les dépendances
- ✅ Configurer la base de données
- ✅ Créer les répertoires nécessaires

### Étape 3: Lancer l'Application

```bash
python scripts/dev.py run
```

## 📋 Prérequis Détaillés

### Système d'Exploitation
- **Windows 10/11** (fortement recommandé)
- Windows Server 2019/2022
- Linux Ubuntu 20.04+ (support expérimental)

### Matériel
- **Processeur**: Intel Core i3 ou équivalent AMD
- **RAM**: 4 GB minimum, 8 GB recommandé
- **Disque**: 2 GB d'espace libre
- **Résolution**: 1366x768 minimum, 1920x1080 recommandé

### Logiciels Requis

#### Python
```bash
# Vérifier la version Python
python --version
# Doit afficher Python 3.10 ou supérieur
```

**Installation Python (si nécessaire):**
1. Télécharger depuis [python.org](https://www.python.org/downloads/)
2. ⚠️ **Important**: Cocher "Add Python to PATH" pendant l'installation
3. Redémarrer le terminal après installation

#### Microsoft Outlook
- **Versions supportées**: Outlook 2016, 2019, 365
- **Configuration requise**: Au moins un compte email configuré
- **Test**: Ouvrir Outlook et envoyer un email de test

#### Git (Optionnel)
```bash
# Installation avec Chocolatey (Windows)
choco install git

# Ou télécharger depuis
# https://git-scm.com/download/win
```

## 🔧 Installation Manuelle Détaillée

### Option A: Avec Git

```bash
# 1. Cloner le repository
git clone https://github.com/Berkaniis/survey-tool.git
cd survey-tool

# 2. Créer l'environnement virtuel
python -m venv venv

# 3. Activer l'environnement virtuel
# Windows Command Prompt:
venv\Scripts\activate.bat

# Windows PowerShell:
venv\Scripts\Activate.ps1

# Linux/Mac:
source venv/bin/activate

# 4. Mettre à jour pip
python -m pip install --upgrade pip

# 5. Installer les dépendances
pip install -r requirements.txt

# 6. Initialiser la base de données
cd src
python -c "from backend.database import database; database.create_tables()"

# 7. Lancer l'application
python main.py
```

### Option B: Sans Git (Téléchargement ZIP)

1. **Télécharger le code**:
   - Aller sur https://github.com/Berkaniis/survey-tool
   - Cliquer sur "Code" → "Download ZIP"
   - Extraire dans un dossier (ex: `C:\survey-tool`)

2. **Suivre les étapes 2-7** de l'Option A

## 🏗️ Build de l'Exécutable

### Créer un Exécutable Portable

```bash
# Installation des outils de build
pip install pyinstaller

# Build simple
python scripts/build.py

# Build avec nettoyage
python scripts/build.py --clean

# Build avec installateur Windows
python scripts/build.py --installer
```

### Fichiers Générés

```
dist/
├── SurveyTool.exe          # Exécutable portable (≈50 MB)
└── SurveyTool-Setup.exe    # Installateur Windows (si --installer)
```

### Distribution

**Exécutable Portable:**
- Copier `SurveyTool.exe` sur n'importe quel PC Windows
- Double-cliquer pour lancer
- Aucune installation requise

**Installateur:**
- Distribuer `SurveyTool-Setup.exe`
- Installation classique avec raccourcis
- Désinstalleur inclus

## 🔧 Configuration Post-Installation

### 1. Premier Démarrage

L'application crée automatiquement :
- Base de données SQLite (`data.db`)
- Dossier de logs (`logs/`)
- Utilisateur administrateur par défaut

**Identifiants par défaut:**
- Email: `admin@company.com`
- Mot de passe: `admin123`

### 2. Configuration Outlook

```bash
# Test de la connexion Outlook
python -c "
from src.backend.providers.outlook_provider import OutlookCOMProvider
provider = OutlookCOMProvider()
print('Outlook disponible:', provider.validate_connection())
print('Comptes:', provider.get_available_accounts())
"
```

Si Outlook n'est pas détecté :
1. Ouvrir Outlook manuellement
2. Configurer au moins un compte email
3. Redémarrer l'application Survey Tool

### 3. Configuration Personnalisée

Éditer `config/config.yaml` :

```yaml
email:
  default_sender: "votre.email@entreprise.com"
  throttle:
    rate: 20  # Réduire si problèmes de performance

ui:
  default_language: "fr"  # Français par défaut
  theme: "dark"           # Thème sombre

performance:
  max_contacts_per_campaign: 50000  # Réduire si RAM limitée
```

## 🧪 Vérification de l'Installation

### Tests Automatiques

```bash
# Lancer la suite de tests
python scripts/dev.py test

# Tests spécifiques
pytest tests/test_database.py -v
pytest tests/test_outlook.py -v
pytest tests/test_import.py -v
```

### Tests Manuels

1. **Interface**:
   - Lancer l'application
   - Vérifier que l'interface s'affiche
   - Tester la connexion (admin@company.com / admin123)

2. **Outlook**:
   - Aller dans Settings → Email
   - Cliquer "Test Connection"
   - Vérifier la liste des comptes

3. **Import Excel**:
   - Créer une campagne de test
   - Importer un fichier Excel simple
   - Vérifier l'aperçu des données

## 🐛 Résolution des Problèmes d'Installation

### Erreur: "Python n'est pas reconnu"

**Solution:**
```bash
# Vérifier l'installation Python
where python
# Si aucun résultat, réinstaller Python avec "Add to PATH"
```

### Erreur: "Microsoft Visual C++ 14.0 is required"

**Solution:**
```bash
# Installer Microsoft C++ Build Tools
# Télécharger: https://visualstudio.microsoft.com/visual-cpp-build-tools/
```

### Erreur: "No module named 'win32com'"

**Solution:**
```bash
# Installer pywin32 manuellement
pip install pywin32
python venv/Scripts/pywin32_postinstall.py -install
```

### Erreur: "Access Denied" ou "Permission Denied"

**Solutions:**
1. **Lancer en tant qu'administrateur**
2. **Désactiver temporairement l'antivirus**
3. **Ajouter une exception dans Windows Defender**

### Erreur: "Outlook COM Error"

**Solutions:**
1. **Redémarrer Outlook complètement**
2. **Réparer l'installation Office**
3. **Vérifier les permissions COM** :

```bash
# Exécuter en tant qu'administrateur
dcomcnfg.exe
# Naviguer vers Component Services → Computers → My Computer → DCOM Config
# Trouver "Microsoft Outlook" → Properties → Security
# Ajouter permissions pour votre utilisateur
```

### Performance Lente

**Optimisations:**
```yaml
# Dans config/config.yaml
performance:
  max_contacts_per_campaign: 10000
  excel_chunk_size: 500
  
email:
  throttle:
    rate: 10  # Emails par minute
```

## 📦 Déploiement en Entreprise

### Installation Silencieuse

```bash
# Copier les fichiers
xcopy "survey-tool" "C:\Program Files\SurveyTool" /E /I

# Créer les raccourcis
powershell -Command "
$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut('C:\Users\Public\Desktop\Survey Tool.lnk')
$Shortcut.TargetPath = 'C:\Program Files\SurveyTool\dist\SurveyTool.exe'
$Shortcut.Save()
"
```

### Script de Déploiement PowerShell

```powershell
# deploy.ps1
param(
    [string]$InstallPath = "C:\Program Files\SurveyTool",
    [string]$RepoUrl = "https://github.com/Berkaniis/survey-tool.git"
)

# Vérifier les prérequis
if (!(Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Error "Python n'est pas installé ou pas dans le PATH"
    exit 1
}

# Cloner ou télécharger
if (Get-Command git -ErrorAction SilentlyContinue) {
    git clone $RepoUrl $InstallPath
} else {
    # Télécharger et extraire le ZIP
    $zipPath = "$env:TEMP\survey-tool.zip"
    Invoke-WebRequest "https://github.com/Berkaniis/survey-tool/archive/main.zip" -OutFile $zipPath
    Expand-Archive $zipPath -DestinationPath $InstallPath -Force
}

# Installer et construire
cd $InstallPath
python scripts/build.py --clean

Write-Host "Installation terminée dans $InstallPath"
```

## 🔄 Mise à Jour

### Mise à Jour du Code

```bash
# Avec Git
cd survey-tool
git pull origin main
pip install -r requirements.txt

# Sans Git (manuel)
# 1. Télécharger la nouvelle version
# 2. Sauvegarder data.db et config/
# 3. Remplacer les fichiers
# 4. Restaurer data.db et config/
```

### Sauvegarde Avant Mise à Jour

```bash
# Sauvegarder les données importantes
mkdir backup-$(date +%Y%m%d)
cp data.db backup-$(date +%Y%m%d)/
cp -r config/ backup-$(date +%Y%m%d)/
cp -r logs/ backup-$(date +%Y%m%d)/
```

## 📞 Support Installation

### Informations de Diagnostic

```bash
# Générer un rapport de diagnostic
python scripts/dev.py diagnose

# Ou manuellement
python --version
pip list | findstr -i "pywebview sqlmodel pandas outlook"
echo $PATH
```

### Contacts Support

- **Issues GitHub**: https://github.com/Berkaniis/survey-tool/issues
- **Documentation**: [README.md](README.md) et [QUICKSTART.md](QUICKSTART.md)
- **Logs**: Consulter `logs/app.log` pour les erreurs détaillées

---

✅ **Installation réussie ?** Suivez le [Guide de Démarrage Rapide](QUICKSTART.md) pour commencer à utiliser l'application !