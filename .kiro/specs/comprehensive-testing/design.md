# Design Document

## Overview

This design outlines a comprehensive testing strategy for the CLI Financial Advisor application. The approach focuses on fixing existing test failures, achieving high test coverage across all modules, and establishing robust testing infrastructure. The design follows a layered testing approach with unit tests, integration tests, and end-to-end CLI tests.

## Architecture

### Testing Pyramid Structure

```
    E2E CLI Tests
   ┌─────────────────┐
   │  Full Workflows │  ← Complete user journeys
   └─────────────────┘
  ┌───────────────────┐
  │ Integration Tests │   ← Module interactions
  └───────────────────┘
 ┌─────────────────────┐
 │    Unit Tests       │    ← Individual functions/classes
 └─────────────────────┘
```

### Test Organization

```
tests/
├── unit/                    # Unit tests for individual components
│   ├── core/               # Core business logic tests
│   │   ├── test_models.py
│   │   ├── test_analytics.py
│   │   ├── test_recommendations.py
│   │   ├── test_storage.py
│   │   └── test_encryption.py
│   ├── commands/           # CLI command tests
│   │   ├── test_setup.py
│   │   ├── test_profile.py
│   │   ├── test_portfolio.py
│   │   ├── test_goals.py
│   │   ├── test_analysis.py
│   │   ├── test_reports.py
│   │   ├── test_learn.py
│   │   └── test_utils.py
│   └── ui/                 # UI component tests
│       ├── test_prompts.py
│       ├── test_formatters.py
│       └── test_tables.py
├── integration/            # Integration tests
│   ├── test_workflows.py   # End-to-end workflows
│   ├── test_data_flow.py   # Data persistence flows
│   └── test_cli_integration.py
├── fixtures/               # Test data and fixtures
│   ├── sample_data.py
│   ├── test_profiles.py
│   └── mock_data.py
└── utils/                  # Test utilities
    ├── test_helpers.py
    ├── cli_runner.py
    └── assertions.py
```

## Components and Interfaces

### Test Infrastructure Components

#### 1. Enhanced Test Fixtures
```python
@pytest.fixture
def temp_storage():
    """Isolated storage for each test."""
    
@pytest.fixture
def sample_user_profile():
    """Realistic user profile data."""
    
@pytest.fixture
def sample_portfolio():
    """Diversified portfolio for testing."""
    
@pytest.fixture
def cli_runner():
    """CLI testing utility."""
```

#### 2. Test Data Builders
```python
class ProfileBuilder:
    """Builder pattern for creating test profiles."""
    
class PortfolioBuilder:
    """Builder pattern for creating test portfolios."""
    
class GoalBuilder:
    """Builder pattern for creating test goals."""
```

#### 3. CLI Testing Framework
```python
class CLITestRunner:
    """Wrapper for testing CLI commands."""
    
    def run_command(self, command: str, input_data: str = None)
    def assert_success(self, result)
    def assert_error(self, result, expected_message: str)
```

#### 4. Mock Services
```python
class MockStorageManager:
    """Mock storage for isolated testing."""
    
class MockEncryptionManager:
    """Mock encryption for testing."""
```

### Core Module Testing Strategy

#### 1. Models Testing
- **Validation Testing**: All field validators and business rules
- **Property Testing**: Calculated properties and derived values
- **Relationship Testing**: Model relationships and foreign keys
- **Serialization Testing**: JSON serialization/deserialization

#### 2. Analytics Testing
- **Calculation Accuracy**: All financial calculations with edge cases
- **Performance Testing**: Large portfolio handling
- **Data Type Consistency**: Decimal/float handling throughout
- **Edge Case Testing**: Empty portfolios, single holdings, extreme values

#### 3. Recommendations Testing
- **Algorithm Testing**: Recommendation generation logic
- **Context Testing**: Different user profiles and scenarios
- **Priority Testing**: Recommendation sorting and prioritization
- **Action Items Testing**: Actionable recommendation content

#### 4. Storage Testing
- **CRUD Operations**: All database operations
- **Transaction Testing**: Data consistency and rollback
- **Migration Testing**: Schema changes and data migration
- **Concurrency Testing**: Multiple access scenarios

#### 5. Encryption Testing
- **Security Testing**: Encryption/decryption accuracy
- **Key Management**: Key generation and storage
- **Performance Testing**: Encryption overhead
- **Compatibility Testing**: Cross-platform encryption

### Command Module Testing Strategy

#### 1. Setup Command Testing
- **Profile Creation**: New user onboarding flow
- **Profile Updates**: Existing profile modification
- **Validation Testing**: Input validation and error handling
- **Interactive Flow**: Menu navigation and user input

#### 2. Portfolio Command Testing
- **Holding Management**: Add, update, remove holdings
- **Data Validation**: Symbol validation, price validation
- **Portfolio Display**: Summary and detailed views
- **Error Scenarios**: Invalid inputs, missing data

