"""
Comprehensive tests for Goals API endpoints with focus on data type consistency
and edge case handling for Decimal fields.
"""

import pytest
from decimal import Decimal
from datetime import date, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.models.goal import FinancialGoal, GoalType
from app.models.user import User
from app.security.auth import create_access_token


client = TestClient(app)


@pytest.fixture
def test_user(db: Session) -> User:
    """Create a test user for goal testing."""
    user = User(
        first_name="Test",
        last_name="User",
        email="test@example.com",
        hashed_password="fake_hash"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user: User) -> dict:
    """Create authentication headers for API requests."""
    token = create_access_token(subject=str(test_user.id))
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def sample_goals(db: Session, test_user: User) -> list[FinancialGoal]:
    """Create sample goals with various data scenarios."""
    goals = [
        FinancialGoal(
            user_id=test_user.id,
            name="Emergency Fund",
            goal_type=GoalType.EMERGENCY_FUND,
            target_amount=Decimal("10000.00"),
            current_amount=Decimal("7500.50"),
            target_date=date.today() + timedelta(days=365),
            priority_level=1,
            monthly_contribution=Decimal("500.00"),
            expected_return_rate=Decimal("0.02"),
            inflation_rate=Decimal("0.03")
        ),
        FinancialGoal(
            user_id=test_user.id,
            name="Home Down Payment",
            goal_type=GoalType.HOME_PURCHASE,
            target_amount=Decimal("50000.00"),
            current_amount=Decimal("15000.25"),
            target_date=date.today() + timedelta(days=730),
            priority_level=2,
            monthly_contribution=Decimal("1200.00"),
            expected_return_rate=Decimal("0.05"),
            inflation_rate=Decimal("0.03")
        ),
        FinancialGoal(
            user_id=test_user.id,
            name="Vacation Fund",
            goal_type=GoalType.VACATION,
            target_amount=Decimal("5000.00"),
            current_amount=Decimal("5000.00"),  # Completed goal
            target_date=date.today() + timedelta(days=180),
            priority_level=3,
            monthly_contribution=Decimal("200.00"),
            expected_return_rate=Decimal("0.01"),
            inflation_rate=Decimal("0.03"),
            is_achieved=True,
            achievement_date=date.today()
        )
    ]
    
    for goal in goals:
        db.add(goal)
    db.commit()
    
    for goal in goals:
        db.refresh(goal)
    
    return goals


