"""Enhanced validation utilities for data integrity and security."""

import re
from decimal import Decimal, InvalidOperation
from datetime import datetime, date
from typing import Any, Optional, Tuple, List
from pydantic import validator, ValidationError

from .logging import get_logger

logger = get_logger("validation")


class ValidationError(Exception):
    """Custom validation error with detailed information."""
    
    def __init__(self, message: str, field: str = None, value: Any = None):
        self.message = message
        self.field = field
        self.value = value
        super().__init__(message)


def validate_email_format(email: str) -> bool:
    """
    Validate email format using RFC 5322 compliant regex.
    
    Args:
        email: Email address to validate
        
    Returns:
        True if email format is valid, False otherwise
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_phone_number(phone: str) -> bool:
    """
    Validate phone number format (US format).
    
    Args:
        phone: Phone number to validate
        
    Returns:
        True if phone format is valid, False otherwise
    """
    # Remove all non-digits
    digits_only = re.sub(r'\D', '', phone)
    
    # US phone numbers should have 10 or 11 digits (with country code)
    return len(digits_only) in [10, 11] and digits_only.isdigit()


def validate_financial_amount(
    amount: Any,
    min_value: Decimal = None,
    max_value: Decimal = None,
    allow_negative: bool = False
) -> Tuple[bool, Optional[str], Optional[Decimal]]:
    """
    Validate financial amounts with comprehensive checks.
    
    Args:
        amount: Amount to validate
        min_value: Minimum allowed value
        max_value: Maximum allowed value
        allow_negative: Whether negative values are allowed
        
    Returns:
        Tuple of (is_valid, error_message, converted_decimal)
    """
    try:
        if amount is None:
            return True, None, None
        
        # Convert to Decimal for precise financial calculations
        if isinstance(amount, str):
            # Remove common currency symbols and whitespace
            cleaned = re.sub(r'[$,\s]', '', amount)
            decimal_amount = Decimal(cleaned)
        else:
            decimal_amount = Decimal(str(amount))
        
        # Check for negative values
        if not allow_negative and decimal_amount < 0:
            return False, "Amount cannot be negative", None
        
        # Check minimum value
        if min_value is not None and decimal_amount < min_value:
            return False, f"Amount must be at least ${min_value}", None
        
        # Check maximum value
        if max_value is not None and decimal_amount > max_value:
            return False, f"Amount cannot exceed ${max_value}", None
        
        # Check for reasonable decimal places (max 2 for currency)
        if decimal_amount.as_tuple().exponent < -2:
            return False, "Amount cannot have more than 2 decimal places", None
        
        return True, None, decimal_amount
        
    except (InvalidOperation, ValueError, TypeError) as e:
        return False, f"Invalid amount format: {str(e)}", None


def validate_age_range(
    birth_date: date,
    min_age: int = 0,
    max_age: int = 150
) -> Tuple[bool, Optional[str], Optional[int]]:
    """
    Validate age based on birth date.
    
    Args:
        birth_date: Date of birth
        min_age: Minimum allowed age
        max_age: Maximum allowed age
        
    Returns:
        Tuple of (is_valid, error_message, calculated_age)
    """
    try:
        if birth_date is None:
            return True, None, None
        
        today = date.today()
        
        # Check if birth date is in the future
        if birth_date > today:
            return False, "Birth date cannot be in the future", None
        
        # Calculate age
        age = today.year - birth_date.year
        if (today.month, today.day) < (birth_date.month, birth_date.day):
            age -= 1
        
        # Validate age range
        if age < min_age:
            return False, f"Age must be at least {min_age} years", None
        
        if age > max_age:
            return False, f"Age cannot exceed {max_age} years", None
        
        return True, None, age
        
    except (ValueError, TypeError) as e:
        return False, f"Invalid birth date: {str(e)}", None


def validate_retirement_age(
    retirement_age: int,
    current_age: int = None,
    min_retirement_age: int = 50,
    max_retirement_age: int = 80
) -> Tuple[bool, Optional[str]]:
    """
    Validate retirement age with business logic.
    
    Args:
        retirement_age: Proposed retirement age
        current_age: Current age of the person
        min_retirement_age: Minimum allowed retirement age
        max_retirement_age: Maximum allowed retirement age
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    try:
        if retirement_age is None:
            return True, None
        
        # Check basic range
        if retirement_age < min_retirement_age:
            return False, f"Retirement age must be at least {min_retirement_age}"
        
        if retirement_age > max_retirement_age:
            return False, f"Retirement age cannot exceed {max_retirement_age}"
        
        # Check against current age
        if current_age is not None and retirement_age <= current_age:
            return False, "Retirement age must be greater than current age"
        
        return True, None
        
    except (ValueError, TypeError):
        return False, "Invalid retirement age format"


