# Development Guide

## Overview

This guide provides comprehensive instructions for developing, testing, and maintaining the Financial Adviser Application. It covers setup, workflow, best practices, and troubleshooting.

## Prerequisites

### Required Software
- **Python 3.11+** - Backend runtime
- **Node.js 18+** - Frontend development
- **Poetry** - Python dependency management
- **npm** - Node.js package manager
- **Git** - Version control

### Recommended Tools
- **VS Code** - IDE with Python and TypeScript extensions
- **Postman/Insomnia** - API testing
- **SQLite Browser** - Database inspection
- **Docker** - Containerization (future)

## Project Setup

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Financial-Adviser-Local-App
   ```

2. **Backend setup**
   ```bash
   cd backend
   poetry install
   poetry shell
   ```

3. **Database initialization**
   ```bash
   # Create database and run migrations
   alembic upgrade head
   ```

4. **Frontend setup**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Verify setup**
   ```bash
   # From project root
   npm run dev:all
   ```

### Environment Configuration

Create environment files for different configurations:

#### Backend Environment (.env)
```bash
# Database
DATABASE_URL=sqlite:///./database/financial_adviser.db

# Security
SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=60

# API Settings
DEBUG=true
ALLOWED_ORIGINS=["http://localhost:3000"]

# Logging
LOG_LEVEL=DEBUG
```

#### Frontend Environment (.env.local)
```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME="Financial Adviser"
VITE_DEBUG=true
```

## Development Workflow

### Daily Development Process

1. **Start development servers**
   ```bash
   # Option 1: Both servers at once
   npm run dev:all

   # Option 2: Separate terminals
   # Terminal 1 - Backend
   cd backend && poetry run uvicorn app.main:app --reload --port 8000

   # Terminal 2 - Frontend  
   cd frontend && npm run dev
   ```

2. **Access applications**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - Alternative API Docs: http://localhost:8000/redoc

### Code Quality Workflow

#### Backend Code Quality
```bash
cd backend

# Format code
poetry run black .
poetry run isort .

# Lint code
poetry run ruff check .
poetry run ruff check . --fix  # Auto-fix issues

# Type checking
poetry run mypy .

# Run all quality checks
poetry run black . && poetry run isort . && poetry run ruff check . && poetry run mypy .
```

#### Frontend Code Quality
```bash
cd frontend

# Lint and fix
npm run lint
npm run lint:fix

# Format code
npm run format

# Type checking
npm run type-check

# Run all quality checks
npm run lint && npm run format && npm run type-check
```

### Testing Workflow

#### Backend Testing
```bash
cd backend

# Run all tests (26+ comprehensive tests)
poetry run pytest

# Run with coverage
poetry run pytest --cov=app

# Run core authentication tests (CRITICAL - must pass)
poetry run pytest tests/test_api/test_auth.py -v

# Run specific test
poetry run pytest tests/test_api/test_auth.py::TestUserRegistration::test_successful_registration_full_data -v

# Run tests with detailed output
poetry run pytest -v -s

# Generate coverage report
poetry run pytest --cov=app --cov-report=html

# Quick test overview (recommended for development)
poetry run pytest --tb=short
```

#### Frontend Testing
```bash
cd frontend

# Run unit tests (Vitest)
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test RegisterPage.test.tsx

# Run E2E tests (126 tests - CRITICAL - must pass after any code changes)
npm run test:e2e

# Run E2E tests with UI mode for debugging
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug
```

#### **MANDATORY Testing Protocol**
After ANY code changes, you MUST run:
```bash
# 1. Core backend tests
poetry run pytest tests/test_api/test_auth.py -v

# 2. Full backend test overview
poetry run pytest --tb=short

# 3. ALL Playwright E2E tests (MUST PASS)
npm run test:e2e
```

#### E2E Test Coverage (126 Tests Across 4 Suites)
- **Authentication Flow Tests** - Login/register validation and error handling
- **Dashboard Navigation Tests** - User interface interactions and routing
- **Portfolio Management Tests** - Investment tracking and portfolio operations
- **Settings & Profile Tests** - User profile management and configuration

## Database Management

### Alembic Migrations

#### Creating Migrations
```bash
cd backend

# Auto-generate migration from model changes
alembic revision --autogenerate -m "Description of changes"

# Create empty migration file
alembic revision -m "Custom migration description"

# Review generated migration before applying
# Edit file in alembic/versions/ if needed
```

#### Applying Migrations
```bash
# Apply all pending migrations
alembic upgrade head

# Apply specific migration
alembic upgrade <revision_id>

# Downgrade to previous migration
alembic downgrade -1

# Downgrade to specific migration
alembic downgrade <revision_id>

# Show current migration status
alembic current

