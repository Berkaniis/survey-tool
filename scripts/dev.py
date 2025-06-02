#!/usr/bin/env python3
"""
Development script for Survey Tool
Quick setup and run for development
"""

import os
import sys
import subprocess
from pathlib import Path
import argparse


def run_command(cmd, cwd=None, check=True):
    """Run a command."""
    print(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=cwd)
    
    if check and result.returncode != 0:
        print(f"Command failed with exit code {result.returncode}")
        sys.exit(1)
    
    return result


def setup_dev_environment():
    """Set up development environment."""
    print("Setting up development environment...")
    
    # Create virtual environment if it doesn't exist
    if not Path('venv').exists():
        print("Creating virtual environment...")
        run_command([sys.executable, '-m', 'venv', 'venv'])
    
    # Determine pip path
    if sys.platform == 'win32':
        pip_path = 'venv/Scripts/pip.exe'
        python_path = 'venv/Scripts/python.exe'
    else:
        pip_path = 'venv/bin/pip'
        python_path = 'venv/bin/python'
    
    # Install dependencies
    print("Installing dependencies...")
    run_command([pip_path, 'install', '-r', 'requirements.txt'])
    run_command([pip_path, 'install', '-r', 'requirements-dev.txt'])
    
    print("Development environment setup complete!")
    return python_path


def create_test_data():
    """Create test data for development."""
    print("Creating test data...")
    
    # This would create sample campaigns, contacts, etc.
    # For now, we'll just create the logs directory
    Path('logs').mkdir(exist_ok=True)
    
    print("Test data created!")


def run_tests():
    """Run the test suite."""
    print("Running tests...")
    
    # Create tests directory if it doesn't exist
    test_dir = Path('tests')
    test_dir.mkdir(exist_ok=True)
    
    # Create a simple test file if none exists
    test_file = test_dir / 'test_basic.py'
    if not test_file.exists():
        test_content = '''"""Basic tests for Survey Tool."""

import pytest
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'src'))

def test_imports():
    """Test that basic imports work."""
    try:
        from backend.database import database
        from backend.services import AuthService, CampaignService
        assert True
    except ImportError as e:
        pytest.fail(f"Import failed: {e}")

def test_config_exists():
    """Test that config file exists."""
    config_path = Path(__file__).parent.parent / 'config' / 'config.yaml'
    assert config_path.exists(), "Config file not found"

def test_frontend_exists():
    """Test that frontend files exist."""
    frontend_path = Path(__file__).parent.parent / 'src' / 'frontend' / 'web' / 'index.html'
    assert frontend_path.exists(), "Frontend index.html not found"
'''
        test_file.write_text(test_content)
    
    # Run pytest
    try:
        run_command([sys.executable, '-m', 'pytest', 'tests/', '-v'])
    except:
        print("Tests failed or pytest not installed. Installing pytest...")
        run_command([sys.executable, '-m', 'pip', 'install', 'pytest'])
        run_command([sys.executable, '-m', 'pytest', 'tests/', '-v'])


def run_app(debug=False):
    """Run the application."""
    print("Starting Survey Tool...")
    
    # Change to src directory
    os.chdir('src')
    
    cmd = [sys.executable, 'main.py']
    if debug:
        cmd.append('--debug')
    
    try:
        run_command(cmd, check=False)
    except KeyboardInterrupt:
        print("\nApplication stopped by user")
    finally:
        # Change back to project root
        os.chdir('..')


def lint_code():
    """Run code linting."""
    print("Running code linting...")
    
    try:
        # Run black
        run_command([sys.executable, '-m', 'black', 'src/', '--check'])
        print("✓ Black formatting check passed")
    except:
        print("Running black formatter...")
        run_command([sys.executable, '-m', 'pip', 'install', 'black'])
        run_command([sys.executable, '-m', 'black', 'src/'])
        print("✓ Code formatted with black")
    
    try:
        # Run flake8
        run_command([sys.executable, '-m', 'flake8', 'src/', '--max-line-length=88'])
        print("✓ Flake8 linting passed")
    except:
        print("Installing flake8...")
        run_command([sys.executable, '-m', 'pip', 'install', 'flake8'])
        run_command([sys.executable, '-m', 'flake8', 'src/', '--max-line-length=88'], check=False)


def main():
    """Main development function."""
    parser = argparse.ArgumentParser(description='Survey Tool Development Script')
    parser.add_argument('action', choices=['setup', 'run', 'test', 'lint', 'data'], 
                       help='Action to perform')
    parser.add_argument('--debug', action='store_true', help='Run in debug mode')
    
    args = parser.parse_args()
    
    print("Survey Tool Development Script")
    print("=" * 40)
    
    # Change to project root
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    os.chdir(project_root)
    
    print(f"Working directory: {os.getcwd()}")
    
    try:
        if args.action == 'setup':
            python_path = setup_dev_environment()
            create_test_data()
            print(f"\nSetup complete! Use '{python_path} scripts/dev.py run' to start the app")
            
        elif args.action == 'run':
            run_app(debug=args.debug)
            
        elif args.action == 'test':
            run_tests()
            
        elif args.action == 'lint':
            lint_code()
            
        elif args.action == 'data':
            create_test_data()
            
    except KeyboardInterrupt:
        print("\nInterrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\nError: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()