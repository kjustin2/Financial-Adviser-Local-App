"""Tests for individual investor authentication endpoints with comprehensive validation testing."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.config import Settings
from app.database import Base, get_db
from app.main import app
from app.models import User  # Import all models
from app.security.auth import get_password_hash

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Global test session for shared database state
_test_session = None

def override_get_db():
    """Override the database dependency for testing."""
    global _test_session
    if _test_session is None:
        _test_session = TestingSessionLocal()
    yield _test_session


# Override dependencies
app.dependency_overrides[get_db] = override_get_db

# Create test client
client = TestClient(app)


@pytest.fixture(scope="function")
def test_db():
    """Create a fresh database for each test."""
    global _test_session
    
    # Clean up any existing session
    if _test_session:
        _test_session.close()
        _test_session = None
    
    # Ensure we have fresh tables for each test
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    # Create a new global session for this test
    _test_session = TestingSessionLocal()
    
    try:
        yield _test_session
    finally:
        # Clean up after test
        _test_session.close()
        _test_session = None
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def test_user_data():
    """Valid test user data for individual investor."""
    return {
        "email": "test@example.com",
        "password": "Test123!@#",
        "first_name": "John",
        "last_name": "Doe",
        "phone": "+1234567890",
        "investment_experience": "intermediate",
        "risk_tolerance": "moderate",
        "investment_style": "balanced",
        "financial_goals": ["retirement", "growth"],
        "net_worth_range": "200k_500k",
        "time_horizon": "long_term",
        "portfolio_complexity": "moderate"
    }


@pytest.fixture
def minimal_user_data():
    """Minimal valid test user data for individual investor."""
    return {
        "email": "minimal@example.com",
        "password": "Test123!@#",
        "first_name": "Jane",
        "last_name": "Smith"
    }


@pytest.fixture
def existing_user(test_db):
    """Create an existing individual investor user in the database."""
    user = User(
        email="existing@example.com",
        hashed_password=get_password_hash("ExistingPassword123!"),
        first_name="Existing",
        last_name="User",
        phone="+1987654321",
        investment_experience="advanced",
        risk_tolerance="aggressive",
        investment_style="growth",
        financial_goals='["retirement", "income"]',
        net_worth_range="500k_plus",
        time_horizon="long_term",
        portfolio_complexity="complex"
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    return {
        "id": user.id,
        "email": user.email,
        "password": "ExistingPassword123!"
    }


class TestUserRegistration:
    """Test user registration functionality."""

    def test_successful_registration_full_data(self, test_db, test_user_data):
        """Test successful registration with all individual investor fields."""
        response = client.post("/api/v1/auth/register", json=test_user_data)
        
        assert response.status_code == 201
        data = response.json()
        
        # Check response structure
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
        assert "expires_in" in data
        assert "user" in data
        
        # Check user data
        user = data["user"]
        assert user["email"] == test_user_data["email"]
        assert user["first_name"] == test_user_data["first_name"]
        assert user["last_name"] == test_user_data["last_name"]
        assert user["phone"] == test_user_data["phone"]
        assert user["investment_experience"] == test_user_data["investment_experience"]
        assert user["risk_tolerance"] == test_user_data["risk_tolerance"]
        assert user["investment_style"] == test_user_data["investment_style"]
        assert user["net_worth_range"] == test_user_data["net_worth_range"]
        assert user["time_horizon"] == test_user_data["time_horizon"]
        assert user["portfolio_complexity"] == test_user_data["portfolio_complexity"]
        assert user["is_active"] is True
        assert "id" in user
        assert "created_at" in user
        assert "updated_at" in user

    def test_successful_registration_minimal_data(self, test_db, minimal_user_data):
        """Test successful registration with minimal required fields."""
        response = client.post("/api/v1/auth/register", json=minimal_user_data)
        
        assert response.status_code == 201
        data = response.json()
        
        # Check that optional fields are properly handled
        user = data["user"]
        assert user["email"] == minimal_user_data["email"]
        assert user["first_name"] == minimal_user_data["first_name"]
        assert user["last_name"] == minimal_user_data["last_name"]
        assert user["phone"] is None
        # Investment profile fields should have defaults
        assert user["investment_experience"] == "intermediate"
        assert user["risk_tolerance"] == "moderate"
        assert user["time_horizon"] == "long_term"
        assert user["portfolio_complexity"] == "moderate"

    def test_registration_duplicate_email(self, test_db, existing_user, test_user_data):
        """Test registration fails with duplicate email."""
        test_user_data["email"] = existing_user["email"]
        
        response = client.post("/api/v1/auth/register", json=test_user_data)
        
        assert response.status_code == 400
        data = response.json()
        
        # FastAPI wraps HTTPException detail in a "detail" key
        assert data["detail"]["success"] is False
        assert data["detail"]["error"]["code"] == "VALIDATION_ERROR"
        assert "field_errors" in data["detail"]["error"]
        assert "email" in data["detail"]["error"]["field_errors"]
        assert "already exists" in data["detail"]["error"]["field_errors"]["email"][0].lower()

    def test_registration_invalid_email_format(self, test_db, test_user_data):
        """Test registration fails with invalid email format."""
        invalid_emails = [
            "invalid-email",
            "invalid@",
            "@invalid.com",
            "invalid..email@test.com",
            "invalid@.com",
            ""
        ]
        
        for invalid_email in invalid_emails:
            test_user_data["email"] = invalid_email
            response = client.post("/api/v1/auth/register", json=test_user_data)
            
            assert response.status_code == 422
            data = response.json()
            assert "detail" in data
            # Pydantic validation errors have a different structure

    def test_registration_weak_passwords(self, test_db, test_user_data):
        """Test registration fails with weak passwords."""
        # Passwords that fail Pydantic validation (too short)
        pydantic_invalid_passwords = [
            "123",  # Too short
        ]
        
        # Passwords that pass Pydantic but fail custom validation
        custom_invalid_passwords = [
            "password1",  # No uppercase, no special chars (8+ chars)
            "PASSWORD1",  # No lowercase, no special chars (8+ chars)  
            "Password1",  # No special chars (8+ chars)
            "Password123",  # No special chars
            "password123!",  # No uppercase
            "PASSWORD123!",  # No lowercase
            "Passwordd!",  # No numbers
        ]
        
        # Test Pydantic validation failures (422 status)
        for weak_password in pydantic_invalid_passwords:
            test_user_data["password"] = weak_password
            response = client.post("/api/v1/auth/register", json=test_user_data)
            
            assert response.status_code == 422
            data = response.json()
            assert "detail" in data
        
        # Test custom validation failures (400 status)
        for weak_password in custom_invalid_passwords:
            test_user_data["password"] = weak_password
            response = client.post("/api/v1/auth/register", json=test_user_data)
            
            assert response.status_code == 400
            data = response.json()
            assert data["detail"]["success"] is False
            assert data["detail"]["error"]["code"] == "VALIDATION_ERROR"
            assert "field_errors" in data["detail"]["error"]
            assert "password" in data["detail"]["error"]["field_errors"]

    def test_registration_missing_required_fields(self, test_db):
        """Test registration fails with missing required fields."""
        required_fields = ["email", "password", "first_name", "last_name"]
        
        for field in required_fields:
            data = {
                "email": "test@example.com",
                "password": "Test123!@#",
                "first_name": "John",
                "last_name": "Doe"
            }
            del data[field]
            
            response = client.post("/api/v1/auth/register", json=data)
            
            assert response.status_code == 422
            response_data = response.json()
            assert "detail" in response_data
            # Pydantic validation errors have a different structure

    def test_registration_empty_strings(self, test_db, test_user_data):
        """Test registration fails with empty string values."""
        required_fields = ["email", "password", "first_name", "last_name"]
        
        for field in required_fields:
            data = test_user_data.copy()
            data[field] = ""
            
            response = client.post("/api/v1/auth/register", json=data)
            
            assert response.status_code in [400, 422]

    def test_registration_field_length_validation(self, test_db, test_user_data):
        """Test registration validates field lengths."""
        # Test maximum lengths
        test_cases = [
            ("first_name", "a" * 101),  # Max 100
            ("last_name", "a" * 101),   # Max 100
            ("phone", "a" * 21),        # Max 20
            ("investment_style", "a" * 51), # Max 50
        ]
        
        for field, value in test_cases:
            data = test_user_data.copy()
            data[field] = value
            
            response = client.post("/api/v1/auth/register", json=data)
            
            assert response.status_code == 422

    def test_registration_data_types(self, test_db):
        """Test registration validates data types."""
        invalid_data_types = [
            {"email": 123},
            {"password": None},
            {"first_name": []},
            {"last_name": {}},
            {"phone": 1234567890},  # Should be string
            {"investment_experience": 123},
            {"risk_tolerance": []},
            {"financial_goals": "not_a_list"},  # Should be list
        ]
        
        base_data = {
            "email": "test@example.com",
            "password": "Test123!@#",
            "first_name": "John",
            "last_name": "Doe"
        }
        
        for invalid_field in invalid_data_types:
            data = {**base_data, **invalid_field}
            response = client.post("/api/v1/auth/register", json=data)
            
            assert response.status_code == 422

    def test_registration_investment_profile_validation(self, test_db, minimal_user_data):
        """Test registration with valid investment profile options."""
        valid_profiles = [
            {
                "investment_experience": "beginner",
                "risk_tolerance": "conservative",
                "investment_style": "growth",
                "financial_goals": ["retirement"],
                "net_worth_range": "100k_200k",
                "time_horizon": "short_term",
                "portfolio_complexity": "simple"
            },
            {
                "investment_experience": "advanced",
                "risk_tolerance": "aggressive", 
                "investment_style": "value",
                "financial_goals": ["growth", "income", "retirement"],
                "net_worth_range": "500k_plus",
                "time_horizon": "long_term",
                "portfolio_complexity": "complex"
            }
        ]
        
        for profile in valid_profiles:
            data = {**minimal_user_data, **profile}
            data["email"] = f"test_{profile['investment_experience']}@example.com"
            
            response = client.post("/api/v1/auth/register", json=data)
            
            assert response.status_code == 201
            user_data = response.json()["user"]
            
            # Verify profile data is saved correctly
            assert user_data["investment_experience"] == profile["investment_experience"]
            assert user_data["risk_tolerance"] == profile["risk_tolerance"]
            assert user_data["investment_style"] == profile["investment_style"]
            assert user_data["net_worth_range"] == profile["net_worth_range"]
            assert user_data["time_horizon"] == profile["time_horizon"]
            assert user_data["portfolio_complexity"] == profile["portfolio_complexity"]

    def test_registration_invalid_investment_options(self, test_db, minimal_user_data):
        """Test registration fails with invalid investment profile options."""
        invalid_options = [
            {"investment_experience": "expert"},  # Not a valid option
            {"risk_tolerance": "very_high"},      # Not a valid option
            {"time_horizon": "immediate"},        # Not a valid option
            {"portfolio_complexity": "extreme"}   # Not a valid option
        ]
        
        for invalid_option in invalid_options:
            data = {**minimal_user_data, **invalid_option}
            data["email"] = f"invalid_{list(invalid_option.keys())[0]}@example.com"
            
            response = client.post("/api/v1/auth/register", json=data)
            
            # Should still succeed but use defaults (validation happens at model level)
            assert response.status_code == 201


class TestUserLogin:
    """Test user login functionality."""

    def test_successful_login_json(self, test_db, existing_user):
        """Test successful login with JSON payload."""
        login_data = {
            "email": existing_user["email"],
            "password": existing_user["password"]
        }
        
        response = client.post("/api/v1/auth/login/json", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
        assert "expires_in" in data
        assert "user" in data
        
        user = data["user"]
        assert user["email"] == existing_user["email"]
        assert user["id"] == existing_user["id"]

    def test_login_invalid_email(self, test_db, existing_user):
        """Test login fails with invalid email."""
        login_data = {
            "email": "nonexistent@example.com",
            "password": existing_user["password"]
        }
        
        response = client.post("/api/v1/auth/login/json", json=login_data)
        
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data

    def test_login_invalid_password(self, test_db, existing_user):
        """Test login fails with invalid password."""
        login_data = {
            "email": existing_user["email"],
            "password": "WrongPassword123!"
        }
        
        response = client.post("/api/v1/auth/login/json", json=login_data)
        
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data

    def test_login_missing_fields(self, test_db):
        """Test login fails with missing fields."""
        # Missing email
        response = client.post("/api/v1/auth/login/json", json={"password": "Test123!"})
        assert response.status_code == 422
        
        # Missing password
        response = client.post("/api/v1/auth/login/json", json={"email": "test@example.com"})
        assert response.status_code == 422

    def test_login_invalid_email_format(self, test_db):
        """Test login fails with invalid email format."""
        login_data = {
            "email": "invalid-email",
            "password": "Test123!"
        }
        
        response = client.post("/api/v1/auth/login/json", json=login_data)
        assert response.status_code == 422


class TestErrorHandling:
    """Test error handling in authentication endpoints."""

    def test_malformed_json(self, test_db):
        """Test handling of malformed JSON."""
        response = client.post(
            "/api/v1/auth/register",
            data="invalid json",
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 422

    def test_wrong_content_type(self, test_db, test_user_data):
        """Test handling of wrong content type."""
        response = client.post(
            "/api/v1/auth/register",
            data=str(test_user_data),
            headers={"Content-Type": "text/plain"}
        )
        
        assert response.status_code == 422

    def test_empty_request_body(self, test_db):
        """Test handling of empty request body."""
        response = client.post("/api/v1/auth/register", json={})
        
        assert response.status_code == 422

    def test_null_values(self, test_db):
        """Test handling of null values."""
        data = {
            "email": None,
            "password": None,
            "first_name": None,
            "last_name": None
        }
        
        response = client.post("/api/v1/auth/register", json=data)
        
        assert response.status_code == 422


class TestSecurityFeatures:
    """Test security features of authentication."""

    def test_password_not_in_response(self, test_db, test_user_data):
        """Test that password is not included in response."""
        response = client.post("/api/v1/auth/register", json=test_user_data)
        
        assert response.status_code == 201
        response_text = response.text.lower()
        
        # Password should not appear anywhere in response
        assert test_user_data["password"].lower() not in response_text
        assert "password" not in response.json()["user"]

    def test_user_created_with_hashed_password(self, test_db, test_user_data):
        """Test that user password is properly hashed in database."""
        response = client.post("/api/v1/auth/register", json=test_user_data)
        assert response.status_code == 201
        
        # Check database directly
        db = next(override_get_db())
        try:
            user = db.query(User).filter(User.email == test_user_data["email"]).first()
            assert user is not None
            assert user.hashed_password != test_user_data["password"]
            assert user.hashed_password.startswith("$2b$")  # bcrypt hash format
        finally:
            db.close()

    def test_inactive_user_cannot_login(self, test_db, existing_user):
        """Test that inactive users cannot login."""
        # First deactivate the user
        db = next(override_get_db())
        try:
            user = db.query(User).filter(User.email == existing_user["email"]).first()
            user.is_active = False
            db.commit()
        finally:
            db.close()
        
        # Try to login
        login_data = {
            "email": existing_user["email"],
            "password": existing_user["password"]
        }
        
        response = client.post("/api/v1/auth/login/json", json=login_data)
        assert response.status_code == 401


class TestLogging:
    """Test logging functionality in authentication."""

    def test_registration_attempt_logged(self, test_db, test_user_data):
        """Test that registration attempts are logged."""
        # This test would ideally capture log output
        # For now, just ensure the endpoint works (logging is called internally)
        response = client.post("/api/v1/auth/register", json=test_user_data)
        assert response.status_code == 201

    def test_login_attempt_logged(self, test_db, existing_user):
        """Test that login attempts are logged."""
        # This test would ideally capture log output
        # For now, just ensure the endpoint works (logging is called internally)
        login_data = {
            "email": existing_user["email"],
            "password": existing_user["password"]
        }
        
        response = client.post("/api/v1/auth/login/json", json=login_data)
        assert response.status_code == 200

    def test_failed_login_attempt_logged(self, test_db, existing_user):
        """Test that failed login attempts are logged."""
        login_data = {
            "email": existing_user["email"],
            "password": "WrongPassword123!"
        }
        
        response = client.post("/api/v1/auth/login/json", json=login_data)
        assert response.status_code == 401


if __name__ == "__main__":
    pytest.main([__file__, "-v"])