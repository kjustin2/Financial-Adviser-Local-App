"""Comprehensive tests for portfolio management endpoints following 2025 testing best practices."""

import pytest
from decimal import Decimal
from datetime import date
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.config import Settings
from app.database import Base, get_db
from app.main import app
from app.models import User, Portfolio, Holding
from app.models.portfolio import PortfolioType
from app.models.holding import SecurityType
from app.security.auth import get_password_hash, create_access_token
from app.utils.logging import get_logger

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

# Module setup and teardown for dependency isolation
def setup_module():
    """Setup module with isolated database dependency."""
    app.dependency_overrides[get_db] = override_get_db

def teardown_module():
    """Clean up after module."""
    if get_db in app.dependency_overrides:
        del app.dependency_overrides[get_db]

# Setup the module
setup_module()

# Create test client
client = TestClient(app)
logger = get_logger("test_portfolios")


@pytest.fixture(scope="function")
def test_db():
    """Create a fresh database for each test."""
    # Ensure we have fresh tables for each test
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    # Create a new session for this test
    db = TestingSessionLocal()
    
    try:
        yield db
    finally:
        # Clean up after test
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def test_user(test_db):
    """Create a test user with investment profile."""
    user = User(
        email="portfoliotest@example.com",
        hashed_password=get_password_hash("TestPassword123!"),
        first_name="Portfolio",
        last_name="Tester",
        investment_experience="intermediate",
        risk_tolerance="moderate",
        investment_style="balanced",
        financial_goals='["retirement", "growth"]',
        net_worth_range="200k_500k",
        time_horizon="long_term"
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    return user


@pytest.fixture
def other_user(test_db):
    """Create another test user to test permissions."""
    user = User(
        email="otheruser@example.com",
        hashed_password=get_password_hash("OtherPassword123!"),
        first_name="Other",
        last_name="User",
        investment_experience="beginner",
        risk_tolerance="conservative",
        investment_style="conservative",
        financial_goals='["retirement"]',
        net_worth_range="100k_200k",
        time_horizon="medium_term"
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user):
    """Create authentication headers for test user."""
    access_token = create_access_token(subject=test_user.id)
    return {"Authorization": f"Bearer {access_token}"}


@pytest.fixture
def other_auth_headers(other_user):
    """Create authentication headers for other user."""
    access_token = create_access_token(subject=other_user.id)
    return {"Authorization": f"Bearer {access_token}"}


@pytest.fixture
def sample_portfolio(test_db, test_user):
    """Create a sample portfolio for testing."""
    portfolio = Portfolio(
        user_id=test_user.id,
        name="Test Portfolio",
        description="A test portfolio for testing",
        portfolio_type=PortfolioType.TAXABLE
    )
    test_db.add(portfolio)
    test_db.commit()
    test_db.refresh(portfolio)
    return portfolio


@pytest.fixture
def portfolio_with_holdings(test_db, sample_portfolio):
    """Create a portfolio with sample holdings."""
    holdings = [
        Holding(
            portfolio_id=sample_portfolio.id,
            symbol="AAPL",
            security_name="Apple Inc",
            security_type=SecurityType.STOCK,
            quantity=Decimal("10.0"),
            cost_basis=Decimal("150.00"),
            purchase_date=date(2024, 1, 1),
            current_price=Decimal("175.00")
        ),
        Holding(
            portfolio_id=sample_portfolio.id,
            symbol="GOOGL",
            security_name="Alphabet Inc",
            security_type=SecurityType.STOCK,
            quantity=Decimal("5.0"),
            cost_basis=Decimal("2800.00"),
            purchase_date=date(2024, 1, 1),
            current_price=Decimal("2900.00")
        )
    ]
    
    for holding in holdings:
        test_db.add(holding)
    test_db.commit()
    
    # Refresh portfolio to get updated holdings
    test_db.refresh(sample_portfolio)
    return sample_portfolio


@pytest.fixture
def valid_portfolio_data():
    """Valid portfolio creation data."""
    return {
        "name": "My Investment Portfolio",
        "description": "Long-term investment portfolio",
        "portfolio_type": "taxable"
    }


class TestPortfolioListEndpoint:
    """Test portfolio list retrieval."""

    def test_get_empty_portfolios_list(self, test_db, auth_headers):
        """Test retrieving empty portfolios list."""
        response = client.get("/api/v1/portfolios/", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "portfolios" in data
        assert "total_count" in data
        assert "total_value" in data
        assert data["portfolios"] == []
        assert data["total_count"] == 0
        assert float(data["total_value"]) == 0.0

    def test_get_portfolios_list_with_data(self, test_db, auth_headers, portfolio_with_holdings):
        """Test retrieving portfolios with data."""
        response = client.get("/api/v1/portfolios/", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["portfolios"]) == 1
        assert data["total_count"] == 1
        
        portfolio = data["portfolios"][0]
        assert portfolio["id"] == portfolio_with_holdings.id
        assert portfolio["name"] == "Test Portfolio"
        assert portfolio["portfolio_type"] == "taxable"
        assert portfolio["holdings_count"] == 2
        
        # Verify calculated values
        assert float(portfolio["current_value"]) == 16250.0  # (10 * 175) + (5 * 2900)
        assert float(portfolio["unrealized_gain_loss"]) == 2250.0  # 16250 - (10*150 + 5*2800)

    def test_get_portfolios_pagination(self, test_db, auth_headers, test_user):
        """Test portfolio list pagination."""
        # Create multiple portfolios
        for i in range(15):
            portfolio = Portfolio(
                user_id=test_user.id,
                name=f"Portfolio {i+1}",
                description=f"Test portfolio {i+1}",
                portfolio_type=PortfolioType.TAXABLE
            )
            test_db.add(portfolio)
        test_db.commit()
        
        # Test first page
        response = client.get("/api/v1/portfolios/?skip=0&limit=10", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["portfolios"]) == 10
        
        # Test second page
        response = client.get("/api/v1/portfolios/?skip=10&limit=10", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["portfolios"]) == 5

    def test_get_portfolios_unauthorized(self, test_db):
        """Test accessing portfolios without authentication."""
        response = client.get("/api/v1/portfolios/")
        assert response.status_code == 401

    def test_get_portfolios_user_isolation(self, test_db, auth_headers, other_auth_headers, sample_portfolio, other_user):
        """Test that users only see their own portfolios."""
        # Create portfolio for other user
        other_portfolio = Portfolio(
            user_id=other_user.id,
            name="Other User's Portfolio",
            description="Should not be visible",
            portfolio_type=PortfolioType.RETIREMENT
        )
        test_db.add(other_portfolio)
        test_db.commit()
        
        # Test first user sees only their portfolio
        response = client.get("/api/v1/portfolios/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["portfolios"]) == 1
        assert data["portfolios"][0]["name"] == "Test Portfolio"
        
        # Test other user sees only their portfolio
        response = client.get("/api/v1/portfolios/", headers=other_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["portfolios"]) == 1
        assert data["portfolios"][0]["name"] == "Other User's Portfolio"


class TestPortfolioCreation:
    """Test portfolio creation."""

    def test_create_portfolio_success(self, test_db, auth_headers, valid_portfolio_data):
        """Test successful portfolio creation."""
        response = client.post("/api/v1/portfolios/", json=valid_portfolio_data, headers=auth_headers)
        
        assert response.status_code == 201
        data = response.json()
        
        assert "id" in data
        assert data["name"] == valid_portfolio_data["name"]
        assert data["description"] == valid_portfolio_data["description"]
        assert data["portfolio_type"] == valid_portfolio_data["portfolio_type"]
        assert data["is_active"] is True
        assert float(data["current_value"]) == 0.0
        assert data["holdings_count"] == 0

    def test_create_portfolio_minimal_data(self, test_db, auth_headers):
        """Test portfolio creation with minimal required data."""
        minimal_data = {"name": "Minimal Portfolio"}
        
        response = client.post("/api/v1/portfolios/", json=minimal_data, headers=auth_headers)
        
        assert response.status_code == 201
        data = response.json()
        
        assert data["name"] == "Minimal Portfolio"
        assert data["description"] is None
        assert data["portfolio_type"] == "taxable"  # Default value

    def test_create_portfolio_missing_name(self, test_db, auth_headers):
        """Test portfolio creation fails without name."""
        data = {"description": "Portfolio without name"}
        
        response = client.post("/api/v1/portfolios/", json=data, headers=auth_headers)
        assert response.status_code == 422

    def test_create_portfolio_empty_name(self, test_db, auth_headers):
        """Test portfolio creation fails with empty name."""
        data = {"name": ""}
        
        response = client.post("/api/v1/portfolios/", json=data, headers=auth_headers)
        assert response.status_code == 422

    def test_create_portfolio_name_too_long(self, test_db, auth_headers):
        """Test portfolio creation fails with name too long."""
        data = {"name": "a" * 256}  # Exceeds 255 character limit
        
        response = client.post("/api/v1/portfolios/", json=data, headers=auth_headers)
        assert response.status_code == 422

    def test_create_portfolio_invalid_type(self, test_db, auth_headers):
        """Test portfolio creation with invalid portfolio type."""
        data = {
            "name": "Test Portfolio",
            "portfolio_type": "invalid_type"
        }
        
        response = client.post("/api/v1/portfolios/", json=data, headers=auth_headers)
        assert response.status_code == 422

    def test_create_portfolio_unauthorized(self, test_db, valid_portfolio_data):
        """Test portfolio creation without authentication."""
        response = client.post("/api/v1/portfolios/", json=valid_portfolio_data)
        assert response.status_code == 401


class TestPortfolioRetrieval:
    """Test individual portfolio retrieval."""

    def test_get_portfolio_success(self, test_db, auth_headers, sample_portfolio):
        """Test successful portfolio retrieval."""
        response = client.get(f"/api/v1/portfolios/{sample_portfolio.id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == sample_portfolio.id
        assert data["name"] == sample_portfolio.name
        assert data["description"] == sample_portfolio.description
        assert data["portfolio_type"] == sample_portfolio.portfolio_type.value

    def test_get_portfolio_with_holdings(self, test_db, auth_headers, portfolio_with_holdings):
        """Test portfolio retrieval with holdings calculations."""
        response = client.get(f"/api/v1/portfolios/{portfolio_with_holdings.id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["holdings_count"] == 2
        assert float(data["current_value"]) == 16250.0
        assert float(data["total_cost_basis"]) == 15500.0
        assert float(data["unrealized_gain_loss"]) == 750.0

    def test_get_portfolio_not_found(self, test_db, auth_headers):
        """Test portfolio retrieval with non-existent ID."""
        response = client.get("/api/v1/portfolios/99999", headers=auth_headers)
        assert response.status_code == 404

    def test_get_portfolio_other_user(self, test_db, auth_headers, other_user):
        """Test cannot access other user's portfolio."""
        # Create portfolio for other user
        other_portfolio = Portfolio(
            user_id=other_user.id,
            name="Other User's Portfolio",
            portfolio_type=PortfolioType.TAXABLE
        )
        test_db.add(other_portfolio)
        test_db.commit()
        
        response = client.get(f"/api/v1/portfolios/{other_portfolio.id}", headers=auth_headers)
        assert response.status_code == 404

    def test_get_portfolio_unauthorized(self, test_db, sample_portfolio):
        """Test portfolio retrieval without authentication."""
        response = client.get(f"/api/v1/portfolios/{sample_portfolio.id}")
        assert response.status_code == 401


class TestPortfolioUpdate:
    """Test portfolio updates."""

    def test_update_portfolio_name(self, test_db, auth_headers, sample_portfolio):
        """Test updating portfolio name."""
        update_data = {"name": "Updated Portfolio Name"}
        
        response = client.put(f"/api/v1/portfolios/{sample_portfolio.id}", json=update_data, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Portfolio Name"
        assert data["description"] == sample_portfolio.description  # Unchanged

    def test_update_portfolio_description(self, test_db, auth_headers, sample_portfolio):
        """Test updating portfolio description."""
        update_data = {"description": "Updated description"}
        
        response = client.put(f"/api/v1/portfolios/{sample_portfolio.id}", json=update_data, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["description"] == "Updated description"
        assert data["name"] == sample_portfolio.name  # Unchanged

    def test_update_portfolio_type(self, test_db, auth_headers, sample_portfolio):
        """Test updating portfolio type."""
        update_data = {"portfolio_type": "retirement"}
        
        response = client.put(f"/api/v1/portfolios/{sample_portfolio.id}", json=update_data, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["portfolio_type"] == "retirement"

    def test_update_portfolio_multiple_fields(self, test_db, auth_headers, sample_portfolio):
        """Test updating multiple portfolio fields."""
        update_data = {
            "name": "Completely New Name",
            "description": "Completely new description",
            "portfolio_type": "retirement"
        }
        
        response = client.put(f"/api/v1/portfolios/{sample_portfolio.id}", json=update_data, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == update_data["name"]
        assert data["description"] == update_data["description"]
        assert data["portfolio_type"] == update_data["portfolio_type"]

    def test_update_portfolio_empty_name(self, test_db, auth_headers, sample_portfolio):
        """Test updating portfolio with empty name fails."""
        update_data = {"name": ""}
        
        response = client.put(f"/api/v1/portfolios/{sample_portfolio.id}", json=update_data, headers=auth_headers)
        assert response.status_code == 422

    def test_update_portfolio_invalid_type(self, test_db, auth_headers, sample_portfolio):
        """Test updating portfolio with invalid type fails."""
        update_data = {"portfolio_type": "invalid_type"}
        
        response = client.put(f"/api/v1/portfolios/{sample_portfolio.id}", json=update_data, headers=auth_headers)
        assert response.status_code == 422

    def test_update_portfolio_not_found(self, test_db, auth_headers):
        """Test updating non-existent portfolio."""
        update_data = {"name": "Updated Name"}
        
        response = client.put("/api/v1/portfolios/99999", json=update_data, headers=auth_headers)
        assert response.status_code == 404

    def test_update_portfolio_other_user(self, test_db, auth_headers, other_user):
        """Test cannot update other user's portfolio."""
        other_portfolio = Portfolio(
            user_id=other_user.id,
            name="Other User's Portfolio",
            portfolio_type=PortfolioType.TAXABLE
        )
        test_db.add(other_portfolio)
        test_db.commit()
        
        update_data = {"name": "Hacked Name"}
        response = client.put(f"/api/v1/portfolios/{other_portfolio.id}", json=update_data, headers=auth_headers)
        assert response.status_code == 404

    def test_update_portfolio_unauthorized(self, test_db, sample_portfolio):
        """Test updating portfolio without authentication."""
        update_data = {"name": "Updated Name"}
        response = client.put(f"/api/v1/portfolios/{sample_portfolio.id}", json=update_data)
        assert response.status_code == 401


class TestPortfolioDeletion:
    """Test portfolio deletion (soft delete)."""

    def test_delete_portfolio_success(self, test_db, auth_headers, sample_portfolio):
        """Test successful portfolio deletion."""
        response = client.delete(f"/api/v1/portfolios/{sample_portfolio.id}", headers=auth_headers)
        
        assert response.status_code == 204
        
        # Verify portfolio is not accessible
        response = client.get(f"/api/v1/portfolios/{sample_portfolio.id}", headers=auth_headers)
        assert response.status_code == 404
        
        # Verify portfolio still exists in database but is inactive
        test_db.refresh(sample_portfolio)
        assert sample_portfolio.is_active is False

    def test_delete_portfolio_with_holdings(self, test_db, auth_headers, portfolio_with_holdings):
        """Test deleting portfolio with holdings."""
        portfolio_id = portfolio_with_holdings.id
        
        response = client.delete(f"/api/v1/portfolios/{portfolio_id}", headers=auth_headers)
        assert response.status_code == 204
        
        # Portfolio should not be accessible
        response = client.get(f"/api/v1/portfolios/{portfolio_id}", headers=auth_headers)
        assert response.status_code == 404

    def test_delete_portfolio_not_found(self, test_db, auth_headers):
        """Test deleting non-existent portfolio."""
        response = client.delete("/api/v1/portfolios/99999", headers=auth_headers)
        assert response.status_code == 404

    def test_delete_portfolio_other_user(self, test_db, auth_headers, other_user):
        """Test cannot delete other user's portfolio."""
        other_portfolio = Portfolio(
            user_id=other_user.id,
            name="Other User's Portfolio",
            portfolio_type=PortfolioType.TAXABLE
        )
        test_db.add(other_portfolio)
        test_db.commit()
        
        response = client.delete(f"/api/v1/portfolios/{other_portfolio.id}", headers=auth_headers)
        assert response.status_code == 404

    def test_delete_portfolio_unauthorized(self, test_db, sample_portfolio):
        """Test deleting portfolio without authentication."""
        response = client.delete(f"/api/v1/portfolios/{sample_portfolio.id}")
        assert response.status_code == 401


class TestPortfolioCalculations:
    """Test portfolio calculation accuracy."""

    def test_portfolio_value_calculations(self, test_db, portfolio_with_holdings):
        """Test portfolio value calculations are accurate."""
        # Expected values:
        # AAPL: 10 * 175 = 1750
        # GOOGL: 5 * 2900 = 14500
        # Total: 16250
        
        # Cost basis:
        # AAPL: 10 * 150 = 1500
        # GOOGL: 5 * 2800 = 14000
        # Total: 15500
        
        # Gain/Loss: 16250 - 15500 = 750
        # Return %: (750 / 15500) * 100 = 4.84%
        
        assert portfolio_with_holdings.total_value == Decimal("16250.00")
        assert portfolio_with_holdings.total_cost_basis == Decimal("15500.00")
        assert portfolio_with_holdings.unrealized_gain_loss == Decimal("750.00")
        assert abs(portfolio_with_holdings.unrealized_return_percent - Decimal("4.84")) < Decimal("0.01")

    def test_empty_portfolio_calculations(self, test_db, sample_portfolio):
        """Test calculations for empty portfolio."""
        assert sample_portfolio.total_value == Decimal("0.00")
        assert sample_portfolio.total_cost_basis == Decimal("0.00")
        assert sample_portfolio.unrealized_gain_loss == Decimal("0.00")
        assert sample_portfolio.unrealized_return_percent == Decimal("0.00")

    def test_portfolio_with_no_current_prices(self, test_db, sample_portfolio):
        """Test calculations when holdings have no current prices."""
        # Create holding without current price
        holding = Holding(
            portfolio_id=sample_portfolio.id,
            symbol="MSFT",
            security_name="Microsoft Corp",
            security_type=SecurityType.STOCK,
            quantity=Decimal("20.0"),
            cost_basis=Decimal("300.00"),
            purchase_date=date(2024, 1, 1),
            current_price=None  # No current price
        )
        test_db.add(holding)
        test_db.commit()
        test_db.refresh(sample_portfolio)
        
        # Should use cost_basis as fallback
        assert sample_portfolio.total_value == Decimal("6000.00")  # 20 * 300
        assert sample_portfolio.total_cost_basis == Decimal("6000.00")
        assert sample_portfolio.unrealized_gain_loss == Decimal("0.00")


class TestPortfolioPerformanceEndpoint:
    """Test portfolio performance metrics endpoint."""

    def test_get_portfolio_performance(self, test_db, auth_headers, portfolio_with_holdings):
        """Test portfolio performance metrics retrieval."""
        response = client.get(f"/api/v1/portfolios/{portfolio_with_holdings.id}/performance", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["portfolio_id"] == portfolio_with_holdings.id
        assert float(data["current_value"]) == 16250.0
        assert float(data["cost_basis"]) == 15500.0
        assert float(data["unrealized_gain_loss"]) == 750.0
        assert float(data["unrealized_return_percent"]) > 4.8

    def test_get_performance_not_found(self, test_db, auth_headers):
        """Test performance endpoint with non-existent portfolio."""
        response = client.get("/api/v1/portfolios/99999/performance", headers=auth_headers)
        assert response.status_code == 404

    def test_get_performance_unauthorized(self, test_db, portfolio_with_holdings):
        """Test performance endpoint without authentication."""
        response = client.get(f"/api/v1/portfolios/{portfolio_with_holdings.id}/performance")
        assert response.status_code == 401


class TestPortfolioErrorHandling:
    """Test error handling scenarios."""

    def test_malformed_json(self, test_db, auth_headers):
        """Test handling of malformed JSON."""
        response = client.post(
            "/api/v1/portfolios/",
            data="invalid json",
            headers={**auth_headers, "Content-Type": "application/json"}
        )
        assert response.status_code == 422

    def test_wrong_content_type(self, test_db, auth_headers, valid_portfolio_data):
        """Test handling of wrong content type."""
        response = client.post(
            "/api/v1/portfolios/",
            data=str(valid_portfolio_data),
            headers={**auth_headers, "Content-Type": "text/plain"}
        )
        assert response.status_code == 422

    def test_empty_request_body(self, test_db, auth_headers):
        """Test handling of empty request body."""
        response = client.post("/api/v1/portfolios/", json={}, headers=auth_headers)
        assert response.status_code == 422

    def test_invalid_portfolio_id_types(self, test_db, auth_headers):
        """Test handling of invalid portfolio ID types."""
        invalid_ids = ["abc", "12.5", "null", "undefined"]
        
        for invalid_id in invalid_ids:
            response = client.get(f"/api/v1/portfolios/{invalid_id}", headers=auth_headers)
            assert response.status_code == 422


class TestPortfolioSecurityFeatures:
    """Test security aspects of portfolio management."""

    def test_sql_injection_protection(self, test_db, auth_headers):
        """Test protection against SQL injection in portfolio names."""
        malicious_data = {
            "name": "'; DROP TABLE portfolios; --",
            "description": "SQL injection attempt"
        }
        
        response = client.post("/api/v1/portfolios/", json=malicious_data, headers=auth_headers)
        
        # Should succeed as a normal portfolio creation
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == malicious_data["name"]  # Stored as literal string

    def test_xss_protection(self, test_db, auth_headers):
        """Test protection against XSS in portfolio data."""
        xss_data = {
            "name": "<script>alert('xss')</script>",
            "description": "<img src=x onerror=alert('xss')>"
        }
        
        response = client.post("/api/v1/portfolios/", json=xss_data, headers=auth_headers)
        
        assert response.status_code == 201
        data = response.json()
        # Data should be stored as-is, frontend should handle escaping
        assert data["name"] == xss_data["name"]
        assert data["description"] == xss_data["description"]

    def test_user_data_isolation(self, test_db, auth_headers, other_auth_headers, test_user, other_user):
        """Test that user data is properly isolated."""
        # Create portfolios for both users
        portfolio1_data = {"name": "User 1 Portfolio"}
        portfolio2_data = {"name": "User 2 Portfolio"}
        
        response1 = client.post("/api/v1/portfolios/", json=portfolio1_data, headers=auth_headers)
        response2 = client.post("/api/v1/portfolios/", json=portfolio2_data, headers=other_auth_headers)
        
        assert response1.status_code == 201
        assert response2.status_code == 201
        
        # Each user should only see their own portfolios
        list1 = client.get("/api/v1/portfolios/", headers=auth_headers)
        list2 = client.get("/api/v1/portfolios/", headers=other_auth_headers)
        
        assert len(list1.json()["portfolios"]) == 1
        assert len(list2.json()["portfolios"]) == 1
        assert list1.json()["portfolios"][0]["name"] == "User 1 Portfolio"
        assert list2.json()["portfolios"][0]["name"] == "User 2 Portfolio"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])