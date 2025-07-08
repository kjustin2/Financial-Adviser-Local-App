# Financial Adviser Local Application

A comprehensive local-first financial advisory application built with Python (FastAPI) and React (TypeScript). This application provides portfolio tracking, investment optimization, financial planning, and market data integration for financial advisors and their clients.

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
├── database/                  # SQLite files
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

### Server Integration Testing
```bash
# Test both backend and frontend servers are working correctly
npm run test:server

# This will test:
# - Backend health endpoints and API documentation
# - Frontend build and accessibility
# - CORS headers and rate limiting
# - Performance thresholds
# - Integration between services
```

### Backend Testing
```bash
cd backend

# Run all tests
poetry run pytest

# Run with coverage
poetry run pytest --cov=app --cov-report=html

# Run specific test file
poetry run pytest tests/test_models/test_client.py

# Run tests with verbose output
poetry run pytest -v

# Test specific components
poetry run pytest tests/test_main.py        # Main application tests
poetry run pytest tests/test_health.py      # Health check tests
```

### Frontend Testing
```bash
cd frontend

# Run unit tests
npm run test

# Run tests in UI mode
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run E2E tests (when configured)
npm run test:e2e
```

### Pre-Commit Quality Checks
```bash
# Run comprehensive quality checks before committing
npm run pre-commit

# This will check:
# - Backend: Type checking, linting, formatting, tests
# - Frontend: TypeScript, ESLint, build tests, unit tests
# - Security: Check for secrets in code
# - Git: Verify staged changes and file sizes
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Application
APP_NAME="Financial Adviser API"
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

## 📊 Core Features

### Current Implementation (MVP)
- ✅ **User Authentication**: Registration, login, password management
- ✅ **Client Management**: Add, edit, view, and manage advisory clients
- ✅ **Database Infrastructure**: SQLAlchemy models with Alembic migrations
- ✅ **API Foundation**: RESTful API with automatic OpenAPI documentation
- ✅ **Frontend Foundation**: React app with TypeScript and Tailwind CSS
- ✅ **Security Layer**: Encrypted configuration and JWT authentication
- ✅ **Comprehensive Logging**: Backend and frontend logging with performance monitoring
- ✅ **Error Handling**: Robust error handling with transaction management
- ✅ **Testing Infrastructure**: Server testing, health checks, and pre-commit quality checks
- ✅ **Development Tools**: Auto-formatting, linting, and debugging utilities

### Planned Features
- 📈 **Portfolio Management**: Investment portfolio tracking and analysis
- 💰 **Holdings Management**: Individual security position tracking
- 🎯 **Financial Goals**: Goal setting and progress tracking
- 📊 **Market Data Integration**: Real-time stock prices and financial data
- 📱 **Responsive Design**: Mobile-friendly interface
- 📋 **Reporting**: Financial reports and export functionality

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
poetry run python -c "from app.database import engine; print(engine.execute('SELECT 1').scalar())"
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

#### Module Import Errors
```bash
# Backend: Check SQLAlchemy imports
cd backend
poetry run python -c "from sqlalchemy import Numeric; print('SQLAlchemy OK')"

# Frontend: Check dependencies
cd frontend
npm list --depth=0
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

See [docs/features-roadmap.md](docs/features-roadmap.md) for detailed feature plans and [docs/saas-expansion-analysis.md](docs/saas-expansion-analysis.md) for future SaaS expansion possibilities.

---

**Built with ❤️ for financial advisors and their clients**