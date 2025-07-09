# Comprehensive Testing Strategy - Enhanced Platform

## Executive Summary

This document outlines the comprehensive testing strategy for the enhanced financial adviser application targeting the $200k investor segment. The strategy emphasizes accuracy, reliability, and security testing appropriate for financial software while ensuring professional-grade user experience.

## Testing Philosophy

### Core Principles
- **Financial Accuracy**: Zero tolerance for calculation errors
- **Security First**: Comprehensive security testing for financial data
- **User Trust**: Rigorous testing to maintain user confidence
- **Regulatory Compliance**: Testing for financial industry standards
- **Performance Excellence**: Testing for professional-grade performance

### Quality Standards
- **99.9% Uptime**: Reliability testing for continuous operation
- **Sub-second Response**: Performance testing for real-time data
- **Zero Data Loss**: Comprehensive backup and recovery testing
- **Accessibility**: WCAG 2.1 AA compliance testing
- **Security**: Financial-grade security testing protocols

## Testing Pyramid Structure

### 1. Unit Testing (Foundation - 70% of tests)

#### Financial Calculation Testing
```python
# Example: Portfolio optimization calculation tests
def test_portfolio_optimization_accuracy():
    """Test modern portfolio theory calculations"""
    portfolio = Portfolio([
        Asset("VTI", weight=0.6, expected_return=0.08, volatility=0.15),
        Asset("BND", weight=0.4, expected_return=0.04, volatility=0.05)
    ])
    
    optimized = portfolio.optimize_sharpe_ratio()
    
    assert abs(optimized.expected_return - 0.064) < 0.001
    assert abs(optimized.volatility - 0.092) < 0.001
    assert abs(optimized.sharpe_ratio - 0.696) < 0.001

def test_tax_loss_harvesting_accuracy():
    """Test tax-loss harvesting calculations"""
    holding = Holding("ARKK", shares=100, cost_basis=150.00, current_price=125.00)
    
    tax_loss = calculate_tax_loss_harvesting(holding, tax_rate=0.35)
    
    assert tax_loss.unrealized_loss == -2500.00
    assert tax_loss.tax_savings == 875.00
    assert tax_loss.wash_sale_risk == "none"
```

#### Data Validation Testing
- **Input Validation**: Test all user input validation rules
- **Data Type Checking**: Ensure proper data type handling
- **Boundary Testing**: Test edge cases and limits
- **Error Handling**: Comprehensive error condition testing

#### Business Logic Testing
- **Goal Calculation**: Retirement, savings, and investment goal testing
- **Risk Assessment**: Risk tolerance and capacity calculations
- **Rebalancing Logic**: Asset allocation optimization testing
- **Performance Attribution**: Return calculation accuracy

### 2. Integration Testing (Integration - 20% of tests)

#### API Integration Testing
```python
# Example: Market data integration testing
def test_market_data_integration():
    """Test real-time market data integration"""
    market_client = MarketDataClient()
    
    # Test Alpha Vantage integration
    price_data = market_client.get_real_time_price("VTI")
    assert price_data.symbol == "VTI"
    assert price_data.price > 0
    assert price_data.timestamp is not None
    
    # Test failover to backup provider
    with mock.patch('market_client.alpha_vantage.get_price', side_effect=Exception):
        backup_data = market_client.get_real_time_price("VTI")
        assert backup_data.provider == "yahoo_finance"

def test_portfolio_account_integration():
    """Test multi-account portfolio integration"""
    user = create_test_user()
    
    # Add multiple accounts
    account1 = user.add_account("401k", AccountType.RETIREMENT)
    account2 = user.add_account("Roth IRA", AccountType.RETIREMENT)
    account3 = user.add_account("Taxable", AccountType.TAXABLE)
    
    # Test portfolio consolidation
    consolidated = user.get_consolidated_portfolio()
    assert len(consolidated.accounts) == 3
    assert consolidated.total_value > 0
```

#### Database Integration Testing
- **CRUD Operations**: Test all database operations
- **Transaction Integrity**: Ensure data consistency
- **Performance Testing**: Database query optimization
- **Migration Testing**: Database schema evolution

#### External Service Integration
- **Market Data APIs**: Alpha Vantage, Yahoo Finance, IEX Cloud
- **Authentication Services**: OAuth2, JWT token validation
- **Notification Services**: Email, push notifications
- **Export Services**: PDF generation, CSV export

### 3. End-to-End Testing (User Flows - 10% of tests)

#### Critical User Journeys
```typescript
// Example: Playwright E2E test
import { test, expect } from '@playwright/test';

test('complete portfolio optimization workflow', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password123');
  await page.click('[data-testid="login-button"]');
  
  // Navigate to portfolio
  await page.click('[data-testid="portfolio-nav"]');
  await expect(page).toHaveURL('/portfolio');
  
  // Add holdings
  await page.click('[data-testid="add-holding"]');
  await page.fill('[data-testid="symbol"]', 'VTI');
  await page.fill('[data-testid="shares"]', '100');
  await page.click('[data-testid="save-holding"]');
  
  // Run optimization
  await page.click('[data-testid="optimize-portfolio"]');
  await expect(page.locator('[data-testid="optimization-results"]')).toBeVisible();
  
  // Verify recommendations
  const recommendations = await page.locator('[data-testid="recommendation"]').count();
  expect(recommendations).toBeGreaterThan(0);
});
```

#### User Journey Testing
- **New User Onboarding**: Complete registration and setup flow
- **Portfolio Management**: Adding, editing, and optimizing portfolios
- **Goal Setting**: Creating and tracking financial goals
- **Reporting**: Generating and exporting reports
- **Settings Management**: User preferences and configurations

## Specialized Testing Categories

### 1. Financial Accuracy Testing

#### Calculation Validation
- **Mathematical Precision**: Floating-point arithmetic validation
- **Financial Formulas**: NPV, IRR, compound interest calculations
- **Tax Calculations**: After-tax returns, tax-loss harvesting
- **Risk Metrics**: Standard deviation, beta, correlation calculations

#### Data Integrity Testing
- **Historical Data**: Backtesting with known historical results
- **Real-Time Data**: Cross-validation with multiple data sources
- **Currency Handling**: Multi-currency support and conversion
- **Corporate Actions**: Dividend, split, and merger handling

### 2. Security Testing

