#!/usr/bin/env python3
"""
Debug script to test API response data types and investigate type mismatches
between backend Decimal fields and frontend expectations.

This script can be run to reproduce and debug the toFixed() error issue.
"""

import json
import requests
from decimal import Decimal
from typing import Any, Dict
import sys
import os

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.models.goal import FinancialGoal, GoalType
from app.models.user import User
from app.database import get_db, engine
from app.utils.auth import create_access_token
from sqlalchemy.orm import sessionmaker
from datetime import date, timedelta

# Configuration
API_BASE_URL = "http://localhost:8000"
TEST_USER_EMAIL = "debug_test@example.com"


def create_test_session():
    """Create a database session for testing."""
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return SessionLocal()


def create_or_get_test_user(db) -> User:
    """Create or get the test user for debugging."""
    user = db.query(User).filter(User.email == TEST_USER_EMAIL).first()
    
    if not user:
        user = User(
            first_name="Debug",
            last_name="User",
            email=TEST_USER_EMAIL,
            hashed_password="fake_hash_for_debug"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"✅ Created test user: {user.email}")
    else:
        print(f"✅ Using existing test user: {user.email}")
    
    return user


def create_test_goals(db, user: User):
    """Create test goals with various data scenarios."""
    # Clear existing test goals
    db.query(FinancialGoal).filter(FinancialGoal.user_id == user.id).delete()
    db.commit()
    
    test_goals = [
        {
            "name": "Emergency Fund",
            "goal_type": GoalType.EMERGENCY_FUND,
            "target_amount": Decimal("10000.00"),
            "current_amount": Decimal("7500.50"),
            "target_date": date.today() + timedelta(days=365),
            "priority_level": 1,
            "monthly_contribution": Decimal("500.00"),
            "expected_return_rate": Decimal("0.02"),
            "inflation_rate": Decimal("0.03")
        },
        {
            "name": "Home Down Payment",
            "goal_type": GoalType.HOME_PURCHASE,
            "target_amount": Decimal("50000.00"),
            "current_amount": Decimal("15000.25"),
            "target_date": date.today() + timedelta(days=730),
            "priority_level": 2,
            "monthly_contribution": Decimal("1200.00"),
            "expected_return_rate": Decimal("0.05"),
            "inflation_rate": Decimal("0.03")
        },
        {
            "name": "Edge Case Goal",
            "goal_type": GoalType.OTHER,
            "target_amount": Decimal("0.01"),  # Very small amount
            "current_amount": Decimal("0.00"),
            "priority_level": 3,
            "monthly_contribution": Decimal("999999.99"),  # Very large contribution
            "expected_return_rate": Decimal("0.0001"),  # Very small rate
            "inflation_rate": Decimal("0.9999")  # Very large rate
        }
    ]
    
    goals = []
    for goal_data in test_goals:
        goal = FinancialGoal(
            user_id=user.id,
            **goal_data
        )
        db.add(goal)
        goals.append(goal)
    
    db.commit()
    
    for goal in goals:
        db.refresh(goal)
    
    print(f"✅ Created {len(goals)} test goals")
    return goals


def get_auth_token(user: User) -> str:
    """Create authentication token for API requests."""
    return create_access_token(subject=str(user.id))


def test_api_response_types():
    """Test API responses and analyze data types."""
    print("\n🔍 Testing API Response Data Types")
    print("=" * 50)
    
    db = create_test_session()
    
    try:
        # Setup test data
        user = create_or_get_test_user(db)
        goals = create_test_goals(db, user)
        token = get_auth_token(user)
        
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test goals list endpoint
        print("\n📋 Testing Goals List Endpoint")
        response = requests.get(f"{API_BASE_URL}/api/v1/goals/", headers=headers)
        
        if response.status_code != 200:
            print(f"❌ API request failed: {response.status_code}")
            print(f"Response: {response.text}")
            return
        
        data = response.json()
        
        print(f"✅ API Response Status: {response.status_code}")
        print(f"📊 Goals Count: {len(data.get('goals', []))}")
        
        # Analyze data types
        print("\n🔍 Data Type Analysis:")
        type_analysis = analyze_data_types(data)
        print_type_analysis(type_analysis)
        
        # Test specific edge cases
        print("\n⚠️  Edge Case Testing:")
        test_edge_cases(data)
        
        # Test frontend simulation
        print("\n🖥️  Frontend Simulation:")
        simulate_frontend_usage(data)
        
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        db.close()


