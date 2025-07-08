# MVP Implementation Plan - Personal Financial Adviser Application

## Executive Summary
This plan outlines the transformation of the current multi-client financial adviser application into a personal financial adviser tool focused on individual user portfolio management, investment tracking, and financial planning. The application will maintain its local-first architecture while removing multi-client functionality.

## Core Changes to MVP

### 1. Architecture Changes
- **Remove Multi-Client Model**: Transform from advisor-managing-clients to user-managing-own-portfolios
- **Simplify User Model**: Single user per installation with their portfolios
- **Update Navigation**: Remove "Clients" section, promote Portfolios to primary feature
- **Personalize Dashboard**: Show user's own financial overview instead of client management

### 2. Feature Updates

#### Backend Changes
1. **User Model Simplification**
   - Remove Client model entirely
   - Link Portfolios directly to User
   - Update all foreign key relationships
   - Simplify authentication (single user focus)

2. **API Endpoint Updates**
   - Remove `/api/v1/clients` endpoints
   - Add `/api/v1/user/profile` for user management
   - Implement full CRUD for portfolios, holdings, transactions, goals
   - Add market data integration endpoints
   - Implement financial calculation endpoints

3. **New Services**
   - Portfolio performance calculator
   - Investment recommendation engine
   - Goal tracking and progress calculator
   - Market data fetcher with caching
   - Report generation service

#### Frontend Changes
1. **Navigation Updates**
   - Dashboard: Personal financial overview
   - My Portfolios: Manage investment portfolios
   - My Goals: Financial goal tracking
   - Market Data: Real-time market information
   - Reports: Personal financial reports
   - Settings: User profile and API keys

2. **New Components**
   - Portfolio performance charts
   - Asset allocation visualizer
   - Goal progress tracker
   - Market data widgets
   - Transaction input forms
   - Investment calculator

3. **User Experience Improvements**
   - Guided onboarding for first-time users
   - Dashboard widgets for quick insights
   - Responsive design for mobile access
   - Dark mode support

## Testing Strategy

### Backend Testing

#### Unit Tests
```
backend/tests/unit/
├── test_models/
│   ├── test_user_model.py
│   ├── test_portfolio_model.py
│   ├── test_holding_model.py
│   ├── test_transaction_model.py
│   └── test_goal_model.py
├── test_services/
│   ├── test_portfolio_service.py
│   ├── test_market_data_service.py
│   ├── test_calculation_service.py
│   └── test_report_service.py
└── test_utils/
    ├── test_encryption.py
    └── test_validators.py
```

#### Integration Tests
```
backend/tests/integration/
├── test_api/
│   ├── test_auth_endpoints.py
│   ├── test_portfolio_endpoints.py
│   ├── test_holding_endpoints.py
│   ├── test_transaction_endpoints.py
│   ├── test_goal_endpoints.py
│   └── test_market_data_endpoints.py
└── test_workflows/
    ├── test_portfolio_creation_flow.py
    ├── test_transaction_processing.py
    └── test_report_generation.py
```

### Frontend Testing

#### Component Tests
```
frontend/src/__tests__/
├── components/
│   ├── Dashboard.test.tsx
│   ├── PortfolioList.test.tsx
│   ├── HoldingForm.test.tsx
│   ├── TransactionForm.test.tsx
│   └── GoalTracker.test.tsx
├── hooks/
│   ├── usePortfolio.test.ts
│   ├── useMarketData.test.ts
│   └── useCalculations.test.ts
└── services/
    ├── api.test.ts
    └── marketData.test.ts
```

#### E2E Tests (Future)
```
e2e/
├── onboarding.spec.ts
├── portfolio-management.spec.ts
├── transaction-flow.spec.ts
└── report-generation.spec.ts
```

## Implementation Steps

### Phase 1: Backend Core Features (Week 1)
1. **Database Schema Updates**
   - Create Alembic migration to remove Client table
   - Update foreign key relationships
   - Add indexes for performance

2. **Model Implementation**
   - Update User model
   - Implement Portfolio, Holding, Transaction, Goal models
   - Add computed properties for calculations

3. **Service Layer**
   - Portfolio management service
   - Transaction processing service
   - Basic calculation service
   - Market data integration (mock initially)

4. **API Endpoints**
   - Full CRUD for all entities
   - Validation with Pydantic schemas
   - Error handling and logging