#### Authentication and Authorization
```python
# Example: Security testing
def test_jwt_token_security():
    """Test JWT token validation and expiration"""
    user = create_test_user()
    
    # Generate token
    token = generate_jwt_token(user)
    assert validate_jwt_token(token) == user.id
    
    # Test token expiration
    expired_token = generate_jwt_token(user, expires_in=-3600)
    with pytest.raises(TokenExpiredError):
        validate_jwt_token(expired_token)
    
    # Test token tampering
    tampered_token = token[:-10] + "malicious"
    with pytest.raises(TokenValidationError):
        validate_jwt_token(tampered_token)
```

#### Data Protection Testing
- **Encryption Testing**: AES-256 encryption validation
- **Local Storage**: Secure local data storage testing
- **API Key Security**: Encrypted API key storage validation
- **Session Management**: Secure session handling

#### Penetration Testing
- **Input Validation**: SQL injection, XSS prevention
- **Authentication Bypass**: Security vulnerability testing
- **Data Exposure**: Sensitive data leakage prevention
- **Rate Limiting**: API abuse prevention

### 3. Performance Testing

#### Load Testing
```python
# Example: Load testing with locust
from locust import HttpUser, task, between

class FinancialAppUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        # Login
        self.client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "password123"
        })
    
    @task(3)
    def view_portfolio(self):
        """Test portfolio loading performance"""
        self.client.get("/api/portfolio")
    
    @task(1)
    def optimize_portfolio(self):
        """Test portfolio optimization performance"""
        self.client.post("/api/portfolio/optimize")
    
    @task(2)
    def get_market_data(self):
        """Test real-time market data performance"""
        self.client.get("/api/market/prices")
```

#### Performance Benchmarks
- **Page Load Time**: <2 seconds for all main pages
- **API Response Time**: <500ms for most endpoints
- **Real-Time Updates**: <5 seconds for live data
- **Report Generation**: <10 seconds for complex reports

#### Stress Testing
- **Concurrent Users**: 100+ simultaneous users
- **Data Volume**: Large portfolios (1000+ holdings)
- **Memory Usage**: Efficient memory management
- **Database Performance**: Query optimization under load

### 4. Accessibility Testing

#### WCAG 2.1 AA Compliance
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: ARIA labels and descriptions
- **Color Contrast**: 4.5:1 minimum contrast ratio
- **Font Size**: Scalable text up to 200%

#### Assistive Technology Testing
- **Screen Readers**: NVDA, JAWS, VoiceOver testing
- **Voice Recognition**: Dragon NaturallySpeaking support
- **Switch Navigation**: Alternative input device support
- **Zoom Software**: Magnification tool compatibility

### 5. Cross-Platform Testing

#### Browser Compatibility
- **Chrome**: Latest 2 versions
- **Firefox**: Latest 2 versions
- **Safari**: Latest 2 versions
- **Edge**: Latest 2 versions

#### Device Testing
- **Desktop**: Windows, macOS, Linux
- **Mobile**: iOS, Android responsive design
- **Tablet**: iPad, Android tablet optimization
- **Screen Sizes**: 320px to 4K resolution

## Test Automation Strategy

### 1. Continuous Integration Pipeline

#### Test Execution Flow
```yaml
# Example: GitHub Actions CI/CD
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Run Unit Tests
      run: |
        pytest tests/unit/ --cov=app --cov-report=xml
    
    - name: Run Integration Tests
      run: |
        pytest tests/integration/ --cov=app --cov-report=xml
    
    - name: Run E2E Tests
      run: |
        playwright test
    
    - name: Security Scan
      run: |
        bandit -r app/
        safety check
    
    - name: Performance Tests
      run: |
        locust --headless --users 10 --spawn-rate 1 -t 60s
```

#### Test Data Management
- **Test Fixtures**: Reusable test data sets
- **Data Factories**: Dynamic test data generation
- **Database Seeding**: Consistent test environment setup
- **Mock Services**: External API mocking

### 2. Test Environment Management

#### Environment Configuration
- **Development**: Local development testing
- **Staging**: Production-like environment testing
- **Production**: Minimal production monitoring
- **Testing**: Dedicated automated testing environment

#### Data Management
- **Test Data Isolation**: Separate test data from production
- **Database Refresh**: Regular test database updates
- **Privacy Compliance**: Synthetic data for testing
- **Backup Testing**: Regular backup and restore validation

## Quality Metrics and Reporting

### 1. Test Coverage Metrics

#### Code Coverage Targets
- **Unit Test Coverage**: 85%+ line coverage
- **Integration Coverage**: 70%+ functional coverage
- **E2E Coverage**: 90%+ critical path coverage
- **Security Coverage**: 100% security feature coverage

#### Quality Gates
- **Build Failure**: <5% test failure rate
- **Performance Regression**: <10% performance degradation
- **Security Vulnerabilities**: Zero high-severity issues
- **Accessibility**: 100% WCAG 2.1 AA compliance

### 2. Test Reporting Dashboard

#### Real-Time Metrics
- **Test Execution Status**: Pass/fail rates by category
- **Performance Trends**: Response time trends over time
- **Security Scan Results**: Vulnerability detection and resolution
- **Coverage Trends**: Test coverage evolution

#### Weekly Quality Reports
- **Test Summary**: Overall test health and trends
- **Performance Analysis**: Performance regression analysis
- **Security Assessment**: Security posture evaluation
- **User Experience**: Accessibility and usability testing results

## Risk-Based Testing Strategy

### 1. High-Risk Areas

#### Financial Calculations
- **Priority**: Critical
- **Testing Level**: Extensive unit and integration testing
- **Validation**: Multiple calculation method verification
- **Monitoring**: Real-time calculation accuracy monitoring

#### Security Features
- **Priority**: Critical
- **Testing Level**: Comprehensive security testing
- **Validation**: Penetration testing and vulnerability scanning
- **Monitoring**: Continuous security monitoring

#### Data Integrity
- **Priority**: High
- **Testing Level**: Comprehensive data validation testing
- **Validation**: Database integrity and backup testing
- **Monitoring**: Data consistency monitoring

### 2. Medium-Risk Areas

#### User Interface
- **Priority**: Medium
- **Testing Level**: Automated UI testing
- **Validation**: Cross-browser and device testing
- **Monitoring**: User experience monitoring

