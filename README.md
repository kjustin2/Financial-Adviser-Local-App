# Personal Financial Management Application

A comprehensive local-first personal investment tracking application built with Python (FastAPI) and React (TypeScript). This application provides portfolio tracking, investment management, and personalized investment recommendations for individual investors looking to manage their own finances.

## 🏗️ Architecture

### Technology Stack
- **Backend**: Python 3.11+ with FastAPI, SQLAlchemy, SQLite/PostgreSQL
- **Frontend**: React 18+ with TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Database**: SQLite (local development) → PostgreSQL (future SaaS)
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Security**: AES-256 encrypted configuration storage for API keys

### Project Structure
```
financial-adviser-app/
├── backend/                    # FastAPI application
│   ├── app/
│   │   ├── main.py            # FastAPI app entry point
│   │   ├── models/            # SQLAlchemy models (User, Portfolio, Holding)
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── api/               # API route handlers
│   │   ├── services/          # Business logic & recommendations
│   │   └── security/          # Security utilities
│   ├── tests/                 # Comprehensive test suite
│   │   ├── test_api/          # API endpoint tests
│   │   └── test_models/       # Model tests
│   ├── pyproject.toml         # Poetry dependencies
│   └── alembic/               # Database migrations
├── frontend/                  # React application
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service layer
│   │   └── types/            # TypeScript types
│   ├── e2e/                  # Playwright E2E tests
│   ├── tests/                # Unit tests
│   ├── package.json
│   └── vite.config.ts
├── database/                  # SQLite files and logs
├── docs/                     # Documentation
├── package.json              # Root scripts
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- **Python 3.11+**: [Download Python](https://python.org/downloads/)
- **Node.js 18+**: [Download Node.js](https://nodejs.org/)
- **Poetry**: [Install Poetry](https://python-poetry.org/docs/#installation)
- **Git**: [Download Git](https://git-scm.com/)

### One-Click Setup (Recommended)

For the fastest setup, use the provided startup scripts:

#### Windows
```bash
# Double-click or run from command prompt
start-app.bat
```

#### macOS/Linux
```bash
# Make executable and run
chmod +x start-app.sh
./start-app.sh
```

#### Cross-Platform (Python)
```bash
# Works on any platform with Python 3.11+
python start-app.py
```

**What the startup scripts do:**
1. Check if Poetry and Node.js are installed
2. Install all project dependencies automatically
3. Start both backend and frontend servers
4. Open the application in your browser

### Manual Installation

#### 1. Clone Repository
```bash
git clone <repository-url>
cd financial-adviser-app
```

#### 2. Install Dependencies
```bash
# Install root dependencies (includes concurrently for dev scripts)
npm install

# Install all dependencies (backend + frontend)
npm run install:all
```

#### 3. Set Up Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
# - Update SECRET_KEY for JWT authentication
# - Add API keys for market data (optional for development)
```

#### 4. Initialize Database
```bash
cd backend
poetry shell
alembic upgrade head
```

#### 5. Start Development Servers
```bash
# Start both backend and frontend servers
npm run dev:all

# Or start individually:
# Backend: npm run dev:backend
# Frontend: npm run dev:frontend
```

#### 6. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🛠️ Development

### Backend Development

#### Available Commands
```bash
cd backend

# Start development server
poetry run uvicorn app.main:app --reload --port 8000

# Database operations
poetry run alembic revision --autogenerate -m "Description"
poetry run alembic upgrade head

# Code quality
poetry run black .                     # Format code
poetry run isort .                     # Sort imports
poetry run ruff check .                # Lint code
poetry run mypy .                      # Type checking

# Testing
poetry run pytest                      # Run all tests
poetry run pytest --cov=app           # With coverage
poetry run pytest tests/test_api/test_auth.py -v  # Specific tests
```

#### Adding New Dependencies
```bash
cd backend
poetry add package-name                # Production dependency
poetry add --group dev package-name    # Development dependency
```

### Frontend Development

