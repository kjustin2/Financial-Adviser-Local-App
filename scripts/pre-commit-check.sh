#!/bin/bash

# Pre-commit checks for the Financial Adviser App
# Run this before committing to ensure code quality

set -e

echo "🔍 Pre-commit Quality Checks"
echo "============================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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
    echo -e "ℹ️  $1"
}

# Track failures
FAILURES=0

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "CLAUDE.md" ]; then
    error "Please run this script from the project root directory"
    exit 1
fi

# Backend checks
check_backend() {
    info "Checking Backend..."
    
    if [ ! -d "backend" ]; then
        warning "Backend directory not found, skipping backend checks"
        return 0
    fi
    
    cd backend
    
    # Check if poetry is available
    if ! command -v poetry >/dev/null 2>&1; then
        error "Poetry not found. Please install poetry first."
        ((FAILURES++))
        cd ..
        return 1
    fi
    
    # Install dependencies if needed
    if [ ! -f "poetry.lock" ]; then
        info "Installing backend dependencies..."
        poetry install --no-dev
    fi
    
    # Type checking
    info "Running type checks..."
    if poetry run mypy .; then
        success "Type checks passed"
    else
        error "Type checks failed"
        ((FAILURES++))
    fi
    
    # Linting
    info "Running linting..."
    if poetry run ruff check .; then
        success "Linting passed"
    else
        error "Linting failed"
        ((FAILURES++))
    fi
    
    # Code formatting check
    info "Checking code formatting..."
    if poetry run black --check .; then
        success "Code formatting is correct"
    else
        error "Code formatting issues found. Run 'poetry run black .' to fix"
        ((FAILURES++))
    fi
    
    # Import sorting check
    info "Checking import sorting..."
    if poetry run isort --check-only .; then
        success "Import sorting is correct"
    else
        error "Import sorting issues found. Run 'poetry run isort .' to fix"
        ((FAILURES++))
    fi
    
    # Run tests
    info "Running backend tests..."
    if poetry run pytest --tb=short; then
        success "Backend tests passed"
    else
        error "Backend tests failed"
        ((FAILURES++))
    fi
    
    cd ..
}

# Frontend checks
check_frontend() {
    info "Checking Frontend..."
    
    if [ ! -d "frontend" ]; then
        warning "Frontend directory not found, skipping frontend checks"
        return 0
    fi
    
    cd frontend
    
    # Check if npm is available
    if ! command -v npm >/dev/null 2>&1; then
        error "npm not found. Please install Node.js and npm first."
        ((FAILURES++))
        cd ..
        return 1
    fi
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        info "Installing frontend dependencies..."
        npm install
    fi
    
    # Type checking
    info "Running TypeScript checks..."
    if npm run type-check; then
        success "TypeScript checks passed"
    else
        error "TypeScript checks failed"
        ((FAILURES++))
    fi
    
    # Linting
    info "Running ESLint..."
    if npm run lint; then
        success "ESLint passed"
    else
        error "ESLint failed"
        ((FAILURES++))
    fi
    
    # Build check
    info "Testing build..."
    if npm run build; then
        success "Build successful"
    else
        error "Build failed"
        ((FAILURES++))
    fi
    
    # Run tests
    info "Running frontend tests..."
    if npm run test; then
        success "Frontend tests passed"
    else
        error "Frontend tests failed"
        ((FAILURES++))
    fi
    
    cd ..
}

# Security checks
check_security() {
    info "Running security checks..."
    
    # Check for common security issues
    if grep -r "password\|secret\|key" --include="*.ts" --include="*.tsx" --include="*.py" --exclude-dir=node_modules --exclude-dir=.git .; then
        warning "Found potential secrets in code. Please review:"
        grep -r "password\|secret\|key" --include="*.ts" --include="*.tsx" --include="*.py" --exclude-dir=node_modules --exclude-dir=.git . | head -10
    fi
    
    # Check for TODO/FIXME comments
    local todos=$(grep -r "TODO\|FIXME\|XXX" --include="*.ts" --include="*.tsx" --include="*.py" --exclude-dir=node_modules --exclude-dir=.git . | wc -l)
    if [ "$todos" -gt 0 ]; then
        warning "Found $todos TODO/FIXME comments in code"
    fi
    
    success "Security checks completed"
}

# Git checks
check_git() {
    info "Running git checks..."
    
    # Check if there are staged changes
    if ! git diff --cached --quiet; then
        info "Found staged changes ready for commit"
    else
        warning "No staged changes found"
    fi
    
    # Check for large files
    local large_files=$(find . -type f -size +10M -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null)
    if [ -n "$large_files" ]; then
        warning "Found large files (>10MB):"
        echo "$large_files"
    fi
    
    success "Git checks completed"
}

# Main execution
main() {
    echo "Starting pre-commit checks..."
    echo ""
    
    # Run all checks
    check_backend
    echo ""
    
    check_frontend
    echo ""
    
    check_security
    echo ""
    
    check_git
    echo ""
    
    # Summary
    echo "🔍 Pre-commit Summary"
    echo "===================="
    
    if [ $FAILURES -eq 0 ]; then
        success "All checks passed! Ready to commit 🎉"
        echo ""
        echo "You can now run: git commit -m 'your commit message'"
        return 0
    else
        error "Found $FAILURES issues that need to be fixed before committing"
        echo ""
        echo "Please fix the issues above and run this script again."
        return 1
    fi
}

# Run main function
main "$@"