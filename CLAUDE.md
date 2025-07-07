# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Financial Adviser Local Application** project in early planning stages. The application is designed to be a local-first, Python + React financial management tool that provides portfolio tracking, investment optimization, and financial planning capabilities.

## Key Architecture

### Technology Stack
- **Backend**: FastAPI (Python 3.11+) with SQLAlchemy ORM
- **Frontend**: React 18+ with TypeScript 5+ and Vite 5+
- **Database**: SQLite (local development) → PostgreSQL (future SaaS)
- **UI**: Tailwind CSS 3+ with shadcn/ui components
- **Charts**: Recharts for financial visualizations

### Project Structure (Planned)
```
financial-adviser-app/
├── backend/                    # FastAPI application
│   ├── app/
│   │   ├── main.py            # FastAPI app entry point
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── api/               # API route handlers
│   │   ├── services/          # Business logic
│   │   └── security/          # Security utilities
│   ├── pyproject.toml         # Poetry dependencies
│   └── alembic/               # Database migrations
├── frontend/                  # React application
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service layer
│   │   └── types/            # TypeScript types
│   ├── package.json
│   └── vite.config.ts
└── database/                  # SQLite files
```

## Development Commands

### Initial Setup
```bash
# Backend setup
cd backend
poetry install
poetry shell
alembic upgrade head

# Frontend setup
cd frontend
npm install
```

### Development Workflow
```bash
# Start both servers (root directory)
npm run dev:all

# Or manually:
# Backend: poetry run uvicorn app.main:app --reload --port 8000
# Frontend: npm run dev
```

### Code Quality
```bash
# Backend
poetry run black .                # Format code
poetry run isort .                # Sort imports
poetry run ruff check .           # Lint code
poetry run mypy .                 # Type checking

# Frontend
npm run lint                      # ESLint
npm run format                    # Prettier
npm run type-check               # TypeScript
```

### Testing
```bash
# Backend
poetry run pytest                # All tests
poetry run pytest --cov=app     # With coverage

# Frontend
npm run test                     # Vitest unit tests
npm run test:e2e                # Playwright E2E tests
```

## Core Features (Planned)

### MVP Features
1. **Portfolio Management**: Track multiple investment portfolios
2. **Investment Tracking**: Monitor stocks, bonds, ETFs, mutual funds
3. **Financial Goals**: Set and track financial objectives
4. **Market Data Integration**: Real-time price updates via APIs
5. **Performance Analytics**: ROI, risk metrics, benchmarking
6. **Reporting**: Generate financial reports and exports

### Security Features
- **Local-first architecture**: No cloud storage of personal data
- **Encrypted API key storage**: Secure external API credentials
- **Data encryption**: AES-256 for sensitive local data
- **Input validation**: Comprehensive data validation

## Database Schema

### Core Entities
- **Users**: User authentication and profiles
- **Clients**: Client information for advisors
- **Portfolios**: Investment portfolio containers
- **Holdings**: Individual security positions
- **Transactions**: Buy/sell/dividend records
- **Goals**: Financial planning objectives

### Key Relationships
```
Users (1) → (*) Clients → (*) Portfolios → (*) Holdings
Clients (1) → (*) Financial Goals
Portfolios (1) → (*) Transactions
```

## External APIs

### Market Data Sources
- **Alpha Vantage**: Primary stock data API
- **Yahoo Finance**: Backup price data
- **IEX Cloud**: Real-time quotes
- **FRED**: Economic indicators

### API Key Management
- Store encrypted in local config files
- Never expose keys to frontend
- Use proxy pattern for API calls
- Automatic failover between sources

## Parallel Development Guide

### Working as Multiple Agents
This project is designed for parallel development. See `parallel-development-plan.md` for detailed work streams.

#### Quick Stream Reference
- **Stream 1**: Core Backend Infrastructure (models, database)
- **Stream 2**: API Development (endpoints, schemas)
- **Stream 3**: Frontend Foundation (setup, base components)
- **Stream 4**: Frontend Features (pages, services)
- **Stream 5**: Integration & Contracts (API specs, testing)
- **Stream 6**: Financial Engine (calculations, market data)
- **Stream 7**: Infrastructure & DevOps (docker, CI/CD)

#### Coordination Points
1. **API Contracts** - Streams 2, 4, 5 must sync daily
2. **Database Schema** - Streams 1, 2, 6 coordinate on changes
3. **UI Components** - Streams 3, 4 ensure consistency

#### Before Starting Work
1. Check `parallel-development-plan.md` for your stream
2. Review dependencies and current progress
3. Coordinate with dependent streams
4. Create feature branch: `feature/stream-X-description`

### Current State
- Project is in **planning phase** with detailed documentation
- No actual code implementation yet
- Comprehensive architecture and feature plans defined
- Ready for parallel development to begin

### Security Considerations
- All financial data stays local
- Encrypt sensitive configuration
- Validate all user inputs
- Use HTTPS for external API calls
- Implement proper authentication

## Common Tasks

### Adding New Features
1. Define database models in `backend/app/models/`
2. Create Pydantic schemas in `backend/app/schemas/`
3. Implement API endpoints in `backend/app/api/`
4. Add business logic in `backend/app/services/`
5. Create React components in `frontend/src/components/`
6. Add TypeScript types in `frontend/src/types/`