### Phase 2: Frontend Foundation (Week 1-2)
1. **Remove Client Features**
   - Update routing configuration
   - Remove client-related components
   - Update navigation structure

2. **Core Components**
   - Dashboard with financial overview
   - Portfolio list and detail views
   - Transaction management
   - Goal tracking interface

3. **State Management**
   - React Query setup for data fetching
   - Form handling with react-hook-form
   - Error boundaries and loading states

### Phase 3: Advanced Features (Week 2)
1. **Financial Calculations**
   - ROI and performance metrics
   - Risk assessment
   - Portfolio rebalancing suggestions

2. **Market Data Integration**
   - API key management UI
   - Real-time price updates
   - Historical data charts

3. **Reporting**
   - PDF report generation
   - Excel export functionality
   - Performance visualizations

### Phase 4: Testing & Polish (Week 3)
1. **Comprehensive Testing**
   - All unit tests passing
   - Integration test coverage
   - Manual testing checklist

2. **UI/UX Polish**
   - Consistent styling
   - Responsive design
   - Loading states and error handling

3. **Documentation**
   - User guide
   - API documentation
   - Deployment instructions

## Files to Create/Modify

### Backend Files to Create
```
backend/app/
├── api/v1/endpoints/
│   ├── portfolios.py
│   ├── holdings.py
│   ├── transactions.py
│   ├── goals.py
│   ├── market_data.py
│   └── reports.py
├── services/
│   ├── portfolio_service.py
│   ├── calculation_service.py
│   ├── market_data_service.py
│   └── report_service.py
├── external/
│   ├── alpha_vantage.py
│   ├── yahoo_finance.py
│   └── market_data_interface.py
└── utils/
    ├── calculations.py
    └── formatters.py
```

### Backend Files to Modify
```
backend/app/
├── models/
│   ├── user.py (remove client relationship)
│   ├── portfolio.py (link to user)
│   └── __init__.py (remove client import)
├── api/v1/
│   └── api.py (update routes)
├── schemas/
│   └── __init__.py (remove client schema)
└── main.py (update app description)
```

### Frontend Files to Create
```
frontend/src/
├── pages/
│   ├── Portfolios/
│   │   ├── PortfolioList.tsx
│   │   ├── PortfolioDetail.tsx
│   │   └── PortfolioForm.tsx
│   ├── Goals/
│   │   ├── GoalList.tsx
│   │   └── GoalForm.tsx
│   ├── Reports/
│   │   └── ReportGenerator.tsx
│   └── Settings/
│       ├── Profile.tsx
│       └── ApiKeys.tsx
├── components/
│   ├── portfolio/
│   │   ├── PerformanceChart.tsx
│   │   ├── AllocationPie.tsx
│   │   └── HoldingsList.tsx
│   ├── transactions/
│   │   ├── TransactionForm.tsx
│   │   └── TransactionHistory.tsx
│   └── market/
│       ├── PriceTicker.tsx
│       └── MarketOverview.tsx
├── hooks/
│   ├── usePortfolio.ts
│   ├── useMarketData.ts
│   └── useCalculations.ts
└── types/
    ├── portfolio.ts
    ├── market.ts
    └── calculations.ts
```

### Frontend Files to Modify
```
frontend/src/
├── App.tsx (update routes)
├── components/
│   └── layout/
│       └── Sidebar.tsx (remove clients)
├── pages/
│   ├── Dashboard.tsx (personalize)
│   └── index.ts (remove clients export)
└── services/
    └── api.ts (update endpoints)
```

## Dependencies to Install

### Backend Dependencies
```toml
# Add to pyproject.toml
[tool.poetry.dependencies]
# Market data
yfinance = "^0.2.33"
alpha-vantage = "^2.3.1"
pandas = "^2.1.4"

# Calculations
numpy = "^1.26.2"
scipy = "^1.11.4"

# Reporting
reportlab = "^4.0.7"
openpyxl = "^3.1.2"
matplotlib = "^3.8.2"

# Caching
redis = "^5.0.1"
aiocache = "^0.12.2"
```

### Frontend Dependencies
```json
// Add to package.json
{
  "dependencies": {
    // Charts and visualization
    "recharts": "^2.10.3",
    "d3": "^7.8.5",
    
    // Forms and validation
    "react-hook-form": "^7.48.2",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.2",
    
    // PDF generation
    "jspdf": "^2.5.1",
    "html2canvas": "^1.4.1",
    
    // Excel export
    "xlsx": "^0.18.5",
    
    // Date handling
    "date-fns": "^3.0.6"
  }
}
```