#### Performance
- **Priority**: Medium
- **Testing Level**: Load and performance testing
- **Validation**: Benchmark comparison testing
- **Monitoring**: Performance monitoring and alerting

## Implementation Timeline

### Phase 1: Foundation Testing (Months 1-2)
- Unit testing framework setup
- Integration testing infrastructure
- Basic security testing implementation
- CI/CD pipeline configuration

### Phase 2: Advanced Testing (Months 3-4)
- E2E testing framework implementation
- Performance testing setup
- Accessibility testing integration
- Security testing automation

### Phase 3: Optimization (Months 5-6)
- Test optimization and maintenance
- Advanced monitoring implementation
- Risk-based testing refinement
- Quality metrics dashboard

## Detailed Test Implementations

### 1. Unit Test Examples

#### Portfolio Optimization Tests
```python
# tests/unit/test_portfolio_optimizer.py
import pytest
import numpy as np
from unittest.mock import Mock, patch
from app.services.portfolio_optimizer import PortfolioOptimizer, OptimizationConstraints
from app.models.portfolio import Asset
from app.core.exceptions import OptimizationError

class TestPortfolioOptimizer:
    """Test suite for portfolio optimization functionality"""
    
    @pytest.fixture
    def optimizer(self):
        return PortfolioOptimizer(risk_free_rate=0.02)
    
    @pytest.fixture
    def sample_assets(self):
        return [
            Asset(symbol="VTI", expected_return=0.08, volatility=0.15, correlation_matrix={}),
            Asset(symbol="BND", expected_return=0.04, volatility=0.05, correlation_matrix={}),
            Asset(symbol="VEA", expected_return=0.07, volatility=0.18, correlation_matrix={})
        ]
    
    @pytest.fixture
    def sample_constraints(self):
        return OptimizationConstraints(
            min_weight=0.0,
            max_weight=0.6,
            sector_limits={"Stocks": (0.3, 0.8), "Bonds": (0.2, 0.5)},
            turnover_limit=0.1
        )
    
    def test_max_sharpe_optimization(self, optimizer, sample_assets, sample_constraints):
        """Test maximum Sharpe ratio optimization"""
        result = optimizer._run_optimization(
            sample_assets, 
            sample_constraints, 
            "max_sharpe"
        )
        
        # Verify weights sum to 1
        assert abs(sum(result.weights) - 1.0) < 1e-6
        
        # Verify weight constraints
        for weight in result.weights:
            assert sample_constraints.min_weight <= weight <= sample_constraints.max_weight
        
        # Verify portfolio metrics are reasonable
        assert result.expected_return > 0
        assert result.volatility > 0
        assert result.sharpe_ratio > 0
        
        # Verify Sharpe ratio is maximized (should be positive)
        assert result.sharpe_ratio > (result.expected_return - 0.02) / result.volatility - 0.01
    
    def test_min_volatility_optimization(self, optimizer, sample_assets, sample_constraints):
        """Test minimum volatility optimization"""
        result = optimizer._run_optimization(
            sample_assets,
            sample_constraints,
            "min_volatility"
        )
        
        # Verify this is actually lower volatility than equal weight
        equal_weight_vol = optimizer._calculate_equal_weight_volatility(sample_assets)
        assert result.volatility <= equal_weight_vol
        
        # Verify portfolio is well-diversified (no single asset > 60%)
        assert all(weight <= 0.6 for weight in result.weights)
    
    def test_constraint_violations(self, optimizer, sample_assets):
        """Test that constraint violations are handled properly"""
        # Test impossible constraints
        impossible_constraints = OptimizationConstraints(
            min_weight=0.5,  # 3 assets * 0.5 = 1.5 > 1.0
            max_weight=0.5
        )
        
        with pytest.raises(OptimizationError):
            optimizer._run_optimization(
                sample_assets,
                impossible_constraints,
                "max_sharpe"
            )
    
    def test_covariance_matrix_calculation(self, optimizer, sample_assets):
        """Test covariance matrix calculation"""
        with patch.object(optimizer, '_fetch_historical_returns') as mock_fetch:
            # Mock historical returns
            mock_returns = np.array([
                [0.01, 0.02, 0.015],  # Day 1
                [0.005, 0.01, 0.008], # Day 2
                [-0.01, 0.005, -0.005], # Day 3
                [0.02, 0.015, 0.018]   # Day 4
            ])
            mock_fetch.return_value = mock_returns
            
            cov_matrix = optimizer.calculate_covariance_matrix(sample_assets)
            
            # Verify covariance matrix properties
            assert cov_matrix.shape == (3, 3)
            assert np.allclose(cov_matrix, cov_matrix.T)  # Symmetric
            assert np.all(np.linalg.eigvals(cov_matrix) >= 0)  # Positive semi-definite
    
    def test_efficient_frontier_generation(self, optimizer, sample_assets):
        """Test efficient frontier calculation"""
        frontier = optimizer.efficient_frontier(sample_assets, num_portfolios=10)
        
        assert len(frontier) <= 10  # May be fewer due to infeasible points
        assert all(point.expected_return > 0 for point in frontier)
        assert all(point.volatility > 0 for point in frontier)
        
        # Verify frontier is sorted by return
        returns = [point.expected_return for point in frontier]
        assert returns == sorted(returns)
    
    @patch('app.services.portfolio_optimizer.asyncio.get_event_loop')
    async def test_async_optimization(self, mock_loop, optimizer, sample_assets, sample_constraints):
        """Test async optimization execution"""
        mock_executor = Mock()
        mock_loop.return_value.run_in_executor.return_value = Mock(
            weights=np.array([0.4, 0.3, 0.3]),
            expected_return=0.065,
            volatility=0.12,
            sharpe_ratio=0.375
        )
        
        result = await optimizer.optimize_portfolio(
            portfolio_id="test-123",
            assets=sample_assets,
            constraints=sample_constraints,
            objective="max_sharpe"
        )
        
        assert result.weights is not None
        assert result.expected_return > 0
        assert result.volatility > 0
```

