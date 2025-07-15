# Technology Stack

## Core Technologies

- **Python 3.11+**: Modern Python with type hints and latest features
- **Click**: Powerful CLI framework for command-line interfaces
- **SQLAlchemy 2.0+**: Database ORM for data persistence
- **Rich**: Beautiful terminal output, tables, and progress bars
- **Cryptography**: AES-256 encryption for sensitive financial data
- **Pydantic 2.0+**: Data validation and serialization

## Build System

- **Build Backend**: Hatchling (modern Python packaging)
- **Package Manager**: pip (standard Python package installation)
- **Project Configuration**: pyproject.toml (PEP 518 compliant)

## Development Tools

- **Testing**: pytest with coverage reporting
- **Code Formatting**: Black (88 character line length)
- **Import Sorting**: isort (Black-compatible profile)
- **Linting**: Ruff (fast Python linter)
- **Type Checking**: mypy (strict type checking enabled)

## Common Commands

### Installation & Setup
```bash
# Install from source
pip install -e .

# Install with development dependencies
pip install -e ".[dev]"
```

### Development Workflow
```bash
# Run tests
pytest

# Run tests with coverage
pytest --cov=cli_advisor --cov-report=html

# Format code
black src/ tests/
isort src/ tests/

# Lint code
ruff check src/ tests/

# Type checking
mypy src/
```

### Application Usage
```bash
# Main CLI entry point
financial-advisor --help

# Common commands
financial-advisor setup
financial-advisor portfolio add-holding
financial-advisor analyze recommendations
```

## Code Quality Standards

- **Line Length**: 88 characters (Black standard)
- **Type Hints**: Required for all functions and methods
- **Test Coverage**: Maintain high coverage with pytest
- **Documentation**: Docstrings for all public functions
- **Security**: All sensitive data must be encrypted before storage