class TestGoalsListEndpoint:
    """Test the goals list endpoint with focus on data type consistency."""

    def test_get_goals_empty_list(self, db: Session, auth_headers: dict):
        """Test getting goals when user has no goals."""
        response = client.get("/api/v1/goals/", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Check structure
        assert "goals" in data
        assert "total_count" in data
        assert "total_target_amount" in data
        assert "total_current_amount" in data
        assert "average_progress" in data
        
        # Check values for empty list
        assert data["goals"] == []
        assert data["total_count"] == 0
        assert data["total_target_amount"] == "0.00"  # Decimal as string
        assert data["total_current_amount"] == "0.00"  # Decimal as string
        assert data["average_progress"] == "0.00"  # Decimal as string

    def test_get_goals_with_data(self, db: Session, auth_headers: dict, sample_goals: list[FinancialGoal]):
        """Test getting goals with actual data."""
        response = client.get("/api/v1/goals/", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Check basic structure
        assert len(data["goals"]) == 3
        assert data["total_count"] == 3
        
        # Check that Decimal fields are returned as strings
        assert isinstance(data["total_target_amount"], str)
        assert isinstance(data["total_current_amount"], str)
        assert isinstance(data["average_progress"], str)
        
        # Verify calculations are correct
        expected_total_target = Decimal("65000.00")  # 10000 + 50000 + 5000
        expected_total_current = Decimal("27500.75")  # 7500.50 + 15000.25 + 5000.00
        
        assert Decimal(data["total_target_amount"]) == expected_total_target
        assert Decimal(data["total_current_amount"]) == expected_total_current
        
        # Check average progress calculation
        # Goal 1: 7500.50 / 10000.00 = 75.005%
        # Goal 2: 15000.25 / 50000.00 = 30.0005%
        # Goal 3: 5000.00 / 5000.00 = 100%
        # Average: (75.005 + 30.0005 + 100) / 3 = 68.335%
        expected_avg = (Decimal("75.005") + Decimal("30.0005") + Decimal("100")) / 3
        actual_avg = Decimal(data["average_progress"])
        assert abs(actual_avg - expected_avg) < Decimal("0.01")  # Allow small floating point variance

    def test_get_goals_data_types(self, db: Session, auth_headers: dict, sample_goals: list[FinancialGoal]):
        """Test that all returned data types are consistent."""
        response = client.get("/api/v1/goals/", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Check top-level data types
        assert isinstance(data["goals"], list)
        assert isinstance(data["total_count"], int)
        assert isinstance(data["total_target_amount"], str)
        assert isinstance(data["total_current_amount"], str)
        assert isinstance(data["average_progress"], str)
        
        # Check individual goal data types
        for goal in data["goals"]:
            assert isinstance(goal["id"], int)
            assert isinstance(goal["name"], str)
            assert isinstance(goal["goal_type"], str)
            assert isinstance(goal["target_amount"], str)  # Decimal as string
            assert isinstance(goal["progress_percent"], str)  # Decimal as string
            assert isinstance(goal["priority_level"], int)
            assert isinstance(goal["is_achieved"], bool)
            
            # Validate Decimal string format
            assert Decimal(goal["target_amount"]) >= 0
            assert Decimal(goal["progress_percent"]) >= 0

    def test_get_goals_edge_cases(self, db: Session, auth_headers: dict, test_user: User):
        """Test edge cases with extreme values."""
        # Create goal with very large target amount
        large_goal = FinancialGoal(
            user_id=test_user.id,
            name="Extreme Goal",
            goal_type=GoalType.OTHER,
            target_amount=Decimal("999999999.99"),
            current_amount=Decimal("1.00"),
            priority_level=1,
        )
        db.add(large_goal)
        
        # Create goal with zero current amount
        zero_goal = FinancialGoal(
            user_id=test_user.id,
            name="Zero Progress Goal",
            goal_type=GoalType.RETIREMENT,
            target_amount=Decimal("100000.00"),
            current_amount=Decimal("0.00"),
            priority_level=2,
        )
        db.add(zero_goal)
        
        db.commit()
        
        response = client.get("/api/v1/goals/", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["goals"]) == 2
        
        # Check that extreme values are handled correctly
        assert Decimal(data["total_target_amount"]) == Decimal("1000099999.99")
        assert Decimal(data["total_current_amount"]) == Decimal("1.00")
        
        # Average progress should be very small but valid
        avg_progress = Decimal(data["average_progress"])
        assert avg_progress >= 0
        assert avg_progress < 1  # Less than 1%

    def test_get_goals_filter_achieved(self, db: Session, auth_headers: dict, sample_goals: list[FinancialGoal]):
        """Test filtering goals by achievement status."""
        # Test getting only achieved goals
        response = client.get("/api/v1/goals/?achieved=true", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["goals"]) == 1
        assert data["goals"][0]["name"] == "Vacation Fund"
        assert data["goals"][0]["is_achieved"] is True
        
        # Test getting only unachieved goals
        response = client.get("/api/v1/goals/?achieved=false", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["goals"]) == 2
        for goal in data["goals"]:
            assert goal["is_achieved"] is False

    def test_get_goals_pagination(self, db: Session, auth_headers: dict, sample_goals: list[FinancialGoal]):
        """Test pagination parameters."""
        # Test limit
        response = client.get("/api/v1/goals/?limit=2", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["goals"]) == 2
        
        # Test skip
        response = client.get("/api/v1/goals/?skip=1&limit=2", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["goals"]) == 2

    def test_unauthorized_access(self, db: Session):
        """Test that unauthorized requests are rejected."""
        response = client.get("/api/v1/goals/")
        assert response.status_code == 401

    def test_invalid_auth_token(self, db: Session):
        """Test that invalid auth tokens are rejected."""
        headers = {"Authorization": "Bearer invalid_token"}
        response = client.get("/api/v1/goals/", headers=headers)
        assert response.status_code == 401


class TestGoalCreateEndpoint:
    """Test goal creation with proper data type handling."""

    def test_create_goal_success(self, db: Session, auth_headers: dict):
        """Test successful goal creation."""
        goal_data = {
            "name": "New Car Fund",
            "goal_type": "vehicle",
            "target_amount": "25000.00",
            "current_amount": "5000.00",
            "target_date": str(date.today() + timedelta(days=365)),
            "priority_level": 2,
            "monthly_contribution": "400.00",
            "expected_return_rate": "0.04",
            "inflation_rate": "0.03",
            "notes": "Saving for a reliable car"
        }
        
        response = client.post("/api/v1/goals/", json=goal_data, headers=auth_headers)
        
        assert response.status_code == 201
        data = response.json()
        
        # Check that all Decimal fields are returned as strings
        assert isinstance(data["target_amount"], str)
        assert isinstance(data["current_amount"], str)
        assert isinstance(data["monthly_contribution"], str)
        assert isinstance(data["expected_return_rate"], str)
        assert isinstance(data["inflation_rate"], str)
        assert isinstance(data["progress_percent"], str)
        
        # Verify values
        assert data["name"] == goal_data["name"]
        assert data["goal_type"] == goal_data["goal_type"]
        assert Decimal(data["target_amount"]) == Decimal(goal_data["target_amount"])
        assert Decimal(data["current_amount"]) == Decimal(goal_data["current_amount"])

    def test_create_goal_minimal_data(self, db: Session, auth_headers: dict):
        """Test creating goal with minimal required data."""
        goal_data = {
            "name": "Minimal Goal",
            "goal_type": "other",
            "target_amount": "1000.00"
        }
        
        response = client.post("/api/v1/goals/", json=goal_data, headers=auth_headers)
        
        assert response.status_code == 201
        data = response.json()
        
        assert data["name"] == "Minimal Goal"
        assert Decimal(data["current_amount"]) == Decimal("0.00")  # Default value

    def test_create_goal_validation_errors(self, db: Session, auth_headers: dict):
        """Test validation error handling."""
        # Test negative target amount
        goal_data = {
            "name": "Invalid Goal",
            "goal_type": "other",
            "target_amount": "-1000.00"
        }
        
        response = client.post("/api/v1/goals/", json=goal_data, headers=auth_headers)
        assert response.status_code == 422


class TestGoalRetrieveEndpoint:
    """Test individual goal retrieval."""

    def test_get_goal_by_id(self, db: Session, auth_headers: dict, sample_goals: list[FinancialGoal]):
        """Test retrieving a specific goal by ID."""
        goal_id = sample_goals[0].id
        
        response = client.get(f"/api/v1/goals/{goal_id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == goal_id
        assert data["name"] == "Emergency Fund"
        
        # Check all Decimal fields are strings
        decimal_fields = [
            "target_amount", "current_amount", "monthly_contribution",
            "expected_return_rate", "inflation_rate", "total_contributions",
            "total_current_amount", "progress_percent", "remaining_amount"
        ]
        
        for field in decimal_fields:
            if data.get(field) is not None:
                assert isinstance(data[field], str)
                # Verify it's a valid decimal
                Decimal(data[field])

    def test_get_nonexistent_goal(self, db: Session, auth_headers: dict):
        """Test getting a goal that doesn't exist."""
        response = client.get("/api/v1/goals/99999", headers=auth_headers)
        assert response.status_code == 404

    def test_get_other_users_goal(self, db: Session, test_user: User, sample_goals: list[FinancialGoal]):
        """Test that users can't access other users' goals."""
        # Create another user
        other_user = User(
            first_name="Other",
            last_name="User", 
            email="other@example.com",
            hashed_password="fake_hash"
        )
        db.add(other_user)
        db.commit()
        
        # Create auth token for other user
        token = create_access_token(subject=str(other_user.id))
        other_headers = {"Authorization": f"Bearer {token}"}
        
        goal_id = sample_goals[0].id
        response = client.get(f"/api/v1/goals/{goal_id}", headers=other_headers)
        assert response.status_code == 404


class TestDataConsistency:
    """Test data consistency across different endpoints."""

    def test_list_vs_individual_consistency(self, db: Session, auth_headers: dict, sample_goals: list[FinancialGoal]):
        """Test that list and individual endpoints return consistent data."""
        # Get goals list
        list_response = client.get("/api/v1/goals/", headers=auth_headers)
        assert list_response.status_code == 200
        list_data = list_response.json()
        
        # Get each goal individually and compare
        for goal_summary in list_data["goals"]:
            goal_id = goal_summary["id"]
            individual_response = client.get(f"/api/v1/goals/{goal_id}", headers=auth_headers)
            assert individual_response.status_code == 200
            individual_data = individual_response.json()
            
            # Check that common fields match
            assert goal_summary["id"] == individual_data["id"]
            assert goal_summary["name"] == individual_data["name"]
            assert goal_summary["goal_type"] == individual_data["goal_type"]
            assert goal_summary["target_amount"] == individual_data["target_amount"]
            assert goal_summary["progress_percent"] == individual_data["progress_percent"]

    def test_decimal_precision_consistency(self, db: Session, auth_headers: dict):
        """Test that Decimal precision is maintained across operations."""
        # Create goal with specific precision
        goal_data = {
            "name": "Precision Test",
            "goal_type": "other",
            "target_amount": "1234.56",
            "current_amount": "123.45"
        }
        
        create_response = client.post("/api/v1/goals/", json=goal_data, headers=auth_headers)
        assert create_response.status_code == 201
        created_goal = create_response.json()
        
        # Verify precision is maintained
        assert created_goal["target_amount"] == "1234.56"
        assert created_goal["current_amount"] == "123.45"
        
        # Check in goals list
        list_response = client.get("/api/v1/goals/", headers=auth_headers)
        list_data = list_response.json()
        
        matching_goal = next(g for g in list_data["goals"] if g["id"] == created_goal["id"])
        assert matching_goal["target_amount"] == "1234.56"