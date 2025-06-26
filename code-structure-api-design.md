# Code Structure and API Design

## Overview
This document defines the folder structure, code organization, and API design patterns for our Python + React financial adviser application.

## Project Structure

### Root Directory Layout
```
financial-adviser-app/
├── README.md
├── .gitignore
├── .env.example
├── package.json                    # Root package.json for dev scripts
├── docker-compose.yml             # Development environment
├── scripts/                       # Build and deployment scripts
├── docs/                         # Documentation
├── frontend/                     # React application
├── backend/                      # FastAPI application
├── database/                     # Local database files
├── assets/                       # Static assets (icons, images)
└── tests/                        # Integration tests
```

## Backend Structure (FastAPI)

### Directory Organization
```
backend/
├── pyproject.toml               # Poetry dependencies
├── alembic.ini                  # Database migration config
├── alembic/                     # Database migrations
├── app/                         # Main application
│   ├── __init__.py
│   ├── main.py                  # FastAPI app entry point
│   ├── config.py                # Configuration management
│   ├── database.py              # Database connection setup
│   ├── models/                  # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── base.py              # Base model class
│   │   ├── client.py            # Client entity
│   │   ├── portfolio.py         # Portfolio entity
│   │   ├── holding.py           # Investment holding entity
│   │   ├── goal.py              # Financial goal entity
│   │   ├── transaction.py       # Transaction entity
│   │   └── user.py              # User/advisor entity
│   ├── schemas/                 # Pydantic schemas (API models)
│   │   ├── __init__.py
│   │   ├── client.py            # Client request/response schemas
│   │   ├── portfolio.py         # Portfolio schemas
│   │   ├── holding.py           # Holding schemas
│   │   └── common.py            # Common/shared schemas
│   ├── api/                     # API route handlers
│   │   ├── __init__.py
│   │   ├── deps.py              # Dependencies (auth, db session)
│   │   ├── v1/                  # API version 1
│   │   │   ├── __init__.py
│   │   │   ├── endpoints/       # Route implementations
│   │   │   │   ├── clients.py
│   │   │   │   ├── portfolios.py
│   │   │   │   ├── holdings.py
│   │   │   │   ├── goals.py
│   │   │   │   └── reports.py
│   │   │   └── api.py           # API router setup
│   │   └── health.py            # Health check endpoints
│   ├── services/                # Business logic layer
│   │   ├── client_service.py    # Client business logic
│   │   ├── portfolio_service.py # Portfolio calculations
│   │   ├── goal_service.py      # Goal tracking logic
│   │   ├── market_data_service.py # External market data
│   │   └── calculation_engine.py # Financial calculations
│   ├── security/                # Security utilities
│   │   ├── config_manager.py    # Encrypted config storage
│   │   ├── auth.py              # Authentication utilities
│   │   └── encryption.py       # Encryption helpers
│   └── utils/                   # Utility functions
│       ├── financial.py         # Financial calculation utilities
│       ├── validators.py        # Custom validators
│       └── formatters.py        # Data formatting
└── tests/                       # Backend tests
    ├── conftest.py              # Test configuration
    ├── test_models/             # Model tests
    ├── test_api/                # API endpoint tests
    └── test_services/           # Service layer tests
```

## Frontend Structure (React)

### Directory Organization
```
frontend/
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite build configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── index.html                  # Entry HTML file
├── src/
│   ├── main.tsx                # React app entry point
│   ├── App.tsx                 # Main app component
│   ├── vite-env.d.ts          # Vite type definitions
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   └── dialog.tsx
│   │   ├── layout/             # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── Layout.tsx
│   │   ├── forms/              # Form components
│   │   │   ├── ClientForm.tsx
│   │   │   ├── PortfolioForm.tsx
│   │   │   ├── HoldingForm.tsx
│   │   │   └── GoalForm.tsx
│   │   ├── charts/             # Chart components
│   │   │   ├── PieChart.tsx
│   │   │   ├── LineChart.tsx
│   │   │   ├── BarChart.tsx
│   │   │   └── AssetAllocationChart.tsx
│   │   ├── tables/             # Data table components
│   │   │   ├── ClientTable.tsx
│   │   │   ├── PortfolioTable.tsx
│   │   │   ├── HoldingTable.tsx
│   │   │   └── TransactionTable.tsx
│   │   └── common/             # Common UI components
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       ├── SearchBar.tsx
│   │       └── Pagination.tsx
│   ├── pages/                  # Page components
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── clients/            # Client management pages
│   │   │   ├── ClientList.tsx
│   │   │   ├── ClientDetail.tsx
│   │   │   └── ClientEdit.tsx
│   │   ├── portfolios/         # Portfolio management pages
│   │   │   ├── PortfolioList.tsx
│   │   │   ├── PortfolioDetail.tsx
│   │   │   └── PortfolioAnalysis.tsx
│   │   ├── goals/              # Goal tracking pages
│   │   │   ├── GoalList.tsx
│   │   │   ├── GoalDetail.tsx
│   │   │   └── GoalProgress.tsx
│   │   ├── reports/            # Reporting pages
│   │   │   ├── ReportList.tsx
│   │   │   ├── ReportBuilder.tsx
│   │   │   └── ReportViewer.tsx
│   │   └── settings/           # Settings pages
│   │       ├── Settings.tsx
│   │       ├── ApiKeySetup.tsx
│   │       └── UserProfile.tsx
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts          # Authentication hook
│   │   ├── useApi.ts           # API request hook
│   │   ├── useLocalStorage.ts  # Local storage hook
│   │   └── useDebounce.ts      # Debounce hook
│   ├── services/               # API service layer
│   │   ├── api.ts              # Base API configuration
│   │   ├── auth.ts             # Authentication API
│   │   ├── clients.ts          # Client API calls
│   │   ├── portfolios.ts       # Portfolio API calls
│   │   ├── holdings.ts         # Holdings API calls
│   │   ├── goals.ts            # Goals API calls
│   │   └── reports.ts          # Reports API calls
│   ├── types/                  # TypeScript type definitions
│   │   ├── api.ts              # API response types
│   │   ├── client.ts           # Client-related types
│   │   ├── portfolio.ts        # Portfolio-related types
│   │   ├── holding.ts          # Holding-related types
│   │   └── common.ts           # Common types
│   ├── utils/                  # Utility functions
│   │   ├── formatters.ts       # Data formatting utilities
│   │   ├── validators.ts       # Form validation
│   │   ├── calculations.ts     # Client-side calculations
│   │   └── constants.ts        # Application constants
│   ├── store/                  # State management
│   │   ├── index.ts            # Store configuration
│   │   ├── authSlice.ts        # Authentication state
│   │   ├── clientSlice.ts      # Client data state
│   │   ├── portfolioSlice.ts   # Portfolio data state
│   │   └── uiSlice.ts          # UI state (theme, modals)
│   └── styles/                 # Global styles
│       ├── globals.css         # Global CSS
│       ├── components.css      # Component-specific styles
│       └── tailwind.css        # Tailwind imports
└── tests/                      # Frontend tests
    ├── components/             # Component tests
    ├── pages/                  # Page tests
    ├── hooks/                  # Hook tests
    ├── services/               # Service tests
    ├── utils/                  # Utility tests
    └── setup.ts                # Test setup configuration
```