# Show migration history
alembic history
```

#### Migration Best Practices
- Always review auto-generated migrations before applying
- Test migrations on copy of production data
- Include both upgrade and downgrade operations
- Use descriptive migration messages
- Never edit applied migrations

### Database Inspection
```bash
# Connect to SQLite database
sqlite3 backend/database/financial_adviser.db

# Common SQL commands
.tables                    # List all tables
.schema users             # Show table schema
SELECT * FROM users;      # Query data
.exit                     # Exit SQLite
```

## API Development

### Adding New Endpoints

1. **Create/Update Model** (if needed)
   ```python
   # backend/app/models/new_model.py
   from sqlalchemy import Column, Integer, String, DateTime
   from .base import Base

   class NewModel(Base):
       __tablename__ = "new_models"
       
       id = Column(Integer, primary_key=True, index=True)
       name = Column(String(100), nullable=False)
       # ... other fields
   ```

2. **Create Pydantic Schemas**
   ```python
   # backend/app/schemas/new_model.py
   from pydantic import BaseModel
   from datetime import datetime

   class NewModelBase(BaseModel):
       name: str

   class NewModelCreate(NewModelBase):
       pass

   class NewModelResponse(NewModelBase):
       id: int
       created_at: datetime
       
       class Config:
           from_attributes = True
   ```

3. **Create API Endpoints**
   ```python
   # backend/app/api/v1/endpoints/new_model.py
   from fastapi import APIRouter, Depends
   from sqlalchemy.orm import Session
   from ...database import get_db
   from ...models.new_model import NewModel
   from ...schemas.new_model import NewModelCreate, NewModelResponse

   router = APIRouter()

   @router.post("/", response_model=NewModelResponse)
   async def create_item(item: NewModelCreate, db: Session = Depends(get_db)):
       # Implementation
       pass
   ```

4. **Register Router**
   ```python
   # backend/app/api/v1/api.py
   from .endpoints import new_model

   router.include_router(new_model.router, prefix="/new-models", tags=["new-models"])
   ```

5. **Create Tests**
   ```python
   # backend/tests/test_api/test_new_model.py
   def test_create_new_model(client, test_user):
       # Test implementation
       pass
   ```

### API Testing with Curl

```bash
# Register user
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "first_name": "Test",
    "last_name": "User",
    "investment_experience": "intermediate",
    "risk_tolerance": "moderate",
    "investment_style": "balanced",
    "financial_goals": ["retirement"],
    "net_worth_range": "200k_500k",
    "time_horizon": "long_term",
    "portfolio_complexity": "moderate"
  }'

# Login and get token
curl -X POST http://localhost:8000/api/v1/auth/login/json \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'

# Use token for authenticated requests
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer <your-token>"
```

## Frontend Development

### Component Development

#### Creating New Components
```typescript
// frontend/src/components/NewComponent.tsx
import React from 'react';

interface NewComponentProps {
  title: string;
  onAction?: () => void;
}

export const NewComponent: React.FC<NewComponentProps> = ({ title, onAction }) => {
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">{title}</h3>
      {onAction && (
        <button onClick={onAction} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
          Action
        </button>
      )}
    </div>
  );
};
```

#### Component Testing
```typescript
// frontend/tests/components/NewComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { NewComponent } from '@/components/NewComponent';

