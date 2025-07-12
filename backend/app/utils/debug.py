"""Debug utilities for development and troubleshooting."""

import traceback
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from .logging import get_logger

logger = get_logger("debug")


class DebugAnalyzer:
    """Utility class for analyzing errors and system state."""

    @staticmethod
    def analyze_validation_error(error: Exception, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze validation errors and provide debugging information."""
        analysis = {
            "error_type": type(error).__name__,
            "error_message": str(error),
            "timestamp": datetime.now().isoformat(),
            "request_data_structure": {},
            "validation_issues": [],
            "suggestions": []
        }

        # Analyze request data structure
        for key, value in request_data.items():
            analysis["request_data_structure"][key] = {
                "type": type(value).__name__,
                "length": len(str(value)) if value is not None else 0,
                "is_empty": not bool(value) if value is not None else True
            }

        # Common validation issues
        if hasattr(error, 'errors'):
            for validation_error in error.errors():
                field = validation_error.get('loc', ['unknown'])[-1]
                error_type = validation_error.get('type', 'unknown')
                message = validation_error.get('msg', 'Unknown error')
                
                issue = {
                    "field": field,
                    "error_type": error_type,
                    "message": message,
                    "input_value": validation_error.get('input')
                }
                analysis["validation_issues"].append(issue)

                # Add specific suggestions
                if error_type == "value_error.email":
                    analysis["suggestions"].append(f"Field '{field}' must be a valid email address")
                elif error_type == "value_error.any_str.min_length":
                    analysis["suggestions"].append(f"Field '{field}' is too short")
                elif error_type == "value_error.any_str.max_length":
                    analysis["suggestions"].append(f"Field '{field}' is too long")
                elif error_type == "value_error.missing":
                    analysis["suggestions"].append(f"Field '{field}' is required but missing")

        return analysis

    @staticmethod
    def analyze_authentication_failure(email: str, client_ip: str) -> Dict[str, Any]:
        """Analyze authentication failures for debugging."""
        analysis = {
            "timestamp": datetime.now().isoformat(),
            "email": email,
            "client_ip": client_ip,
            "user_exists": False,
            "user_active": False,
            "recent_attempts": 0,
            "account_created": None,
            "last_login": None,
            "suggestions": []
        }

        db = next(get_db())
        try:
            user = db.query(User).filter(User.email == email).first()
            if user:
                analysis["user_exists"] = True
                analysis["user_active"] = user.is_active
                analysis["account_created"] = user.created_at.isoformat()
                
                if not user.is_active:
                    analysis["suggestions"].append("User account is inactive")
                else:
                    analysis["suggestions"].append("Check password - user exists and is active")
            else:
                analysis["suggestions"].append("User does not exist - check email spelling")

            # Count recent login attempts (this would require a login_attempts table)
            # For now, just add placeholder
            analysis["recent_attempts"] = 0

        except Exception as e:
            logger.error(f"Error analyzing authentication failure: {str(e)}")
            analysis["analysis_error"] = str(e)
        finally:
            db.close()

        return analysis

    @staticmethod
    def get_system_diagnostics() -> Dict[str, Any]:
        """Get comprehensive system diagnostics."""
        from ..database import engine
        from sqlalchemy import text
        import psutil
        import os

        diagnostics = {
            "timestamp": datetime.now().isoformat(),
            "system": {},
            "database": {},
            "application": {},
            "recent_errors": []
        }

        # System information
        try:
            diagnostics["system"] = {
                "cpu_percent": psutil.cpu_percent(interval=1),
                "memory_percent": psutil.virtual_memory().percent,
                "disk_usage": psutil.disk_usage('/').percent,
                "python_version": f"{os.sys.version_info.major}.{os.sys.version_info.minor}.{os.sys.version_info.micro}"
            }
        except ImportError:
            diagnostics["system"] = {"note": "psutil not available for system metrics"}

        # Database diagnostics
        try:
            with engine.connect() as connection:
                # Get database size (SQLite specific)
                result = connection.execute(text(
                    "SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()"
                ))
                db_size = result.scalar()
                
                # Get table information
                result = connection.execute(text(
                    "SELECT name, sql FROM sqlite_master WHERE type='table'"
                ))
                tables = [{"name": row[0], "sql": row[1]} for row in result]
                
                # Get user count
                result = connection.execute(text("SELECT COUNT(*) FROM users"))
                user_count = result.scalar()

                diagnostics["database"] = {
                    "connected": True,
                    "size_bytes": db_size,
                    "tables": len(tables),
                    "user_count": user_count,
                    "table_list": [table["name"] for table in tables]
                }
        except Exception as e:
            diagnostics["database"] = {
                "connected": False,
                "error": str(e)
            }

        # Application diagnostics
        from ..config import settings
        diagnostics["application"] = {
            "debug_mode": settings.debug,
            "app_version": settings.app_version,
            "allowed_origins": settings.allowed_origins,
            "database_url_scheme": settings.database_url.split("://")[0]
        }

        return diagnostics

    @staticmethod
    def create_error_report(
        error: Exception,
        context: Dict[str, Any],
        user_id: Optional[int] = None,
        client_ip: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create a comprehensive error report for debugging."""
        report = {
            "timestamp": datetime.now().isoformat(),
            "error_id": f"ERR_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{id(error)}",
            "error_details": {
                "type": type(error).__name__,
                "message": str(error),
                "traceback": traceback.format_exc()
            },
            "context": context,
            "user_context": {
                "user_id": user_id,
                "client_ip": client_ip
            },
            "system_state": {},
            "recommendations": []
        }

        # Add system state if in debug mode
        from ..config import settings
        if settings.debug:
            try:
                report["system_state"] = DebugAnalyzer.get_system_diagnostics()
            except Exception as diag_error:
                report["system_state"] = {"error": f"Failed to get diagnostics: {str(diag_error)}"}

        # Add recommendations based on error type
        error_name = type(error).__name__
        if error_name == "ValidationError":
            report["recommendations"].extend([
                "Check request payload format and field validation",
                "Verify all required fields are present",
                "Check field data types and length constraints"
            ])
        elif error_name == "IntegrityError":
            report["recommendations"].extend([
                "Check for duplicate values in unique fields",
                "Verify foreign key constraints",
                "Check database schema consistency"
            ])
        elif error_name == "HTTPException":
            report["recommendations"].extend([
                "Check API endpoint path and method",
                "Verify authentication tokens",
                "Check request permissions"
            ])
        else:
            report["recommendations"].append("Check application logs for more details")

        return report


def log_error_with_context(
    error: Exception,
    context: str,
    user_id: Optional[int] = None,
    client_ip: Optional[str] = None,
    additional_data: Optional[Dict[str, Any]] = None
) -> str:
    """Log an error with comprehensive context and return error ID."""
    context_data = additional_data or {}
    
    error_report = DebugAnalyzer.create_error_report(
        error, context_data, user_id, client_ip
    )
    
    logger.error(
        f"Error in {context}: {str(error)}",
        extra={
            "error_id": error_report["error_id"],
            "error_type": type(error).__name__,
            "user_id": user_id,
            "client_ip": client_ip,
            "context": context,
            "additional_data": additional_data
        }
    )
    
    # In debug mode, also log the full report
    from ..config import settings
    if settings.debug:
        logger.debug(f"Full error report: {error_report}")
    
    return error_report["error_id"]


def analyze_request_performance(
    endpoint: str,
    method: str,
    duration_ms: float,
    status_code: int
) -> Dict[str, Any]:
    """Analyze request performance and identify potential issues."""
    analysis = {
        "endpoint": endpoint,
        "method": method,
        "duration_ms": duration_ms,
        "status_code": status_code,
        "performance_category": "good",
        "issues": [],
        "suggestions": []
    }

    # Categorize performance
    if duration_ms > 5000:  # 5 seconds
        analysis["performance_category"] = "critical"
        analysis["issues"].append("Extremely slow response time")
        analysis["suggestions"].extend([
            "Check database query performance",
            "Review business logic complexity",
            "Consider caching strategies",
            "Check for external API timeouts"
        ])
    elif duration_ms > 2000:  # 2 seconds
        analysis["performance_category"] = "poor"
        analysis["issues"].append("Slow response time")
        analysis["suggestions"].extend([
            "Optimize database queries",
            "Review data processing logic",
            "Consider pagination for large datasets"
        ])
    elif duration_ms > 1000:  # 1 second
        analysis["performance_category"] = "fair"
        analysis["issues"].append("Moderately slow response")
        analysis["suggestions"].append("Monitor and consider optimization")

    # Analyze by status code
    if status_code >= 500:
        analysis["issues"].append("Server error occurred")
        analysis["suggestions"].append("Check application logs and error handling")
    elif status_code >= 400:
        analysis["issues"].append("Client error occurred")
        analysis["suggestions"].append("Check request validation and user input")

    return analysis