### Database Changes
1. Modify models in `backend/app/models/`
2. Generate migration: `alembic revision --autogenerate -m "description"`
3. Review and edit migration file
4. Apply migration: `alembic upgrade head`

### Adding Dependencies
```bash
# Backend
poetry add package-name
poetry add --group dev package-name  # Dev dependencies

# Frontend
npm install package-name
npm install -D package-name          # Dev dependencies
```

## Distribution

### Build Process
- **Standalone executable**: PyInstaller for backend + embedded frontend
- **Cross-platform installers**: Inno Setup (Windows), create-dmg (macOS), FPM (Linux)
- **Local packaging**: Single-file database, portable installation

### Target Platforms
- Windows 10/11
- macOS 10.15+
- Linux (Ubuntu, CentOS, Debian)

This project emphasizes local-first architecture, user privacy, and professional financial management capabilities.

## Code Patterns and Implementation

### Backend Architecture Patterns

#### Layered Architecture
The backend follows a clean layered architecture:
- **Models Layer**: SQLAlchemy ORM models with business logic properties
- **Schemas Layer**: Pydantic models for API validation and serialization
- **API Layer**: FastAPI routes with dependency injection
- **Service Layer**: Business logic and complex operations
- **Security Layer**: JWT authentication and AES-256 encryption

#### Key Patterns Implemented
- **Dependency Injection**: Centralized authentication and database dependencies
- **Repository Pattern**: SQLAlchemy models with computed properties
- **Security Patterns**: JWT tokens, bcrypt password hashing, encrypted configuration
- **Error Handling**: Global exception handlers with standardized error responses

#### Database Patterns
- **Base Model**: Common fields (id, created_at, updated_at, is_active) for all entities
- **Soft Deletion**: Using is_active flags instead of hard deletes
- **Relationship Management**: Proper foreign keys with cascade operations
- **Computed Properties**: Business calculations as model properties

### Frontend Architecture Patterns

#### Component-Based Architecture
The frontend uses a structured component hierarchy:
- **UI Components**: shadcn/ui primitives for consistent design
- **Layout Components**: Header, Sidebar, Layout for application structure
- **Page Components**: Feature-specific pages with business logic
- **Hook Pattern**: Custom hooks for API calls and state management

#### Key Patterns Implemented
- **Service Layer**: Centralized API calls with error handling
- **Type Safety**: Full TypeScript implementation with shared types
- **State Management**: React Query for server state, local state for UI
- **Form Handling**: react-hook-form with Zod validation

### Security Implementation

#### Local-First Security
- **Encrypted Storage**: API keys encrypted with AES-256 using Fernet
- **JWT Authentication**: Stateless authentication with secure token handling
- **Input Validation**: Comprehensive Pydantic validation on all API inputs
- **CORS Protection**: Restricted origins for cross-origin requests

#### Data Protection
- **Local Database**: SQLite for development, easily migrated to PostgreSQL
- **No Cloud Dependencies**: All financial data stays on user's machine
- **Secure Defaults**: HTTPS enforcement, secure headers, input sanitization

### Development Workflow Patterns

#### Code Quality
- **Backend**: Black (formatting), isort (imports), ruff (linting), mypy (type checking)
- **Frontend**: ESLint (linting), Prettier (formatting), TypeScript (type checking)
- **Testing**: pytest (backend), Vitest (frontend) with comprehensive fixtures

#### File Organization
- **Backend**: Clear separation of models, schemas, API routes, and services
- **Frontend**: Component hierarchy with hooks, services, and type definitions
- **Documentation**: Organized in docs/mvp/ and docs/future/ folders

### Performance Considerations

#### Backend Optimization
- **Database Indexing**: Strategic indexes on frequently queried columns
- **Connection Pooling**: SQLAlchemy session management
- **Lazy Loading**: Efficient loading of related data
- **Query Optimization**: Eager loading to prevent N+1 queries

#### Frontend Optimization
- **Code Splitting**: Vite's automatic bundle optimization
- **Memoization**: React.memo for expensive components
- **Efficient Re-renders**: Proper state management with React Query
- **Type Safety**: Compile-time optimization with TypeScript

### Testing Strategy

#### Backend Testing
- **Unit Tests**: Individual model and service testing
- **Integration Tests**: API endpoint testing with test database
- **Fixtures**: Reusable test data and database sessions
- **Coverage**: Comprehensive test coverage with pytest-cov

#### Frontend Testing
- **Component Tests**: Individual component testing with React Testing Library
- **Hook Tests**: Custom hook testing with proper mocking
- **Integration Tests**: Page-level testing with API mocking
- **E2E Tests**: Full user workflow testing with Playwright (future)

### Migration Patterns for SaaS

#### Database Evolution
- **Multi-tenancy Ready**: Models designed for easy tenant isolation
- **PostgreSQL Migration**: SQLAlchemy makes database switching seamless
- **Schema Versioning**: Alembic migrations for safe schema changes

#### API Versioning
- **Version Compatibility**: API structure ready for v2 with tenant support
- **Backward Compatibility**: Maintaining local app compatibility during SaaS transition

This implementation provides a solid foundation for both local application usage and future SaaS expansion while maintaining security, performance, and code quality best practices.