# Design Document

## Overview

The CLI Financial Advisor is a command-line application that provides personalized financial advice and portfolio management for individual investors. The system transforms the complex web-based financial management application into a streamlined, privacy-focused CLI tool that runs entirely on the user's local machine.

The application follows a modular architecture with clear separation between data storage, business logic, and user interface layers. It uses Python as the primary language with Click for CLI framework, providing an intuitive command structure and rich terminal output.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLI Interface Layer                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │   Commands  │ │  Formatters │ │    Interactive Prompts  ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │ Recommendation│ Portfolio   │ │    Goal Management      ││
│  │    Engine     │ Analytics   │ │                         ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │   Models    │ │  Storage    │ │    Encryption           ││
│  │             │ │  Manager    │ │                         ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Language**: Python 3.11+
- **CLI Framework**: Click 8.0+ for command structure and argument parsing
- **Data Storage**: SQLite with SQLAlchemy ORM for local data persistence
- **Encryption**: cryptography library for AES-256 encryption of sensitive data
- **Output Formatting**: Rich library for beautiful terminal output and tables
- **Configuration**: TOML format for user preferences and settings
- **Testing**: pytest for comprehensive test coverage

### Directory Structure

```
cli-financial-advisor/
├── src/
│   ├── cli_advisor/
│   │   ├── __init__.py
│   │   ├── main.py              # Main CLI entry point
│   │   ├── commands/            # CLI command modules
│   │   │   ├── __init__.py
│   │   │   ├── setup.py         # Profile setup commands
│   │   │   ├── portfolio.py     # Portfolio management commands
│   │   │   ├── goals.py         # Goal management commands
│   │   │   ├── analysis.py      # Analysis and reporting commands
│   │   │   └── utils.py         # Utility commands
│   │   ├── core/                # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── models.py        # Data models
│   │   │   ├── storage.py       # Data persistence layer
│   │   │   ├── recommendations.py # Recommendation engine
│   │   │   ├── analytics.py     # Portfolio analytics
│   │   │   └── encryption.py    # Data encryption utilities
│   │   ├── ui/                  # User interface components
│   │   │   ├── __init__.py
│   │   │   ├── formatters.py    # Output formatting
│   │   │   ├── prompts.py       # Interactive prompts
│   │   │   └── tables.py        # Table display utilities
│   │   └── config/              # Configuration management
│   │       ├── __init__.py
│   │       └── settings.py      # Application settings
├── tests/                       # Test suite
├── docs/                        # Documentation
├── pyproject.toml              # Project configuration
└── README.md
```

## Components and Interfaces

### CLI Interface Layer

#### Command Structure
The application uses a hierarchical command structure:

```
financial-advisor
├── setup                    # Initial profile setup
├── profile                  # Profile management
│   ├── show                # Display current profile
│   └── update              # Update profile settings
├── portfolio               # Portfolio management
│   ├── add-holding         # Add new holding
│   ├── list-holdings       # List all holdings
│   ├── update-holding      # Update existing holding
│   ├── remove-holding      # Remove holding
│   └── summary             # Portfolio summary
├── goals                   # Goal management
│   ├── add                 # Add new goal
│   ├── list                # List all goals
│   ├── update              # Update goal progress
│   ├── remove              # Remove goal
│   └── suggest             # Suggest goals based on profile
├── analyze                 # Analysis commands
│   ├── portfolio           # Portfolio analysis
│   ├── recommendations     # Get recommendations
│   ├── risk                # Risk analysis
│   └── allocation          # Asset allocation analysis
├── reports                 # Reporting commands
│   ├── performance         # Performance report
│   ├── export              # Export data to CSV
│   └── backup              # Create encrypted backup
└── learn                   # Educational content
    ├── concepts            # Investment concepts
    └── glossary            # Financial terms glossary
```

#### Interactive Prompts Interface
```python
class PromptInterface:
    def get_user_profile() -> UserProfile
    def get_holding_details() -> HoldingData
    def get_goal_details() -> GoalData
    def confirm_action(message: str) -> bool
    def select_from_options(options: List[str]) -> str
```

#### Output Formatting Interface
```python
class FormatterInterface:
    def format_portfolio_summary(portfolio: Portfolio) -> str
    def format_recommendations(recommendations: List[Recommendation]) -> str
    def format_goals_table(goals: List[Goal]) -> str
    def format_holdings_table(holdings: List[Holding]) -> str
```

### Business Logic Layer

#### Recommendation Engine
The recommendation engine analyzes user profile and portfolio to generate personalized advice:

```python
class RecommendationEngine:
    def generate_recommendations(
        user_profile: UserProfile, 
        portfolio: Portfolio
    ) -> List[Recommendation]
    
    def analyze_asset_allocation(portfolio: Portfolio) -> AllocationAnalysis
    def assess_risk_level(portfolio: Portfolio) -> RiskAssessment
    def suggest_rebalancing(portfolio: Portfolio, target_allocation: dict) -> List[RebalanceAction]
    def identify_tax_opportunities(portfolio: Portfolio) -> List[TaxOptimization]
```

#### Portfolio Analytics
Provides comprehensive portfolio analysis and performance metrics:

