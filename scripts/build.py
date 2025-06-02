#!/usr/bin/env python3
"""
Build script for Survey Tool
Creates a standalone executable using PyInstaller
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path
import argparse


def run_command(cmd, cwd=None):
    """Run a command and return the result."""
    print(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"Error running command: {' '.join(cmd)}")
        print(f"STDOUT: {result.stdout}")
        print(f"STDERR: {result.stderr}")
        sys.exit(1)
    
    return result


def clean_build():
    """Clean previous build artifacts."""
    print("Cleaning previous build artifacts...")
    
    dirs_to_clean = ['build', 'dist', '__pycache__']
    
    for dir_name in dirs_to_clean:
        if os.path.exists(dir_name):
            shutil.rmtree(dir_name)
            print(f"Removed {dir_name}")
    
    # Remove .pyc files
    for root, dirs, files in os.walk('.'):
        for file in files:
            if file.endswith('.pyc'):
                os.remove(os.path.join(root, file))


def install_dependencies():
    """Install required dependencies."""
    print("Installing dependencies...")
    
    run_command([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'])
    
    # Ensure PyInstaller is installed
    run_command([sys.executable, '-m', 'pip', 'install', 'pyinstaller>=6.0'])


def create_version_file():
    """Create version file for Windows executable."""
    version_file_content = """
# UTF-8
VSVersionInfo(
  ffi=FixedFileInfo(
    filevers=(1, 0, 0, 0),
    prodvers=(1, 0, 0, 0),
    mask=0x3f,
    flags=0x0,
    OS=0x4,
    fileType=0x1,
    subtype=0x0,
    date=(0, 0)
  ),
  kids=[
    StringFileInfo(
      [
        StringTable(
          u'040904B0',
          [
            StringStruct(u'CompanyName', u'Survey Tool Company'),
            StringStruct(u'FileDescription', u'Customer Satisfaction Survey Tool'),
            StringStruct(u'FileVersion', u'1.0.0.0'),
            StringStruct(u'InternalName', u'SurveyTool'),
            StringStruct(u'LegalCopyright', u'Copyright © 2024'),
            StringStruct(u'OriginalFilename', u'SurveyTool.exe'),
            StringStruct(u'ProductName', u'Survey Tool'),
            StringStruct(u'ProductVersion', u'1.0.0.0')
          ]
        )
      ]
    ),
    VarFileInfo([VarStruct(u'Translation', [1033, 1200])])
  ]
)
"""
    
    with open('version.txt', 'w') as f:
        f.write(version_file_content)
    
    print("Created version.txt")


def create_pyinstaller_spec():
    """Create PyInstaller spec file."""
    spec_content = """# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(
    ['src/main.py'],
    pathex=[],
    binaries=[],
    datas=[
        ('src/frontend/web', 'web'),
        ('config/config.yaml', 'config'),
        ('config/logging.yaml', 'config'),
        ('LICENSE', '.'),
    ],
    hiddenimports=[
        'sqlalchemy.sql.default_comparator',
        'win32com.client',
        'pythoncom',
        'pywintypes',
        'sqlmodel',
        'pandas',
        'openpyxl',
        'xlrd',
        'passlib.handlers.bcrypt',
        'passlib.context',
        'jose.jwt',
        'cryptography.fernet',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        'matplotlib',
        'IPython',
        'jupyter',
        'notebook',
        'tkinter',
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

# Filter out unnecessary files
def filter_binaries(binaries):
    excluded = [
        'api-ms-win',
        'msvcp',
        'vcruntime',
        'Qt5',
        'PyQt5',
    ]
    
    return [
        (name, path, kind) for name, path, kind in binaries
        if not any(ex in name.lower() for ex in excluded)
    ]

a.binaries = filter_binaries(a.binaries)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='SurveyTool',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,  # Hide console window
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    version='version.txt',
    icon='assets/icon.ico' if os.path.exists('assets/icon.ico') else None,
    uac_admin=False,
    uac_uiaccess=False,
)
"""
    
    with open('SurveyTool.spec', 'w') as f:
        f.write(spec_content)
    
    print("Created SurveyTool.spec")


def create_icon():
    """Create a simple icon file if none exists."""
    icon_path = Path('assets/icon.ico')
    
    if not icon_path.exists():
        icon_path.parent.mkdir(exist_ok=True)
        
        # For simplicity, we'll skip icon creation
        # In a real project, you'd want to create a proper .ico file
        print("Note: No icon file found. Consider adding assets/icon.ico")
    
    return icon_path.exists()


def build_executable(debug=False):
    """Build the executable using PyInstaller."""
    print("Building executable...")
    
    # Create spec file
    create_pyinstaller_spec()
    
    # Create version file for Windows
    if sys.platform == 'win32':
        create_version_file()
    
    # Build command
    cmd = [sys.executable, '-m', 'PyInstaller']
    
    if not debug:
        cmd.append('--clean')
    
    cmd.extend([
        '--onefile',
        '--windowed',  # No console window
        'SurveyTool.spec'
    ])
    
    # Run PyInstaller
    run_command(cmd)
    
    print("Build completed successfully!")
    
    # Show output location
    if sys.platform == 'win32':
        exe_path = Path('dist/SurveyTool.exe')
    else:
        exe_path = Path('dist/SurveyTool')
    
    if exe_path.exists():
        print(f"Executable created: {exe_path.absolute()}")
        print(f"Size: {exe_path.stat().st_size / (1024*1024):.1f} MB")
    else:
        print("Warning: Executable not found at expected location")


def create_installer():
    """Create an installer (Windows only)."""
    if sys.platform != 'win32':
        print("Installer creation is only supported on Windows")
        return
    
    try:
        # Check if NSIS is available
        run_command(['makensis', '/VERSION'])
        
        print("Creating installer with NSIS...")
        
        # Create NSIS script
        nsis_script = """