#### Real-Time Market Data Tests
```python
# tests/unit/test_market_data_service.py
import pytest
import asyncio
import json
from unittest.mock import Mock, AsyncMock, patch
from app.services.market_data_service import MarketDataService, MarketDataPoint
from datetime import datetime

class TestMarketDataService:
    """Test suite for real-time market data service"""
    
    @pytest.fixture
    def market_service(self):
        return MarketDataService()
    
    @pytest.fixture
    def sample_market_data(self):
        return {
            "VTI": MarketDataPoint(
                symbol="VTI",
                price=235.67,
                volume=1000000,
                timestamp=datetime.now(),
                change=2.34,
                change_percent=1.0,
                bid=235.65,
                ask=235.68,
                market_cap=1500000000000,
                pe_ratio=18.5
            )
        }
    
    @pytest.mark.asyncio
    async def test_market_data_initialization(self, market_service):
        """Test market data service initialization"""
        with patch('aioredis.create_redis_pool') as mock_redis:
            mock_redis.return_value = Mock()
            await market_service.initialize()
            
            assert market_service.redis is not None
            mock_redis.assert_called_once_with('redis://localhost')
    
    @pytest.mark.asyncio
    async def test_client_subscription(self, market_service):
        """Test client subscription to market data"""
        client_id = "test-client-123"
        symbols = ["VTI", "BND", "VEA"]
        
        await market_service.subscribe_client(client_id, symbols)
        
        # Verify subscriptions were added
        for symbol in symbols:
            assert client_id in market_service.subscriptions.get(symbol, set())
    
    @pytest.mark.asyncio
    async def test_price_update_broadcast(self, market_service, sample_market_data):
        """Test price update broadcasting to clients"""
        # Setup mock WebSocket connection
        mock_websocket = AsyncMock()
        client_id = "test-client-123"
        
        market_service.websocket_connections[client_id] = mock_websocket
        market_service.subscriptions["VTI"] = {client_id}
        
        # Broadcast update
        await market_service._broadcast_updates(sample_market_data)
        
        # Verify WebSocket send was called
        mock_websocket.send.assert_called_once()
        
        # Verify message format
        sent_message = json.loads(mock_websocket.send.call_args[0][0])
        assert sent_message["type"] == "price_update"
        assert sent_message["symbol"] == "VTI"
        assert sent_message["data"]["price"] == 235.67
    
    @pytest.mark.asyncio
    async def test_provider_failover(self, market_service):
        """Test failover between market data providers"""
        symbols = ["VTI", "BND"]
        
        # Mock providers with first one failing
        mock_provider1 = Mock()
        mock_provider1.get_real_time_data.side_effect = Exception("Provider 1 failed")
        
        mock_provider2 = Mock()
        mock_provider2.get_real_time_data.return_value = {
            "VTI": MarketDataPoint(symbol="VTI", price=235.67, volume=1000, timestamp=datetime.now(), change=1.0, change_percent=0.5, bid=235.0, ask=236.0)
        }
        
        market_service.providers = [mock_provider1, mock_provider2]
        
        result = await market_service._fetch_with_failover(symbols)
        
        # Verify failover worked
        assert "VTI" in result
        assert result["VTI"].price == 235.67
        mock_provider1.get_real_time_data.assert_called_once_with(symbols)
        mock_provider2.get_real_time_data.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_websocket_connection_cleanup(self, market_service):
        """Test WebSocket connection cleanup"""
        client_id = "test-client-123"
        mock_websocket = AsyncMock()
        
        # Setup connection and subscriptions
        market_service.websocket_connections[client_id] = mock_websocket
        market_service.subscriptions["VTI"] = {client_id}
        market_service.subscriptions["BND"] = {client_id}
        
        # Cleanup
        market_service._cleanup_client_subscriptions(client_id)
        
        # Verify cleanup
        assert client_id not in market_service.websocket_connections
        assert client_id not in market_service.subscriptions.get("VTI", set())
        assert client_id not in market_service.subscriptions.get("BND", set())
```

