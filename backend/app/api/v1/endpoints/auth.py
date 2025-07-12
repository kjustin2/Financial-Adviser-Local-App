"""Authentication endpoints for user registration and login."""

import json
from datetime import timedelta
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.config import settings
from app.database import get_db
from app.models.user import User
from app.schemas.auth import (
    PasswordChange,
    TokenResponse,
    UserLogin,
    UserRegister,
    UserResponse,
)
from app.security.auth import (
    create_access_token,
    get_password_hash,
    validate_password_strength,
    verify_password,
)
from app.utils.logging import get_logger

router = APIRouter()
logger = get_logger("auth")


def create_validation_error_response(
    message: str, field_errors: Dict[str, List[str]] = None
) -> Dict[str, Any]:
    """Create standardized validation error response."""
    return {
        "success": False,
        "error": {
            "code": "VALIDATION_ERROR",
            "message": message,
            "field_errors": field_errors or {},
        },
    }


@router.post(
    "/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED
)
def register_user(
    user_data: UserRegister, request: Request, db: Session = Depends(get_db)
) -> Any:
    """Register a new individual investor with enhanced validation and logging."""
    client_ip = request.client.host if request.client else "unknown"

    logger.info(
        f"Registration attempt for email: {user_data.email}",
        extra={
            "client_ip": client_ip,
            "email": user_data.email,
            "first_name": user_data.first_name,
            "last_name": user_data.last_name,
            "investment_experience": user_data.investment_experience,
            "risk_tolerance": user_data.risk_tolerance,
            "net_worth_range": user_data.net_worth_range,
        },
    )

    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        logger.warning(
            f"Registration failed - email already exists: {user_data.email}",
            extra={"client_ip": client_ip, "email": user_data.email},
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=create_validation_error_response(
                "Registration failed",
                {"email": ["A user with this email address already exists"]},
            ),
        )

    # Validate password strength
    is_strong, message = validate_password_strength(user_data.password)
    if not is_strong:
        logger.warning(
            f"Registration failed - weak password for: {user_data.email}",
            extra={"client_ip": client_ip, "email": user_data.email, "reason": message},
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=create_validation_error_response(
                "Password does not meet requirements",
                {"password": [message]},
            ),
        )

    try:

        # Create new user with individual investor profile
        hashed_password = get_password_hash(user_data.password)
        
        # Convert financial goals list to JSON string for storage
        financial_goals_json = None
        if user_data.financial_goals:
            financial_goals_json = json.dumps(user_data.financial_goals)
        db_user = User(
            email=user_data.email,
            hashed_password=hashed_password,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            phone=user_data.phone,
            investment_experience=user_data.investment_experience,
            risk_tolerance=user_data.risk_tolerance,
            investment_style=user_data.investment_style,
            financial_goals=financial_goals_json,
            net_worth_range=user_data.net_worth_range,
            time_horizon=user_data.time_horizon,
        )

        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        logger.info(
            f"User registered successfully: {user_data.email}",
            extra={
                "client_ip": client_ip,
                "user_id": db_user.id,
                "email": db_user.email,
            },
        )

        # Create access token
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            subject=db_user.id, expires_delta=access_token_expires
        )

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.access_token_expire_minutes * 60,
            user=UserResponse.model_validate(db_user),
        )

    except IntegrityError as e:
        db.rollback()
        logger.error(
            f"Database integrity error during registration: {user_data.email}",
            extra={"client_ip": client_ip, "error": str(e)},
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=create_validation_error_response(
                "Registration failed due to data conflict",
                {"email": ["This email address is already in use"]},
            ),
        )
    except Exception as e:
        db.rollback()
        import traceback
        error_details = {
            "error_type": type(e).__name__,
            "error_message": str(e),
            "traceback": traceback.format_exc()
        }
        logger.error(
            f"Unexpected error during registration: {user_data.email}",
            extra={
                "client_ip": client_ip,
                "error": error_details,
                "request_data": {
                    "email": user_data.email,
                    "investment_experience": user_data.investment_experience,
                    "risk_tolerance": user_data.risk_tolerance,
                    "net_worth_range": user_data.net_worth_range
                }
            }
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": f"An error occurred during registration: {str(e)}"},
        )


@router.post("/login", response_model=TokenResponse)
def login_user(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> Any:
    """Login user with email and password."""
    client_ip = request.client.host if request.client else "unknown"

    logger.info(
        f"Login attempt for email: {form_data.username}",
        extra={"client_ip": client_ip, "email": form_data.username},
    )

    user = (
        db.query(User)
        .filter(User.email == form_data.username, User.is_active == True)
        .first()
    )

    if not user or not verify_password(form_data.password, user.hashed_password):
        logger.warning(
            f"Failed login attempt for email: {form_data.username}",
            extra={
                "client_ip": client_ip,
                "email": form_data.username,
                "reason": "user_not_found" if not user else "invalid_password",
            },
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    logger.info(
        f"Successful login for user: {user.email}",
        extra={"client_ip": client_ip, "user_id": user.id, "email": user.email},
    )

    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.access_token_expire_minutes * 60,
        user=UserResponse.model_validate(user),
    )


@router.post("/login/json", response_model=TokenResponse)
def login_user_json(
    user_data: UserLogin, request: Request, db: Session = Depends(get_db)
) -> Any:
    """Login user with JSON payload."""
    client_ip = request.client.host if request.client else "unknown"

    logger.info(
        f"JSON login attempt for email: {user_data.email}",
        extra={"client_ip": client_ip, "email": user_data.email},
    )

    user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .filter(User.is_active == True)
        .first()
    )

    if not user or not verify_password(user_data.password, user.hashed_password):
        logger.warning(
            f"Failed JSON login attempt for email: {user_data.email}",
            extra={
                "client_ip": client_ip,
                "email": user_data.email,
                "reason": "user_not_found" if not user else "invalid_password",
            },
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    logger.info(
        f"Successful JSON login for user: {user.email}",
        extra={"client_ip": client_ip, "user_id": user.id, "email": user.email},
    )

    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.access_token_expire_minutes * 60,
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_active_user)) -> Any:
    """Get current user information."""
    return UserResponse.model_validate(current_user)


@router.post("/change-password")
def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Any:
    """Change user password."""
    # Verify current password
    if not verify_password(
        password_data.current_password, current_user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    # Validate new password strength
    is_strong, message = validate_password_strength(password_data.new_password)
    if not is_strong:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)

    # Update password
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()

    return {"message": "Password changed successfully"}