## API Design Patterns

### RESTful API Structure

#### Base URL Pattern
```
https://localhost:8000/api/v1/{resource}
```

#### Resource Endpoints

**Clients Resource:**
```
GET    /api/v1/clients           # List all clients
POST   /api/v1/clients           # Create new client
GET    /api/v1/clients/{id}      # Get specific client
PUT    /api/v1/clients/{id}      # Update client
DELETE /api/v1/clients/{id}      # Delete client
GET    /api/v1/clients/{id}/portfolios  # Get client's portfolios
```

**Portfolios Resource:**
```
GET    /api/v1/portfolios        # List all portfolios
POST   /api/v1/portfolios        # Create new portfolio
GET    /api/v1/portfolios/{id}   # Get specific portfolio
PUT    /api/v1/portfolios/{id}   # Update portfolio
DELETE /api/v1/portfolios/{id}   # Delete portfolio
GET    /api/v1/portfolios/{id}/holdings    # Get portfolio holdings
GET    /api/v1/portfolios/{id}/performance # Get portfolio performance
POST   /api/v1/portfolios/{id}/rebalance   # Rebalance portfolio
```

**Holdings Resource:**
```
GET    /api/v1/holdings          # List all holdings
POST   /api/v1/holdings          # Create new holding
GET    /api/v1/holdings/{id}     # Get specific holding
PUT    /api/v1/holdings/{id}     # Update holding
DELETE /api/v1/holdings/{id}     # Delete holding
```

**Goals Resource:**
```
GET    /api/v1/goals             # List all goals
POST   /api/v1/goals             # Create new goal
GET    /api/v1/goals/{id}        # Get specific goal
PUT    /api/v1/goals/{id}        # Update goal
DELETE /api/v1/goals/{id}        # Delete goal
GET    /api/v1/goals/{id}/progress # Get goal progress
```

### Request/Response Patterns

#### Standard Response Format
```json
{
  "success": true,
  "data": {
    // Resource data
  },
  "message": "Operation completed successfully",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Pagination Response
```json
{
  "success": true,
  "data": [
    // Array of resources
  ],
  "pagination": {
    "page": 1,
    "size": 20,
    "total": 150,
    "pages": 8
  }
}
```

### API Schema Examples

#### Client Schema
```python
# Pydantic schemas
class ClientBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    risk_tolerance: RiskToleranceEnum = RiskToleranceEnum.MODERATE

class ClientCreate(ClientBase):
    pass

class ClientUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    risk_tolerance: Optional[RiskToleranceEnum] = None

class ClientResponse(ClientBase):
    id: int
    created_at: datetime
    updated_at: datetime
    total_portfolio_value: Optional[float] = None

    class Config:
        from_attributes = True
```

#### Portfolio Schema
```python
class PortfolioBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    target_allocation: Dict[str, float] = Field(..., description="Asset allocation percentages")
    portfolio_type: PortfolioTypeEnum = PortfolioTypeEnum.INVESTMENT

class PortfolioCreate(PortfolioBase):
    client_id: int

class PortfolioResponse(PortfolioBase):
    id: int
    client_id: int
    current_value: float
    total_return: float
    total_return_percentage: float
    holdings_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

### API Security

#### Authentication
```python
# JWT token-based authentication
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from jose import JWTError, jwt

security = HTTPBearer()

async def get_current_user(token: str = Depends(security)):
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = get_user(user_id)
    if user is None:
        raise credentials_exception
    return user
```

#### Rate Limiting
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.post("/portfolios/")
@limiter.limit("10/minute")
async def create_portfolio(request: Request, portfolio: PortfolioCreate):
    # Implementation
    pass
```

### Error Handling

#### Global Exception Handler
```python
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Invalid input data",
                "details": exc.errors()
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    )
```

### API Documentation

#### OpenAPI Configuration
```python
from fastapi.openapi.utils import get_openapi

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="Financial Adviser API",
        version="1.0.0",
        description="Comprehensive API for personal financial management",
        routes=app.routes,
    )
    
    # Add security scheme
    openapi_schema["components"]["securitySchemes"] = {
        "Bearer": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
```

This code structure provides a solid foundation for building a maintainable, scalable financial adviser application with clear separation of concerns and industry-standard patterns. 