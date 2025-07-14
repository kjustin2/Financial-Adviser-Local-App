"""Comprehensive tests for holdings management endpoints following 2025 testing best practices."""

import pytest
from decimal import Decimal
from datetime import date, datetime
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
logger = get_logger("test_holdings")


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
        email="holdingstest@example.com",
        hashed_password=get_password_hash("TestPassword123!"),
        first_name="Holdings",
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
def test_portfolio(test_db, test_user):
    """Create a test portfolio for holdings."""
    portfolio = Portfolio(
        user_id=test_user.id,
        name="Test Holdings Portfolio",
        description="Portfolio for testing holdings",
        portfolio_type=PortfolioType.TAXABLE
    )
    test_db.add(portfolio)
    test_db.commit()
    test_db.refresh(portfolio)
    return portfolio


@pytest.fixture
def other_portfolio(test_db, other_user):
    """Create a portfolio for other user."""
    portfolio = Portfolio(
        user_id=other_user.id,
        name="Other User Portfolio",
        description="Portfolio for other user",
        portfolio_type=PortfolioType.RETIREMENT
    )
    test_db.add(portfolio)
    test_db.commit()
    test_db.refresh(portfolio)
    return portfolio


@pytest.fixture
def sample_holding(test_db, test_portfolio):
    """Create a sample holding for testing."""
    holding = Holding(
        portfolio_id=test_portfolio.id,
        symbol="AAPL",
        security_name="Apple Inc",
        security_type=SecurityType.STOCK,
        quantity=Decimal("10.0"),
        cost_basis=Decimal("150.00"),
        purchase_date=date(2024, 1, 1),
        current_price=Decimal("175.00")
    )
    test_db.add(holding)
    test_db.commit()
    test_db.refresh(holding)
    return holding


@pytest.fixture
def valid_holding_data(test_portfolio):
    """Valid holding creation data."""
    return {
        "portfolio_id": test_portfolio.id,
        "symbol": "GOOGL",
        "security_name": "Alphabet Inc",
        "security_type": "stock",
        "quantity": "5.0",
        "cost_basis": "2800.00",
        "purchase_date": "2024-01-15"
    }


