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

# Check cache configuration
echo "🗄️ Validating cache configuration..."

if ! grep -q "cache: 'npm'" .github/workflows/deploy.yml; then
    echo "❌ ERROR: npm cache not configured"
    exit 1
fi

if ! grep -q "cache-dependency-path: './web/package-lock.json'" .github/workflows/deploy.yml; then
    echo "❌ ERROR: Cache dependency path not pointing to package-lock.json"
    exit 1
fi

echo "✅ Cache configuration is valid"

# Check error handling
echo "🛡️ Validating error handling..."

if ! grep -q "npm ci ||" .github/workflows/deploy.yml; then
    echo "❌ ERROR: No fallback mechanism for npm ci"
    exit 1
fi

if ! grep -q "npm install as fallback" .github/workflows/deploy.yml; then
    echo "❌ ERROR: Fallback error message not found"
    exit 1
fi

echo "✅ Error handling is configured"

# Check workflow dispatch
echo "🚀 Validating manual trigger..."

if ! grep -q "workflow_dispatch:" .github/workflows/deploy.yml; then
    echo "❌ ERROR: Manual workflow dispatch not configured"
    exit 1
fi

echo "✅ Manual trigger is configured"

# Validate package.json scripts
echo "📦 Validating package.json scripts..."

cd web

if ! npm run --silent 2>/dev/null | grep -q "build"; then
    echo "❌ ERROR: build script not found in package.json"
    exit 1
fi

if ! npm run --silent 2>/dev/null | grep -q "test"; then
    echo "❌ ERROR: test script not found in package.json"
    exit 1
fi

if ! npm run --silent 2>/dev/null | grep -q "lint"; then
    echo "❌ ERROR: lint script not found in package.json"
    exit 1
fi

cd ..

echo "✅ All required npm scripts are present"

echo ""
echo "🎉 Workflow validation completed successfully!"
echo "✅ GitHub Actions deployment should now work without caching errors"
echo ""
echo "Next steps:"
echo "1. Commit the changes to your repository"
echo "2. Push to trigger the workflow"
echo "3. Monitor the Actions tab for successful deployment"