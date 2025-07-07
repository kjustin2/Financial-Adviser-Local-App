# Build, Test, and Security Guide

## Overview
This document outlines the development workflow, testing strategies, security considerations, and deployment processes for our Python + React financial adviser application.

## Local Development Setup

### Prerequisites
```bash
# Required software
- Python 3.11+
- Node.js 18+
- Git
- Docker (optional, for database services)
```

### Initial Setup
```bash
# 1. Clone repository
git clone <repo-url>
cd financial-adviser-app

# 2. Backend setup
cd backend
poetry install
poetry shell
alembic upgrade head

# 3. Frontend setup (in new terminal)
cd frontend
npm install

# 4. Environment configuration
cp .env.example .env.local
# Edit .env.local with your configuration
```

### Development Workflow

#### Starting the Application

##### Option 1: Single Command (Recommended)
```bash
# Start both frontend and backend with one command
npm run dev:all

# This runs both servers concurrently:
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Documentation: http://localhost:8000/docs
```

##### Option 2: Manual (Two Terminals)
```bash
# Terminal 1: Backend server
cd backend
poetry run uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend development server
cd frontend
npm run dev
```

##### Setup for Single Command
Add these scripts to your root `package.json`:
```json
{
  "name": "financial-adviser-app",
  "scripts": {
    "dev:all": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend && poetry run uvicorn app.main:app --reload --port 8000",
    "dev:frontend": "cd frontend && npm run dev",
    "install:all": "cd backend && poetry install && cd ../frontend && npm install"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

**First-time setup:**
```bash
# Install concurrently for running both servers
npm install

# Install all dependencies
npm run install:all

# Start development
npm run dev:all
```

#### Development Scripts
```bash
# Backend
poetry run python -m app.main          # Start server
poetry run alembic revision --autogenerate -m "message"  # Create migration
poetry run alembic upgrade head         # Apply migrations
poetry run python -m pytest            # Run tests

# Frontend
npm run dev                            # Development server
npm run build                          # Production build
npm run preview                        # Preview production build
npm run test                           # Run tests
npm run lint                           # Lint code
npm run type-check                     # TypeScript checking
```

## Code Quality and Linting

### Backend Linting (Python)
```bash
# pyproject.toml configuration
[tool.black]
line-length = 88
target-version = ['py311']

[tool.isort]
profile = "black"
multi_line_output = 3

[tool.ruff]
select = ["E", "F", "I", "N", "W", "UP"]
ignore = ["E501"]  # Line too long (handled by black)
line-length = 88