#### 3. Analysis Command Testing
- **Report Generation**: All analysis reports
- **Recommendation Display**: Recommendation formatting
- **Interactive Analysis**: User-driven analysis flows
- **Performance Testing**: Large portfolio analysis

#### 4. Goals Command Testing
- **Goal Management**: CRUD operations for goals
- **Progress Tracking**: Goal progress calculations
- **Recommendation Integration**: Goal-based recommendations
- **Timeline Management**: Goal deadline handling

## Data Models

### Test Data Schema

```python
@dataclass
class TestScenario:
    """Test scenario configuration."""
    name: str
    description: str
    user_profile: UserProfile
    holdings: List[Holding]
    goals: List[Goal]
    expected_recommendations: int
    expected_risk_level: str

@dataclass
class CLITestCase:
    """CLI command test case."""
    command: str
    inputs: List[str]
    expected_output: str
    expected_exit_code: int
    setup_data: Optional[dict] = None
```

### Mock Data Patterns

```python
class TestDataFactory:
    """Factory for creating consistent test data."""
    
    @staticmethod
    def create_conservative_profile() -> UserProfile
    
    @staticmethod
    def create_diversified_portfolio() -> List[Holding]
    
    @staticmethod
    def create_retirement_goals() -> List[Goal]
```

## Error Handling

### Test Error Scenarios

1. **Data Validation Errors**
   - Invalid user inputs
   - Malformed data structures
   - Type conversion errors

2. **Storage Errors**
   - Database connection failures
   - Disk space issues
   - Permission errors

3. **Calculation Errors**
   - Division by zero
   - Overflow conditions
   - Invalid mathematical operations

4. **CLI Interaction Errors**
   - Interrupted user input
   - Invalid command arguments
   - Missing required data

### Error Testing Strategy

```python
class ErrorTestMixin:
    """Mixin for consistent error testing."""
    
    def assert_validation_error(self, func, *args, **kwargs)
    def assert_storage_error(self, operation, expected_error)
    def assert_cli_error(self, command, expected_message)
```

## Testing Strategy

### Phase 1: Fix Existing Tests
1. **Decimal/Float Type Issues**: Fix arithmetic operations in recommendations
2. **Model Default Values**: Ensure proper initialization of model fields
3. **Analytics Logic**: Correct best/worst performer calculations
4. **Test Data Consistency**: Align test expectations with actual calculations

### Phase 2: Core Module Coverage
1. **Storage Module**: Complete CRUD operation testing
2. **Encryption Module**: Security and performance testing
3. **Analytics Module**: Edge cases and performance testing
4. **Models Module**: Comprehensive validation testing

### Phase 3: Command Module Coverage
1. **Setup Commands**: User onboarding flows
2. **Portfolio Commands**: Holding management operations
3. **Analysis Commands**: Report generation and recommendations
4. **Utility Commands**: System operations and maintenance

### Phase 4: Integration Testing
1. **Workflow Testing**: Complete user journeys
2. **Data Flow Testing**: Cross-module data consistency
3. **CLI Integration**: Menu navigation and command execution
4. **Performance Testing**: Large dataset handling

### Phase 5: Test Infrastructure
1. **Test Utilities**: Helper functions and assertions
2. **Mock Services**: Isolated testing components
3. **Test Data Management**: Consistent and realistic test data
4. **CI/CD Integration**: Automated test execution

## Performance Considerations

### Test Execution Performance
- **Parallel Execution**: Use pytest-xdist for parallel test runs
- **Test Isolation**: Minimize test interdependencies
- **Resource Management**: Proper cleanup of test resources
- **Selective Testing**: Ability to run specific test suites

### Application Performance Testing
- **Large Portfolio Testing**: 1000+ holdings performance
- **Memory Usage Testing**: Memory leak detection
- **Database Performance**: Query optimization validation
- **Encryption Performance**: Security operation overhead

## Security Testing

### Data Security Validation
- **Encryption Correctness**: Verify encrypted data cannot be read without keys
- **Key Management**: Secure key generation and storage
- **Data Sanitization**: Ensure sensitive data is properly cleaned
- **Access Control**: Validate data access restrictions

### Input Security Testing
- **SQL Injection**: Database query safety
- **Path Traversal**: File operation security
- **Input Validation**: Malicious input handling
- **Error Information**: Prevent information leakage in errors

## Monitoring and Reporting

### Coverage Reporting
- **Line Coverage**: Target 90%+ line coverage
- **Branch Coverage**: Critical decision point coverage
- **Function Coverage**: All public functions tested
- **Module Coverage**: No modules below 80% coverage

### Test Quality Metrics
- **Test Execution Time**: Monitor test performance
- **Test Reliability**: Track flaky test occurrences
- **Test Maintenance**: Measure test update frequency
- **Bug Detection**: Track bugs caught by tests vs. production

### Continuous Integration
- **Automated Execution**: Run tests on every commit
- **Quality Gates**: Prevent merging with failing tests
- **Performance Monitoring**: Track test execution trends
- **Coverage Tracking**: Monitor coverage changes over time