#### Available Commands
```bash
cd frontend

# Development
npm run dev                            # Start dev server
npm run build                          # Production build
npm run preview                        # Preview production build

# Code quality
npm run lint                           # ESLint
npm run lint:fix                       # ESLint with auto-fix
npm run format                         # Prettier formatting
npm run type-check                     # TypeScript checking

# Testing
npm run test                           # Vitest unit tests
npm run test:ui                        # Vitest UI
npm run test:coverage                  # Coverage report
npm run test:e2e                       # Playwright E2E tests
```

#### Adding New Dependencies
```bash
cd frontend
npm install package-name               # Production dependency
npm install -D package-name            # Development dependency
```

### Root Level Commands

```bash
# Development
npm run dev:all                        # Start both servers
npm run install:all                    # Install all dependencies

# Quality & Testing
npm run lint:all                       # Lint both backend and frontend
npm run type-check:all                 # Type check both projects
npm run test:all                       # Run all tests
npm run test:server                    # Test server functionality
npm run pre-commit                     # Run pre-commit quality checks
npm run fix:all                        # Auto-fix formatting and linting issues

# Production
npm run build                          # Build frontend for production
```

## 🧪 Testing

The application includes comprehensive testing following 2025 best practices:

### Quick Test Commands

**🚀 Optimized for Speed:**
```bash
# Fast E2E tests (Chromium only, optimized for development)
npm run test:e2e:fast

# All tests with maximum parallelization
npm run test:e2e:parallel

# Run all tests (backend + frontend + E2E)
npm run test:all
```

### Backend Testing (pytest)

**Comprehensive API Testing:**
- **Auth Tests**: 26 tests covering registration, login, validation
- **Portfolio Tests**: 44 tests covering CRUD, calculations, permissions
- **Holdings Tests**: 68 tests covering all endpoints and edge cases

```bash
cd backend

# Fast testing (optimized for development)
poetry run pytest -x --tb=short --disable-warnings    # Stop at first failure
poetry run pytest -n auto --tb=short                   # Parallel execution
poetry run pytest --lf --tb=short                      # Run last failed tests

# Standard testing
poetry run pytest                          # Run all tests
poetry run pytest -v                       # Verbose output
poetry run pytest --cov=app --cov-report=html    # Coverage report

# Specific test execution
poetry run pytest tests/test_api/test_auth.py         # Auth tests
poetry run pytest tests/test_api/test_portfolios.py   # Portfolio tests
poetry run pytest tests/test_api/test_holdings.py     # Holdings tests
```

### Frontend Testing

**Unit Tests (Vitest):**
```bash
cd frontend

# Fast unit tests (optimized for development)
npm run test:fast              # No coverage, basic reporter
npm run test:parallel          # Multi-threaded execution

# Standard testing
npm run test                   # Run all tests once
npm run test:watch             # Watch mode for development
npm run test:coverage          # Run with coverage report
```

**E2E Tests (Playwright):**
```bash
# All E2E Tests
npm run test:e2e                   # All browsers, full test suite
npm run test:e2e:ui                # Interactive UI mode
npm run test:e2e:debug             # Debug mode with browser

# Performance-Optimized Commands
npm run test:e2e:fast              # Chromium only (fastest)
npm run test:e2e:parallel          # All available CPU cores

# Individual Test Files
cd frontend && npx playwright test auth.spec.ts         # Authentication tests
cd frontend && npx playwright test portfolios.spec.ts   # Portfolio tests
```

### Test Coverage
- **Backend API**: 138+ tests covering auth, portfolios, and holdings
- **Frontend**: Unit tests for components and hooks
- **E2E Tests**: 50+ tests covering complete user workflows
- **Security**: SQL injection, XSS, and permission testing

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Application
APP_NAME="Personal Financial Manager"
DEBUG=false

# Database
DATABASE_URL="sqlite:///./database/financial_adviser.db"

# Security
SECRET_KEY="your-secret-key-change-this-in-production"
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API Keys (optional for development)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
POLYGON_API_KEY=your_polygon_key
IEX_CLOUD_API_KEY=your_iex_cloud_key