#### Tax Optimization Tests
```python
# tests/unit/test_tax_optimizer.py
import pytest
from datetime import datetime, timedelta
from unittest.mock import Mock, AsyncMock, patch
from app.services.tax_optimizer import TaxOptimizer, TaxLossOpportunity
from app.models.holding import Holding, TaxLot
from app.models.transaction import Transaction

class TestTaxOptimizer:
    """Test suite for tax optimization functionality"""
    
    @pytest.fixture
    def tax_optimizer(self):
        return TaxOptimizer()
    
    @pytest.fixture
    def sample_holding_with_loss(self):
        return Holding(
            id="holding-123",
            symbol="ARKK",
            shares=100,
            current_price=125.00,
            tax_lots=[
                TaxLot(
                    id="lot-1",
                    shares=100,
                    cost_basis=15000,  # $150 per share
                    purchase_date=datetime.now() - timedelta(days=200),
                    current_value=12500  # $125 per share
                )
            ]
        )
    
    @pytest.fixture
    def sample_transactions(self):
        return [
            Transaction(
                id="tx-1",
                symbol="ARKK",
                transaction_type="BUY",
                shares=50,
                price=140.00,
                date=datetime.now() - timedelta(days=20),
                total_amount=7000
            ),
            Transaction(
                id="tx-2",
                symbol="ARKK",
                transaction_type="SELL",
                shares=25,
                price=130.00,
                date=datetime.now() - timedelta(days=10),
                total_amount=3250
            )
        ]
    
    @pytest.mark.asyncio
    async def test_tax_loss_opportunity_identification(self, tax_optimizer, sample_holding_with_loss):
        """Test identification of tax-loss harvesting opportunities"""
        with patch.object(tax_optimizer, '_get_detailed_holdings') as mock_holdings:
            with patch.object(tax_optimizer, '_get_recent_transactions') as mock_transactions:
                mock_holdings.return_value = [sample_holding_with_loss]
                mock_transactions.return_value = []
                
                opportunities = await tax_optimizer.analyze_tax_loss_opportunities(
                    user_id="user-123",
                    portfolio_id="portfolio-123",
                    tax_rate_short=0.37,
                    tax_rate_long=0.20
                )
                
                assert len(opportunities) == 1
                opportunity = opportunities[0]
                
                # Verify opportunity details
                assert opportunity.symbol == "ARKK"
                assert opportunity.unrealized_loss == 2500.0  # (150 - 125) * 100
                assert opportunity.tax_savings == 500.0  # 2500 * 0.20 (long-term)
                assert opportunity.wash_sale_risk == "LOW"
    
    def test_wash_sale_risk_assessment(self, tax_optimizer, sample_holding_with_loss, sample_transactions):
        """Test wash sale risk assessment"""
        # Test high risk scenario (recent purchase)
        recent_purchase = Transaction(
            symbol="ARKK",
            transaction_type="BUY",
            shares=50,
            price=140.00,
            date=datetime.now() - timedelta(days=10),
            total_amount=7000
        )
        
        risk = tax_optimizer._assess_wash_sale_risk(
            "ARKK",
            sample_holding_with_loss.tax_lots[0].purchase_date,
            [recent_purchase]
        )
        
        assert risk.risk_level == "HIGH"
        assert len(risk.recent_purchases) == 1
        assert risk.recent_purchases[0].symbol == "ARKK"
    
    @pytest.mark.asyncio
    async def test_replacement_securities_identification(self, tax_optimizer):
        """Test identification of replacement securities"""
        with patch.object(tax_optimizer, 'get_asset_information') as mock_asset_info:
            with patch.object(tax_optimizer, 'find_similar_assets') as mock_similar:
                with patch.object(tax_optimizer, 'calculate_correlation') as mock_correlation:
                    # Mock asset information
                    mock_asset_info.return_value = Mock(
                        asset_class="US_EQUITY",
                        sector="TECHNOLOGY",
                        market_cap="LARGE"
                    )
                    
                    # Mock similar assets
                    mock_similar.return_value = [
                        Mock(symbol="VTI", name="Total Stock Market", expense_ratio=0.03),
                        Mock(symbol="QQQ", name="Nasdaq 100", expense_ratio=0.20)
                    ]
                    
                    # Mock correlations
                    mock_correlation.side_effect = [0.85, 0.75]
                    
                    replacement_options = await tax_optimizer.find_replacement_securities(
                        sample_holding_with_loss
                    )
                    
                    assert len(replacement_options) == 2
                    assert replacement_options[0].symbol == "VTI"
                    assert replacement_options[0].correlation == 0.85
                    assert replacement_options[1].symbol == "QQQ"
                    assert replacement_options[1].correlation == 0.75
    
    def test_asset_location_optimization(self, tax_optimizer):
        """Test asset location optimization across account types"""
        # Mock accounts
        taxable_account = Mock(
            type="TAXABLE",
            current_value=100000,
            tax_treatment="taxable"
        )
        
        tax_deferred_account = Mock(
            type="TRADITIONAL_IRA",
            current_value=50000,
            tax_treatment="tax_deferred"
        )
        
        tax_free_account = Mock(
            type="ROTH_IRA",
            current_value=25000,
            tax_treatment="tax_free"
        )
        
        accounts = [taxable_account, tax_deferred_account, tax_free_account]
        
        # Target allocation
        target_allocation = {
            "US_STOCKS": 0.6,
            "INTERNATIONAL_STOCKS": 0.2,
            "BONDS": 0.2
        }
        
        # Asset tax efficiency scores (lower = more tax efficient)
        asset_scores = {
            "US_STOCKS": 0.3,  # Tax efficient
            "INTERNATIONAL_STOCKS": 0.7,  # Tax inefficient
            "BONDS": 0.8  # Very tax inefficient
        }
        
        with patch.object(tax_optimizer, '_calculate_asset_tax_efficiency') as mock_scores:
            mock_scores.return_value = asset_scores
            
            placement_plan = tax_optimizer._optimize_asset_placement(
                target_allocation,
                asset_scores,
                [taxable_account],
                [tax_deferred_account],
                [tax_free_account],
                175000  # Total value
            )
            
            # Verify tax-inefficient assets are placed in tax-advantaged accounts
            assert placement_plan.get_allocation("BONDS", "tax_free") > 0
            assert placement_plan.get_allocation("INTERNATIONAL_STOCKS", "tax_deferred") > 0
            assert placement_plan.get_allocation("US_STOCKS", "taxable") > 0
```

### 2. Integration Test Examples

