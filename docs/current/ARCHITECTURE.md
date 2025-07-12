# Financial Adviser Application Architecture

## Overview

This document provides a comprehensive overview of the Financial Adviser Application architecture, designed as a local-first, privacy-focused personal financial management tool.

## System Architecture

### High-Level Design

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │◄──►│    Backend      │◄──►│   Database      │
│   (React)       │    │   (FastAPI)     │    │   (SQLite)      │
│                 │    │                 │    │                 │
│ • UI Components │    │ • REST API      │    │ • User Data     │
│ • State Mgmt    │    │ • Auth System   │    │ • Portfolios    │
│ • API Calls     │    │ • Business Logic│    │ • Transactions  │
│ • Charts/Reports│    │ • Validation    │    │ • Goals         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Backend (FastAPI + Python)
- **Framework**: FastAPI 0.104+
- **Database**: SQLAlchemy ORM with SQLite
- **Authentication**: JWT tokens with bcrypt password hashing
- **Validation**: Pydantic schemas
- **Security**: Rate limiting, CORS, input validation
- **Logging**: Structured logging with file rotation
- **Testing**: pytest with comprehensive test coverage

#### Frontend (React + TypeScript)
- **Framework**: React 18+ with TypeScript 5+
- **Build Tool**: Vite 5+
- **UI Framework**: Tailwind CSS 3+ with shadcn/ui components
- **State Management**: TanStack Query for server state
- **Routing**: React Router 6+
- **Charts**: Recharts for financial visualizations
- **Forms**: react-hook-form with Zod validation

## Directory Structure

### Backend (`/backend`)

```
backend/
├── app/                          # Application source code
│   ├── api/                      # API layer
│   │   ├── deps.py              # Dependency injection
│   │   └── v1/                  # API v1 endpoints
│   │       ├── api.py           # Main router
│   │       └── endpoints/       # Individual endpoint modules
│   │           ├── auth.py      # Authentication endpoints
│   │           ├── portfolios.py # Portfolio management
│   │           ├── goals.py     # Financial goals
│   │           ├── holdings.py  # Investment holdings
│   │           └── transactions.py # Transaction management
│   ├── models/                  # SQLAlchemy models
│   │   ├── base.py             # Base model with common fields
│   │   ├── user.py             # User authentication model
│   │   ├── portfolio.py        # Portfolio management
│   │   ├── holding.py          # Individual holdings
│   │   ├── transaction.py      # Financial transactions
│   │   ├── goal.py             # Financial goals
│   │   ├── market_data.py      # Market data caching
│   │   └── report.py           # Report generation
│   ├── schemas/                 # Pydantic schemas
│   │   ├── auth.py             # Authentication schemas
│   │   ├── portfolio.py        # Portfolio schemas
│   │   ├── goal.py             # Goal schemas
│   │   ├── holding.py          # Holding schemas
│   │   ├── transaction.py      # Transaction schemas
│   │   └── common.py           # Common/shared schemas
│   ├── security/                # Security utilities
│   │   ├── auth.py             # JWT authentication
│   │   └── encryption.py       # Data encryption utilities
│   ├── services/                # Business logic layer
│   │   └── portfolio_service.py # Portfolio calculations
│   ├── utils/                   # Utility modules
│   │   ├── logging.py          # Logging configuration
│   │   ├── validation.py       # Custom validators
│   │   ├── transactions.py     # Transaction utilities
│   │   └── debug.py            # Development utilities
│   ├── config.py               # Application configuration
│   ├── database.py             # Database configuration
│   └── main.py                 # FastAPI application entry
├── tests/                       # Test suite
│   ├── test_api/               # API endpoint tests
│   ├── test_models/            # Model tests (placeholder)
│   ├── test_services/          # Service layer tests (placeholder)
│   ├── test_health.py          # Health check tests
│   └── test_main.py            # Application tests
├── alembic/                    # Database migrations
│   ├── versions/               # Migration files
│   ├── env.py                  # Alembic environment
│   └── script.py.mako          # Migration template
├── database/                   # Local data storage
│   ├── financial_adviser.db    # SQLite database
│   └── logs/                   # Application logs
├── pyproject.toml              # Poetry dependencies
├── alembic.ini                 # Alembic configuration
└── conftest.py                 # pytest configuration
```

### Frontend (`/frontend`)