def analyze_data_types(data: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze the data types of all fields in the response."""
    analysis = {
        "top_level": {},
        "goals": [],
        "issues": []
    }
    
    # Analyze top-level fields
    for key, value in data.items():
        if key != "goals":
            analysis["top_level"][key] = {
                "type": type(value).__name__,
                "value": str(value),
                "is_decimal_string": is_decimal_string(value)
            }
    
    # Analyze individual goals
    for i, goal in enumerate(data.get("goals", [])):
        goal_analysis = {}
        for key, value in goal.items():
            goal_analysis[key] = {
                "type": type(value).__name__,
                "value": str(value),
                "is_decimal_string": is_decimal_string(value)
            }
        analysis["goals"].append(goal_analysis)
    
    return analysis


def is_decimal_string(value: Any) -> bool:
    """Check if a value is a string that represents a decimal number."""
    if not isinstance(value, str):
        return False
    
    try:
        Decimal(value)
        return True
    except:
        return False


def print_type_analysis(analysis: Dict[str, Any]):
    """Print the type analysis in a readable format."""
    print("\n📊 Top-Level Fields:")
    for field, info in analysis["top_level"].items():
        status = "✅" if info["is_decimal_string"] or info["type"] in ["int", "list"] else "❓"
        print(f"  {status} {field}: {info['type']} = {info['value']}")
        if info["is_decimal_string"]:
            print(f"    🔢 Decimal string detected")
    
    print(f"\n📊 Goal Fields (analyzing first goal):")
    if analysis["goals"]:
        first_goal = analysis["goals"][0]
        for field, info in first_goal.items():
            status = "✅" if info["is_decimal_string"] or info["type"] in ["int", "str", "bool"] else "❓"
            print(f"  {status} {field}: {info['type']} = {info['value']}")
            if info["is_decimal_string"]:
                print(f"    🔢 Decimal string detected")


def test_edge_cases(data: Dict[str, Any]):
    """Test edge cases that might cause frontend errors."""
    print("Testing edge case scenarios...")
    
    # Test average_progress field specifically
    avg_progress = data.get("average_progress")
    print(f"\n🎯 Testing average_progress field:")
    print(f"  Type: {type(avg_progress).__name__}")
    print(f"  Value: {avg_progress}")
    
    # Simulate the original error scenario
    try:
        if avg_progress is not None:
            # Try the operation that was failing
            if hasattr(avg_progress, 'toFixed'):
                result = avg_progress.toFixed(1)
                print(f"  ✅ toFixed(1) worked: {result}")
            else:
                # Try JavaScript-style conversion
                if isinstance(avg_progress, str):
                    num_value = float(avg_progress)
                    result = f"{num_value:.1f}"
                    print(f"  ✅ String->float->format worked: {result}")
                elif isinstance(avg_progress, (int, float)):
                    result = f"{avg_progress:.1f}"
                    print(f"  ✅ Number format worked: {result}")
                else:
                    print(f"  ❌ Unexpected type: {type(avg_progress)}")
    
    except Exception as e:
        print(f"  ❌ Error with average_progress: {e}")
    
    # Test other critical fields
    critical_fields = ["total_target_amount", "total_current_amount"]
    for field in critical_fields:
        value = data.get(field)
        print(f"\n🎯 Testing {field}:")
        print(f"  Type: {type(value).__name__}")
        print(f"  Value: {value}")
        
        try:
            if isinstance(value, str):
                num_value = float(value)
                print(f"  ✅ String->float conversion: {num_value}")
            elif isinstance(value, (int, float)):
                print(f"  ✅ Already numeric: {value}")
            else:
                print(f"  ❓ Unexpected type for numeric field")
        except Exception as e:
            print(f"  ❌ Conversion error: {e}")


def simulate_frontend_usage(data: Dict[str, Any]):
    """Simulate how the frontend would use this data."""
    print("Simulating frontend data usage...")
    
    # Simulate the Dashboard component logic
    try:
        goals_data = data
        
        # Original problematic code simulation
        print(f"\n🖥️  Simulating Dashboard.tsx logic:")
        
        # Test the safeToFixed function equivalent
        def safe_to_fixed(value, decimals=1):
            try:
                if value is None or value == "":
                    return "0.0"
                
                if isinstance(value, str):
                    num_value = float(value)
                elif isinstance(value, (int, float)):
                    num_value = float(value)
                else:
                    print(f"    ❌ Unexpected type: {type(value)} = {value}")
                    return "0.0"
                
                return f"{num_value:.{decimals}f}"
            
            except Exception as e:
                print(f"    ❌ Conversion error: {e}")
                return "0.0"
        
        # Test critical fields
        avg_progress = goals_data.get("average_progress")
        total_count = goals_data.get("total_count", 0)
        
        formatted_progress = safe_to_fixed(avg_progress, 1)
        print(f"  ✅ Average progress: {formatted_progress}%")
        print(f"  ✅ Total goals: {total_count} active goals")
        
        # Test individual goal formatting
        if goals_data.get("goals"):
            first_goal = goals_data["goals"][0]
            target_amount = safe_to_fixed(first_goal.get("target_amount"), 2)
            progress_percent = safe_to_fixed(first_goal.get("progress_percent"), 1)
            
            print(f"  ✅ First goal target: ${target_amount}")
            print(f"  ✅ First goal progress: {progress_percent}%")
        
        print(f"\n🎉 Frontend simulation completed successfully!")
        
    except Exception as e:
        print(f"❌ Frontend simulation failed: {e}")
        import traceback
        traceback.print_exc()


def test_server_running():
    """Test if the development server is running."""
    try:
        response = requests.get(f"{API_BASE_URL}/docs", timeout=5)
        if response.status_code == 200:
            print("✅ Backend server is running")
            return True
        else:
            print(f"❌ Backend server responded with status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Backend server is not accessible: {e}")
        print(f"💡 Make sure to start the backend server first:")
        print(f"   cd backend && poetry run uvicorn app.main:app --reload --port 8000")
        return False


def main():
    """Main debug function."""
    print("🚀 API Data Types Debug Script")
    print("=" * 50)
    print("This script investigates data type issues between backend and frontend")
    print("especially the 'toFixed is not a function' error.\n")
    
    # Check if server is running
    if not test_server_running():
        return 1
    
    # Run the tests
    test_api_response_types()
    
    print("\n" + "=" * 50)
    print("🎯 Debug Summary:")
    print("- Check the type analysis above")
    print("- Ensure Decimal fields are consistently handled")
    print("- Frontend should use safe conversion functions")
    print("- Backend should return Decimal fields as strings")
    
    return 0


if __name__ == "__main__":
    exit(main())