# Project Structure

## Directory Organization

```
cli-financial-advisor/
├── src/cli_advisor/           # Main application package
│   ├── main.py               # CLI entry point and command definitions
│   ├── commands/             # Command implementations
│   ├── core/                 # Business logic and data models
│   │   ├── models.py         # Data models and schemas
│   │   ├── storage.py        # Database operations
│   │   └── encryption.py     # Security and encryption utilities
│   ├── ui/                   # User interface components
│   │   └── prompts.py        # Interactive prompts and formatting
│   └── config/               # Configuration management
├── tests/                    # Test suite
├── scripts/                  # Development and deployment scripts
│   ├── setup-dev.sh         # Development environment setup
│   ├── pre-commit-check.sh  # Code quality checks
│   └── test-integration.sh  # Integration testing
├── assets/                   # Static assets and resources
├── error_images/             # Error screenshots and debugging aids
└── docs/                     # Documentation (if present)
```

## Architecture Patterns

### Layered Architecture
- **CLI Layer** (`main.py`): Command-line interface and user interaction
- **Command Layer** (`commands/`): Command implementations and orchestration
- **Core Layer** (`core/`): Business logic, data models, and storage
- **UI Layer** (`ui/`): User interface components and formatting

### Key Modules

#### `main.py`
- CLI entry point using Click framework
- Command group definitions and routing
- Global CLI options and configuration

#### `core/models.py`
- Pydantic data models for validation
- SQLAlchemy ORM models for persistence
- Business entity definitions

#### `core/storage.py`
- Database operations and queries
- Data persistence layer
- Transaction management

#### `core/encryption.py`
- AES-256 encryption for sensitive data
- Key management and security utilities
- Privacy-focused data handling

#### `ui/prompts.py`
- Rich-based terminal formatting
- Interactive user prompts
- Progress bars and visual feedback

## Naming Conventions

- **Files**: snake_case (e.g., `user_profile.py`)
- **Classes**: PascalCase (e.g., `UserProfile`)
- **Functions/Variables**: snake_case (e.g., `get_user_profile`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_RISK_TOLERANCE`)
- **CLI Commands**: kebab-case (e.g., `add-holding`)

## Import Organization

1. Standard library imports
2. Third-party library imports
3. Local application imports

Use absolute imports from the `cli_advisor` package root.

## Configuration Management

- Use `pyproject.toml` for project configuration
- Environment-specific settings in `config/` module
- No hardcoded secrets or sensitive data in source code