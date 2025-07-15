#!/bin/bash

# Workflow Validation Script
# This script validates the GitHub Actions workflow configuration

set -e

# Global variables
readonly WORKFLOW_FILE=".github/workflows/deploy.yml"
readonly WEB_PACKAGE_JSON="web/package.json"
readonly WEB_PACKAGE_LOCK="web/package-lock.json"

# Function to check if required files exist
check_required_files() {
    echo "📁 Checking required files..."
    
    local files_to_check=(
        "$WORKFLOW_FILE:.github/workflows/deploy.yml not found"
        "$WEB_PACKAGE_JSON:web/package.json not found"
        "$WEB_PACKAGE_LOCK:web/package-lock.json not found"
    )
    
    for file_info in "${files_to_check[@]}"; do
        local file_path="${file_info%%:*}"
        local error_msg="${file_info#*:}"
        
        if [ ! -f "$file_path" ]; then
            echo "❌ ERROR: $error_msg"
            if [[ "$file_path" == "$WEB_PACKAGE_LOCK" ]]; then
                echo "💡 Run 'npm install' in the web directory to generate it"
            fi
            return 1
        fi
    done
    
    echo "✅ All required files exist"
    return 0
}

# Function to validate workflow structure
validate_workflow_structure() {
    echo "🔧 Validating workflow syntax..."
    
    local required_elements=(
        "jobs:No jobs found in workflow"
        "test:Test job not found in workflow"
        "build-and-deploy:Build and deploy job not found in workflow"
    )
    
    for element_info in "${required_elements[@]}"; do
        local pattern="${element_info%%:*}"
        local error_msg="${element_info#*:}"
        
        if ! grep -q "$pattern:" "$WORKFLOW_FILE"; then
            echo "❌ ERROR: $error_msg"
            return 1
        fi
    done
    
    echo "✅ Workflow structure is valid"
    return 0
}

# Function to validate cache configuration
validate_cache_configuration() {
    echo "🗄️ Validating cache configuration..."
    
    local cache_checks=(
        "cache: 'npm':npm cache not configured"
        "cache-dependency-path: './web/package-lock.json':Cache dependency path not pointing to package-lock.json"
    )
    
    for check_info in "${cache_checks[@]}"; do
        local pattern="${check_info%%:*}"
        local error_msg="${check_info#*:}"
        
        if ! grep -q "$pattern" "$WORKFLOW_FILE"; then
            echo "❌ ERROR: $error_msg"
            return 1
        fi
    done
    
    echo "✅ Cache configuration is valid"
    return 0
}

# Function to validate error handling
validate_error_handling() {
    echo "🛡️ Validating error handling..."
    
    local error_handling_checks=(
        "npm ci ||:No fallback mechanism for npm ci"
        "npm install as fallback:Fallback error message not found"
    )
    
    for check_info in "${error_handling_checks[@]}"; do
        local pattern="${check_info%%:*}"
        local error_msg="${check_info#*:}"
        
        if ! grep -q "$pattern" "$WORKFLOW_FILE"; then
            echo "❌ ERROR: $error_msg"
            return 1
        fi
    done
    
    echo "✅ Error handling is configured"
    return 0
}

# Function to validate workflow dispatch
validate_workflow_dispatch() {
    echo "🚀 Validating manual trigger..."
    
    if ! grep -q "workflow_dispatch:" "$WORKFLOW_FILE"; then
        echo "❌ ERROR: Manual workflow dispatch not configured"
        return 1
    fi
    
    echo "✅ Manual trigger is configured"
    return 0
}

# Function to validate package.json scripts
validate_package_scripts() {
    echo "📦 Validating package.json scripts..."
    
    local original_dir="$PWD"
    cd web || {
        echo "❌ ERROR: Cannot access web directory"
        return 1
    }
    
    local required_scripts=("build" "test" "lint")
    
    for script in "${required_scripts[@]}"; do
        if ! npm run --silent 2>/dev/null | grep -q "$script"; then
            echo "❌ ERROR: $script script not found in package.json"
            cd "$original_dir"
            return 1
        fi
    done
    
    cd "$original_dir"
    echo "✅ All required npm scripts are present"
    return 0
}

# Function to display success message
display_success_message() {
    echo ""
    echo "🎉 Workflow validation completed successfully!"
    echo "✅ GitHub Actions deployment should now work without caching errors"
    echo ""
    echo "Next steps:"
    echo "1. Commit the changes to your repository"
    echo "2. Push to trigger the workflow"
    echo "3. Monitor the Actions tab for successful deployment"
}

# Main function to orchestrate all validations
main() {
    echo "🔍 Validating GitHub Actions workflow configuration..."
    
    local validation_functions=(
        "check_required_files"
        "validate_workflow_structure"
        "validate_cache_configuration"
        "validate_error_handling"
        "validate_workflow_dispatch"
        "validate_package_scripts"
    )
    
    for func in "${validation_functions[@]}"; do
        if ! "$func"; then
            echo "❌ Validation failed at: $func"
            exit 1
        fi
    done
    
    display_success_message
}

# Execute main function
main "$@"