# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Personal Financial Management Application** designed for individual investors. The application is a local-first, Python + React financial management tool that provides portfolio tracking, investment optimization, and financial planning capabilities for individual users rather than financial adviser firms.

## Key Architecture

### Technology Stack
- **Backend**: FastAPI (Python 3.11+) with SQLAlchemy ORM
- **Frontend**: React 18+ with TypeScript 5+ and Vite 5+
- **Database**: SQLite (local development) → PostgreSQL (future SaaS)
- **UI**: Tailwind CSS 3+ with shadcn/ui components
- **Charts**: Recharts for financial visualizations

### Project Structure (Current)
```
financial-adviser-app/
├── backend/                    # FastAPI application
│   ├── app/
│   │   ├── main.py            # FastAPI app entry point
│   │   ├── models/            # SQLAlchemy models
│   │   │   ├── user.py        # Individual investor user model
│   │   │   ├── portfolio.py   # Portfolio management
│   │   │   └── ...
│   │   ├── schemas/           # Pydantic schemas
│   │   │   ├── auth.py        # Authentication schemas
│   │   │   └── ...
│   │   ├── api/               # API route handlers
│   │   │   └── v1/endpoints/  # API endpoints
│   │   ├── services/          # Business logic
│   │   ├── security/          # Security utilities
│   │   └── utils/             # Utilities (logging, etc.)
│   ├── tests/                 # Test suite
│   │   ├── test_api/         # API tests
│   │   └── test_models/      # Model tests
│   ├── pyproject.toml         # Poetry dependencies
│   └── alembic/               # Database migrations
├── frontend/                  # React application
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── pages/            # Page components
│   │   │   └── auth/         # Authentication pages
│   │   ├── services/         # API service layer
│   │   ├── contexts/         # React contexts
│   │   └── types/            # TypeScript types
│   ├── tests/                # Frontend tests
│   ├── package.json
│   └── vite.config.ts
└── database/                  # SQLite files
```

## Documentation Structure

The codebase includes comprehensive documentation organized as follows:

### Core Documentation Files
- **CLAUDE.md** (this file) - Main instructions for Claude Code
- **README.md** - Project overview and quick start guide
- **docs/ARCHITECTURE.md** - Comprehensive system architecture and design patterns
- **docs/API_REFERENCE.md** - Complete REST API documentation with examples
- **docs/DEVELOPMENT_GUIDE.md** - Detailed development workflow and best practices