#### API Integration Tests
```python
# tests/integration/test_portfolio_api.py
import pytest
import asyncio
from httpx import AsyncClient
from app.main import app
from app.core.config import settings
from app.models.portfolio import Portfolio
from app.models.user import User

class TestPortfolioAPI:
    """Integration tests for portfolio API endpoints"""
    
    @pytest.fixture
    async def client(self):
        async with AsyncClient(app=app, base_url="http://test") as ac:
            yield ac
    
    @pytest.fixture
    async def authenticated_user(self, client):
        # Create test user
        user_data = {
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Test User"
        }
        
        # Register user
        response = await client.post("/api/v1/auth/register", json=user_data)
        assert response.status_code == 201
        
        # Login user
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        
        response = await client.post("/api/v1/auth/login", json=login_data)
        assert response.status_code == 200
        
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
    
    @pytest.mark.asyncio
    async def test_create_portfolio(self, client, authenticated_user):
        """Test portfolio creation via API"""
        portfolio_data = {
            "name": "Test Portfolio",
            "description": "A test portfolio",
            "risk_tolerance": "moderate",
            "investment_horizon": "long_term"
        }
        
        response = await client.post(
            "/api/v1/portfolios",
            json=portfolio_data,
            headers=authenticated_user
        )
        
        assert response.status_code == 201
        
        data = response.json()
        assert data["name"] == portfolio_data["name"]
        assert data["description"] == portfolio_data["description"]
        assert "id" in data
        assert "created_at" in data
    
    @pytest.mark.asyncio
    async def test_portfolio_optimization(self, client, authenticated_user):
        """Test portfolio optimization endpoint"""
        # First create a portfolio
        portfolio_data = {
            "name": "Optimization Test Portfolio",
            "description": "Portfolio for optimization testing"
        }
        
        create_response = await client.post(
            "/api/v1/portfolios",
            json=portfolio_data,
            headers=authenticated_user
        )
        portfolio_id = create_response.json()["id"]
        
        # Add some holdings
        holdings_data = [
            {
                "symbol": "VTI",
                "shares": 100,
                "purchase_price": 200.00,
                "purchase_date": "2023-01-01"
            },
            {
                "symbol": "BND",
                "shares": 200,
                "purchase_price": 80.00,
                "purchase_date": "2023-01-01"
            }
        ]
        
        for holding in holdings_data:
            await client.post(
                f"/api/v1/portfolios/{portfolio_id}/holdings",
                json=holding,
                headers=authenticated_user
            )
        
        # Run optimization
        optimization_request = {
            "portfolio_id": portfolio_id,
            "objective": "max_sharpe",
            "constraints": {
                "min_weight": 0.0,
                "max_weight": 0.8
            }
        }
        
        response = await client.post(
            "/api/v1/portfolio/optimize",
            json=optimization_request,
            headers=authenticated_user
        )
        
        assert response.status_code == 200
        
        data = response.json()
        assert "optimization_id" in data
        assert "optimal_allocation" in data
        assert "expected_return" in data
        assert "volatility" in data
        assert "sharpe_ratio" in data
        assert "efficient_frontier" in data
        
        # Verify allocation weights sum to 1
        weights = list(data["optimal_allocation"].values())
        assert abs(sum(weights) - 1.0) < 0.01
    
    @pytest.mark.asyncio
    async def test_tax_loss_harvesting(self, client, authenticated_user):
        """Test tax-loss harvesting endpoint"""
        # Create portfolio with holdings that have losses
        portfolio_data = {"name": "Tax Loss Portfolio"}
        create_response = await client.post(
            "/api/v1/portfolios",
            json=portfolio_data,
            headers=authenticated_user
        )
        portfolio_id = create_response.json()["id"]
        
        # Add holding with simulated loss
        holding_data = {
            "symbol": "ARKK",
            "shares": 100,
            "purchase_price": 150.00,
            "current_price": 125.00,  # $25 loss per share
            "purchase_date": "2023-01-01"
        }
        
        await client.post(
            f"/api/v1/portfolios/{portfolio_id}/holdings",
            json=holding_data,
            headers=authenticated_user
        )
        
        # Request tax-loss harvesting analysis
        request_data = {
            "portfolio_id": portfolio_id,
            "tax_rate_short": 0.37,
            "tax_rate_long": 0.20,
            "min_loss_threshold": 100.0,
            "include_wash_sale_analysis": True
        }
        
        response = await client.get(
            "/api/v1/tax/loss-harvesting",
            params=request_data,
            headers=authenticated_user
        )
        
        assert response.status_code == 200
        
        data = response.json()
        assert "opportunities" in data
        assert "total_potential_savings" in data
        assert "total_harvestable_loss" in data
        assert "summary" in data
        
        if data["opportunities"]:
            opportunity = data["opportunities"][0]
            assert "symbol" in opportunity
            assert "unrealized_loss" in opportunity
            assert "tax_savings" in opportunity
            assert "wash_sale_risk" in opportunity
            assert "replacement_options" in opportunity
```

#### WebSocket Integration Tests
```python
# tests/integration/test_websocket_market_data.py
import pytest
import asyncio
import json
from fastapi.testclient import TestClient
from app.main import app
from app.services.market_data_service import MarketDataService

class TestWebSocketMarketData:
    """Integration tests for WebSocket market data"""
    
    @pytest.fixture
    def client(self):
        return TestClient(app)
    
    @pytest.fixture
    def auth_token(self):
        # Mock authentication token
        return "test-token-123"
    
    @pytest.mark.asyncio
    async def test_websocket_connection(self, client, auth_token):
        """Test WebSocket connection establishment"""
        with client.websocket_connect(f"/ws/market-data?token={auth_token}") as websocket:
            # Test connection establishment
            data = websocket.receive_json()
            assert data["type"] == "connection_established"
            assert "client_id" in data
    
    @pytest.mark.asyncio
    async def test_market_data_subscription(self, client, auth_token):
        """Test market data subscription flow"""
        with client.websocket_connect(f"/ws/market-data?token={auth_token}") as websocket:
            # Receive connection confirmation
            websocket.receive_json()
            
            # Subscribe to symbols
            subscription_message = {
                "type": "subscribe",
                "symbols": ["VTI", "BND"],
                "data_types": ["price", "quote"]
            }
            
            websocket.send_json(subscription_message)
            
            # Should receive subscription confirmation
            response = websocket.receive_json()
            assert response["type"] == "subscription_confirmed"
            assert set(response["symbols"]) == {"VTI", "BND"}
    
    @pytest.mark.asyncio
    async def test_real_time_price_updates(self, client, auth_token):
        """Test real-time price update delivery"""
        with client.websocket_connect(f"/ws/market-data?token={auth_token}") as websocket:
            # Setup subscription
            websocket.receive_json()  # Connection established
            
            subscription_message = {
                "type": "subscribe",
                "symbols": ["VTI"],
                "data_types": ["price"]
            }
            websocket.send_json(subscription_message)
            websocket.receive_json()  # Subscription confirmed
            
            # Simulate price update from market data service
            market_service = MarketDataService()
            
            # Mock price update
            price_update = {
                "symbol": "VTI",
                "price": 235.67,
                "change": 2.34,
                "change_percent": 1.0,
                "timestamp": "2023-01-01T12:00:00Z"
            }
            
            # This would normally be triggered by the market data fetcher
            await market_service._broadcast_updates({"VTI": price_update})
            
            # Verify client receives update
            update_message = websocket.receive_json()
            assert update_message["type"] == "price_update"
            assert update_message["symbol"] == "VTI"
            assert update_message["data"]["price"] == 235.67
```

### 3. End-to-End Test Examples

