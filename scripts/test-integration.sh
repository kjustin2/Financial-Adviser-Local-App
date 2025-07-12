#!/bin/bash

# Integration test script for the Financial Adviser App
# Tests end-to-end functionality across backend and frontend

set -e

echo "🔗 Financial Adviser App - Integration Test Suite"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:5173"
LOG_FILE="./logs/integration-test-$(date +%Y%m%d-%H%M%S).log"
TEST_USER_EMAIL="integration-test-$(date +%s)@example.com"
TEST_USER_PASSWORD="IntegrationTest123!@#"

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

# Track test results
TESTS_PASSED=0
TOTAL_TESTS=0

# Test counter
test_step() {
    ((TOTAL_TESTS++))
    info "Test $TOTAL_TESTS: $1"
}

# Mark test as passed
test_passed() {
    ((TESTS_PASSED++))
    success "$1"
}

# Test API with JSON response
api_test() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    local headers=$5
    
    local curl_opts="-s -w %{http_code} -o response.json"
    
    if [ -n "$headers" ]; then
        curl_opts="$curl_opts $headers"
    fi
    
    if [ -n "$data" ]; then
        curl_opts="$curl_opts -H 'Content-Type: application/json' -d '$data'"
    fi
    
    local status=$(eval "curl -X $method $curl_opts '$BACKEND_URL$endpoint'")
    
    if [ "$status" = "$expected_status" ]; then
        return 0
    else
        echo "Expected status $expected_status, got $status"
        if [ -f response.json ]; then
            echo "Response: $(cat response.json)"
        fi
        return 1
    fi
}

# Extract value from JSON response
extract_json() {
    local field=$1
    if [ -f response.json ]; then
        jq -r "$field" response.json 2>/dev/null || echo "null"
    else
        echo "null"
    fi
}

# Check if services are running
check_services() {
    info "Checking if services are running..."
    
    # Check backend
    if ! curl -s "$BACKEND_URL/health" >/dev/null; then
        error "Backend is not running at $BACKEND_URL"
        echo "Please start backend with: npm run dev:backend"
        exit 1
    fi
    
    # Check frontend
    if ! curl -s "$FRONTEND_URL/" >/dev/null; then
        error "Frontend is not running at $FRONTEND_URL"
        echo "Please start frontend with: npm run dev:frontend"
        exit 1
    fi
    
    success "Both services are running"
}

# Test user registration flow
test_user_registration() {
    test_step "User Registration"
    
    local user_data='{
        "email": "'$TEST_USER_EMAIL'",
        "password": "'$TEST_USER_PASSWORD'",
        "first_name": "Integration",
        "last_name": "Test",
        "phone": "+1234567890",
        "investment_experience": "intermediate",
        "risk_tolerance": "moderate",
        "investment_style": "balanced",
        "financial_goals": ["retirement", "growth"],
        "net_worth_range": "200k_500k",
        "time_horizon": "long_term",
        "portfolio_complexity": "moderate"
    }'
    
    if api_test "POST" "/api/v1/auth/register" "$user_data" "201"; then
        local user_id=$(extract_json '.data.user.id')
        local access_token=$(extract_json '.data.access_token')
        
        if [ "$user_id" != "null" ] && [ "$access_token" != "null" ]; then
            test_passed "User registration successful - ID: $user_id"
            echo "$access_token" > test_token.txt
            return 0
        else
            error "Registration response missing required fields"
            return 1
        fi
    else
        error "User registration failed"
        return 1
    fi
}

# Test user login flow
test_user_login() {
    test_step "User Login"
    
    local login_data='{
        "email": "'$TEST_USER_EMAIL'",
        "password": "'$TEST_USER_PASSWORD'"
    }'
    
    if api_test "POST" "/api/v1/auth/login/json" "$login_data" "200"; then
        local access_token=$(extract_json '.data.access_token')
        
        if [ "$access_token" != "null" ]; then
            test_passed "User login successful"
            echo "$access_token" > test_token.txt
            return 0
        else
            error "Login response missing access token"
            return 1
        fi
    else
        error "User login failed"
        return 1
    fi
}

# Test authenticated user profile access
test_user_profile() {
    test_step "User Profile Access"
    
    if [ ! -f test_token.txt ]; then
        error "No access token available"
        return 1
    fi
    
    local token=$(cat test_token.txt)
    local auth_header="-H 'Authorization: Bearer $token'"
    
    if api_test "GET" "/api/v1/auth/me" "" "200" "$auth_header"; then
        local email=$(extract_json '.data.email')
        
        if [ "$email" = "$TEST_USER_EMAIL" ]; then
            test_passed "User profile access successful"
            return 0
        else
            error "Profile email mismatch: expected $TEST_USER_EMAIL, got $email"
            return 1
        fi
    else
        error "User profile access failed"
        return 1
    fi
}

# Test portfolio creation
test_portfolio_creation() {
    test_step "Portfolio Creation"
    
    if [ ! -f test_token.txt ]; then
        error "No access token available"
        return 1
    fi
    
    local token=$(cat test_token.txt)
    local auth_header="-H 'Authorization: Bearer $token'"
    
    local portfolio_data='{
        "name": "Integration Test Portfolio",
        "description": "Portfolio created during integration testing",
        "portfolio_type": "growth",
        "target_allocation": {
            "stocks": 70,
            "bonds": 20,
            "cash": 10
        },
        "risk_level": "moderate",
        "benchmark_symbol": "SPY",
        "rebalance_frequency": "quarterly",
        "rebalance_threshold": 5.0
    }'
    
    if api_test "POST" "/api/v1/portfolios" "$portfolio_data" "201" "$auth_header"; then
        local portfolio_id=$(extract_json '.data.id')
        
        if [ "$portfolio_id" != "null" ]; then
            test_passed "Portfolio creation successful - ID: $portfolio_id"
            echo "$portfolio_id" > test_portfolio_id.txt
            return 0
        else
            error "Portfolio creation response missing ID"
            return 1
        fi
    else
        error "Portfolio creation failed"
        return 1
    fi
}