### Legacy Documentation
The following documentation directories contain historical information:
- **docs/mvp/** - MVP planning and feature specifications
- **docs/future/** - Future SaaS expansion plans
- **docs/enhanced/** - Advanced feature designs

### When Working on Documentation
**IMPORTANT**: When making changes that are purely documentation updates (editing .md files, updating comments, or modifying documentation-only content), you do NOT need to run the full test suite. Documentation changes don't affect application functionality and testing is not required.

However, when making ANY code changes to Python (.py), TypeScript (.ts/.tsx), or configuration files, you MUST run the testing workflow as described below.

### Quick Reference - Development Scripts
The project includes several utility scripts in the `scripts/` directory:
- **setup-dev.sh** - Complete development environment setup
- **pre-commit-check.sh** - Comprehensive pre-commit validation
- **test-server.sh** - Test running development servers
- **test-integration.sh** - End-to-end integration testing

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
# Quick start (all-in-one setup)
./scripts/setup-dev.sh           # First-time setup
npm run start                    # Start both servers

# Individual commands
npm run dev:all                  # Start both servers
npm run dev:backend              # Backend only
npm run dev:frontend             # Frontend only

# Project management
npm run setup                    # Install all dependencies + migrate DB
npm run reset                    # Clean everything and reinstall
npm run clean:all                # Clean build artifacts and dependencies

# Database management
npm run db:migrate               # Apply pending migrations
npm run db:migration             # Create new migration from model changes
npm run db:reset                 # Reset database and apply all migrations
```

### Code Quality & Testing
```bash
# Comprehensive quality checks
npm run quality:all              # Run all linting and type checking
npm run fix:all                  # Auto-fix all code issues
npm run pre-commit               # Complete pre-commit validation

# Individual quality tools
npm run lint:all                 # Lint backend and frontend
npm run lint:backend             # Python: black, isort, ruff
npm run lint:frontend            # TypeScript: ESLint
npm run type-check:all           # Type checking for both

# Testing commands
npm run test:all                 # Run all tests (backend + frontend + E2E)
npm run test:backend             # Python: pytest
npm run test:frontend            # TypeScript: Vitest
npm run test:backend:coverage    # Backend tests with coverage
npm run test:frontend:coverage   # Frontend tests with coverage
npm run test:server              # Test running development servers
npm run test:integration         # End-to-end integration tests
npm run test:e2e                 # Playwright end-to-end tests
npm run test:e2e:ui              # Playwright tests with UI mode
npm run test:e2e:debug           # Playwright tests in debug mode

# Development tools
npm run logs:view                # View application logs
npm run logs:errors              # View error logs only
```

## Core Features (Implemented & Planned)

### ✅ Implemented Features
1. **Individual Investor Authentication**: Complete registration and login system
2. **Investment Profile Management**: Risk tolerance, experience, financial goals
3. **User Profile System**: Personal information and investment preferences
4. **Database Migrations**: Alembic-managed schema evolution
5. **Comprehensive Testing**: 24+ test cases covering core functionality
6. **Enhanced Logging**: Structured logging with request tracking
7. **Input Validation**: Multi-layer validation (Pydantic + custom)

### 🔄 MVP Features (In Progress)
1. **Portfolio Management**: Track multiple investment portfolios
2. **Investment Tracking**: Monitor stocks, bonds, ETFs, mutual funds
3. **Financial Goals**: Set and track financial objectives
4. **Market Data Integration**: Real-time price updates via APIs
5. **Performance Analytics**: ROI, risk metrics, benchmarking
6. **Reporting**: Generate financial reports and exports

### Security Features (Implemented)
- **Local-first architecture**: No cloud storage of personal data
- **JWT Authentication**: Stateless authentication with secure tokens
- **Password Security**: bcrypt hashing with strength validation
- **Input validation**: Comprehensive Pydantic validation
- **Error Handling**: Structured error responses
- **Request Logging**: Security-focused logging with IP tracking

## Database Schema (Current)

### Core Entities
- **Users**: Individual investor authentication and investment profiles
  - Personal info (name, email, phone)
  - Investment profile (experience, risk tolerance, goals)
  - Account management (active status, timestamps)
- **Portfolios**: Investment portfolio containers (planned)
- **Holdings**: Individual security positions (planned)
- **Transactions**: Buy/sell/dividend records (planned)
- **Goals**: Financial planning objectives (planned)

### Key Relationships (Current & Planned)
```
Users (1) → (*) Portfolios → (*) Holdings
Users (1) → (*) Financial Goals
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

## Development Best Practices

### Change Management Workflow
**CRITICAL**: Follow this workflow for ALL changes to ensure stability:

1. **Pre-Change Analysis**
   - Read and understand existing code structure
   - Identify all affected components and dependencies
   - Plan the change with minimal impact
   - Review similar patterns in the codebase

2. **Implementation**
   - Make changes incrementally
   - Follow existing code patterns and conventions
   - Add proper logging for new functionality
   - Include comprehensive error handling

3. **Testing Protocol** (MANDATORY)
   ```bash
   # After ANY code change, run these commands:
   poetry run pytest tests/test_api/test_auth.py -v  # Core auth tests
   poetry run pytest --tb=short                     # All tests overview
   npm run test:e2e                                 # Playwright E2E tests (must pass)
   ```

4. **Code Review Process** (MANDATORY)
   - Review your changes as an expert reviewer
   - Check for security vulnerabilities
   - Verify error handling is comprehensive
   - Ensure logging is appropriate and informative
   - Validate that patterns match existing codebase

5. **Issue Resolution**
   - If tests fail, fix issues immediately before proceeding
   - Use debug scripts to isolate problems
   - Never leave failing tests
   - Document any known limitations

### Current Project State
- **Status**: MVP Phase with working authentication system
- **Core Features**: Individual investor registration and authentication working
- **Test Coverage**: 24/26 tests passing (core functionality complete)
- **Architecture**: Clean layered architecture with proper separation of concerns

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

### Testing Strategy (Implemented Best Practices)

#### Backend Testing (Current Implementation)
- **Unit Tests**: Individual model and service testing
- **Integration Tests**: API endpoint testing with test database
- **Fixtures**: Reusable test data and database sessions  
- **Coverage**: Comprehensive test coverage with pytest-cov
- **Test Isolation**: Each test uses fresh database state
- **Error Testing**: Comprehensive validation error testing
- **Security Testing**: Authentication and authorization testing

#### Testing Best Practices (MANDATORY)
```bash
# Always run these after ANY code change:
poetry run pytest tests/test_api/test_auth.py -v  # Core functionality
poetry run pytest --tb=short                     # Quick overview

# For debugging specific issues:
poetry run pytest tests/test_api/test_auth.py::TestClass::test_method -v -s

# Before committing changes:
poetry run pytest --cov=app                      # Full coverage report
```

#### Test Debugging Strategy
When tests fail:
1. **Isolate the Issue**: Run only the failing test with `-v -s` flags
2. **Create Debug Scripts**: Write standalone scripts to reproduce issues
3. **Check Test Fixtures**: Ensure fixtures are properly set up and torn down
4. **Validate Data Flow**: Verify database state, session management, and data persistence
5. **Review Logs**: Use logging output to trace execution flow

#### Frontend Testing
- **Component Tests**: Individual component testing with React Testing Library
- **Hook Tests**: Custom hook testing with proper mocking
- **Integration Tests**: Page-level testing with API mocking
- **E2E Tests**: Full user workflow testing with Playwright (126 comprehensive tests)

#### Playwright E2E Testing (MANDATORY)
**CRITICAL**: All Playwright tests MUST pass after any code changes. The test suite includes 126 comprehensive tests across 4 test suites covering:

- **Authentication Flow**: Login/register page validation and error handling
- **Dashboard Navigation**: User interface interactions and routing  
- **Portfolio Management**: Investment tracking and portfolio operations
- **Settings & Profile**: User profile management and configuration

**Running Playwright Tests**:
```bash
npm run test:e2e              # Run all E2E tests (must pass)
npm run test:e2e:ui           # Run with interactive UI mode
npm run test:e2e:debug        # Run in debug mode for troubleshooting
```

**Test Requirements**:
- All 126 tests must pass before committing any changes
- Tests validate both UI interactions and API integrations
- Cross-browser compatibility (Chromium, Firefox, WebKit)
- Client-side validation and error message display
- Authentication flows and protected route access

### Logging Best Practices (Implemented)

#### Structured Logging Implementation
- **Request Tracking**: Every API request logged with IP, method, endpoint
- **User Actions**: Authentication attempts, registration, profile changes
- **Error Tracking**: Detailed error logging with stack traces and context
- **Performance Monitoring**: Request timing and response status codes
- **Security Events**: Failed login attempts, invalid tokens, suspicious activity

#### Logging Levels and Usage
```python
# Request/Response logging (INFO level)
logger.info(f"Registration attempt for email: {user_data.email}",
    extra={"client_ip": client_ip, "email": user_data.email})

# Warning for business logic issues (WARNING level) 
logger.warning(f"Registration failed - email already exists: {email}",
    extra={"client_ip": client_ip, "email": email})

# Errors with full context (ERROR level)
logger.error(f"Unexpected error during registration: {email}",
    extra={"client_ip": client_ip, "error": error_details})
```

#### Log File Organization
- **Application Logs**: `database/logs/app_YYYYMMDD.log`
- **Error Logs**: `database/logs/errors_YYYYMMDD.log`
- **Daily Rotation**: Automatic log file rotation for disk space management
- **Structured Data**: JSON-style extra fields for easy parsing and analysis

#### Debugging with Logs
1. **Follow Request Flow**: Track requests from entry to completion
2. **Context Preservation**: Include relevant data (user_id, email, etc.) in all related log entries
3. **Error Correlation**: Link errors to specific user actions and requests
4. **Performance Analysis**: Use timing data to identify bottlenecks

### Expert Code Review Process (MANDATORY)

#### Pre-Review Checklist
Before considering any change complete, conduct expert review:

1. **Security Review**
   - No secrets or sensitive data exposed in logs or responses
   - All user inputs properly validated and sanitized
   - Authentication and authorization correctly implemented
   - SQL injection and other attack vectors prevented

2. **Architecture Review**
   - Changes follow existing patterns and conventions
   - Proper separation of concerns maintained
   - Dependencies injected correctly
   - Error handling consistent with existing code

3. **Performance Review**
   - Database queries optimized (no N+1 problems)
   - Proper indexing considered for new database fields
   - Memory usage reasonable
   - Response times acceptable

4. **Code Quality Review**
   - Code is readable and maintainable
   - Proper documentation and comments where needed
   - Function and variable names are descriptive
   - No code duplication or anti-patterns

#### Expert Review Questions
Ask these questions for every change:

1. **Does this change break existing functionality?**
   - Run full test suite to verify
   - Check for breaking changes in API contracts
   - Verify backward compatibility

2. **Is error handling comprehensive?**
   - All possible error paths covered
   - User-friendly error messages
   - Proper logging of errors with context

3. **Are security best practices followed?**
   - Input validation comprehensive
   - Output properly escaped/sanitized
   - Authentication/authorization correct

4. **Is the code maintainable?**
   - Clear structure and organization
   - Follows existing patterns
   - Easy to understand and modify

#### Post-Change Validation
After making changes, always:
```bash
# 1. Run core tests
poetry run pytest tests/test_api/test_auth.py -v

# 2. Run full test suite
poetry run pytest --tb=short

# 3. Run Playwright E2E tests (MANDATORY - must pass)
npm run test:e2e

# 4. Check code quality
poetry run black .
poetry run ruff check .

# 5. Verify application startup
poetry run uvicorn app.main:app --reload --port 8000
```

### Migration Patterns for SaaS

#### Database Evolution
- **Multi-tenancy Ready**: Models designed for easy tenant isolation
- **PostgreSQL Migration**: SQLAlchemy makes database switching seamless
- **Schema Versioning**: Alembic migrations for safe schema changes

#### API Versioning
- **Version Compatibility**: API structure ready for v2 with tenant support
- **Backward Compatibility**: Maintaining local app compatibility during SaaS transition

This implementation provides a solid foundation for both local application usage and future SaaS expansion while maintaining security, performance, and code quality best practices.