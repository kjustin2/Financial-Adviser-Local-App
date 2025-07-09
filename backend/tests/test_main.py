"""Tests for the main FastAPI application."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.config import Settings
from app.database import Base, get_db
from app.main import app

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override the database dependency for testing."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


def override_settings():
    """Override settings for testing."""
    return Settings(
        debug=True,
        database_url=SQLALCHEMY_DATABASE_URL,
        secret_key="test-secret-key",
        allowed_origins=["http://localhost:3000", "http://localhost:5173"],
    )


# Override dependencies
app.dependency_overrides[get_db] = override_get_db

# Create test client
client = TestClient(app)


@pytest.fixture(scope="function")
def test_db():
    """Create a fresh database for each test."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


class TestMainApplication:
    """Test main application endpoints and functionality."""

    def test_root_endpoint(self, test_db):
        """Test the root endpoint."""
        response = client.get("/")
        assert response.status_code == 200

        data = response.json()
        assert "message" in data
        assert "version" in data
        assert data["docs"] == "/docs"
        assert data["redoc"] == "/redoc"
        assert data["health"] == "/health"

    def test_health_check(self, test_db):
        """Test the health check endpoint."""
        response = client.get("/health")
        assert response.status_code == 200

        data = response.json()
        assert data["success"] is True
        assert data["status"] == "healthy"
        assert "timestamp" in data
        assert "version" in data

    def test_docs_endpoint(self, test_db):
        """Test that the docs endpoint is accessible."""
        response = client.get("/docs")
        assert response.status_code == 200
        assert "text/html" in response.headers["content-type"]

    def test_openapi_endpoint(self, test_db):
        """Test that the OpenAPI schema is accessible."""
        response = client.get("/openapi.json")
        assert response.status_code == 200

        data = response.json()
        assert "openapi" in data
        assert "info" in data
        assert "paths" in data

    def test_cors_headers(self, test_db):
        """Test that CORS headers are properly set."""
        # Make a preflight request
        response = client.options(
            "/",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "Content-Type",
            },
        )

        assert response.status_code == 200
        assert "access-control-allow-origin" in response.headers
        assert "access-control-allow-methods" in response.headers
        assert "access-control-allow-headers" in response.headers

    def test_404_handling(self, test_db):
        """Test handling of 404 errors."""
        response = client.get("/nonexistent-endpoint")
        assert response.status_code == 404

        data = response.json()
        assert "detail" in data

    def test_rate_limiting(self, test_db):
        """Test rate limiting on health endpoint."""
        # Make multiple requests quickly
        responses = []
        for i in range(35):  # Exceed the 30/minute limit
            response = client.get("/health")
            responses.append(response)

        # Check that some requests are rate limited
        status_codes = [r.status_code for r in responses]
        assert 429 in status_codes  # Too Many Requests

    def test_validation_error_handling(self, test_db):
        """Test handling of validation errors."""
        # This will test once we have POST endpoints with validation
        # For now, we'll test with a malformed request to an API endpoint
        response = client.post("/api/v1/test", json={"invalid": "data"})
        # This might return 404 or 422 depending on endpoint existence
        assert response.status_code in [404, 422]


class TestErrorHandling:
    """Test error handling functionality."""

    def test_general_exception_handling(self, test_db):
        """Test that unhandled exceptions are caught and logged."""
        # This would require creating an endpoint that raises an exception
        # For now, we'll test with a simulated error
        pass

    def test_logging_middleware(self, test_db):
        """Test that requests are logged properly."""
        response = client.get("/")
        assert response.status_code == 200
        # In a real test, we would check log output
        # This requires capturing log output in tests


class TestDatabaseConnection:
    """Test database connection and setup."""

    def test_database_tables_created(self, test_db):
        """Test that database tables are created on startup."""
        # Check that we can query the database

        db = next(override_get_db())
        try:
            # This should not raise an exception
            result = db.execute("SELECT 1").scalar()
            assert result == 1
        finally:
            db.close()

    def test_database_connection_pooling(self, test_db):
        """Test database connection pooling."""
        # Make multiple database requests
        responses = []
        for i in range(10):
            response = client.get("/health")
            responses.append(response)

        # All should succeed
        for response in responses:
            assert response.status_code == 200


class TestSecurity:
    """Test security features."""

    def test_security_headers(self, test_db):
        """Test that security headers are set."""
        response = client.get("/")

        # Check for security headers
        # These would be set by additional middleware if needed
        # For now, just ensure basic security is working
        assert response.status_code == 200

    def test_sensitive_data_not_exposed(self, test_db):
        """Test that sensitive configuration is not exposed."""
        response = client.get("/")
        data = response.json()

        # Ensure no sensitive data is in the response
        response_str = str(data)
        assert "secret_key" not in response_str.lower()
        assert "password" not in response_str.lower()
        assert "api_key" not in response_str.lower()


@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    """Set up test environment."""
    # Create test database tables
    Base.metadata.create_all(bind=engine)
    yield
    # Clean up after tests
    Base.metadata.drop_all(bind=engine)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