class TestHoldingsListEndpoint:
    """Test holdings list retrieval."""

    def test_get_empty_holdings_list(self, test_db, auth_headers):
        """Test retrieving empty holdings list."""
        response = client.get("/api/v1/holdings/", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "holdings" in data
        assert "total_count" in data
        assert "total_value" in data
        assert data["holdings"] == []
        assert data["total_count"] == 0
        assert float(data["total_value"]) == 0.0

    def test_get_holdings_list_with_data(self, test_db):
        """Test retrieving holdings with data."""
        # Create user via database session (like transactions test)
        user = User(
            email="holdingstest@example.com",
            hashed_password=get_password_hash("TestPassword123!"),
            first_name="Holdings",
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
        
        # Create auth headers
        access_token = create_access_token(subject=user.id)
        auth_headers = {"Authorization": f"Bearer {access_token}"}
        
        # Create portfolio via API first
        portfolio_data = {
            "name": "Test Portfolio for Holdings",
            "description": "Portfolio for testing holdings data",
            "portfolio_type": "taxable"
        }
        portfolio_response = client.post("/api/v1/portfolios/", json=portfolio_data, headers=auth_headers)
        assert portfolio_response.status_code == 201
        portfolio_id = portfolio_response.json()["id"]
        
        # Create holding via API to ensure proper database session handling
        holding_data = {
            "portfolio_id": portfolio_id,
            "symbol": "AAPL",
            "security_name": "Apple Inc",
            "security_type": "stock",
            "quantity": "10.0",
            "cost_basis": "150.00",
            "purchase_date": "2024-01-01"
        }
        
        # Create the holding
        create_response = client.post("/api/v1/holdings/", json=holding_data, headers=auth_headers)
        assert create_response.status_code == 201
        
        # Update current price for calculations
        holding_id = create_response.json()["id"]
        price_update = {
            "symbol": "AAPL",
            "current_price": "175.00",
            "last_updated": "2024-07-13T16:00:00"
        }
        price_response = client.put(f"/api/v1/holdings/{holding_id}/price", json=price_update, headers=auth_headers)
        assert price_response.status_code == 200
        
        # Now test the holdings list
        response = client.get("/api/v1/holdings/", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["holdings"]) == 1
        assert data["total_count"] == 1
        
        holding = data["holdings"][0]
        assert holding["id"] == holding_id
        assert holding["symbol"] == "AAPL"
        assert holding["security_name"] == "Apple Inc"
        assert holding["security_type"] == "stock"
        assert float(holding["quantity"]) == 10.0
        
        # Verify calculated values (10 * 175 = 1750)
        assert float(holding["current_value"]) == 1750.0
        # Gain/Loss: 1750 - (10 * 150) = 250
        assert float(holding["unrealized_gain_loss"]) == 250.0

    def test_get_holdings_filtered_by_portfolio(self, test_db, auth_headers, sample_holding, test_user):
        """Test filtering holdings by portfolio."""
        # Create second portfolio with different holding
        second_portfolio = Portfolio(
            user_id=test_user.id,
            name="Second Portfolio",
            portfolio_type=PortfolioType.RETIREMENT
        )
        test_db.add(second_portfolio)
        test_db.commit()
        
        second_holding = Holding(
            portfolio_id=second_portfolio.id,
            symbol="MSFT",
            security_name="Microsoft Corp",
            security_type=SecurityType.STOCK,
            quantity=Decimal("20.0"),
            cost_basis=Decimal("300.00"),
            purchase_date=date(2024, 1, 1)
        )
        test_db.add(second_holding)
        test_db.commit()
        
        # Test filtering by first portfolio
        response = client.get(f"/api/v1/holdings/?portfolio_id={sample_holding.portfolio_id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["holdings"]) == 1
        assert data["holdings"][0]["symbol"] == "AAPL"
        
        # Test filtering by second portfolio
        response = client.get(f"/api/v1/holdings/?portfolio_id={second_portfolio.id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["holdings"]) == 1
        assert data["holdings"][0]["symbol"] == "MSFT"

    def test_get_holdings_pagination(self, test_db, auth_headers, test_portfolio):
        """Test holdings list pagination."""
        # Create multiple holdings
        for i in range(15):
            holding = Holding(
                portfolio_id=test_portfolio.id,
                symbol=f"STOCK{i:02d}",
                security_name=f"Stock {i}",
                security_type=SecurityType.STOCK,
                quantity=Decimal("1.0"),
                cost_basis=Decimal("100.00"),
                purchase_date=date(2024, 1, 1)
            )
            test_db.add(holding)
        test_db.commit()
        
        # Test first page
        response = client.get("/api/v1/holdings/?skip=0&limit=10", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["holdings"]) == 10
        
        # Test second page
        response = client.get("/api/v1/holdings/?skip=10&limit=10", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["holdings"]) == 5

    def test_get_holdings_unauthorized(self, test_db):
        """Test accessing holdings without authentication."""
        response = client.get("/api/v1/holdings/")
        assert response.status_code == 401

    def test_get_holdings_user_isolation(self, test_db, auth_headers, other_auth_headers, sample_holding, other_portfolio):
        """Test that users only see their own holdings."""
        # Create holding for other user
        other_holding = Holding(
            portfolio_id=other_portfolio.id,
            symbol="TSLA",
            security_name="Tesla Inc",
            security_type=SecurityType.STOCK,
            quantity=Decimal("3.0"),
            cost_basis=Decimal("800.00"),
            purchase_date=date(2024, 1, 1)
        )
        test_db.add(other_holding)
        test_db.commit()
        
        # Test first user sees only their holdings
        response = client.get("/api/v1/holdings/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["holdings"]) == 1
        assert data["holdings"][0]["symbol"] == "AAPL"
        
        # Test other user sees only their holdings
        response = client.get("/api/v1/holdings/", headers=other_auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["holdings"]) == 1
        assert data["holdings"][0]["symbol"] == "TSLA"


class TestHoldingsCreation:
    """Test holdings creation."""

    def test_create_holding_success(self, test_db, auth_headers, valid_holding_data):
        """Test successful holding creation."""
        response = client.post("/api/v1/holdings/", json=valid_holding_data, headers=auth_headers)
        
        assert response.status_code == 201
        data = response.json()
        
        assert "id" in data
        assert data["symbol"] == valid_holding_data["symbol"]
        assert data["security_name"] == valid_holding_data["security_name"]
        assert data["security_type"] == valid_holding_data["security_type"]
        assert float(data["quantity"]) == float(valid_holding_data["quantity"])
        assert float(data["cost_basis"]) == float(valid_holding_data["cost_basis"])
        assert data["purchase_date"] == valid_holding_data["purchase_date"]
        assert data["is_active"] is True

    def test_create_holding_minimal_data(self, test_db, auth_headers, test_portfolio):
        """Test holding creation with minimal required data."""
        minimal_data = {
            "portfolio_id": test_portfolio.id,
            "symbol": "MINIMAL",
            "security_type": "stock",
            "quantity": "1.0",
            "cost_basis": "100.00",
            "purchase_date": "2024-01-01"
        }
        
        response = client.post("/api/v1/holdings/", json=minimal_data, headers=auth_headers)
        
        assert response.status_code == 201
        data = response.json()
        
        assert data["symbol"] == "MINIMAL"
        assert data["security_name"] is None
        assert data["current_price"] is None

    def test_create_holding_missing_required_fields(self, test_db, auth_headers):
        """Test holding creation fails without required fields."""
        required_fields = ["portfolio_id", "symbol", "security_type", "quantity", "cost_basis", "purchase_date"]
        
        for field in required_fields:
            data = {
                "portfolio_id": 1,
                "symbol": "TEST",
                "security_type": "stock",
                "quantity": "1.0",
                "cost_basis": "100.00",
                "purchase_date": "2024-01-01"
            }
            del data[field]
            
            response = client.post("/api/v1/holdings/", json=data, headers=auth_headers)
            assert response.status_code == 422

    def test_create_holding_invalid_portfolio(self, test_db, auth_headers):
        """Test holding creation fails with invalid portfolio ID."""
        data = {
            "portfolio_id": 99999,  # Non-existent portfolio
            "symbol": "TEST",
            "security_type": "stock",
            "quantity": "1.0",
            "cost_basis": "100.00",
            "purchase_date": "2024-01-01"
        }
        
        response = client.post("/api/v1/holdings/", json=data, headers=auth_headers)
        assert response.status_code == 404

    def test_create_holding_other_user_portfolio(self, test_db, auth_headers, other_portfolio):
        """Test cannot create holding in other user's portfolio."""
        data = {
            "portfolio_id": other_portfolio.id,
            "symbol": "HACK",
            "security_type": "stock",
            "quantity": "1.0",
            "cost_basis": "100.00",
            "purchase_date": "2024-01-01"
        }
        
        response = client.post("/api/v1/holdings/", json=data, headers=auth_headers)
        assert response.status_code == 404

    def test_create_holding_duplicate_symbol(self, test_db, auth_headers, sample_holding, valid_holding_data):
        """Test cannot create holding with duplicate symbol in same portfolio."""
        # Try to create another AAPL holding in same portfolio
        duplicate_data = valid_holding_data.copy()
        duplicate_data["symbol"] = "AAPL"
        
        response = client.post("/api/v1/holdings/", json=duplicate_data, headers=auth_headers)
        assert response.status_code == 400

    def test_create_holding_invalid_data_types(self, test_db, auth_headers, test_portfolio):
        """Test holding creation validates data types."""
        invalid_data_sets = [
            {"quantity": "invalid_number"},
            {"cost_basis": "not_a_decimal"},
            {"purchase_date": "invalid_date"},
            {"security_type": "invalid_type"},
            {"portfolio_id": "not_an_integer"}
        ]
        
        base_data = {
            "portfolio_id": test_portfolio.id,
            "symbol": "TEST",
            "security_type": "stock",
            "quantity": "1.0",
            "cost_basis": "100.00",
            "purchase_date": "2024-01-01"
        }
        
        for invalid_data in invalid_data_sets:
            data = {**base_data, **invalid_data}
            response = client.post("/api/v1/holdings/", json=data, headers=auth_headers)
            assert response.status_code == 422

    def test_create_holding_negative_values(self, test_db, auth_headers, test_portfolio):
        """Test holding creation rejects negative values."""
        negative_data_sets = [
            {"quantity": "-1.0"},
            {"cost_basis": "-100.00"}
        ]
        
        base_data = {
            "portfolio_id": test_portfolio.id,
            "symbol": "TEST",
            "security_type": "stock",
            "quantity": "1.0",
            "cost_basis": "100.00",
            "purchase_date": "2024-01-01"
        }
        
        for negative_data in negative_data_sets:
            data = {**base_data, **negative_data}
            response = client.post("/api/v1/holdings/", json=data, headers=auth_headers)
            assert response.status_code == 422

    def test_create_holding_unauthorized(self, test_db, valid_holding_data):
        """Test holding creation without authentication."""
        response = client.post("/api/v1/holdings/", json=valid_holding_data)
        assert response.status_code == 401


class TestHoldingsRetrieval:
    """Test individual holding retrieval."""

    def test_get_holding_success(self, test_db, auth_headers, sample_holding):
        """Test successful holding retrieval."""
        response = client.get(f"/api/v1/holdings/{sample_holding.id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == sample_holding.id
        assert data["symbol"] == sample_holding.symbol
        assert data["security_name"] == sample_holding.security_name
        assert data["security_type"] == sample_holding.security_type.value

    def test_get_holding_with_calculations(self, test_db, auth_headers, sample_holding):
        """Test holding retrieval includes calculations."""
        response = client.get(f"/api/v1/holdings/{sample_holding.id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Total cost basis: 10 * 150 = 1500
        assert float(data["total_cost_basis"]) == 1500.0
        # Current value: 10 * 175 = 1750
        assert float(data["current_value"]) == 1750.0
        # Gain/Loss: 1750 - 1500 = 250
        assert float(data["unrealized_gain_loss"]) == 250.0
        # Return %: (250 / 1500) * 100 = 16.67%
        assert abs(float(data["unrealized_gain_loss_percent"]) - 16.67) < 0.01

    def test_get_holding_not_found(self, test_db, auth_headers):
        """Test holding retrieval with non-existent ID."""
        response = client.get("/api/v1/holdings/99999", headers=auth_headers)
        assert response.status_code == 404

    def test_get_holding_other_user(self, test_db, auth_headers, other_portfolio):
        """Test cannot access other user's holding."""
        other_holding = Holding(
            portfolio_id=other_portfolio.id,
            symbol="OTHER",
            security_type=SecurityType.STOCK,
            quantity=Decimal("1.0"),
            cost_basis=Decimal("100.00"),
            purchase_date=date(2024, 1, 1)
        )
        test_db.add(other_holding)
        test_db.commit()
        
        response = client.get(f"/api/v1/holdings/{other_holding.id}", headers=auth_headers)
        assert response.status_code == 404

    def test_get_holding_unauthorized(self, test_db, sample_holding):
        """Test holding retrieval without authentication."""
        response = client.get(f"/api/v1/holdings/{sample_holding.id}")
        assert response.status_code == 401


class TestHoldingsUpdate:
    """Test holding updates."""

    def test_update_holding_quantity(self, test_db, auth_headers, sample_holding):
        """Test updating holding quantity."""
        update_data = {"quantity": "15.0"}
        
        response = client.put(f"/api/v1/holdings/{sample_holding.id}", json=update_data, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert float(data["quantity"]) == 15.0
        # Verify calculations update: 15 * 175 = 2625
        assert float(data["current_value"]) == 2625.0

    def test_update_holding_current_price(self, test_db, auth_headers, sample_holding):
        """Test updating holding current price."""
        update_data = {"current_price": "200.00"}
        
        response = client.put(f"/api/v1/holdings/{sample_holding.id}", json=update_data, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert float(data["current_price"]) == 200.0
        # Verify calculations update: 10 * 200 = 2000
        assert float(data["current_value"]) == 2000.0

    def test_update_holding_multiple_fields(self, test_db, auth_headers, sample_holding):
        """Test updating multiple holding fields."""
        update_data = {
            "quantity": "12.0",
            "current_price": "180.00",
            "security_name": "Apple Inc. (Updated)"
        }
        
        response = client.put(f"/api/v1/holdings/{sample_holding.id}", json=update_data, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert float(data["quantity"]) == 12.0
        assert float(data["current_price"]) == 180.0
        assert data["security_name"] == "Apple Inc. (Updated)"
        # Verify calculations: 12 * 180 = 2160
        assert float(data["current_value"]) == 2160.0

    def test_update_holding_invalid_data(self, test_db, auth_headers, sample_holding):
        """Test updating holding with invalid data."""
        invalid_updates = [
            {"quantity": "-5.0"},  # Negative quantity
            {"cost_basis": "-100.00"},  # Negative cost basis
            {"current_price": "invalid"},  # Invalid price format
        ]
        
        for invalid_data in invalid_updates:
            response = client.put(f"/api/v1/holdings/{sample_holding.id}", json=invalid_data, headers=auth_headers)
            assert response.status_code == 422

    def test_update_holding_not_found(self, test_db, auth_headers):
        """Test updating non-existent holding."""
        update_data = {"quantity": "5.0"}
        
        response = client.put("/api/v1/holdings/99999", json=update_data, headers=auth_headers)
        assert response.status_code == 404

    def test_update_holding_other_user(self, test_db, auth_headers, other_portfolio):
        """Test cannot update other user's holding."""
        other_holding = Holding(
            portfolio_id=other_portfolio.id,
            symbol="OTHER",
            security_type=SecurityType.STOCK,
            quantity=Decimal("1.0"),
            cost_basis=Decimal("100.00"),
            purchase_date=date(2024, 1, 1)
        )
        test_db.add(other_holding)
        test_db.commit()
        
        update_data = {"quantity": "999.0"}
        response = client.put(f"/api/v1/holdings/{other_holding.id}", json=update_data, headers=auth_headers)
        assert response.status_code == 404

    def test_update_holding_unauthorized(self, test_db, sample_holding):
        """Test updating holding without authentication."""
        update_data = {"quantity": "5.0"}
        response = client.put(f"/api/v1/holdings/{sample_holding.id}", json=update_data)
        assert response.status_code == 401


class TestHoldingsDeletion:
    """Test holding deletion (soft delete)."""

    def test_delete_holding_success(self, test_db, auth_headers, sample_holding):
        """Test successful holding deletion."""
        response = client.delete(f"/api/v1/holdings/{sample_holding.id}", headers=auth_headers)
        
        assert response.status_code == 204
        
        # Verify holding is not accessible
        response = client.get(f"/api/v1/holdings/{sample_holding.id}", headers=auth_headers)
        assert response.status_code == 404
        
        # Verify holding still exists in database but is inactive
        test_db.refresh(sample_holding)
        assert sample_holding.is_active is False

    def test_delete_holding_not_found(self, test_db, auth_headers):
        """Test deleting non-existent holding."""
        response = client.delete("/api/v1/holdings/99999", headers=auth_headers)
        assert response.status_code == 404

    def test_delete_holding_other_user(self, test_db, auth_headers, other_portfolio):
        """Test cannot delete other user's holding."""
        other_holding = Holding(
            portfolio_id=other_portfolio.id,
            symbol="OTHER",
            security_type=SecurityType.STOCK,
            quantity=Decimal("1.0"),
            cost_basis=Decimal("100.00"),
            purchase_date=date(2024, 1, 1)
        )
        test_db.add(other_holding)
        test_db.commit()
        
        response = client.delete(f"/api/v1/holdings/{other_holding.id}", headers=auth_headers)
        assert response.status_code == 404

    def test_delete_holding_unauthorized(self, test_db, sample_holding):
        """Test deleting holding without authentication."""
        response = client.delete(f"/api/v1/holdings/{sample_holding.id}")
        assert response.status_code == 401


class TestHoldingsCalculations:
    """Test holding calculation accuracy."""

    def test_holding_value_calculations(self, test_db, sample_holding):
        """Test holding value calculations are accurate."""
        # Expected values for AAPL: 10 shares at $150 cost, $175 current
        # Total cost basis: 10 * 150 = 1500
        # Current value: 10 * 175 = 1750
        # Gain/Loss: 1750 - 1500 = 250
        # Return %: (250 / 1500) * 100 = 16.67%
        
        assert sample_holding.total_cost_basis == Decimal("1500.00")
        assert sample_holding.current_value == Decimal("1750.00")
        assert sample_holding.unrealized_gain_loss == Decimal("250.00")
        assert abs(sample_holding.unrealized_gain_loss_percent - Decimal("16.67")) < Decimal("0.01")

    def test_holding_without_current_price(self, test_db, test_portfolio):
        """Test calculations when holding has no current price."""
        holding = Holding(
            portfolio_id=test_portfolio.id,
            symbol="NOPRICE",
            security_type=SecurityType.STOCK,
            quantity=Decimal("5.0"),
            cost_basis=Decimal("200.00"),
            purchase_date=date(2024, 1, 1),
            current_price=None  # No current price
        )
        test_db.add(holding)
        test_db.commit()
        
        # Should use cost_basis as fallback for current value
        assert holding.current_value == Decimal("1000.00")  # 5 * 200
        assert holding.total_cost_basis == Decimal("1000.00")
        assert holding.unrealized_gain_loss == Decimal("0.00")
        assert holding.unrealized_gain_loss_percent == Decimal("0.00")

    def test_holding_profitability_check(self, test_db, test_portfolio):
        """Test holding profitability calculation."""
        # Profitable holding
        profitable = Holding(
            portfolio_id=test_portfolio.id,
            symbol="PROFIT",
            security_type=SecurityType.STOCK,
            quantity=Decimal("1.0"),
            cost_basis=Decimal("100.00"),
            purchase_date=date(2024, 1, 1),
            current_price=Decimal("150.00")
        )
        test_db.add(profitable)
        
        # Losing holding
        losing = Holding(
            portfolio_id=test_portfolio.id,
            symbol="LOSS",
            security_type=SecurityType.STOCK,
            quantity=Decimal("1.0"),
            cost_basis=Decimal("100.00"),
            purchase_date=date(2024, 1, 1),
            current_price=Decimal("80.00")
        )
        test_db.add(losing)
        test_db.commit()
        
        assert profitable.is_profitable is True
        assert losing.is_profitable is False


class TestHoldingsPerformanceEndpoint:
    """Test holdings performance metrics endpoint."""

    def test_get_holding_performance(self, test_db, auth_headers, sample_holding, test_portfolio):
        """Test holding performance metrics retrieval."""
        # Need to refresh portfolio to get total value for weight calculation
        test_db.refresh(test_portfolio)
        
        response = client.get(f"/api/v1/holdings/{sample_holding.id}/performance", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["holding_id"] == sample_holding.id
        assert data["symbol"] == "AAPL"
        assert float(data["current_value"]) == 1750.0
        assert float(data["cost_basis"]) == 1500.0
        assert float(data["unrealized_gain_loss"]) == 250.0
        assert float(data["unrealized_gain_loss_percent"]) > 16.6
        
        # Weight in portfolio (holding is 100% of portfolio value)
        assert float(data["weight_in_portfolio"]) == 100.0

    def test_get_performance_not_found(self, test_db, auth_headers):
        """Test performance endpoint with non-existent holding."""
        response = client.get("/api/v1/holdings/99999/performance", headers=auth_headers)
        assert response.status_code == 404

    def test_get_performance_unauthorized(self, test_db, sample_holding):
        """Test performance endpoint without authentication."""
        response = client.get(f"/api/v1/holdings/{sample_holding.id}/performance")
        assert response.status_code == 401


class TestHoldingsPriceUpdate:
    """Test holdings price update endpoint."""

    def test_update_holding_price_success(self, test_db, auth_headers, sample_holding):
        """Test successful price update."""
        price_data = {
            "symbol": "AAPL",
            "current_price": "190.00",
            "last_updated": "2024-07-13T16:00:00"
        }
        
        response = client.put(f"/api/v1/holdings/{sample_holding.id}/price", json=price_data, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert float(data["current_price"]) == 190.0
        assert data["last_price_update"] == "2024-07-13T16:00:00"
        # Verify calculations update: 10 * 190 = 1900
        assert float(data["current_value"]) == 1900.0

    def test_update_holding_price_symbol_mismatch(self, test_db, auth_headers, sample_holding):
        """Test price update fails with symbol mismatch."""
        price_data = {
            "symbol": "WRONG",  # Different from AAPL
            "current_price": "190.00",
            "last_updated": "2024-07-13T16:00:00"
        }
        
        response = client.put(f"/api/v1/holdings/{sample_holding.id}/price", json=price_data, headers=auth_headers)
        assert response.status_code == 400

    def test_update_holding_price_not_found(self, test_db, auth_headers):
        """Test price update with non-existent holding."""
        price_data = {
            "symbol": "AAPL",
            "current_price": "190.00",
            "last_updated": "2024-07-13T16:00:00"
        }
        
        response = client.put("/api/v1/holdings/99999/price", json=price_data, headers=auth_headers)
        assert response.status_code == 404

    def test_update_holding_price_unauthorized(self, test_db, sample_holding):
        """Test price update without authentication."""
        price_data = {
            "symbol": "AAPL",
            "current_price": "190.00",
            "last_updated": "2024-07-13T16:00:00"
        }
        
        response = client.put(f"/api/v1/holdings/{sample_holding.id}/price", json=price_data)
        assert response.status_code == 401


class TestHoldingsErrorHandling:
    """Test error handling scenarios."""

    def test_malformed_json(self, test_db, auth_headers):
        """Test handling of malformed JSON."""
        response = client.post(
            "/api/v1/holdings/",
            data="invalid json",
            headers={**auth_headers, "Content-Type": "application/json"}
        )
        assert response.status_code == 422

    def test_empty_request_body(self, test_db, auth_headers):
        """Test handling of empty request body."""
        response = client.post("/api/v1/holdings/", json={}, headers=auth_headers)
        assert response.status_code == 422

    def test_invalid_holding_id_types(self, test_db, auth_headers):
        """Test handling of invalid holding ID types."""
        invalid_ids = ["abc", "12.5", "null", "undefined"]
        
        for invalid_id in invalid_ids:
            response = client.get(f"/api/v1/holdings/{invalid_id}", headers=auth_headers)
            assert response.status_code == 422


class TestHoldingsSecurityFeatures:
    """Test security aspects of holdings management."""

    def test_sql_injection_protection(self, test_db, auth_headers, test_portfolio):
        """Test protection against SQL injection in holding data."""
        malicious_data = {
            "portfolio_id": test_portfolio.id,
            "symbol": "'; DROP TABLE holdings; --",
            "security_name": "<script>alert('xss')</script>",
            "security_type": "stock",
            "quantity": "1.0",
            "cost_basis": "100.00",
            "purchase_date": "2024-01-01"
        }
        
        response = client.post("/api/v1/holdings/", json=malicious_data, headers=auth_headers)
        
        # Should succeed as a normal holding creation
        assert response.status_code == 201
        data = response.json()
        assert data["symbol"] == malicious_data["symbol"]  # Stored as literal string

    def test_user_data_isolation(self, test_db, auth_headers, other_auth_headers, test_portfolio, other_portfolio):
        """Test that user holdings data is properly isolated."""
        # Create holdings for both users
        holding1_data = {
            "portfolio_id": test_portfolio.id,
            "symbol": "USER1",
            "security_type": "stock",
            "quantity": "1.0",
            "cost_basis": "100.00",
            "purchase_date": "2024-01-01"
        }
        holding2_data = {
            "portfolio_id": other_portfolio.id,
            "symbol": "USER2",
            "security_type": "stock",
            "quantity": "1.0",
            "cost_basis": "100.00",
            "purchase_date": "2024-01-01"
        }
        
        response1 = client.post("/api/v1/holdings/", json=holding1_data, headers=auth_headers)
        response2 = client.post("/api/v1/holdings/", json=holding2_data, headers=other_auth_headers)
        
        assert response1.status_code == 201
        assert response2.status_code == 201
        
        # Each user should only see their own holdings
        list1 = client.get("/api/v1/holdings/", headers=auth_headers)
        list2 = client.get("/api/v1/holdings/", headers=other_auth_headers)
        
        assert len(list1.json()["holdings"]) == 1
        assert len(list2.json()["holdings"]) == 1
        assert list1.json()["holdings"][0]["symbol"] == "USER1"
        assert list2.json()["holdings"][0]["symbol"] == "USER2"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])