```
frontend/
├── src/
│   ├── components/              # React components
│   │   ├── auth/               # Authentication components
│   │   │   └── AuthGuard.tsx   # Route protection
│   │   ├── layout/             # Layout components
│   │   │   ├── Header.tsx      # Application header
│   │   │   ├── Sidebar.tsx     # Navigation sidebar
│   │   │   └── Layout.tsx      # Main layout wrapper
│   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── button.tsx      # Button component
│   │   │   └── card.tsx        # Card component
│   │   ├── charts/             # Chart components (placeholder)
│   │   ├── forms/              # Form components (placeholder)
│   │   ├── tables/             # Table components (placeholder)
│   │   ├── common/             # Common/shared components (placeholder)
│   │   └── ErrorBoundary.tsx   # Error boundary
│   ├── pages/                  # Page components
│   │   ├── auth/               # Authentication pages
│   │   │   ├── LoginPage.tsx   # Login page
│   │   │   └── RegisterPage.tsx # Registration page
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── portfolios/         # Portfolio management pages
│   │   │   └── PortfolioList.tsx
│   │   ├── goals/              # Financial goals pages
│   │   │   └── GoalList.tsx
│   │   ├── clients/            # Client management (legacy)
│   │   │   └── ClientList.tsx
│   │   ├── reports/            # Reports (placeholder)
│   │   └── settings/           # Settings (placeholder)
│   ├── contexts/               # React contexts
│   │   └── AuthContext.tsx     # Authentication context
│   ├── hooks/                  # Custom hooks
│   │   ├── usePortfolios.ts    # Portfolio management hook
│   │   └── useGoals.ts         # Goals management hook
│   ├── services/               # API service layer
│   │   └── api.ts              # API client configuration
│   ├── utils/                  # Utility functions
│   │   ├── cn.ts               # className utility
│   │   ├── logger.ts           # Frontend logging
│   │   └── debug.ts            # Development utilities
│   ├── types/                  # TypeScript type definitions (placeholder)
│   ├── store/                  # State management (placeholder)
│   ├── styles/                 # Global styles
│   │   └── globals.css         # Global CSS with Tailwind
│   ├── App.tsx                 # Main application component
│   ├── main.tsx                # Application entry point
│   └── vite-env.d.ts           # Vite type definitions
├── tests/                      # Frontend tests
│   ├── pages/                  # Page component tests
│   │   └── RegisterPage.test.tsx
│   ├── components/             # Component tests (placeholder)
│   ├── hooks/                  # Hook tests (placeholder)
│   ├── services/               # Service tests (placeholder)
│   └── utils/                  # Utility tests (placeholder)
├── package.json                # npm dependencies
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── index.html                  # HTML entry point
```

## Core Features & Implementation Status

### ✅ Implemented Features

#### User Authentication & Management
- **Individual Investor Registration**: Complete with investment profile collection
- **JWT Authentication**: Secure token-based authentication
- **Password Security**: bcrypt hashing with strength validation
- **Investment Profiling**: Risk tolerance, experience, financial goals
- **Profile Management**: Update user information and preferences

#### Database & Infrastructure
- **SQLAlchemy Models**: User, Portfolio, Holdings, Goals, Transactions
- **Database Migrations**: Alembic-managed schema evolution
- **Comprehensive Logging**: Structured logging with request tracking
- **Health Monitoring**: Health check endpoints with system status
- **Rate Limiting**: API protection against abuse
- **CORS Configuration**: Secure cross-origin request handling

#### API Layer
- **RESTful Endpoints**: Well-structured API with proper HTTP methods
- **Input Validation**: Multi-layer validation (Pydantic + custom)
- **Error Handling**: Standardized error responses
- **API Documentation**: Automatic OpenAPI/Swagger documentation

#### Testing Infrastructure
- **Backend Testing**: 26+ pytest tests covering authentication, validation, and API endpoints
- **Frontend E2E Testing**: 126 comprehensive Playwright tests across 4 test suites
- **Test Coverage**: Authentication flow, portfolio management, dashboard navigation, settings
- **Test Fixtures**: Reusable test data and database sessions
- **Cross-browser Testing**: Chromium, Firefox, WebKit compatibility
- **Integration Tests**: Full request/response cycle testing

### 🔄 Partially Implemented Features

#### Portfolio Management
- **Models & Schemas**: Complete portfolio data structures
- **API Endpoints**: Full CRUD operations for portfolios
- **Performance Calculations**: Basic metrics (unrealized gains, returns)
- **Asset Allocation**: Portfolio breakdown by asset class
- **Frontend Integration**: Basic portfolio list component and creation modal

#### Financial Goals
- **Goal Tracking**: Complete goal management system with backend implementation
- **Progress Monitoring**: Progress calculations and projections
- **Contribution Tracking**: Record and monitor goal contributions
- **Achievement Management**: Mark goals as achieved with dates
- **Frontend Integration**: Basic hooks implemented (useGoals)