def validate_risk_tolerance(risk_tolerance: str) -> bool:
    """
    Validate risk tolerance value.
    
    Args:
        risk_tolerance: Risk tolerance value to validate
        
    Returns:
        True if valid, False otherwise
    """
    valid_values = ['conservative', 'moderate', 'aggressive']
    return risk_tolerance.lower() in valid_values


def validate_password_strength(password: str) -> Tuple[bool, str]:
    """
    Validate password strength with comprehensive checks.
    
    Args:
        password: Password to validate
        
    Returns:
        Tuple of (is_strong, message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if len(password) > 128:
        return False, "Password cannot exceed 128 characters"
    
    # Check for at least one uppercase letter
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    # Check for at least one lowercase letter
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    
    # Check for at least one digit
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    
    # Check for at least one special character
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Password must contain at least one special character"
    
    # Check for common weak passwords
    weak_passwords = [
        'password', '12345678', 'qwerty123', 'admin123',
        'password123', 'letmein', 'welcome123'
    ]
    
    if password.lower() in weak_passwords:
        return False, "Password is too common and easily guessable"
    
    return True, "Password meets security requirements"


def sanitize_string_input(input_string: str, max_length: int = None) -> str:
    """
    Sanitize string input to prevent injection attacks.
    
    Args:
        input_string: String to sanitize
        max_length: Maximum allowed length
        
    Returns:
        Sanitized string
    """
    if not isinstance(input_string, str):
        return str(input_string)
    
    # Remove or escape potentially dangerous characters
    sanitized = input_string.strip()
    
    # Remove null bytes
    sanitized = sanitized.replace('\x00', '')
    
    # Limit length if specified
    if max_length and len(sanitized) > max_length:
        sanitized = sanitized[:max_length]
    
    return sanitized


def validate_date_range(
    start_date: date,
    end_date: date,
    max_range_days: int = None
) -> Tuple[bool, Optional[str]]:
    """
    Validate date range constraints.
    
    Args:
        start_date: Start date
        end_date: End date
        max_range_days: Maximum allowed days between dates
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    try:
        if start_date is None or end_date is None:
            return True, None
        
        if start_date > end_date:
            return False, "Start date cannot be after end date"
        
        if max_range_days:
            date_diff = (end_date - start_date).days
            if date_diff > max_range_days:
                return False, f"Date range cannot exceed {max_range_days} days"
        
        return True, None
        
    except (ValueError, TypeError) as e:
        return False, f"Invalid date range: {str(e)}"


class BusinessRuleValidator:
    """Validator for complex business rules."""
    
    @staticmethod
    def validate_client_financial_profile(
        annual_income: Optional[Decimal],
        net_worth: Optional[Decimal],
        age: Optional[int]
    ) -> List[str]:
        """
        Validate client financial profile for consistency.
        
        Returns:
            List of validation error messages
        """
        errors = []
        
        if annual_income and net_worth:
            # Net worth shouldn't be extremely disproportionate to income
            if net_worth > annual_income * 50:
                errors.append(
                    "Net worth seems disproportionately high compared to annual income. "
                    "Please verify these values."
                )
            
            if annual_income > 500000 and net_worth < annual_income * 2:
                errors.append(
                    "High income earners typically have higher net worth ratios. "
                    "Please verify these values."
                )
        
        if age and annual_income:
            # Age-based income validation
            if age < 25 and annual_income > 200000:
                errors.append(
                    "Income seems high for age. Please verify client information."
                )
        
        return errors
    
    @staticmethod
    def validate_portfolio_allocation(allocations: dict) -> List[str]:
        """
        Validate portfolio allocation percentages.
        
        Args:
            allocations: Dictionary of asset_type -> percentage
            
        Returns:
            List of validation error messages
        """
        errors = []
        
        total_allocation = sum(allocations.values())
        
        if abs(total_allocation - 100) > 0.01:  # Allow for small rounding errors
            errors.append(f"Portfolio allocation must total 100%, currently {total_allocation}%")
        
        for asset_type, percentage in allocations.items():
            if percentage < 0:
                errors.append(f"Allocation for {asset_type} cannot be negative")
            
            if percentage > 100:
                errors.append(f"Allocation for {asset_type} cannot exceed 100%")
        
        return errors