#### Complete User Workflow Tests
```typescript
// tests/e2e/portfolio-optimization.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Portfolio Optimization Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'testpassword123');
    await page.click('[data-testid="login-button"]');
    
    // Wait for dashboard to load
    await page.waitForURL('/dashboard');
  });

  test('complete portfolio optimization workflow', async ({ page }) => {
    // Navigate to portfolio creation
    await page.click('[data-testid="create-portfolio-button"]');
    
    // Fill portfolio creation form
    await page.fill('[data-testid="portfolio-name"]', 'E2E Test Portfolio');
    await page.fill('[data-testid="portfolio-description"]', 'End-to-end test portfolio');
    await page.selectOption('[data-testid="risk-tolerance"]', 'moderate');
    await page.click('[data-testid="create-portfolio-submit"]');
    
    // Wait for portfolio creation and redirect
    await page.waitForURL(/\/portfolio\/[a-zA-Z0-9-]+/);
    
    // Add holdings
    await page.click('[data-testid="add-holding-button"]');
    
    // Add first holding
    await page.fill('[data-testid="holding-symbol"]', 'VTI');
    await page.fill('[data-testid="holding-shares"]', '100');
    await page.fill('[data-testid="holding-price"]', '200.00');
    await page.click('[data-testid="add-holding-submit"]');
    
    // Wait for holding to appear in table
    await expect(page.locator('[data-testid="holdings-table"]')).toContainText('VTI');
    
    // Add second holding
    await page.click('[data-testid="add-holding-button"]');
    await page.fill('[data-testid="holding-symbol"]', 'BND');
    await page.fill('[data-testid="holding-shares"]', '250');
    await page.fill('[data-testid="holding-price"]', '80.00');
    await page.click('[data-testid="add-holding-submit"]');
    
    // Wait for second holding to appear
    await expect(page.locator('[data-testid="holdings-table"]')).toContainText('BND');
    
    // Run portfolio optimization
    await page.click('[data-testid="optimize-portfolio-button"]');
    
    // Configure optimization parameters
    await page.selectOption('[data-testid="optimization-objective"]', 'max_sharpe');
    await page.fill('[data-testid="min-weight"]', '0.0');
    await page.fill('[data-testid="max-weight"]', '0.8');
    await page.click('[data-testid="run-optimization-button"]');
    
    // Wait for optimization results
    await page.waitForSelector('[data-testid="optimization-results"]', { timeout: 30000 });
    
    // Verify optimization results are displayed
    await expect(page.locator('[data-testid="optimal-allocation"]')).toBeVisible();
    await expect(page.locator('[data-testid="expected-return"]')).toBeVisible();
    await expect(page.locator('[data-testid="portfolio-volatility"]')).toBeVisible();
    await expect(page.locator('[data-testid="sharpe-ratio"]')).toBeVisible();
    
    // Verify efficient frontier chart is displayed
    await expect(page.locator('[data-testid="efficient-frontier-chart"]')).toBeVisible();
    
    // Verify rebalancing recommendations
    await expect(page.locator('[data-testid="rebalancing-trades"]')).toBeVisible();
    
    // Accept optimization and implement rebalancing
    await page.click('[data-testid="implement-rebalancing-button"]');
    
    // Confirm rebalancing
    await page.click('[data-testid="confirm-rebalancing-button"]');
    
    // Wait for rebalancing completion
    await page.waitForSelector('[data-testid="rebalancing-success"]', { timeout: 10000 });
    
    // Verify portfolio allocation has been updated
    const allocationChart = page.locator('[data-testid="allocation-chart"]');
    await expect(allocationChart).toBeVisible();
    
    // Verify portfolio performance metrics are updated
    await expect(page.locator('[data-testid="portfolio-total-value"]')).toBeVisible();
    await expect(page.locator('[data-testid="portfolio-daily-return"]')).toBeVisible();
  });

  test('tax-loss harvesting workflow', async ({ page }) => {
    // Navigate to existing portfolio with losses
    await page.goto('/portfolio/test-portfolio-with-losses');
    
    // Navigate to tax optimization section
    await page.click('[data-testid="tax-optimization-tab"]');
    
    // Configure tax rates
    await page.fill('[data-testid="short-term-tax-rate"]', '0.37');
    await page.fill('[data-testid="long-term-tax-rate"]', '0.20');
    await page.fill('[data-testid="min-loss-threshold"]', '500');
    
    // Run tax-loss harvesting analysis
    await page.click('[data-testid="analyze-tax-losses-button"]');
    
    // Wait for analysis results
    await page.waitForSelector('[data-testid="tax-loss-opportunities"]', { timeout: 15000 });
    
    // Verify opportunities are displayed
    await expect(page.locator('[data-testid="opportunity-card"]')).toHaveCount(3);
    
    // Check first opportunity details
    const firstOpportunity = page.locator('[data-testid="opportunity-card"]').first();
    await expect(firstOpportunity.locator('[data-testid="opportunity-symbol"]')).toBeVisible();
    await expect(firstOpportunity.locator('[data-testid="unrealized-loss"]')).toBeVisible();
    await expect(firstOpportunity.locator('[data-testid="tax-savings"]')).toBeVisible();
    await expect(firstOpportunity.locator('[data-testid="wash-sale-risk"]')).toBeVisible();
    
    // View replacement options
    await firstOpportunity.locator('[data-testid="view-replacements-button"]').click();
    
    // Verify replacement securities are shown
    await expect(page.locator('[data-testid="replacement-options"]')).toBeVisible();
    await expect(page.locator('[data-testid="replacement-option"]')).toHaveCount(3);
    
    // Select replacement security
    await page.locator('[data-testid="replacement-option"]').first().click();
    await page.click('[data-testid="select-replacement-button"]');
    
    // Harvest tax loss
    await page.click('[data-testid="harvest-loss-button"]');
    
    // Confirm harvesting
    await page.click('[data-testid="confirm-harvest-button"]');
    
    // Wait for harvesting completion
    await page.waitForSelector('[data-testid="harvesting-success"]', { timeout: 10000 });
    
    // Verify transaction was recorded
    await page.click('[data-testid="transactions-tab"]');
    await expect(page.locator('[data-testid="transaction-row"]')).toHaveCount(2); // Sell + Buy
    
    // Verify tax savings summary
    await page.click('[data-testid="tax-summary-tab"]');
    await expect(page.locator('[data-testid="total-tax-savings"]')).toBeVisible();
    await expect(page.locator('[data-testid="harvested-losses"]')).toBeVisible();
  });
});
```

### 4. Performance Test Examples