```python
class PortfolioAnalytics:
    def calculate_total_value(holdings: List[Holding]) -> Decimal
    def calculate_returns(holdings: List[Holding]) -> PerformanceMetrics
    def analyze_diversification(holdings: List[Holding]) -> DiversificationScore
    def calculate_risk_metrics(holdings: List[Holding]) -> RiskMetrics
    def generate_allocation_breakdown(holdings: List[Holding]) -> AllocationBreakdown
```

#### Goal Management
Handles financial goal tracking and progress analysis:

```python
class GoalManager:
    def suggest_goals(user_profile: UserProfile) -> List[GoalSuggestion]
    def calculate_progress(goal: Goal, current_savings: Decimal) -> GoalProgress
    def estimate_timeline(goal: Goal, monthly_contribution: Decimal) -> TimelineEstimate
    def assess_feasibility(goals: List[Goal], income: Decimal) -> FeasibilityAnalysis
```

### Data Layer

#### Data Models
Core data structures representing financial entities:

```python
@dataclass
class UserProfile:
    name: str
    age: int
    income_range: str
    experience_level: str
    risk_tolerance: str
    financial_goals: List[str]
    time_horizon: str
    major_purchases: List[str]

@dataclass
class Holding:
    id: str
    symbol: str
    quantity: Decimal
    purchase_price: Decimal
    purchase_date: date
    current_price: Optional[Decimal] = None

@dataclass
class Goal:
    id: str
    name: str
    category: str
    target_amount: Decimal
    target_date: date
    current_amount: Decimal = Decimal('0')

@dataclass
class Recommendation:
    id: str
    type: str
    priority: str
    title: str
    description: str
    reasoning: str
    action_items: List[str]
    implemented: bool = False
```

#### Storage Manager
Handles data persistence with encryption:

```python
class StorageManager:
    def save_user_profile(profile: UserProfile) -> None
    def load_user_profile() -> Optional[UserProfile]
    def save_holdings(holdings: List[Holding]) -> None
    def load_holdings() -> List[Holding]
    def save_goals(goals: List[Goal]) -> None
    def load_goals() -> List[Goal]
    def create_backup() -> str
    def restore_from_backup(backup_path: str) -> None
```

#### Encryption Layer
Provides secure storage for sensitive financial data:

```python
class EncryptionManager:
    def encrypt_data(data: bytes, key: bytes) -> bytes
    def decrypt_data(encrypted_data: bytes, key: bytes) -> bytes
    def generate_key() -> bytes
    def derive_key_from_password(password: str) -> bytes
```

## Data Models