#### Investment Recommendations
- **Recommendation Engine**: Personalized investment recommendations based on user profile
- **Financial Summary**: Comprehensive financial health assessment
- **API Endpoints**: GET /api/v1/recommendations/ and /summary endpoints
- **Business Logic**: Portfolio health scoring and risk assessment

#### Holdings & Transactions
- **Data Models**: Complete holding and transaction structures
- **API Endpoints**: CRUD operations for holdings and transactions
- **Cost Basis Tracking**: Purchase price and quantity management
- **Frontend Integration**: Pending UI implementation

### 📋 Planned Features

#### Market Data Integration
- **Real-time Quotes**: Integration with financial APIs
- **Historical Data**: Price history for performance analysis
- **Market Indicators**: Economic data and market indices

#### Advanced Analytics
- **Performance Benchmarking**: Compare against market indices
- **Risk Metrics**: Sharpe ratio, beta, alpha calculations
- **Rebalancing Alerts**: Automated portfolio rebalancing suggestions

#### Reporting & Exports
- **Financial Reports**: PDF generation for portfolio summaries
- **Tax Reporting**: Capital gains/losses for tax preparation
- **Data Export**: CSV/Excel export capabilities

## Security Architecture

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication with configurable expiration
- **Password Hashing**: bcrypt with salt for secure password storage
- **Session Management**: Token-based sessions with proper logout
- **Role-Based Access**: User-scoped data access (no admin roles needed)

### Data Protection
- **Local-First**: All financial data stored locally on user's machine
- **Encryption**: Sensitive configuration data encrypted with AES-256
- **Input Validation**: Comprehensive validation at API and model layers
- **SQL Injection Protection**: Parameterized queries via SQLAlchemy ORM

### Security Headers & CORS
- **CORS Policy**: Restricted origins for cross-origin requests
- **Rate Limiting**: Protection against brute force and DoS attacks
- **Error Handling**: Secure error messages without data leakage
- **Request Logging**: Security event monitoring and audit trails

## Database Schema

### Core Entities

#### Users Table
```sql
users:
- id (Primary Key)
- email (Unique, Not Null)
- hashed_password (Not Null)
- first_name, last_name
- phone (Optional)
- firm_name, license_number (Optional)
- investment_experience (enum)
- risk_tolerance (enum)
- investment_style (enum)
- financial_goals (JSON array)
- net_worth_range (enum)
- time_horizon (enum)
- portfolio_complexity (enum)
- is_active (Boolean, default True)
- created_at, updated_at (Timestamps)
```

#### Portfolios Table
```sql
portfolios:
- id (Primary Key)
- user_id (Foreign Key to users)
- name (Not Null)
- description (Optional)
- portfolio_type (enum)
- target_allocation (JSON)
- risk_level (enum)
- benchmark_symbol (Optional)
- rebalance_frequency (enum)
- rebalance_threshold (Decimal)
- is_active (Boolean, default True)
- created_at, updated_at (Timestamps)
```

#### Holdings Table
```sql
holdings:
- id (Primary Key)
- portfolio_id (Foreign Key to portfolios)
- symbol (Not Null)
- asset_class (enum)
- quantity (Decimal)
- cost_basis (Decimal per share)
- current_price (Decimal, updated from market data)
- purchase_date (Date)
- is_active (Boolean, default True)
- created_at, updated_at (Timestamps)
```

#### Goals Table
```sql
financial_goals:
- id (Primary Key)
- user_id (Foreign Key to users)
- name (Not Null)
- description (Optional)
- goal_type (enum)
- target_amount (Decimal)
- current_amount (Decimal)
- target_date (Date)
- priority_level (enum)
- monthly_contribution (Decimal)
- expected_return_rate (Decimal)
- inflation_rate (Decimal)
- is_achieved (Boolean, default False)
- achievement_date (Date, Optional)
- notes (Text, Optional)
- is_active (Boolean, default True)
- created_at, updated_at (Timestamps)
```

#### Transactions Table
```sql
transactions:
- id (Primary Key)
- portfolio_id (Foreign Key to portfolios)
- holding_id (Foreign Key to holdings, Optional)
- transaction_type (enum: buy, sell, dividend, etc.)
- symbol (Not Null)
- quantity (Decimal)
- price_per_share (Decimal)
- total_amount (Decimal)
- fees (Decimal)
- transaction_date (Date)
- notes (Text, Optional)
- created_at, updated_at (Timestamps)
```

### Relationships
- Users 1:N Portfolios
- Users 1:N Financial Goals
- Portfolios 1:N Holdings
- Portfolios 1:N Transactions
- Holdings 1:N Transactions (optional relationship)

## API Documentation