# CORS (for production)
ALLOWED_ORIGINS=["http://localhost:5173","http://localhost:3000"]
```

### API Keys Setup

The application supports encrypted storage of API keys for market data:

1. **Alpha Vantage**: [Get API Key](https://www.alphavantage.co/support/#api-key)
2. **Polygon.io**: [Get API Key](https://polygon.io/)
3. **IEX Cloud**: [Get API Key](https://iexcloud.io/)

API keys are automatically encrypted and stored locally using AES-256 encryption.

## 🏭 Production Build

### Building the Application
```bash
# Build frontend for production
npm run build

# Backend is ready for production after installing dependencies
cd backend && poetry install --no-dev
```

### Deployment Options

#### 1. Standalone Executable (Recommended for Local Distribution)
```bash
# Install PyInstaller
pip install pyinstaller

# Build standalone executable
python scripts/build-standalone.py
```

#### 2. Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

#### 3. Manual Deployment
```bash
# Backend (using uvicorn)
cd backend
poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000

# Frontend (serve built files)
cd frontend
npm run build
# Serve dist/ folder with any web server
```

## 🔒 Security Features

- **Local-First Architecture**: All financial data stays on the user's machine
- **Encrypted API Key Storage**: API keys encrypted with AES-256
- **JWT Authentication**: Secure user authentication with bcrypt password hashing
- **Input Validation**: Comprehensive validation using Pydantic schemas
- **SQL Injection Protection**: SQLAlchemy ORM with parameterized queries
- **CORS Configuration**: Restricted cross-origin requests
- **User Data Isolation**: Each user can only access their own data

## 📊 Core Features

### ✅ Current Implementation (Simplified MVP)

**Authentication & User Management:**
- ✅ **User Registration**: Complete with investment profile (risk tolerance, experience, goals)
- ✅ **Secure Login**: JWT-based authentication with password strength validation
- ✅ **Investment Profiling**: Risk tolerance, investment experience, financial goals, time horizon

**Portfolio Management:**
- ✅ **Portfolio CRUD**: Create, read, update, delete portfolios
- ✅ **Portfolio Types**: Taxable, retirement, education accounts
- ✅ **Value Calculations**: Real-time portfolio valuation and performance metrics
- ✅ **User Isolation**: Users can only access their own portfolios

**Holdings Management:**
- ✅ **Security Tracking**: Stocks, bonds, ETFs, mutual funds, crypto
- ✅ **Performance Metrics**: Gain/loss calculations, return percentages
- ✅ **Price Updates**: Manual price entry with calculation updates
- ✅ **Position Management**: Add, edit, delete individual holdings

**Technical Infrastructure:**
- ✅ **Comprehensive Testing**: 138+ backend tests, E2E testing with Playwright
- ✅ **Database Migrations**: Alembic-managed schema evolution
- ✅ **Comprehensive Logging**: Structured logging with request tracking
- ✅ **Error Handling**: Robust error handling with user-friendly messages
- ✅ **API Documentation**: Automatic OpenAPI/Swagger documentation

### 🚧 In Development

**Investment Recommendations (Core Feature):**
- 🔄 **Personalized Recommendations**: Based on user investment profile and current portfolio
- 🔄 **Risk Assessment**: Portfolio health scoring and risk analysis
- 🔄 **Actionable Insights**: Specific suggestions for portfolio improvement

### 📅 Planned Features

**Market Data Integration:**
- 📈 **Real-time Prices**: Automatic price updates via market data APIs
- 📊 **Market Analytics**: Performance benchmarking and market analysis
- 💰 **Dividend Tracking**: Dividend history and income projections

**Advanced Portfolio Features:**
- 🎯 **Asset Allocation**: Target allocation tracking and rebalancing suggestions
- 📊 **Performance Analytics**: Historical performance tracking and analysis
- 📋 **Reporting**: PDF reports and data export functionality

**User Experience:**
- 📱 **Mobile Responsive**: Optimized mobile interface
- 🌙 **Dark Mode**: Dark theme support
- 📧 **Notifications**: Portfolio alerts and recommendations

## 🎯 Target Users

This application is designed for **individual investors** who want to:
- Track their personal investment portfolios
- Get personalized investment recommendations
- Maintain privacy with local-first data storage
- Manage multiple account types (taxable, retirement, etc.)
- Monitor investment performance and risk

**Not suitable for:**
- Financial advisors managing client accounts
- Institutional investment management
- Real-time trading applications
- Professional portfolio management services

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run test:all`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style
- **Backend**: Black, isort, and ruff for Python formatting and linting
- **Frontend**: ESLint and Prettier for TypeScript/React formatting
- **Commits**: Use conventional commit format