### User Profile Schema
```sql
CREATE TABLE user_profiles (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    income_range TEXT NOT NULL,
    experience_level TEXT NOT NULL,
    risk_tolerance TEXT NOT NULL,
    financial_goals TEXT NOT NULL,  -- JSON array
    time_horizon TEXT NOT NULL,
    major_purchases TEXT,           -- JSON array
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Holdings Schema
```sql
CREATE TABLE holdings (
    id TEXT PRIMARY KEY,
    symbol TEXT NOT NULL,
    security_name TEXT,
    quantity DECIMAL(15,6) NOT NULL,
    purchase_price DECIMAL(15,4) NOT NULL,
    purchase_date DATE NOT NULL,
    current_price DECIMAL(15,4),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Goals Schema
```sql
CREATE TABLE goals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL,
    target_date DATE NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Recommendations Schema
```sql
CREATE TABLE recommendations (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    priority TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reasoning TEXT NOT NULL,
    action_items TEXT NOT NULL,  -- JSON array
    implemented BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    implemented_at TIMESTAMP
);
```

## Error Handling

### Error Categories
1. **User Input Errors**: Invalid commands, malformed data, missing required fields
2. **Data Validation Errors**: Invalid security symbols, negative amounts, future dates
3. **Storage Errors**: File system issues, encryption/decryption failures
4. **Business Logic Errors**: Impossible goals, conflicting recommendations

### Error Handling Strategy
```python
class FinancialAdvisorError(Exception):
    """Base exception for financial advisor application"""
    pass

class ValidationError(FinancialAdvisorError):
    """Raised when user input validation fails"""
    pass

class StorageError(FinancialAdvisorError):
    """Raised when data storage operations fail"""
    pass

class RecommendationError(FinancialAdvisorError):
    """Raised when recommendation generation fails"""
    pass
```

### Error Recovery
- Graceful degradation when optional features fail
- Clear error messages with suggested solutions
- Automatic retry for transient failures
- Data integrity checks and recovery procedures

## Testing Strategy

### Unit Testing
**Scope**: Test all business logic components in isolation using pytest framework

**Core Components to Test**:
- **RecommendationEngine**: Test recommendation generation with various user profiles and portfolio compositions
  - Mock portfolio data with different risk levels and allocations
  - Verify recommendation priorities and categories are correctly assigned
  - Test edge cases like empty portfolios or extreme risk tolerances
- **PortfolioAnalytics**: Test all calculation methods with known inputs and expected outputs
  - Test total value calculations with various holding combinations
  - Verify return percentage calculations with positive and negative scenarios
  - Test diversification scoring with concentrated vs. diversified portfolios
- **GoalManager**: Test goal suggestion and progress calculation logic
  - Mock user profiles with different demographics and verify appropriate goal suggestions
  - Test timeline calculations with various contribution amounts
  - Test feasibility analysis with realistic and unrealistic goal combinations
- **StorageManager**: Test data persistence operations with mocked file system
  - Test save/load operations for all data types
  - Verify data integrity after round-trip serialization
  - Test error handling for file system failures
- **EncryptionManager**: Test encryption/decryption with known test vectors
  - Verify data can be encrypted and decrypted correctly
  - Test key derivation from passwords
  - Test handling of corrupted encrypted data

**Testing Approach**:
- Use pytest fixtures for common test data (sample portfolios, user profiles)
- Mock external dependencies using unittest.mock
- Parametrize tests to cover multiple scenarios efficiently
- Achieve 90%+ code coverage with focus on critical financial calculations
- Test both happy path and error conditions for each component
- **Database Isolation**: Use in-memory SQLite databases for unit tests to avoid conflicts
- **Parallel Testing**: Each test gets its own isolated database instance, enabling full parallelization with pytest-xdist

### Integration Testing
**Scope**: Test complete workflows from CLI commands through data persistence

**CLI Command Testing**:
- **Setup Command Integration**: Test complete profile setup workflow
  - Use Click's testing utilities to simulate user input
  - Verify profile data is correctly saved to storage
  - Test validation of invalid inputs during setup
- **Portfolio Command Integration**: Test holding management workflows
  - Test add-holding command with various security types
  - Verify holdings are persisted and can be retrieved
  - Test portfolio summary generation with real data
- **Goal Command Integration**: Test goal management workflows
  - Test goal creation, update, and deletion workflows
  - Verify goal progress calculations update correctly
  - Test goal suggestion integration with user profile data
- **Analysis Command Integration**: Test recommendation generation workflows
  - Test end-to-end recommendation generation with real portfolio data
  - Verify recommendations are based on actual user profile and holdings
  - Test recommendation tracking and implementation detection

**Data Flow Testing**:
- **Storage Integration**: Test data persistence across application restarts
  - Create test data, restart application, verify data is correctly loaded
  - Test backup and restore operations with real encrypted files
  - Test data migration scenarios for schema changes
  - **Database Isolation**: Use temporary directories for integration tests to avoid conflicts
  - **Parallel Integration Testing**: Each integration test uses unique temporary database files
- **Encryption Integration**: Test encrypted storage with real file operations
  - Test encryption/decryption with actual file system operations
  - Verify encrypted files cannot be read without proper keys
  - Test password-based key derivation in realistic scenarios

**Error Handling Integration**:
- Test graceful handling of corrupted data files
- Test behavior when storage directory is not writable
- Test recovery from partial data corruption scenarios

### User Acceptance Testing
**Scope**: Test complete user journeys from first-time setup to ongoing portfolio management

**User Journey Testing**:
- **New User Onboarding**: Test complete setup process for different user types
  - Beginner investor with simple goals
  - Experienced investor with complex portfolio
  - User with specific major purchase timeline
- **Daily Usage Workflows**: Test common user interactions
  - Adding new holdings after purchases
  - Checking portfolio performance
  - Reviewing and acting on recommendations
- **Goal Management Workflows**: Test goal-related user journeys
  - Setting up retirement planning goals
  - Tracking progress toward major purchase goals
  - Adjusting goals based on changing circumstances

**Output Validation**:
- Verify all CLI output is properly formatted and readable
- Test table formatting with various data sizes
- Validate educational content is accurate and helpful
- Test interactive prompts provide clear guidance

**Usability Testing**:
- Test command discoverability and help system
- Verify error messages are clear and actionable
- Test tab completion and command shortcuts
- Validate overall user experience flow

### Performance Testing
**Scope**: Ensure application performs well with realistic data volumes

**Load Testing**:
- Test with large portfolios (1000+ holdings) to verify performance scales
- Measure recommendation generation time with complex portfolios
- Test backup and restore operations with large datasets
- Validate memory usage remains reasonable with large data sets

**Benchmark Testing**:
- Establish performance baselines for key operations
- Test portfolio analysis performance with various portfolio sizes
- Measure startup time and command response times
- Monitor resource usage during intensive operations

**Stress Testing**:
- Test application behavior with extremely large datasets
- Test concurrent access scenarios (multiple CLI instances)
- Test behavior under low memory conditions
- Validate graceful degradation when resources are constrained

## Security Considerations

### Data Protection
- All sensitive financial data encrypted at rest using AES-256
- User-provided encryption password for data access
- No network communication - fully offline operation
- Secure deletion of temporary files and memory

### Input Validation
- Sanitize all user inputs to prevent injection attacks
- Validate financial data ranges and formats
- Implement rate limiting for resource-intensive operations
- Secure handling of file system operations

### Privacy
- No telemetry or usage tracking
- No external API calls for market data (user provides prices)
- Local-only data storage with user-controlled backups
- Clear data retention and deletion policies