# Test portfolio listing
test_portfolio_listing() {
    test_step "Portfolio Listing"
    
    if [ ! -f test_token.txt ]; then
        error "No access token available"
        return 1
    fi
    
    local token=$(cat test_token.txt)
    local auth_header="-H 'Authorization: Bearer $token'"
    
    if api_test "GET" "/api/v1/portfolios" "" "200" "$auth_header"; then
        local total_count=$(extract_json '.data.total_count')
        
        if [ "$total_count" != "null" ] && [ "$total_count" -gt 0 ]; then
            test_passed "Portfolio listing successful - Found $total_count portfolios"
            return 0
        else
            error "No portfolios found in listing"
            return 1
        fi
    else
        error "Portfolio listing failed"
        return 1
    fi
}

# Test goal creation
test_goal_creation() {
    test_step "Financial Goal Creation"
    
    if [ ! -f test_token.txt ]; then
        error "No access token available"
        return 1
    fi
    
    local token=$(cat test_token.txt)
    local auth_header="-H 'Authorization: Bearer $token'"
    
    local goal_data='{
        "name": "Integration Test Goal",
        "description": "Goal created during integration testing",
        "goal_type": "retirement",
        "target_amount": 100000.00,
        "current_amount": 10000.00,
        "target_date": "2030-12-31",
        "priority_level": "high",
        "monthly_contribution": 1000.00,
        "expected_return_rate": 7.0,
        "inflation_rate": 3.0,
        "notes": "Integration test goal"
    }'
    
    if api_test "POST" "/api/v1/goals" "$goal_data" "201" "$auth_header"; then
        local goal_id=$(extract_json '.data.id')
        
        if [ "$goal_id" != "null" ]; then
            test_passed "Goal creation successful - ID: $goal_id"
            echo "$goal_id" > test_goal_id.txt
            return 0
        else
            error "Goal creation response missing ID"
            return 1
        fi
    else
        error "Goal creation failed"
        return 1
    fi
}

# Test error handling
test_error_handling() {
    test_step "Error Handling"
    
    # Test invalid endpoint
    if api_test "GET" "/api/v1/nonexistent" "" "404"; then
        test_passed "404 error handling works"
    else
        error "404 error handling failed"
        return 1
    fi
    
    # Test invalid JSON
    if api_test "POST" "/api/v1/auth/register" "invalid json" "422"; then
        test_passed "Invalid JSON error handling works"
    else
        error "Invalid JSON error handling failed"
        return 1
    fi
    
    return 0
}

# Test validation rules endpoint
test_validation_rules() {
    test_step "Validation Rules"
    
    if api_test "GET" "/validation-rules" "" "200"; then
        local email_required=$(extract_json '.rules.email.required')
        local password_min_length=$(extract_json '.rules.password.min_length')
        
        if [ "$email_required" = "true" ] && [ "$password_min_length" = "8" ]; then
            test_passed "Validation rules endpoint working correctly"
            return 0
        else
            error "Validation rules response format incorrect"
            return 1
        fi
    else
        error "Validation rules endpoint failed"
        return 1
    fi
}

# Clean up test data
cleanup() {
    info "Cleaning up test data..."
    
    # Remove test files
    rm -f response.json test_token.txt test_portfolio_id.txt test_goal_id.txt
    
    # Note: In a real application, you might want to delete the test user
    # For this integration test, we'll leave it for inspection
    
    success "Cleanup completed"
}

# Generate integration test report
generate_report() {
    echo ""
    echo "🔗 Integration Test Report"
    echo "========================="
    echo "Tests Passed: $TESTS_PASSED/$TOTAL_TESTS"
    echo "Success Rate: $(echo "scale=1; $TESTS_PASSED * 100 / $TOTAL_TESTS" | bc -l)%"
    echo ""
    echo "Test User: $TEST_USER_EMAIL"
    echo "Log File: $LOG_FILE"
    echo ""
    
    if [ $TESTS_PASSED -eq $TOTAL_TESTS ]; then
        success "All integration tests passed! 🎉"
        echo ""
        echo "The application is working correctly end-to-end."
        return 0
    else
        local failures=$((TOTAL_TESTS - TESTS_PASSED))
        error "$failures integration tests failed"
        echo ""
        echo "Please review the failed tests and fix any issues."
        return 1
    fi
}

# Main execution
main() {
    log "Starting integration test suite..."
    
    # Setup
    check_services
    
    echo ""
    info "Running integration tests..."
    echo ""
    
    # Run test suite
    test_user_registration
    test_user_login
    test_user_profile
    test_portfolio_creation
    test_portfolio_listing
    test_goal_creation
    test_error_handling
    test_validation_rules
    
    # Cleanup and report
    cleanup
    generate_report
    
    return $?
}

# Trap cleanup on exit
trap cleanup EXIT

# Run main function
main "$@"