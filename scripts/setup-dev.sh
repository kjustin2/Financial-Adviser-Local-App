#!/bin/bash

# Development setup script for Financial Adviser App
# This script sets up the complete development environment

set -e

echo "🚀 Financial Adviser App - Development Setup"
echo "============================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Success message
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Error message
error() {
    echo -e "${RED}❌ $1${NC}"
}

# Warning message
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Info message
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check system requirements
check_requirements() {
    info "Checking system requirements..."
    
    local missing_deps=()
    
    # Check Python
    if command_exists python3; then
        local python_version=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
        local required_version="3.11"
        
        if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" = "$required_version" ]; then
            success "Python $python_version found"
        else
            error "Python 3.11+ required, found $python_version"
            missing_deps+=("python3.11+")
        fi
    else
        error "Python 3 not found"
        missing_deps+=("python3")
    fi
    
    # Check Node.js
    if command_exists node; then
        local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$node_version" -ge 18 ]; then
            success "Node.js v$(node --version | cut -d'v' -f2) found"
        else
            error "Node.js 18+ required, found v$(node --version | cut -d'v' -f2)"
            missing_deps+=("nodejs18+")
        fi
    else
        error "Node.js not found"
        missing_deps+=("nodejs")
    fi
    
    # Check npm
    if command_exists npm; then
        success "npm $(npm --version) found"
    else
        error "npm not found"
        missing_deps+=("npm")
    fi
    
    # Check Poetry
    if command_exists poetry; then
        success "Poetry $(poetry --version | cut -d' ' -f3) found"
    else
        warning "Poetry not found - will attempt to install"
        missing_deps+=("poetry")
    fi
    
    # Check Git
    if command_exists git; then
        success "Git $(git --version | cut -d' ' -f3) found"
    else
        error "Git not found"
        missing_deps+=("git")
    fi
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        echo ""
        error "Missing dependencies: ${missing_deps[*]}"
        echo ""
        echo "Installation instructions:"
        echo "  macOS: brew install python@3.11 node npm git"
        echo "  Ubuntu/Debian: sudo apt-get install python3.11 python3.11-pip nodejs npm git"
        echo "  Windows: Install from official websites or use chocolatey"
        echo ""
        echo "Poetry installation: curl -sSL https://install.python-poetry.org | python3 -"
        return 1
    fi
    
    success "All system requirements met"
    return 0
}

# Install Poetry if missing
install_poetry() {
    if ! command_exists poetry; then
        info "Installing Poetry..."
        curl -sSL https://install.python-poetry.org | python3 -
        
        # Add to PATH for current session
        export PATH="$HOME/.local/bin:$PATH"
        
        if command_exists poetry; then
            success "Poetry installed successfully"
        else
            error "Poetry installation failed"
            echo "Please install Poetry manually: https://python-poetry.org/docs/#installation"
            return 1
        fi
    fi
    
    return 0
}

# Setup backend
setup_backend() {
    info "Setting up backend..."
    
    if [ ! -d "backend" ]; then
        error "Backend directory not found"
        return 1
    fi
    
    cd backend
    
    # Install dependencies
    info "Installing Python dependencies..."
    poetry install
    
    # Create database directory
    mkdir -p database/logs
    
    # Run database migrations
    info "Setting up database..."
    poetry run alembic upgrade head
    
    success "Backend setup complete"
    cd ..
}

# Setup frontend
setup_frontend() {
    info "Setting up frontend..."
    
    if [ ! -d "frontend" ]; then
        error "Frontend directory not found"
        return 1
    fi
    
    cd frontend
    
    # Install dependencies
    info "Installing Node.js dependencies..."
    npm install
    
    success "Frontend setup complete"
    cd ..
}

# Setup project scripts
setup_scripts() {
    info "Setting up project scripts..."
    
    # Make scripts executable
    if [ -d "scripts" ]; then
        chmod +x scripts/*.sh
        success "Scripts made executable"
    fi
    
    # Create logs directory
    mkdir -p logs
    
    success "Project scripts setup complete"
}

# Create development environment files
setup_env_files() {
    info "Setting up environment files..."
    
    # Backend .env file
    if [ ! -f "backend/.env" ]; then
        cat > backend/.env << 'EOF'
# Database
DATABASE_URL=sqlite:///./database/financial_adviser.db

# Security
SECRET_KEY=development-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=60

# API Settings
DEBUG=true
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:5173"]

# Logging
LOG_LEVEL=DEBUG
ECHO_SQL=false
EOF
        success "Created backend/.env"
    else
        info "Backend .env file already exists"
    fi
    
    # Frontend .env.local file
    if [ ! -f "frontend/.env.local" ]; then
        cat > frontend/.env.local << 'EOF'
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME="Financial Adviser"
VITE_DEBUG=true
EOF
        success "Created frontend/.env.local"
    else
        info "Frontend .env.local file already exists"
    fi
}

# Run initial tests
run_initial_tests() {
    info "Running initial tests..."
    
    # Backend tests
    cd backend
    if poetry run pytest --tb=short -q; then
        success "Backend tests passed"
    else
        warning "Some backend tests failed - this is normal for initial setup"
    fi
    cd ..
    
    # Frontend type check
    cd frontend
    if npm run type-check; then
        success "Frontend type checking passed"
    else
        warning "Frontend type checking failed - check for any issues"
    fi
    cd ..
}

# Display final instructions
show_final_instructions() {
    echo ""
    success "🎉 Development environment setup complete!"
    echo ""
    echo "📋 Next steps:"
    echo ""
    echo "1. Start the development servers:"
    echo "   npm run dev:all"
    echo ""
    echo "2. Access the application:"
    echo "   Frontend: http://localhost:5173"
    echo "   Backend API: http://localhost:8000"
    echo "   API Docs: http://localhost:8000/docs"
    echo ""
    echo "3. Useful commands:"
    echo "   npm run test:all        # Run all tests"
    echo "   npm run lint:all        # Run linting"
    echo "   npm run fix:all         # Auto-fix code issues"
    echo "   npm run pre-commit      # Pre-commit checks"
    echo "   npm run logs:view       # View application logs"
    echo ""
    echo "4. Development workflow:"
    echo "   - Make changes to code"
    echo "   - Run npm run pre-commit before committing"
    echo "   - Use npm run test:server to test running servers"
    echo ""
    echo "📚 Documentation:"
    echo "   - Architecture: docs/ARCHITECTURE.md"
    echo "   - API Reference: docs/API_REFERENCE.md"
    echo "   - Development Guide: docs/DEVELOPMENT_GUIDE.md"
    echo "   - Main docs: CLAUDE.md"
    echo ""
    success "Happy coding! 🚀"
}

# Check if we're in the right directory
check_directory() {
    if [ ! -f "package.json" ] || [ ! -f "CLAUDE.md" ]; then
        error "Please run this script from the project root directory"
        exit 1
    fi
}

# Main execution
main() {
    echo "Starting development environment setup..."
    echo ""
    
    # Check we're in the right place
    check_directory
    
    # Check and install requirements
    if ! check_requirements; then
        exit 1
    fi
    
    echo ""
    
    # Install Poetry if needed
    install_poetry
    
    echo ""
    
    # Setup components
    setup_backend
    echo ""
    
    setup_frontend
    echo ""
    
    setup_scripts
    echo ""
    
    setup_env_files
    echo ""
    
    # Run initial tests
    run_initial_tests
    echo ""
    
    # Show final instructions
    show_final_instructions
    
    return 0
}

# Run main function
main "$@"