### Authentication Endpoints (`/api/v1/auth`) ✅ **FULLY IMPLEMENTED**
- `POST /register` - User registration with investment profile
- `POST /login/json` - JSON-based login for web interface
- `POST /login/form` - Form-based login (alternative)
- `GET /me` - Get current user profile
- `PUT /me` - Update user profile
- `POST /change-password` - Change user password

### Portfolio Endpoints (`/api/v1/portfolios`) ✅ **FULLY IMPLEMENTED**
- `GET /` - List user's portfolios with aggregated data
- `POST /` - Create new portfolio
- `GET /{id}` - Get specific portfolio
- `PUT /{id}` - Update portfolio
- `DELETE /{id}` - Delete portfolio (soft delete)
- `GET /{id}/performance` - Get portfolio performance metrics
- `GET /{id}/allocation` - Get asset allocation breakdown

### Goals Endpoints (`/api/v1/goals`) ✅ **FULLY IMPLEMENTED**
- `GET /` - List user's financial goals with progress tracking
- `POST /` - Create new goal
- `GET /{id}` - Get specific goal
- `PUT /{id}` - Update goal
- `DELETE /{id}` - Delete goal (soft delete)
- `GET /{id}/progress` - Get detailed progress information
- `GET /{id}/contributions` - List goal contributions
- `POST /{id}/contributions` - Add contribution to goal

### Investment Recommendations (`/api/v1/recommendations`) ✅ **IMPLEMENTED**
- `GET /` - Get personalized investment recommendations
- `GET /summary` - Get comprehensive financial situation summary

### Holdings Endpoints (`/api/v1/holdings`) 🔄 **BACKEND READY**
- `GET /` - List holdings (with portfolio filtering)
- `POST /` - Add new holding
- `GET /{id}` - Get specific holding
- `PUT /{id}` - Update holding
- `DELETE /{id}` - Delete holding (soft delete)

### Transactions Endpoints (`/api/v1/transactions`) 🔄 **BACKEND READY**
- `GET /` - List transactions (with filtering)
- `POST /` - Record new transaction
- `GET /{id}` - Get specific transaction
- `PUT /{id}` - Update transaction
- `DELETE /{id}` - Delete transaction

### System Endpoints ✅ **IMPLEMENTED**
- `GET /health` - Health check with system status
- `GET /debug` - Debug information (development only)
- `GET /validation-rules` - Frontend validation rules
- `GET /` - API information and documentation links

## Development Workflow

### Prerequisites
- Python 3.11+
- Node.js 18+
- Poetry (Python dependency management)
- npm (Node.js package manager)

### Setup Commands
```bash
# Backend setup
cd backend
poetry install
poetry shell
alembic upgrade head

# Frontend setup
cd frontend
npm install

# Start development servers
npm run dev:all  # Start both backend and frontend
```

### Code Quality Tools
```bash
# Backend code quality
poetry run black .      # Code formatting
poetry run isort .      # Import sorting
poetry run ruff check . # Linting
poetry run mypy .       # Type checking

# Frontend code quality
npm run lint            # ESLint
npm run format          # Prettier
npm run type-check      # TypeScript
```

### Testing
```bash
# Backend tests
poetry run pytest                    # All tests
poetry run pytest --cov=app         # With coverage
poetry run pytest tests/test_api/test_auth.py -v  # Specific tests

# Frontend tests
npm run test           # Unit tests (Vitest)
npm run test:coverage  # With coverage
```

## Performance Considerations

### Backend Optimizations
- **Database Indexing**: Strategic indexes on frequently queried columns
- **Connection Pooling**: SQLAlchemy session management
- **Query Optimization**: Eager loading to prevent N+1 queries
- **Caching Strategy**: Market data caching to reduce API calls

### Frontend Optimizations
- **Code Splitting**: Vite's automatic bundle optimization
- **Lazy Loading**: Route-based code splitting
- **Memoization**: React.memo for expensive components
- **State Management**: Efficient server state with TanStack Query

### Monitoring & Logging
- **Structured Logging**: JSON-formatted logs with context
- **Performance Monitoring**: Request timing and slow query detection
- **Error Tracking**: Comprehensive error logging with stack traces
- **Health Checks**: System status monitoring and alerting

## Future Architecture Considerations

### SaaS Migration Path
- **Multi-tenancy**: Database schema ready for tenant isolation
- **PostgreSQL Migration**: Easy migration from SQLite
- **Cloud Deployment**: Docker containerization ready
- **API Versioning**: Structured for backward compatibility

### Scalability Features
- **Horizontal Scaling**: Stateless design supports load balancing
- **Caching Layer**: Redis integration for session and data caching
- **Message Queues**: Background job processing for reports
- **Microservices**: Modular design allows service separation

This architecture provides a solid foundation for both local application usage and future SaaS expansion while maintaining security, performance, and code quality best practices.