## Testing Commands

### Backend Testing
```bash
# Run all tests
cd backend
poetry run pytest

# Run with coverage
poetry run pytest --cov=app --cov-report=html

# Run specific test categories
poetry run pytest tests/unit/
poetry run pytest tests/integration/
poetry run pytest -k "portfolio"

# Run tests in watch mode
poetry run ptw
```

### Frontend Testing
```bash
# Run all tests
cd frontend
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm run test src/__tests__/components/Dashboard.test.tsx
```

### Integration Testing
```bash
# Run backend and frontend together
npm run test:integration

# Manual testing checklist
npm run test:manual
```

## Deployment Commands

### Local Development
```bash
# Install all dependencies
npm run install:all

# Database setup
cd backend
poetry run alembic upgrade head

# Start development servers
npm run dev:all
```

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd backend
poetry build

# Create standalone executable
poetry run pyinstaller --name FinancialAdviser --onefile app/main.py
```

### Database Migration
```bash
# Create new migration
cd backend
poetry run alembic revision --autogenerate -m "Remove client model"

# Apply migrations
poetry run alembic upgrade head

# Rollback if needed
poetry run alembic downgrade -1
```

## Running the Application

### Development Mode
```bash
# From root directory
npm run dev:all

# Or separately:
# Terminal 1 - Backend
cd backend
poetry run uvicorn app.main:app --reload --port 8000

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Production Mode
```bash
# Using Docker (future)
docker-compose up

# Using executables
./dist/FinancialAdviser

# Manual production start
cd backend
poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000
# Frontend served from backend/static
```

### Environment Setup
```bash
# Backend environment
cd backend
cp .env.example .env
# Edit .env with your configuration

# Frontend environment
cd frontend
cp .env.example .env
# Edit .env with API endpoint
```

## Code Quality Commands

### Backend
```bash
cd backend

# Format code
poetry run black .
poetry run isort .

# Lint code
poetry run ruff check .
poetry run mypy .

# All quality checks
poetry run make quality
```

### Frontend
```bash
cd frontend

# Lint code
npm run lint
npm run lint:fix

# Format code
npm run format

# Type check
npm run type-check

# All checks
npm run check:all
```

## Review Checklist

### Code Review Points
1. **Security**
   - [ ] All inputs validated
   - [ ] API keys encrypted
   - [ ] No sensitive data in logs
   - [ ] CORS properly configured

2. **Performance**
   - [ ] Database queries optimized
   - [ ] Proper indexing in place
   - [ ] Frontend bundle size reasonable
   - [ ] Lazy loading implemented

3. **Testing**
   - [ ] All unit tests pass
   - [ ] Integration tests cover workflows
   - [ ] Edge cases handled
   - [ ] Error scenarios tested

4. **User Experience**
   - [ ] Intuitive navigation
   - [ ] Clear error messages
   - [ ] Loading states present
   - [ ] Responsive on all devices

5. **Code Quality**
   - [ ] Consistent style
   - [ ] No lint errors
   - [ ] Type safety maintained
   - [ ] Documentation complete

## Timeline

### Week 1
- Days 1-2: Backend schema updates and core models
- Days 3-4: API endpoints and services
- Day 5: Backend testing

### Week 2
- Days 1-2: Frontend refactoring (remove clients)
- Days 3-4: Core UI components
- Day 5: Frontend-backend integration

### Week 3
- Days 1-2: Advanced features (calculations, market data)
- Days 3-4: Testing and bug fixes
- Day 5: Documentation and final review

## Success Criteria

1. **Functionality**
   - User can create and manage multiple portfolios
   - Transactions tracked accurately
   - Performance calculations correct
   - Goals progress tracked
   - Reports generated successfully

2. **Quality**
   - 80%+ test coverage
   - All linting passes
   - No critical security issues
   - Performance benchmarks met

3. **User Experience**
   - Onboarding takes < 5 minutes
   - Common tasks require < 3 clicks
   - Page load times < 2 seconds
   - Mobile responsive

This plan ensures a systematic transformation of the application from a multi-client financial adviser tool to a personal financial management application, with comprehensive testing and quality assurance at every step.