; Survey Tool Installer Script
!define APP_NAME "Survey Tool"
!define APP_VERSION "1.0.0"
!define APP_PUBLISHER "Survey Tool Company"
!define APP_URL "https://github.com/company/survey-tool"
!define APP_EXE "SurveyTool.exe"

Name "${APP_NAME}"
OutFile "SurveyTool-Setup.exe"
InstallDir "$PROGRAMFILES\\${APP_NAME}"
RequestExecutionLevel admin

Section "MainSection" SEC01
    SetOutPath "$INSTDIR"
    File "dist\\${APP_EXE}"
    
    ; Create shortcuts
    CreateDirectory "$SMPROGRAMS\\${APP_NAME}"
    CreateShortCut "$SMPROGRAMS\\${APP_NAME}\\${APP_NAME}.lnk" "$INSTDIR\\${APP_EXE}"
    CreateShortCut "$DESKTOP\\${APP_NAME}.lnk" "$INSTDIR\\${APP_EXE}"
    
    ; Write uninstaller
    WriteUninstaller "$INSTDIR\\Uninstall.exe"
    
    ; Registry entries
    WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${APP_NAME}" "DisplayName" "${APP_NAME}"
    WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${APP_NAME}" "UninstallString" "$INSTDIR\\Uninstall.exe"
SectionEnd

Section "Uninstall"
    Delete "$INSTDIR\\${APP_EXE}"
    Delete "$INSTDIR\\Uninstall.exe"
    Delete "$SMPROGRAMS\\${APP_NAME}\\${APP_NAME}.lnk"
    Delete "$DESKTOP\\${APP_NAME}.lnk"
    RMDir "$SMPROGRAMS\\${APP_NAME}"
    RMDir "$INSTDIR"
    
    DeleteRegKey HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${APP_NAME}"
SectionEnd
"""
        
        with open('installer.nsi', 'w') as f:
            f.write(nsis_script)
        
        run_command(['makensis', 'installer.nsi'])
        
        print("Installer created: SurveyTool-Setup.exe")
        
    except subprocess.CalledProcessError:
        print("NSIS not found. Skipping installer creation.")
        print("To create an installer, install NSIS from https://nsis.sourceforge.io/")


def main():
    """Main build function."""
    parser = argparse.ArgumentParser(description='Build Survey Tool executable')
    parser.add_argument('--clean', action='store_true', help='Clean build artifacts before building')
    parser.add_argument('--debug', action='store_true', help='Build in debug mode')
    parser.add_argument('--installer', action='store_true', help='Create installer (Windows only)')
    parser.add_argument('--no-deps', action='store_true', help='Skip dependency installation')
    
    args = parser.parse_args()
    
    print("Survey Tool Build Script")
    print("=" * 40)
    
    # Change to project root
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    os.chdir(project_root)
    
    print(f"Working directory: {os.getcwd()}")
    
    try:
        if args.clean:
            clean_build()
        
        if not args.no_deps:
            install_dependencies()
        
        # Create icon if needed
        create_icon()
        
        # Build executable
        build_executable(debug=args.debug)
        
        # Create installer if requested
        if args.installer:
            create_installer()
        
        print("\nBuild process completed successfully!")
        print("\nNext steps:")
        print("1. Test the executable in dist/")
        print("2. Create documentation")
        print("3. Package for distribution")
        
    except KeyboardInterrupt:
        print("\nBuild interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\nBuild failed: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()