### Before Submitting
```bash
# Run comprehensive pre-commit checks
npm run pre-commit

# Or run individual checks:
npm run lint:all                       # Lint all code
npm run type-check:all                 # Type check all projects
npm run test:all                       # Run all tests
npm run test:server                    # Test server integration
```

## 📄 API Documentation

When the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🆘 Troubleshooting

### Quick Diagnostics

#### Test Server Health
```bash
# Test if both servers are working correctly
npm run test:server

# This will identify common issues like:
# - Backend not starting (dependency issues, port conflicts)
# - Frontend build failures (missing dependencies)
# - Network connectivity problems
# - Performance issues
```

#### Run Pre-commit Checks
```bash
# Identify code quality issues before they cause problems
npm run pre-commit

# This will catch:
# - Type errors and linting issues
# - Test failures
# - Security concerns (hardcoded secrets)
# - Build problems
```

### Common Issues

#### Backend Server Won't Start
```bash
# Check if dependencies are installed
cd backend
poetry install

# Check for import errors
poetry run python -c "import app.main"

# Reset Poetry environment if needed
poetry env remove python
poetry install
```

#### Frontend Build Errors
```bash
# Install missing dependencies
cd frontend
npm install

# Check for TypeScript errors
npm run type-check

# Clear cache and reinstall if needed
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### Database Issues
```bash
# Reset database
cd backend
rm -f database/financial_adviser.db
poetry run alembic upgrade head

# Check database connectivity
poetry run python -c "from app.database import engine; print('Database OK')"
```

#### Port Conflicts
```bash
# Check what's using ports 8000 or 5173
lsof -i :8000
lsof -i :5173

# Kill processes if needed
kill -9 <PID>

# Or use different ports
VITE_PORT=3000 npm run dev:frontend    # Use port 3000 for frontend
```

### Performance Issues

#### Slow Server Response
```bash
# Check server performance
npm run test:server

# Monitor logs for slow operations
tail -f backend/database/logs/app_*.log
```

#### Build Performance
```bash
# Clear build caches
cd frontend
rm -rf dist .vite node_modules/.vite
npm run build
```

### Getting Help

1. **Run Diagnostics First**: `npm run test:server` and `npm run pre-commit`
2. **Check Logs**: Look in `backend/database/logs/` for detailed error information
3. **Review Issues**: Check the [Issues](../../issues) page for known problems
4. **API Documentation**: Review http://localhost:8000/docs when backend is running
5. **Dependencies**: Ensure Python 3.11+ and Node.js 18+ are installed
6. **Environment**: Verify `.env` file is configured correctly

### Debug Mode

#### Enable Debug Logging
```bash
# Backend: Set DEBUG=true in .env file
echo "DEBUG=true" >> .env

# Frontend: Check browser console for detailed logs
# Open Developer Tools (F12) -> Console tab
```

#### Verbose Testing
```bash
# Backend tests with verbose output
cd backend
poetry run pytest -v -s

# Frontend tests with debug info
cd frontend
npm run test -- --reporter=verbose
```

## 📋 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔮 Roadmap

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architectural information and [docs/current/SIMPLIFICATION_PLAN.md](docs/current/SIMPLIFICATION_PLAN.md) for the current development plan focused on the Investment Recommendations System as the core value proposition.

---

**Built with ❤️ for individual investors who want to take control of their financial future**