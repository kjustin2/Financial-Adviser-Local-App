#!/usr/bin/env python3
"""
Cross-platform startup script for Financial Adviser Application
"""
import os
import sys
import subprocess
import shutil
from pathlib import Path

def check_command(command):
    """Check if a command is available in the system PATH"""
    return shutil.which(command) is not None

def run_command(command, cwd=None):
    """Run a command and return the result"""
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            cwd=cwd,
            capture_output=True,
            text=True
        )
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def main():
    print("Starting Financial Adviser Application...")
    print()
    
    # Check prerequisites
    print("Checking prerequisites...")
    
    if not check_command("poetry"):
        print("Error: Poetry is not installed or not in PATH")
        print("Please install Poetry from https://python-poetry.org/docs/#installation")
        sys.exit(1)
    
    if not check_command("node"):
        print("Error: Node.js is not installed or not in PATH")
        print("Please install Node.js from https://nodejs.org/")
        sys.exit(1)
    
    if not check_command("npm"):
        print("Error: npm is not installed or not in PATH")
        print("Please install npm (usually comes with Node.js)")
        sys.exit(1)
    
    print("✓ Poetry found")
    print("✓ Node.js found")
    print("✓ npm found")
    print()
    
    # Get the project root directory
    project_root = Path(__file__).parent
    
    # Install dependencies
    print("Checking and installing dependencies...")
    success, stdout, stderr = run_command("npm run install:all", cwd=project_root)
    
    if not success:
        print("Error installing dependencies:")
        print(stderr)
        sys.exit(1)
    
    print("✓ Dependencies installed")
    print()
    
    # Start the application
    print("Starting both backend and frontend servers...")
    print("Backend will run on: http://localhost:8000")
    print("Frontend will run on: http://localhost:5173")
    print()
    print("Press Ctrl+C to stop both servers")
    print()
    
    try:
        # Start the development servers
        subprocess.run("npm run dev:all", shell=True, cwd=project_root)
    except KeyboardInterrupt:
        print("\nShutting down servers...")
        print("Thank you for using Financial Adviser Application!")

if __name__ == "__main__":
    main()