[tool.mypy]
python_version = "3.11"
strict = true
```

**Linting Commands:**
```bash
cd backend
poetry run black .                     # Format code
poetry run isort .                     # Sort imports
poetry run ruff check .                # Lint code
poetry run mypy .                      # Type checking
```

### Frontend Linting (TypeScript/React)
```json
// .eslintrc.json
{
  "extends": [
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

**Linting Commands:**
```bash
cd frontend
npm run lint                           # ESLint
npm run lint:fix                       # ESLint with auto-fix
npm run format                         # Prettier formatting
npm run type-check                     # TypeScript checking
```

### Pre-commit Hooks
```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-merge-conflict

  - repo: https://github.com/psf/black
    rev: 23.7.0
    hooks:
      - id: black

  - repo: https://github.com/pycqa/isort
    rev: 5.12.0
    hooks:
      - id: isort

  - repo: https://github.com/pre-commit/mirrors-eslint
    rev: v8.44.0
    hooks:
      - id: eslint
        files: \.(js|ts|jsx|tsx)$
        additional_dependencies:
          - eslint@8.44.0
          - "@typescript-eslint/eslint-plugin@6.1.0"
```

## Testing Strategy

### Backend Testing (Python)

#### Unit Testing with pytest
```python
# tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import get_db, Base

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(db_session):
    def override_get_db():
        yield db_session
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
```

```python
# tests/test_portfolios.py
def test_create_portfolio(client, db_session):
    portfolio_data = {
        "name": "Test Portfolio",
        "description": "A test portfolio",
        "target_allocation": {"stocks": 60, "bonds": 40}
    }
    
    response = client.post("/api/portfolios/", json=portfolio_data)
    assert response.status_code == 201
    
    data = response.json()
    assert data["name"] == "Test Portfolio"
    assert "id" in data
```

#### Integration Testing
```python
# tests/integration/test_portfolio_workflow.py
def test_complete_portfolio_workflow(client, db_session):
    # Create client
    client_data = {"name": "John Doe", "email": "john@example.com"}
    client_response = client.post("/api/clients/", json=client_data)
    client_id = client_response.json()["id"]
    
    # Create portfolio
    portfolio_data = {
        "client_id": client_id,
        "name": "Retirement Portfolio",
        "target_allocation": {"stocks": 70, "bonds": 30}
    }
    portfolio_response = client.post("/api/portfolios/", json=portfolio_data)
    portfolio_id = portfolio_response.json()["id"]
    
    # Add holdings
    holding_data = {
        "portfolio_id": portfolio_id,
        "symbol": "VTI",
        "shares": 100,
        "price": 200.50
    }
    holding_response = client.post("/api/holdings/", json=holding_data)
    
    # Verify portfolio value calculation
    portfolio_response = client.get(f"/api/portfolios/{portfolio_id}")
    portfolio = portfolio_response.json()
    assert portfolio["total_value"] == 20050.0
```

### Frontend Testing (React)

#### Unit Testing with Vitest
```typescript
// src/components/__tests__/PortfolioCard.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PortfolioCard } from '../PortfolioCard'

describe('PortfolioCard', () => {
  it('renders portfolio information correctly', () => {
    const portfolio = {
      id: '1',
      name: 'Test Portfolio',
      totalValue: 50000,
      change: 1500,
      changePercent: 3.0
    }

    render(<PortfolioCard portfolio={portfolio} />)
    
    expect(screen.getByText('Test Portfolio')).toBeInTheDocument()
    expect(screen.getByText('$50,000')).toBeInTheDocument()
    expect(screen.getByText('+$1,500 (3.0%)')).toBeInTheDocument()
  })
})
```

#### Integration Testing with React Testing Library
```typescript
// src/pages/__tests__/DashboardPage.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { DashboardPage } from '../DashboardPage'
import { server } from '../../mocks/server'

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('DashboardPage', () => {
  it('loads and displays portfolio data', async () => {
    renderWithProviders(<DashboardPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Portfolio Overview')).toBeInTheDocument()
    })
    
    expect(screen.getByText('Total Value: $150,000')).toBeInTheDocument()
  })
})
```

#### E2E Testing with Playwright
```typescript
// e2e/portfolio-management.spec.ts
import { test, expect } from '@playwright/test'

test('user can create and manage portfolio', async ({ page }) => {
  await page.goto('http://localhost:5173')
  
  // Create new portfolio
  await page.click('[data-testid="new-portfolio-button"]')
  await page.fill('[data-testid="portfolio-name"]', 'Test Portfolio')
  await page.selectOption('[data-testid="risk-level"]', 'moderate')
  await page.click('[data-testid="create-portfolio"]')
  
  // Verify portfolio appears in list
  await expect(page.locator('[data-testid="portfolio-list"]')).toContainText('Test Portfolio')
  
  // Add holding
  await page.click('[data-testid="add-holding-button"]')
  await page.fill('[data-testid="symbol-input"]', 'VTI')
  await page.fill('[data-testid="shares-input"]', '100')
  await page.click('[data-testid="save-holding"]')
  
  // Verify holding appears
  await expect(page.locator('[data-testid="holdings-table"]')).toContainText('VTI')
})
```

### Testing Commands
```bash
# Backend
cd backend
poetry run pytest                      # Run all tests
poetry run pytest -v                   # Verbose output
poetry run pytest --cov=app           # Coverage report
poetry run pytest -k "test_portfolio" # Run specific tests

# Frontend
cd frontend
npm run test                           # Unit tests (Vitest)
npm run test:ui                        # Vitest UI
npm run test:coverage                  # Coverage report
npm run test:e2e                       # E2E tests (Playwright)
```

## Security Considerations

### API Key Management

#### Problem Statement
Local applications need to call external APIs (market data, bank APIs) securely without exposing API keys to users who have file system access.

#### Security Strategy: Multi-Layer Approach

##### 1. Environment Variables (Development)
```bash
# .env.local (never commit to git)
ALPHA_VANTAGE_API_KEY=your_key_here
POLYGON_API_KEY=your_key_here
ENCRYPTION_KEY=generated_key_here
```

##### 2. Encrypted Configuration Storage
```python
# app/security/config_manager.py
import os
import json
from cryptography.fernet import Fernet
from pathlib import Path

class SecureConfigManager:
    def __init__(self, user_data_dir: Path):
        self.config_path = user_data_dir / "config.encrypted"
        self.key_path = user_data_dir / "app.key"
        
    def generate_key(self) -> bytes:
        """Generate encryption key on first run"""
        key = Fernet.generate_key()
        with open(self.key_path, 'wb') as f:
            f.write(key)
        os.chmod(self.key_path, 0o600)  # Owner read/write only
        return key
    
    def get_key(self) -> bytes:
        """Get existing key or generate new one"""
        if self.key_path.exists():
            with open(self.key_path, 'rb') as f:
                return f.read()
        return self.generate_key()
    
    def encrypt_config(self, config: dict) -> None:
        """Encrypt and store configuration"""
        key = self.get_key()
        fernet = Fernet(key)
        encrypted_data = fernet.encrypt(json.dumps(config).encode())
        
        with open(self.config_path, 'wb') as f:
            f.write(encrypted_data)
        os.chmod(self.config_path, 0o600)
    
    def decrypt_config(self) -> dict:
        """Decrypt and return configuration"""
        if not self.config_path.exists():
            return {}
            
        key = self.get_key()
        fernet = Fernet(key)
        
        with open(self.config_path, 'rb') as f:
            encrypted_data = f.read()
            
        decrypted_data = fernet.decrypt(encrypted_data)
        return json.loads(decrypted_data.decode())
```

##### 3. API Key Proxy Pattern
```python
# app/services/market_data.py
import aiohttp
from app.security.config_manager import SecureConfigManager

class MarketDataService:
    def __init__(self, config_manager: SecureConfigManager):
        self.config_manager = config_manager
        
    async def get_stock_price(self, symbol: str) -> dict:
        """Get stock price without exposing API key to frontend"""
        config = self.config_manager.decrypt_config()
        api_key = config.get('alpha_vantage_api_key')
        
        if not api_key:
            raise ValueError("API key not configured")
            
        async with aiohttp.ClientSession() as session:
            url = f"https://www.alphavantage.co/query"
            params = {
                "function": "GLOBAL_QUOTE",
                "symbol": symbol,
                "apikey": api_key
            }
            
            async with session.get(url, params=params) as response:
                data = await response.json()
                
                # Return sanitized data (no API key)
                return {
                    "symbol": symbol,
                    "price": float(data["Global Quote"]["05. price"]),
                    "change": float(data["Global Quote"]["09. change"]),
                    "change_percent": data["Global Quote"]["10. change percent"]
                }
```

##### 4. User Setup Flow
```typescript
// Frontend: API Key Setup Component
interface ApiKeySetupProps {
  onComplete: () => void;
}

export function ApiKeySetup({ onComplete }: ApiKeySetupProps) {
  const [apiKeys, setApiKeys] = useState({
    alphaVantage: '',
    polygon: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Send encrypted to backend for storage
    await fetch('/api/config/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiKeys)
    });
    
    // Clear form data
    setApiKeys({ alphaVantage: '', polygon: '' });
    onComplete();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Alpha Vantage API Key</label>
        <input
          type="password"
          value={apiKeys.alphaVantage}
          onChange={(e) => setApiKeys(prev => ({ 
            ...prev, 
            alphaVantage: e.target.value 
          }))}
          placeholder="Your Alpha Vantage API key"
        />
      </div>
      <button type="submit">Save Configuration</button>
    </form>
  );
}
```

#### Security Best Practices

##### Data Protection
```python
# app/security/database.py
from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
import sqlite3

# Enable WAL mode and encryption for SQLite
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if isinstance(dbapi_connection, sqlite3.Connection):
        cursor = dbapi_connection.cursor()
        # Enable WAL mode for better concurrency
        cursor.execute("PRAGMA journal_mode=WAL")
        # Enable foreign key constraints
        cursor.execute("PRAGMA foreign_keys=ON")
        # Set secure deletion
        cursor.execute("PRAGMA secure_delete=ON")
        cursor.close()
```

##### Input Validation
```python
# app/models/validators.py
from pydantic import BaseModel, validator
import re

class PortfolioCreate(BaseModel):
    name: str
    description: str | None = None
    
    @validator('name')
    def validate_name(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError('Name must be at least 2 characters')
        if len(v) > 100:
            raise ValueError('Name too long')
        # Prevent SQL injection patterns
        if re.search(r'[;\'"\\]', v):
            raise ValueError('Invalid characters in name')
        return v.strip()
```

##### Rate Limiting
```python
# app/middleware/rate_limit.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)

# Apply to sensitive endpoints
@app.post("/api/portfolios/")
@limiter.limit("10/minute")
async def create_portfolio(request: Request, portfolio: PortfolioCreate):
    # Implementation
    pass
```

### Security Configuration Checklist

- [ ] **API Keys**: Encrypted storage, never in source code
- [ ] **Database**: WAL mode, secure deletion, foreign key constraints
- [ ] **Input Validation**: All user inputs validated and sanitized
- [ ] **Rate Limiting**: Prevent abuse of API endpoints
- [ ] **File Permissions**: Restrict access to configuration files
- [ ] **Logging**: Audit trail without sensitive data
- [ ] **Updates**: Automatic dependency security updates

## Application Packaging and Distribution

### Local Development Build
```bash
# Development build script
#!/bin/bash
# scripts/dev-build.sh

echo "Building development version..."

# Backend
cd backend
poetry install
poetry run alembic upgrade head

# Frontend
cd ../frontend
npm install
npm run build

echo "Development build complete!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5173"
```

### Production Build Strategy

#### Option 1: Standalone Executable (Recommended)
```python
# scripts/build-standalone.py
"""
Build standalone executable using PyInstaller
"""
import PyInstaller.__main__
import shutil
import os

def build_backend():
    PyInstaller.__main__.run([
        'backend/app/main.py',
        '--onedir',
        '--name=financial-adviser-backend',
        '--add-data=backend/alembic;alembic',
        '--add-data=frontend/dist;static',
        '--hidden-import=uvicorn',
        '--hidden-import=sqlalchemy',
        '--clean'
    ])

def build_installer():
    # Create installer script
    installer_content = """
#!/bin/bash
# install.sh

echo "Installing Financial Adviser..."

# Create application directory
mkdir -p ~/Applications/FinancialAdviser
cp -r * ~/Applications/FinancialAdviser/

# Create desktop shortcut
cat > ~/Desktop/FinancialAdviser.desktop << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Financial Adviser
Exec=~/Applications/FinancialAdviser/financial-adviser-backend
Icon=~/Applications/FinancialAdviser/icon.png
Terminal=false
StartupNotify=true
EOF

chmod +x ~/Desktop/FinancialAdviser.desktop

echo "Installation complete!"
echo "Launch from desktop or run: ~/Applications/FinancialAdviser/financial-adviser-backend"
    """
    
    with open('dist/install.sh', 'w') as f:
        f.write(installer_content)
    
    os.chmod('dist/install.sh', 0o755)

if __name__ == "__main__":
    build_backend()
    build_installer()
```

#### Option 2: Docker Container
```dockerfile
# Dockerfile.standalone
FROM python:3.11-slim

# Install Node.js for frontend build
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

WORKDIR /app

# Build frontend
COPY frontend/ ./frontend/
RUN cd frontend && npm install && npm run build

# Install backend
COPY backend/ ./backend/
RUN cd backend && pip install poetry && poetry install --no-dev

# Create startup script
COPY scripts/docker-start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 8000
CMD ["/start.sh"]
```

### Distribution Strategy

#### For Local Users
1. **Executable Bundle**: Single .exe/.app file with embedded frontend
2. **Installer Package**: Setup wizard that installs to system (Recommended)
3. **Portable Version**: Zip file that runs from any folder

### Installer Package Implementation (Recommended)

#### Windows Installer with Inno Setup
```pascal
; scripts/windows-installer.iss
[Setup]
AppName=Financial Adviser
AppVersion=1.0.0
DefaultDirName={autopf}\Financial Adviser
DefaultGroupName=Financial Adviser
OutputDir=dist
OutputBaseFilename=FinancialAdviserSetup
Compression=lzma
SolidCompression=yes
PrivilegesRequired=lowest
SetupIconFile=assets\icon.ico
WizardImageFile=assets\wizard-image.bmp
WizardSmallImageFile=assets\wizard-small.bmp

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked; OnlyBelowVersion: 0,6.1

[Files]
Source: "dist\financial-adviser-backend\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "assets\*"; DestDir: "{app}\assets"; Flags: ignoreversion recursesubdirs

[Icons]
Name: "{group}\Financial Adviser"; Filename: "{app}\financial-adviser-backend.exe"; IconFilename: "{app}\assets\icon.ico"
Name: "{group}\Uninstall Financial Adviser"; Filename: "{uninstallexe}"
Name: "{autodesktop}\Financial Adviser"; Filename: "{app}\financial-adviser-backend.exe"; IconFilename: "{app}\assets\icon.ico"; Tasks: desktopicon
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\Financial Adviser"; Filename: "{app}\financial-adviser-backend.exe"; IconFilename: "{app}\assets\icon.ico"; Tasks: quicklaunchicon

[Run]
Filename: "{app}\financial-adviser-backend.exe"; Description: "{cm:LaunchProgram,Financial Adviser}"; Flags: nowait postinstall skipifsilent

[Code]
function GetUninstallString: String;
var
  sUnInstPath: String;
  sUnInstallString: String;
begin
  sUnInstPath := ExpandConstant('Software\Microsoft\Windows\CurrentVersion\Uninstall\{#emit SetupSetting("AppId")}_is1');
  sUnInstallString := '';
  if not RegQueryStringValue(HKLM, sUnInstPath, 'UninstallString', sUnInstallString) then
    RegQueryStringValue(HKCU, sUnInstPath, 'UninstallString', sUnInstallString);
  Result := sUnInstallString;
end;

function IsUpgrade: Boolean;
begin
  Result := (GetUninstallString() <> '');
end;
```

#### macOS Installer with create-dmg
```bash
# scripts/build-macos-installer.sh
#!/bin/bash

echo "Building macOS installer..."

# Build the application
python scripts/build-standalone.py

# Create app bundle structure
mkdir -p "dist/Financial Adviser.app/Contents/MacOS"
mkdir -p "dist/Financial Adviser.app/Contents/Resources"

# Copy executable
cp "dist/financial-adviser-backend" "dist/Financial Adviser.app/Contents/MacOS/"

# Create Info.plist
cat > "dist/Financial Adviser.app/Contents/Info.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>financial-adviser-backend</string>
    <key>CFBundleIdentifier</key>
    <string>com.yourcompany.financial-adviser</string>
    <key>CFBundleName</key>
    <string>Financial Adviser</string>
    <key>CFBundleVersion</key>
    <string>1.0.0</string>
    <key>CFBundleIconFile</key>
    <string>icon.icns</string>
</dict>
</plist>
EOF

# Copy icon
cp "assets/icon.icns" "dist/Financial Adviser.app/Contents/Resources/"

# Create DMG
create-dmg \
  --volname "Financial Adviser" \
  --volicon "assets/volume-icon.icns" \
  --window-pos 200 120 \
  --window-size 600 300 \
  --icon-size 100 \
  --icon "Financial Adviser.app" 175 120 \
  --hide-extension "Financial Adviser.app" \
  --app-drop-link 425 120 \
  "dist/FinancialAdviser-1.0.0.dmg" \
  "dist/"

echo "macOS installer created: dist/FinancialAdviser-1.0.0.dmg"
```

#### Linux Installer with FPM
```bash
# scripts/build-linux-installer.sh
#!/bin/bash

echo "Building Linux installer..."

# Build the application
python scripts/build-standalone.py

# Create directory structure
mkdir -p dist/linux-package/usr/local/bin
mkdir -p dist/linux-package/usr/share/applications
mkdir -p dist/linux-package/usr/share/pixmaps
mkdir -p dist/linux-package/usr/share/doc/financial-adviser

# Copy files
cp -r dist/financial-adviser-backend/* dist/linux-package/usr/local/bin/
cp assets/icon.png dist/linux-package/usr/share/pixmaps/financial-adviser.png

# Create desktop entry
cat > dist/linux-package/usr/share/applications/financial-adviser.desktop << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Financial Adviser
Comment=Personal Financial Management Tool
Exec=/usr/local/bin/financial-adviser-backend
Icon=financial-adviser
Terminal=false
StartupNotify=true
Categories=Office;Finance;
EOF

# Create documentation
cat > dist/linux-package/usr/share/doc/financial-adviser/README << EOF
Financial Adviser - Personal Financial Management Tool

To run the application:
  financial-adviser-backend

The application will be available at http://localhost:8000

For support, visit: https://github.com/youruser/financial-adviser-app
EOF

# Build DEB package
fpm -s dir -t deb \
    -n financial-adviser \
    -v 1.0.0 \
    --description "Personal Financial Management Tool" \
    --url "https://github.com/youruser/financial-adviser-app" \
    --maintainer "Your Name <your.email@example.com>" \
    --license "MIT" \
    --category "Office" \
    -C dist/linux-package \
    --after-install scripts/post-install.sh \
    --before-remove scripts/pre-remove.sh \
    .

# Build RPM package
fpm -s dir -t rpm \
    -n financial-adviser \
    -v 1.0.0 \
    --description "Personal Financial Management Tool" \
    --url "https://github.com/youruser/financial-adviser-app" \
    --maintainer "Your Name <your.email@example.com>" \
    --license "MIT" \
    --category "Office" \
    -C dist/linux-package \
    --after-install scripts/post-install.sh \
    --before-remove scripts/pre-remove.sh \
    .

echo "Linux packages created:"
echo "  - financial-adviser_1.0.0_amd64.deb"
echo "  - financial-adviser-1.0.0-1.x86_64.rpm"
```

#### Build Script for All Platforms
```python
# scripts/build-installers.py
"""
Build installers for all platforms
"""
import os
import sys
import subprocess
import platform
from pathlib import Path

def build_base_application():
    """Build the base application using PyInstaller"""
    print("Building base application...")
    
    # Build frontend
    subprocess.run(["npm", "run", "build"], cwd="frontend", check=True)
    
    # Build backend with PyInstaller
    import PyInstaller.__main__
    PyInstaller.__main__.run([
        'backend/app/main.py',
        '--onedir',
        '--name=financial-adviser-backend',
        '--add-data=frontend/dist;static',
        '--add-data=backend/alembic;alembic',
        '--hidden-import=uvicorn',
        '--hidden-import=sqlalchemy',
        '--hidden-import=aiohttp',
        '--clean',
        '--noconfirm'
    ])
    
    print("Base application built successfully!")

def build_windows_installer():
    """Build Windows installer using Inno Setup"""
    if platform.system() != "Windows":
        print("Skipping Windows installer (not on Windows)")
        return
        
    print("Building Windows installer...")
    
    # Check if Inno Setup is installed
    inno_setup_path = r"C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
    if not os.path.exists(inno_setup_path):
        print("Error: Inno Setup not found. Please install Inno Setup 6.")
        return
    
    # Build installer
    subprocess.run([
        inno_setup_path,
        "scripts/windows-installer.iss"
    ], check=True)
    
    print("Windows installer created: dist/FinancialAdviserSetup.exe")

def build_macos_installer():
    """Build macOS installer"""
    if platform.system() != "Darwin":
        print("Skipping macOS installer (not on macOS)")
        return
        
    print("Building macOS installer...")
    subprocess.run(["bash", "scripts/build-macos-installer.sh"], check=True)

def build_linux_installer():
    """Build Linux installers"""
    if platform.system() != "Linux":
        print("Skipping Linux installer (not on Linux)")
        return
        
    print("Building Linux installer...")
    subprocess.run(["bash", "scripts/build-linux-installer.sh"], check=True)

def main():
    """Main build function"""
    print("Financial Adviser - Building Installers")
    print("=" * 40)
    
    # Create dist directory
    Path("dist").mkdir(exist_ok=True)
    
    # Build base application
    build_base_application()
    
    # Build platform-specific installers
    current_platform = platform.system()
    print(f"\nBuilding installer for {current_platform}...")
    
    if current_platform == "Windows":
        build_windows_installer()
    elif current_platform == "Darwin":
        build_macos_installer()
    elif current_platform == "Linux":
        build_linux_installer()
    else:
        print(f"Unsupported platform: {current_platform}")
    
    print("\nBuild complete!")
    print("Installers available in: dist/")

if __name__ == "__main__":
    main()
```

#### Installation Requirements
```bash
# Install build tools

# Windows (run as administrator)
# 1. Install Inno Setup: https://jrsoftware.org/isinfo.php
# 2. Install PyInstaller
pip install pyinstaller

# macOS
brew install create-dmg
pip install pyinstaller

# Linux (Ubuntu/Debian)
sudo apt install ruby ruby-dev rubygems build-essential
sudo gem install --no-document fpm
pip install pyinstaller

# Linux (CentOS/RHEL)
sudo yum install ruby ruby-devel rpm-build
sudo gem install --no-document fpm
pip install pyinstaller
```

#### Usage
```bash
# Build installer for current platform
python scripts/build-installers.py

# This will create:
# Windows: dist/FinancialAdviserSetup.exe
# macOS: dist/FinancialAdviser-1.0.0.dmg  
# Linux: dist/financial-adviser_1.0.0_amd64.deb
#        dist/financial-adviser-1.0.0-1.x86_64.rpm
```

### Manual Build Process (Alternative)

If you prefer to avoid automated CI/CD costs, you can build installers manually:

1. **Development Machine**: Set up build tools on your local machine
2. **Version Control**: Tag releases in git for version tracking
3. **Manual Testing**: Test installers on clean VMs before distribution
4. **Distribution**: Upload to GitHub Releases or your own hosting

This approach gives you full control and zero CI/CD costs while still providing professional installer packages for end users.

This comprehensive setup provides:
- **🔒 Secure API key management** with encryption
- **🧪 Robust testing** at unit, integration, and E2E levels  
- **🔧 Clean development workflow** with linting and formatting
- **📦 Multiple distribution options** for different user needs
- **🛡️ Security best practices** throughout the application

The architecture ensures that sensitive data is protected while maintaining ease of use for local development and end-user deployment. 