describe('NewComponent', () => {
  it('renders with title', () => {
    render(<NewComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('calls onAction when button clicked', () => {
    const mockAction = jest.fn();
    render(<NewComponent title="Test" onAction={mockAction} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockAction).toHaveBeenCalled();
  });
});
```

### State Management

#### API Service Layer
```typescript
// frontend/src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

#### Custom Hooks
```typescript
// frontend/src/hooks/useAuth.ts
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/services/api';

export const useAuth = () => {
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await api.post('/api/v1/auth/login/json', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.access_token);
    },
  });

  const userQuery = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await api.get('/api/v1/auth/me');
      return response.data;
    },
    enabled: !!localStorage.getItem('accessToken'),
  });

  return {
    login: loginMutation.mutate,
    user: userQuery.data,
    isLoading: loginMutation.isPending || userQuery.isLoading,
  };
};
```

## Debugging

### Backend Debugging

#### Logging
```python
# Use the centralized logger
from app.utils.logging import get_logger

logger = get_logger("module_name")

logger.debug("Debug information")
logger.info("General information")
logger.warning("Warning message")
logger.error("Error occurred", extra={"context": "additional_data"})
```

#### Database Debugging
```python
# Enable SQL logging in config
ECHO_SQL = True  # Shows all SQL queries

# Or use the debug utility
from app.utils.debug import debug_query

debug_query(db.query(User).filter(User.email == "test@example.com"))
```

#### Interactive Debugging
```python
# Add breakpoint in code
import pdb; pdb.set_trace()

# Or use modern debugger
import ipdb; ipdb.set_trace()
```

### Frontend Debugging

#### Browser DevTools
- Use React Developer Tools extension
- Enable Redux DevTools for state management
- Use Network tab for API request debugging

#### Console Logging
```typescript
// Structured logging in frontend
import { logger } from '@/utils/logger';

logger.debug('Component mounted', { component: 'NewComponent' });
logger.error('API call failed', { endpoint: '/api/v1/portfolios', error });
```

### Common Issues and Solutions

#### Backend Issues

**Issue: Database locked error**
```bash
# Solution: Close all database connections
poetry run python -c "from app.database import engine; engine.dispose()"
```

**Issue: Migration conflicts**
```bash
# Solution: Reset to last good migration
alembic downgrade <previous_revision>
alembic upgrade head
```

**Issue: Import errors**
```bash
# Solution: Ensure PYTHONPATH includes app directory
export PYTHONPATH="${PYTHONPATH}:$(pwd)/backend"
```

#### Frontend Issues

**Issue: Module not found errors**
```bash
# Solution: Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue: TypeScript errors**
```bash
# Solution: Clear TypeScript cache
rm -rf node_modules/.cache
npx tsc --build --clean
```

## Performance Optimization

### Backend Performance

#### Database Optimization
```python
# Use eager loading to prevent N+1 queries
from sqlalchemy.orm import joinedload

users_with_portfolios = db.query(User).options(joinedload(User.portfolios)).all()

# Index frequently queried columns
class User(Base):
    email = Column(String, index=True, unique=True)
    created_at = Column(DateTime, index=True)
```

#### Query Optimization
```python
# Use pagination for large datasets
def get_portfolios(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Portfolio).offset(skip).limit(limit).all()

# Use select only needed columns
portfolios = db.query(Portfolio.id, Portfolio.name, Portfolio.total_value).all()
```

### Frontend Performance

#### Code Splitting
```typescript
// Lazy load components
import { lazy, Suspense } from 'react';

const PortfolioList = lazy(() => import('@/pages/portfolios/PortfolioList'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PortfolioList />
    </Suspense>
  );
}
```

#### Memoization
```typescript
// Memoize expensive calculations
import { useMemo } from 'react';

const ExpensiveComponent = ({ data }) => {
  const processedData = useMemo(() => {
    return data.map(item => expensiveCalculation(item));
  }, [data]);

  return <div>{/* Use processedData */}</div>;
};
```

## Build and Deployment

### Development Build
```bash
# Backend - no build needed (interpreted)
poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000

# Frontend development build
npm run dev
```

### Production Build
```bash
# Frontend production build
npm run build

# Preview production build
npm run preview

# Backend production
poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Build Scripts

#### Backend Build Script
```bash
#!/bin/bash
# scripts/build-backend.sh

cd backend
poetry install --only=main
poetry run alembic upgrade head
echo "Backend build complete"
```

#### Frontend Build Script
```bash
#!/bin/bash
# scripts/build-frontend.sh

cd frontend
npm ci
npm run type-check
npm run lint
npm run build
echo "Frontend build complete"
```

### Cross-Platform Distribution
```bash
# Create standalone executable (future)
pyinstaller --onefile --windowed app/main.py

# Package for different platforms
# Windows: Create .exe installer
# macOS: Create .dmg package
# Linux: Create .deb/.rpm packages
```

## Security Best Practices

### Backend Security
- Never commit secrets or API keys
- Use environment variables for configuration
- Validate all user inputs
- Implement proper authentication and authorization
- Use HTTPS in production
- Keep dependencies updated

### Frontend Security
- Sanitize user inputs
- Use HTTPS for API calls
- Store sensitive data securely
- Implement proper error handling
- Validate data received from API

## Monitoring and Logging

### Log Analysis
```bash
# View recent logs
tail -f backend/database/logs/app_$(date +%Y%m%d).log

# Search for errors
grep "ERROR" backend/database/logs/app_*.log

# Monitor API calls
grep "API Call" backend/database/logs/app_*.log | tail -20
```

### Performance Monitoring
```python
# Monitor slow queries
from app.utils.logging import log_query_performance

start_time = time.time()
result = db.query(User).all()
duration = time.time() - start_time
log_query_performance("SELECT * FROM users", duration, len(result))
```

## Troubleshooting Guide

### Database Issues
1. **Connection errors**: Check DATABASE_URL and file permissions
2. **Migration failures**: Review migration file and database state
3. **Data integrity errors**: Check foreign key constraints

### API Issues
1. **Authentication failures**: Verify JWT token and user status
2. **Validation errors**: Check request data against schemas
3. **Performance issues**: Monitor query performance and optimize

### Frontend Issues
1. **Build failures**: Check for TypeScript errors and missing dependencies
2. **Runtime errors**: Use browser DevTools and error boundaries
3. **API integration issues**: Verify API responses and error handling

This guide provides the foundation for effective development and maintenance of the Financial Adviser Application. Regular updates to this documentation ensure it remains current with the evolving codebase.