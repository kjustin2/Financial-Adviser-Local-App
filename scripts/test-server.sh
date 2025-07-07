#!/bin/bash

# Test script for local server validation
# This script tests that both backend and frontend are working properly

set -e  # Exit on any error

echo "🧪 Financial Adviser App - Local Server Test Suite"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:5173"
TIMEOUT=10
LOG_FILE="./logs/test-$(date +%Y%m%d-%H%M%S).log"

# Create logs directory
mkdir -p logs

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Success message
success() {
    echo -e "${GREEN}✅ $1${NC}"
    log "SUCCESS: $1"
}

# Error message
error() {
    echo -e "${RED}❌ $1${NC}"
    log "ERROR: $1"
}

# Warning message
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    log "WARNING: $1"
}

# Info message
info() {
    echo -e "ℹ️  $1"
    log "INFO: $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Wait for service to be ready
wait_for_service() {
    local url=$1
    local name=$2
    local max_attempts=30
    local attempt=1
    
    info "Waiting for $name to be ready at $url..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|404"; then
            success "$name is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        ((attempt++))
    done
    
    error "$name did not start within $((max_attempts * 2)) seconds"
    return 1
}

# Test HTTP endpoint
test_endpoint() {
    local url=$1
    local expected_status=$2
    local description=$3
    
    info "Testing: $description"
    
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" = "$expected_status" ]; then
        success "$description - Status: $response"
        return 0
    else
        error "$description - Expected: $expected_status, Got: $response"
        return 1
    fi
}

# Test JSON endpoint
test_json_endpoint() {
    local url=$1
    local expected_field=$2
    local description=$3
    
    info "Testing: $description"
    
    local response=$(curl -s "$url" 2>/dev/null)
    
    if echo "$response" | jq -e ".$expected_field" >/dev/null 2>&1; then
        success "$description - JSON field '$expected_field' present"
        return 0
    else
        error "$description - JSON field '$expected_field' missing or invalid JSON"
        echo "Response: $response"
        return 1
    fi
}

# Performance test
performance_test() {
    local url=$1
    local description=$2
    local max_time=$3
    
    info "Performance test: $description"
    
    local start_time=$(date +%s.%3N)
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    local end_time=$(date +%s.%3N)
    
    local duration=$(echo "$end_time - $start_time" | bc)
    
    if (( $(echo "$duration < $max_time" | bc -l) )); then
        success "$description - Response time: ${duration}s (< ${max_time}s)"
        return 0
    else
        warning "$description - Response time: ${duration}s (> ${max_time}s)"
        return 1
    fi
}

# Check dependencies
check_dependencies() {
    info "Checking dependencies..."
    
    local deps=("curl" "jq" "bc")
    local missing=()
    
    for dep in "${deps[@]}"; do
        if ! command_exists "$dep"; then
            missing+=("$dep")
        fi
    done
    
    if [ ${#missing[@]} -gt 0 ]; then
        error "Missing dependencies: ${missing[*]}"
        echo "Please install missing dependencies:"
        echo "Ubuntu/Debian: sudo apt-get install ${missing[*]}"
        echo "macOS: brew install ${missing[*]}"
        return 1
    fi
    
    success "All dependencies available"
    return 0
}

# Test backend
test_backend() {
    info "Testing Backend Server..."
    
    local tests_passed=0
    local total_tests=0
    
    # Test health endpoint
    ((total_tests++))
    if test_endpoint "$BACKEND_URL/health" "200" "Health check endpoint"; then
        ((tests_passed++))
    fi
    
    # Test health endpoint JSON structure
    ((total_tests++))
    if test_json_endpoint "$BACKEND_URL/health" "success" "Health check JSON response"; then
        ((tests_passed++))
    fi
    
    # Test root endpoint
    ((total_tests++))
    if test_endpoint "$BACKEND_URL/" "200" "Root endpoint"; then
        ((tests_passed++))
    fi
    
    # Test API documentation
    ((total_tests++))
    if test_endpoint "$BACKEND_URL/docs" "200" "API documentation"; then
        ((tests_passed++))
    fi
    
    # Test OpenAPI schema
    ((total_tests++))
    if test_endpoint "$BACKEND_URL/openapi.json" "200" "OpenAPI schema"; then
        ((tests_passed++))
    fi
    
    # Performance test
    ((total_tests++))
    if performance_test "$BACKEND_URL/health" "Health check performance" "0.5"; then
        ((tests_passed++))
    fi
    
    # Test CORS headers
    ((total_tests++))
    local cors_response=$(curl -s -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: GET" -X OPTIONS "$BACKEND_URL/" -I 2>/dev/null)
    if echo "$cors_response" | grep -qi "access-control-allow-origin"; then
        success "CORS headers present"
        ((tests_passed++))
    else
        error "CORS headers missing"
    fi
    
    # Test rate limiting
    ((total_tests++))
    info "Testing rate limiting (this may take a moment)..."
    local rate_limit_failed=false
    for i in {1..35}; do
        local status=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health" 2>/dev/null)
        if [ "$status" = "429" ]; then
            success "Rate limiting working (got 429 after $i requests)"
            ((tests_passed++))
            rate_limit_failed=false
            break
        fi
        rate_limit_failed=true
    done
    
    if [ "$rate_limit_failed" = true ]; then
        warning "Rate limiting may not be working (no 429 response)"
    fi
    
    info "Backend Tests: $tests_passed/$total_tests passed"
    return $((total_tests - tests_passed))
}

# Test frontend
test_frontend() {
    info "Testing Frontend Server..."
    
    local tests_passed=0
    local total_tests=0
    
    # Test main page
    ((total_tests++))
    if test_endpoint "$FRONTEND_URL/" "200" "Frontend main page"; then
        ((tests_passed++))
    fi
    
    # Test that it's serving HTML
    ((total_tests++))
    local content_type=$(curl -s -I "$FRONTEND_URL/" 2>/dev/null | grep -i "content-type" | grep -i "html")
    if [ -n "$content_type" ]; then
        success "Frontend serving HTML content"
        ((tests_passed++))
    else
        error "Frontend not serving HTML content"
    fi
    
    # Performance test
    ((total_tests++))
    if performance_test "$FRONTEND_URL/" "Frontend performance" "2.0"; then
        ((tests_passed++))
    fi
    
    info "Frontend Tests: $tests_passed/$total_tests passed"
    return $((total_tests - tests_passed))
}

# Test integration
test_integration() {
    info "Testing Integration..."
    
    local tests_passed=0
    local total_tests=0
    
    # Test that frontend can reach backend
    ((total_tests++))
    info "Testing frontend-backend communication..."
    
    # This would require a more complex test with the actual frontend
    # For now, just verify both services are running
    if test_endpoint "$BACKEND_URL/health" "200" "Backend reachable from integration test" && 
       test_endpoint "$FRONTEND_URL/" "200" "Frontend reachable from integration test"; then
        success "Both services are running for integration"
        ((tests_passed++))
    fi
    
    info "Integration Tests: $tests_passed/$total_tests passed"
    return $((total_tests - tests_passed))
}

# Generate report
generate_report() {
    local backend_result=$1
    local frontend_result=$2
    local integration_result=$3
    
    echo ""
    echo "🔍 Test Report"
    echo "=============="
    echo "Backend Tests: $([[ $backend_result -eq 0 ]] && echo "✅ PASSED" || echo "❌ FAILED ($backend_result failures)")"
    echo "Frontend Tests: $([[ $frontend_result -eq 0 ]] && echo "✅ PASSED" || echo "❌ FAILED ($frontend_result failures)")"
    echo "Integration Tests: $([[ $integration_result -eq 0 ]] && echo "✅ PASSED" || echo "❌ FAILED ($integration_result failures)")"
    echo ""
    echo "Log file: $LOG_FILE"
    echo ""
    
    local total_failures=$((backend_result + frontend_result + integration_result))
    
    if [ $total_failures -eq 0 ]; then
        success "All tests passed! 🎉"
        return 0
    else
        error "Some tests failed. Total failures: $total_failures"
        return 1
    fi
}

# Main execution
main() {
    log "Starting test suite..."
    
    # Check dependencies
    if ! check_dependencies; then
        exit 1
    fi
    
    # Wait for services to be ready
    info "Checking if services are running..."
    
    if ! wait_for_service "$BACKEND_URL/health" "Backend"; then
        error "Backend server is not running. Please start it with: npm run dev:backend"
        exit 1
    fi
    
    if ! wait_for_service "$FRONTEND_URL/" "Frontend"; then
        error "Frontend server is not running. Please start it with: npm run dev:frontend"
        exit 1
    fi
    
    # Run tests
    echo ""
    test_backend
    local backend_result=$?
    
    echo ""
    test_frontend
    local frontend_result=$?
    
    echo ""
    test_integration
    local integration_result=$?
    
    # Generate report
    generate_report $backend_result $frontend_result $integration_result
    return $?
}

# Run main function
main "$@"