#### Load Testing Implementation
```python
# tests/performance/test_load_performance.py
import asyncio
import time
from concurrent.futures import ThreadPoolExecutor
from locust import HttpUser, task, between
from locust.clients import HttpSession

class PortfolioUser(HttpUser):
    """Simulated user for portfolio operations"""
    
    wait_time = between(1, 3)
    
    def on_start(self):
        """Login user on start"""
        self.login()
    
    def login(self):
        """Authenticate user"""
        response = self.client.post("/api/v1/auth/login", json={
            "email": f"loadtest{self.user_id}@example.com",
            "password": "testpassword123"
        })
        
        if response.status_code == 200:
            self.token = response.json()["access_token"]
            self.client.headers.update({"Authorization": f"Bearer {self.token}"})
        else:
            self.token = None
    
    @task(3)
    def view_portfolio(self):
        """View portfolio dashboard"""
        if self.token:
            self.client.get("/api/v1/portfolios")
    
    @task(2)
    def view_holdings(self):
        """View portfolio holdings"""
        if self.token:
            self.client.get("/api/v1/portfolios/default/holdings")
    
    @task(1)
    def optimize_portfolio(self):
        """Run portfolio optimization"""
        if self.token:
            self.client.post("/api/v1/portfolio/optimize", json={
                "portfolio_id": "default",
                "objective": "max_sharpe",
                "constraints": {
                    "min_weight": 0.0,
                    "max_weight": 0.8
                }
            })
    
    @task(1)
    def tax_loss_analysis(self):
        """Run tax-loss harvesting analysis"""
        if self.token:
            self.client.get("/api/v1/tax/loss-harvesting", params={
                "portfolio_id": "default",
                "tax_rate_short": 0.37,
                "tax_rate_long": 0.20,
                "min_loss_threshold": 100.0
            })
    
    @task(4)
    def get_market_data(self):
        """Fetch real-time market data"""
        if self.token:
            self.client.get("/api/v1/market-data/quotes", params={
                "symbols": "VTI,BND,VEA,VWO,VXUS"
            })

class StressTestUser(HttpUser):
    """High-frequency user for stress testing"""
    
    wait_time = between(0.1, 0.5)
    
    def on_start(self):
        self.login()
    
    def login(self):
        response = self.client.post("/api/v1/auth/login", json={
            "email": f"stresstest{self.user_id}@example.com",
            "password": "testpassword123"
        })
        
        if response.status_code == 200:
            self.token = response.json()["access_token"]
            self.client.headers.update({"Authorization": f"Bearer {self.token}"})
    
    @task(10)
    def rapid_portfolio_access(self):
        """Rapidly access portfolio data"""
        if self.token:
            self.client.get("/api/v1/portfolios/default")
    
    @task(5)
    def rapid_market_data_access(self):
        """Rapidly access market data"""
        if self.token:
            self.client.get("/api/v1/market-data/quotes?symbols=VTI")
```

### 5. Test Fixtures and Data Management

#### Test Data Factory
```python
# tests/fixtures/data_factory.py
import factory
from datetime import datetime, timedelta
from app.models.user import User
from app.models.portfolio import Portfolio
from app.models.holding import Holding, TaxLot
from app.models.transaction import Transaction

class UserFactory(factory.Factory):
    """Factory for creating test users"""
    
    class Meta:
        model = User
    
    email = factory.Sequence(lambda n: f"user{n}@example.com")
    full_name = factory.Faker('name')
    password_hash = factory.LazyFunction(lambda: "$2b$12$sample_hash")
    is_active = True
    created_at = factory.LazyFunction(datetime.now)
    updated_at = factory.LazyFunction(datetime.now)

class PortfolioFactory(factory.Factory):
    """Factory for creating test portfolios"""
    
    class Meta:
        model = Portfolio
    
    name = factory.Sequence(lambda n: f"Test Portfolio {n}")
    description = factory.Faker('sentence')
    risk_tolerance = factory.Iterator(['conservative', 'moderate', 'aggressive'])
    investment_horizon = factory.Iterator(['short_term', 'medium_term', 'long_term'])
    total_value = factory.Faker('pydecimal', left_digits=6, right_digits=2, positive=True)
    created_at = factory.LazyFunction(datetime.now)
    updated_at = factory.LazyFunction(datetime.now)

class HoldingFactory(factory.Factory):
    """Factory for creating test holdings"""
    
    class Meta:
        model = Holding
    
    symbol = factory.Iterator(['VTI', 'BND', 'VEA', 'VWO', 'VXUS', 'QQQ', 'SPY'])
    shares = factory.Faker('pyint', min_value=1, max_value=1000)
    current_price = factory.Faker('pydecimal', left_digits=3, right_digits=2, positive=True)
    purchase_date = factory.LazyFunction(lambda: datetime.now() - timedelta(days=100))
    created_at = factory.LazyFunction(datetime.now)
    updated_at = factory.LazyFunction(datetime.now)

class TaxLotFactory(factory.Factory):
    """Factory for creating test tax lots"""
    
    class Meta:
        model = TaxLot
    
    shares = factory.Faker('pyint', min_value=1, max_value=100)
    cost_basis = factory.Faker('pydecimal', left_digits=5, right_digits=2, positive=True)
    purchase_date = factory.LazyFunction(lambda: datetime.now() - timedelta(days=200))
    current_value = factory.LazyAttribute(lambda obj: obj.shares * obj.cost_basis * 0.9)  # 10% loss

class TransactionFactory(factory.Factory):
    """Factory for creating test transactions"""
    
    class Meta:
        model = Transaction
    
    symbol = factory.Iterator(['VTI', 'BND', 'VEA', 'VWO'])
    transaction_type = factory.Iterator(['BUY', 'SELL', 'DIVIDEND'])
    shares = factory.Faker('pyint', min_value=1, max_value=100)
    price = factory.Faker('pydecimal', left_digits=3, right_digits=2, positive=True)
    total_amount = factory.LazyAttribute(lambda obj: obj.shares * obj.price)
    date = factory.LazyFunction(lambda: datetime.now() - timedelta(days=30))
    created_at = factory.LazyFunction(datetime.now)
```

#### Test Database Management
```python
# tests/fixtures/database.py
import pytest
import asyncio
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.database import Base, get_db
from app.core.config import settings

# Test database URL
TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

# Create async engine for testing
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    future=True
)

# Create async session factory
TestSessionLocal = sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
async def setup_database():
    """Setup test database"""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield
    
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture
async def db_session(setup_database):
    """Create database session for testing"""
    async with TestSessionLocal() as session:
        yield session

@pytest.fixture
def override_get_db(db_session):
    """Override database dependency for testing"""
    def _override_get_db():
        return db_session
    
    return _override_get_db
```

This comprehensive testing strategy ensures that the enhanced financial adviser application meets the highest standards of accuracy, security, and user experience expected by sophisticated investors with $200k+ portfolios. The detailed test implementations provide robust coverage across all layers of the application, from individual component unit tests to complete end-to-end workflow testing.