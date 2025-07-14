"""Comprehensive tests for transaction management endpoints."""

import pytest
from decimal import Decimal
from datetime import date
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models import User, Portfolio, Transaction, Holding
from app.models.portfolio import PortfolioType
from app.models.transaction import TransactionType
from app.models.holding import SecurityType
from app.security.auth import get_password_hash, create_access_token
from app.utils.logging import get_logger

# Test database setup - isolated for transaction tests
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
logger = get_logger("test_transactions")


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
def test_user_and_portfolio(test_db):
    """Create a test user and portfolio via API calls to ensure proper session handling."""
    # Create user first
    user = User(
        email="transactiontest@example.com",
        hashed_password=get_password_hash("TestPassword123!"),
        first_name="Transaction",
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
    
    # Create portfolio via API
    portfolio_data = {
        "name": "Test Portfolio for Transactions",
        "description": "Portfolio for testing transactions",
        "portfolio_type": "taxable"
    }
    portfolio_response = client.post("/api/v1/portfolios/", json=portfolio_data, headers=auth_headers)
    assert portfolio_response.status_code == 201
    portfolio_id = portfolio_response.json()["id"]
    
    return {
        "user": user,
        "auth_headers": auth_headers,
        "portfolio_id": portfolio_id
    }


@pytest.fixture
def sample_buy_transaction_data(test_portfolio):
    """Sample buy transaction data."""
    return {
        "portfolio_id": test_portfolio.id,
        "type": "buy",
        "symbol": "AAPL",
        "security_name": "Apple Inc",
        "quantity": 10.0,
        "price": 150.00,
        "total_amount": 1500.00,
        "fees": 9.99,
        "transaction_date": "2024-01-15",
        "notes": "Test buy transaction"
    }


@pytest.fixture
def sample_dividend_transaction_data(test_portfolio):
    """Sample dividend transaction data."""
    return {
        "portfolio_id": test_portfolio.id,
        "type": "dividend",
        "symbol": "AAPL",
        "security_name": "Apple Inc",
        "total_amount": 25.00,
        "fees": 0.00,
        "transaction_date": "2024-02-15",
        "notes": "Quarterly dividend payment"
    }


class TestTransactionCreation:
    """Test transaction creation functionality."""

    def test_create_buy_transaction_success(self, test_user_and_portfolio):
        """Test successful buy transaction creation."""
        auth_headers = test_user_and_portfolio["auth_headers"]
        portfolio_id = test_user_and_portfolio["portfolio_id"]
        
        # Create a transaction
        transaction_data = {
            "portfolio_id": portfolio_id,
            "type": "buy",
            "symbol": "AAPL",
            "security_name": "Apple Inc",
            "quantity": 10.0,
            "price": 150.00,
            "total_amount": 1500.00,
            "fees": 9.99,
            "transaction_date": "2024-01-15",
            "notes": "Test buy transaction"
        }
        
        response = client.post(
            "/api/v1/transactions/", 
            json=transaction_data, 
            headers=auth_headers
        )
        
        assert response.status_code == 201
        data = response.json()
        
        assert data["type"] == "buy"
        assert data["symbol"] == "AAPL"
        assert float(data["quantity"]) == 10.0
        assert float(data["price"]) == 150.00
        assert float(data["total_amount"]) == 1500.00
        assert float(data["fees"]) == 9.99
        assert data["transaction_date"] == "2024-01-15"
        assert data["is_buy_transaction"] is True
        assert data["is_sell_transaction"] is False
        assert data["is_income_transaction"] is False

    def test_create_dividend_transaction_success(self, test_db, auth_headers, sample_dividend_transaction_data):
        """Test successful dividend transaction creation."""
        response = client.post(
            "/api/v1/transactions/", 
            json=sample_dividend_transaction_data, 
            headers=auth_headers
        )
        
        assert response.status_code == 201
        data = response.json()
        
        assert data["type"] == "dividend"
        assert data["symbol"] == "AAPL"
        assert data["quantity"] is None
        assert data["price"] is None
        assert float(data["total_amount"]) == 25.00
        assert data["is_income_transaction"] is True

    def test_create_transaction_creates_holding(self, test_db, auth_headers, sample_buy_transaction_data):
        """Test that buy transaction automatically creates holding."""
        # Verify no holdings exist initially
        holdings_response = client.get("/api/v1/holdings/", headers=auth_headers)
        assert len(holdings_response.json()["holdings"]) == 0
        
        # Create buy transaction
        response = client.post(
            "/api/v1/transactions/", 
            json=sample_buy_transaction_data, 
            headers=auth_headers
        )
        assert response.status_code == 201
        
        # Verify holding was created
        holdings_response = client.get("/api/v1/holdings/", headers=auth_headers)
        holdings_data = holdings_response.json()
        
        assert len(holdings_data["holdings"]) == 1
        holding = holdings_data["holdings"][0]
        assert holding["symbol"] == "AAPL"
        assert float(holding["quantity"]) == 10.0

    def test_create_transaction_updates_existing_holding(self, test_db, auth_headers, sample_buy_transaction_data):
        """Test that additional buy transactions update existing holdings."""
        # Create first transaction
        response1 = client.post(
            "/api/v1/transactions/", 
            json=sample_buy_transaction_data, 
            headers=auth_headers
        )
        assert response1.status_code == 201
        
        # Create second transaction for same symbol
        second_transaction = sample_buy_transaction_data.copy()
        second_transaction["quantity"] = 5.0
        second_transaction["total_amount"] = 750.00
        second_transaction["transaction_date"] = "2024-01-20"
        
        response2 = client.post(
            "/api/v1/transactions/", 
            json=second_transaction, 
            headers=auth_headers
        )
        assert response2.status_code == 201
        
        # Verify holding was updated, not duplicated
        holdings_response = client.get("/api/v1/holdings/", headers=auth_headers)
        holdings_data = holdings_response.json()
        
        assert len(holdings_data["holdings"]) == 1
        holding = holdings_data["holdings"][0]
        assert holding["symbol"] == "AAPL"
        assert float(holding["quantity"]) == 15.0  # 10 + 5

    def test_create_transaction_missing_required_fields(self, test_db, auth_headers, test_portfolio):
        """Test transaction creation with missing required fields."""
        incomplete_data = {
            "portfolio_id": test_portfolio.id,
            "type": "buy",
            "symbol": "AAPL"
            # Missing total_amount, transaction_date
        }
        
        response = client.post(
            "/api/v1/transactions/", 
            json=incomplete_data, 
            headers=auth_headers
        )
        
        assert response.status_code == 422

    def test_create_buy_transaction_missing_quantity(self, test_db, auth_headers, test_portfolio):
        """Test buy transaction creation without quantity fails."""
        invalid_data = {
            "portfolio_id": test_portfolio.id,
            "type": "buy",
            "symbol": "AAPL",
            "total_amount": 1500.00,
            "transaction_date": "2024-01-15"
            # Missing quantity and price for buy transaction
        }
        
        response = client.post(
            "/api/v1/transactions/", 
            json=invalid_data, 
            headers=auth_headers
        )
        
        assert response.status_code == 422

    def test_create_transaction_invalid_portfolio(self, test_db, auth_headers):
        """Test transaction creation with non-existent portfolio."""
        invalid_data = {
            "portfolio_id": 99999,
            "type": "buy",
            "symbol": "AAPL",
            "quantity": 10.0,
            "price": 150.00,
            "total_amount": 1500.00,
            "transaction_date": "2024-01-15"
        }
        
        response = client.post(
            "/api/v1/transactions/", 
            json=invalid_data, 
            headers=auth_headers
        )
        
        assert response.status_code == 404

    def test_create_transaction_unauthorized(self, test_db, sample_buy_transaction_data):
        """Test transaction creation without authentication."""
        response = client.post("/api/v1/transactions/", json=sample_buy_transaction_data)
        assert response.status_code == 401


class TestTransactionRetrieval:
    """Test transaction retrieval functionality."""

    def test_get_transactions_empty_list(self, test_db, auth_headers):
        """Test retrieving empty transactions list."""
        response = client.get("/api/v1/transactions/", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "transactions" in data
        assert data["transactions"] == []
        assert data["total_count"] == 0

    def test_get_transactions_with_data(self, test_db, auth_headers, sample_buy_transaction_data):
        """Test retrieving transactions with data."""
        # Create a transaction first
        create_response = client.post(
            "/api/v1/transactions/", 
            json=sample_buy_transaction_data, 
            headers=auth_headers
        )
        assert create_response.status_code == 201
        
        # Get transactions
        response = client.get("/api/v1/transactions/", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["transactions"]) == 1
        assert data["total_count"] == 1
        transaction = data["transactions"][0]
        assert transaction["symbol"] == "AAPL"
        assert transaction["type"] == "buy"

    def test_get_transaction_by_id(self, test_db, auth_headers, sample_buy_transaction_data):
        """Test retrieving specific transaction by ID."""
        # Create a transaction first
        create_response = client.post(
            "/api/v1/transactions/", 
            json=sample_buy_transaction_data, 
            headers=auth_headers
        )
        assert create_response.status_code == 201
        transaction_id = create_response.json()["id"]
        
        # Get specific transaction
        response = client.get(f"/api/v1/transactions/{transaction_id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == transaction_id
        assert data["symbol"] == "AAPL"

    def test_get_transaction_not_found(self, test_db, auth_headers):
        """Test retrieving non-existent transaction."""
        response = client.get("/api/v1/transactions/99999", headers=auth_headers)
        assert response.status_code == 404

    def test_get_transactions_with_filters(self, test_db, auth_headers, test_portfolio):
        """Test retrieving transactions with various filters."""
        # Create multiple transactions
        transactions_data = [
            {
                "portfolio_id": test_portfolio.id,
                "type": "buy",
                "symbol": "AAPL",
                "quantity": 10.0,
                "price": 150.00,
                "total_amount": 1500.00,
                "transaction_date": "2024-01-15"
            },
            {
                "portfolio_id": test_portfolio.id,
                "type": "sell",
                "symbol": "AAPL",
                "quantity": 5.0,
                "price": 160.00,
                "total_amount": 800.00,
                "transaction_date": "2024-02-15"
            },
            {
                "portfolio_id": test_portfolio.id,
                "type": "dividend",
                "symbol": "MSFT",
                "total_amount": 25.00,
                "transaction_date": "2024-01-20"
            }
        ]
        
        for trans_data in transactions_data:
            response = client.post("/api/v1/transactions/", json=trans_data, headers=auth_headers)
            assert response.status_code == 201
        
        # Test portfolio filter
        response = client.get(f"/api/v1/transactions/?portfolio_id={test_portfolio.id}", headers=auth_headers)
        assert response.status_code == 200
        assert len(response.json()["transactions"]) == 3
        
        # Test type filter
        response = client.get("/api/v1/transactions/?transaction_type=buy", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["transactions"]) == 1
        assert data["transactions"][0]["type"] == "buy"
        
        # Test symbol filter
        response = client.get("/api/v1/transactions/?symbol=AAPL", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["transactions"]) == 2
        
        # Test date range filter
        response = client.get(
            "/api/v1/transactions/?start_date=2024-02-01&end_date=2024-02-28", 
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["transactions"]) == 1
        assert data["transactions"][0]["type"] == "sell"

    def test_get_transactions_pagination(self, test_db, auth_headers, test_portfolio):
        """Test transaction list pagination."""
        # Create multiple transactions
        for i in range(15):
            trans_data = {
                "portfolio_id": test_portfolio.id,
                "type": "buy",
                "symbol": f"STOCK{i}",
                "quantity": 1.0,
                "price": 100.00,
                "total_amount": 100.00,
                "transaction_date": "2024-01-15"
            }
            response = client.post("/api/v1/transactions/", json=trans_data, headers=auth_headers)
            assert response.status_code == 201
        
        # Test first page
        response = client.get("/api/v1/transactions/?skip=0&limit=10", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["transactions"]) == 10
        assert data["has_next"] is True
        assert data["has_previous"] is False
        
        # Test second page
        response = client.get("/api/v1/transactions/?skip=10&limit=10", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["transactions"]) == 5
        assert data["has_next"] is False
        assert data["has_previous"] is True


class TestTransactionUpdate:
    """Test transaction update functionality."""

    def test_update_transaction_success(self, test_db, auth_headers, sample_buy_transaction_data):
        """Test successful transaction update."""
        # Create transaction first
        create_response = client.post(
            "/api/v1/transactions/", 
            json=sample_buy_transaction_data, 
            headers=auth_headers
        )
        assert create_response.status_code == 201
        transaction_id = create_response.json()["id"]
        
        # Update transaction
        update_data = {
            "notes": "Updated transaction notes",
            "fees": 5.99
        }
        
        response = client.put(
            f"/api/v1/transactions/{transaction_id}", 
            json=update_data, 
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["notes"] == "Updated transaction notes"
        assert float(data["fees"]) == 5.99

    def test_update_transaction_not_found(self, test_db, auth_headers):
        """Test updating non-existent transaction."""
        update_data = {"notes": "Updated notes"}
        
        response = client.put(
            "/api/v1/transactions/99999", 
            json=update_data, 
            headers=auth_headers
        )
        
        assert response.status_code == 404

    def test_update_transaction_unauthorized(self, test_db, sample_buy_transaction_data):
        """Test updating transaction without authentication."""
        update_data = {"notes": "Updated notes"}
        response = client.put("/api/v1/transactions/1", json=update_data)
        assert response.status_code == 401


class TestTransactionDeletion:
    """Test transaction deletion functionality."""

    def test_delete_transaction_success(self, test_db, auth_headers, sample_buy_transaction_data):
        """Test successful transaction deletion."""
        # Create transaction first
        create_response = client.post(
            "/api/v1/transactions/", 
            json=sample_buy_transaction_data, 
            headers=auth_headers
        )
        assert create_response.status_code == 201
        transaction_id = create_response.json()["id"]
        
        # Delete transaction
        response = client.delete(f"/api/v1/transactions/{transaction_id}", headers=auth_headers)
        
        assert response.status_code == 204
        
        # Verify transaction is no longer accessible
        get_response = client.get(f"/api/v1/transactions/{transaction_id}", headers=auth_headers)
        assert get_response.status_code == 404

    def test_delete_transaction_not_found(self, test_db, auth_headers):
        """Test deleting non-existent transaction."""
        response = client.delete("/api/v1/transactions/99999", headers=auth_headers)
        assert response.status_code == 404

    def test_delete_transaction_unauthorized(self, test_db):
        """Test deleting transaction without authentication."""
        response = client.delete("/api/v1/transactions/1")
        assert response.status_code == 401


class TestSellTransactionLogic:
    """Test sell transaction logic and holdings updates."""

    def test_sell_transaction_reduces_holding(self, test_db, auth_headers, sample_buy_transaction_data):
        """Test that sell transaction reduces existing holding."""
        # Create buy transaction first
        buy_response = client.post(
            "/api/v1/transactions/", 
            json=sample_buy_transaction_data, 
            headers=auth_headers
        )
        assert buy_response.status_code == 201
        
        # Verify holding exists
        holdings_response = client.get("/api/v1/holdings/", headers=auth_headers)
        assert len(holdings_response.json()["holdings"]) == 1
        holding = holdings_response.json()["holdings"][0]
        assert float(holding["quantity"]) == 10.0
        
        # Create sell transaction
        sell_data = {
            "portfolio_id": sample_buy_transaction_data["portfolio_id"],
            "type": "sell",
            "symbol": "AAPL",
            "quantity": 3.0,
            "price": 160.00,
            "total_amount": 480.00,
            "fees": 9.99,
            "transaction_date": "2024-02-15"
        }
        
        sell_response = client.post("/api/v1/transactions/", json=sell_data, headers=auth_headers)
        assert sell_response.status_code == 201
        
        # Verify holding quantity was reduced
        holdings_response = client.get("/api/v1/holdings/", headers=auth_headers)
        holding = holdings_response.json()["holdings"][0]
        assert float(holding["quantity"]) == 7.0  # 10 - 3

    def test_sell_transaction_without_holding_fails(self, test_db, auth_headers, test_portfolio):
        """Test that sell transaction fails without existing holding."""
        sell_data = {
            "portfolio_id": test_portfolio.id,
            "type": "sell",
            "symbol": "NONEXISTENT",
            "quantity": 10.0,
            "price": 100.00,
            "total_amount": 1000.00,
            "transaction_date": "2024-01-15"
        }
        
        response = client.post("/api/v1/transactions/", json=sell_data, headers=auth_headers)
        assert response.status_code == 400
        assert "no existing holding found" in response.json()["detail"]

    def test_sell_entire_position_removes_holding(self, test_db, auth_headers, sample_buy_transaction_data):
        """Test that selling entire position removes holding."""
        # Create buy transaction
        buy_response = client.post(
            "/api/v1/transactions/", 
            json=sample_buy_transaction_data, 
            headers=auth_headers
        )
        assert buy_response.status_code == 201
        
        # Sell entire position
        sell_data = {
            "portfolio_id": sample_buy_transaction_data["portfolio_id"],
            "type": "sell",
            "symbol": "AAPL",
            "quantity": 10.0,  # Entire position
            "price": 160.00,
            "total_amount": 1600.00,
            "fees": 9.99,
            "transaction_date": "2024-02-15"
        }
        
        sell_response = client.post("/api/v1/transactions/", json=sell_data, headers=auth_headers)
        assert sell_response.status_code == 201
        
        # Verify holding was removed (soft deleted)
        holdings_response = client.get("/api/v1/holdings/", headers=auth_headers)
        assert len(holdings_response.json()["holdings"]) == 0


class TestTransactionCalculations:
    """Test transaction calculation properties."""

    def test_transaction_net_amount_calculation(self, test_db, auth_headers, sample_buy_transaction_data):
        """Test net amount calculation for transactions."""
        response = client.post(
            "/api/v1/transactions/", 
            json=sample_buy_transaction_data, 
            headers=auth_headers
        )
        assert response.status_code == 201
        data = response.json()
        
        # For buy transaction: net_amount = total_amount + fees
        expected_net_amount = 1500.00 + 9.99
        assert float(data["net_amount"]) == expected_net_amount

    def test_transaction_effective_price_calculation(self, test_db, auth_headers, sample_buy_transaction_data):
        """Test effective price calculation including fees."""
        response = client.post(
            "/api/v1/transactions/", 
            json=sample_buy_transaction_data, 
            headers=auth_headers
        )
        assert response.status_code == 201
        data = response.json()
        
        # effective_price = net_amount / quantity
        expected_effective_price = (1500.00 + 9.99) / 10.0
        assert abs(float(data["effective_price"]) - expected_effective_price) < 0.01


class TestTransactionSecurity:
    """Test transaction security and access control."""

    def test_user_cannot_access_other_user_transactions(self, test_db):
        """Test that users cannot access other users' transactions."""
        # Create two users and portfolios
        user1 = User(
            email="user1@example.com",
            hashed_password=get_password_hash("password"),
            first_name="User",
            last_name="One",
            investment_experience="intermediate",
            risk_tolerance="moderate"
        )
        user2 = User(
            email="user2@example.com",
            hashed_password=get_password_hash("password"),
            first_name="User",
            last_name="Two",
            investment_experience="intermediate",
            risk_tolerance="moderate"
        )
        
        test_db.add(user1)
        test_db.add(user2)
        test_db.commit()
        test_db.refresh(user1)
        test_db.refresh(user2)
        
        portfolio1 = Portfolio(
            user_id=user1.id,
            name="User1 Portfolio",
            portfolio_type=PortfolioType.TAXABLE
        )
        portfolio2 = Portfolio(
            user_id=user2.id,
            name="User2 Portfolio",
            portfolio_type=PortfolioType.TAXABLE
        )
        
        test_db.add(portfolio1)
        test_db.add(portfolio2)
        test_db.commit()
        test_db.refresh(portfolio1)
        test_db.refresh(portfolio2)
        
        # Create auth headers for both users
        token1 = create_access_token(subject=user1.id)
        token2 = create_access_token(subject=user2.id)
        headers1 = {"Authorization": f"Bearer {token1}"}
        headers2 = {"Authorization": f"Bearer {token2}"}
        
        # User1 creates a transaction
        trans_data = {
            "portfolio_id": portfolio1.id,
            "type": "buy",
            "symbol": "AAPL",
            "quantity": 10.0,
            "price": 150.00,
            "total_amount": 1500.00,
            "transaction_date": "2024-01-15"
        }
        
        response = client.post("/api/v1/transactions/", json=trans_data, headers=headers1)
        assert response.status_code == 201
        transaction_id = response.json()["id"]
        
        # User2 should not be able to access User1's transaction
        response = client.get(f"/api/v1/transactions/{transaction_id}", headers=headers2)
        assert response.status_code == 404
        
        # User2 should not see User1's transactions in list
        response = client.get("/api/v1/transactions/", headers=headers2)
        assert response.status_code == 200
        assert len(response.json()["transactions"]) == 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])