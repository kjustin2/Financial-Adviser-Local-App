"""Logging configuration and utilities."""

import logging
import logging.handlers
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

from ..config import settings


class ColoredFormatter(logging.Formatter):
    """Custom formatter with colors for different log levels."""
    
    COLORS = {
        'DEBUG': '\033[36m',     # Cyan
        'INFO': '\033[32m',      # Green
        'WARNING': '\033[33m',   # Yellow
        'ERROR': '\033[31m',     # Red
        'CRITICAL': '\033[35m',  # Magenta
        'RESET': '\033[0m'       # Reset
    }
    
    def format(self, record):
        """Format log record with colors."""
        if record.levelname in self.COLORS:
            record.levelname = f"{self.COLORS[record.levelname]}{record.levelname}{self.COLORS['RESET']}"
        return super().format(record)


def setup_logging(
    level: str = "INFO",
    log_file: Optional[Path] = None,
    max_bytes: int = 10 * 1024 * 1024,  # 10MB
    backup_count: int = 5
) -> logging.Logger:
    """Configure application logging."""
    
    # Create logs directory
    logs_dir = settings.data_dir / "logs"
    logs_dir.mkdir(exist_ok=True, parents=True)
    
    # Set up root logger
    logger = logging.getLogger("financial_adviser")
    logger.setLevel(getattr(logging, level.upper()))
    
    # Clear any existing handlers
    logger.handlers.clear()
    
    # Console handler with colors
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG if settings.debug else logging.INFO)
    
    console_formatter = ColoredFormatter(
        fmt="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)
    
    # File handler with rotation
    if log_file is None:
        log_file = logs_dir / f"app_{datetime.now().strftime('%Y%m%d')}.log"
    
    file_handler = logging.handlers.RotatingFileHandler(
        log_file,
        maxBytes=max_bytes,
        backupCount=backup_count,
        encoding='utf-8'
    )
    file_handler.setLevel(logging.DEBUG)
    
    file_formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)s | %(name)s | %(funcName)s:%(lineno)d | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    file_handler.setFormatter(file_formatter)
    logger.addHandler(file_handler)
    
    # Error file handler for errors and above
    error_file = logs_dir / f"errors_{datetime.now().strftime('%Y%m%d')}.log"
    error_handler = logging.handlers.RotatingFileHandler(
        error_file,
        maxBytes=max_bytes,
        backupCount=backup_count,
        encoding='utf-8'
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(file_formatter)
    logger.addHandler(error_handler)
    
    # Configure third-party loggers
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.INFO if settings.echo_sql else logging.WARNING)
    logging.getLogger("aiohttp").setLevel(logging.WARNING)
    
    return logger


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance for a specific module."""
    return logging.getLogger(f"financial_adviser.{name}")


# Request/Response logging middleware
class LoggingMiddleware:
    """Middleware to log requests and responses."""
    
    def __init__(self, app):
        self.app = app
        self.logger = get_logger("middleware")
    
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        
        start_time = datetime.now()
        
        # Log request
        client_ip = scope.get("client", ["unknown"])[0]
        method = scope["method"]
        path = scope["path"]
        
        self.logger.info(f"Request: {method} {path} from {client_ip}")
        
        # Capture response
        response_body = []
        status_code = 500
        
        async def send_wrapper(message):
            nonlocal status_code
            if message["type"] == "http.response.start":
                status_code = message["status"]
            elif message["type"] == "http.response.body":
                if message.get("body"):
                    response_body.append(message["body"])
            await send(message)
        
        try:
            await self.app(scope, receive, send_wrapper)
        except Exception as e:
            self.logger.error(f"Request failed: {method} {path} - {str(e)}")
            raise
        finally:
            # Log response
            duration = (datetime.now() - start_time).total_seconds()
            self.logger.info(f"Response: {method} {path} - {status_code} - {duration:.3f}s")
            
            # Log slow requests
            if duration > 1.0:
                self.logger.warning(f"Slow request: {method} {path} took {duration:.3f}s")


# Database logging utilities
def log_query_performance(query: str, duration: float, result_count: int = 0):
    """Log database query performance."""
    logger = get_logger("database")
    
    if duration > 0.1:  # Log slow queries (>100ms)
        logger.warning(f"Slow query ({duration:.3f}s): {query[:100]}...")
    else:
        logger.debug(f"Query ({duration:.3f}s, {result_count} results): {query[:100]}...")


# API logging utilities
def log_api_call(endpoint: str, method: str, user_id: Optional[str] = None, **kwargs):
    """Log API endpoint calls."""
    logger = get_logger("api")
    
    extra_info = " | ".join([f"{k}={v}" for k, v in kwargs.items()])
    user_info = f"user_id={user_id}" if user_id else "anonymous"
    
    logger.info(f"API Call: {method} {endpoint} | {user_info} | {extra_info}")


def log_security_event(event_type: str, details: str, user_id: Optional[str] = None, ip: Optional[str] = None):
    """Log security-related events."""
    logger = get_logger("security")
    
    user_info = f"user_id={user_id}" if user_id else "anonymous"
    ip_info = f"ip={ip}" if ip else "unknown_ip"
    
    logger.warning(f"Security Event: {event_type} | {user_info} | {ip_info} | {details}")


# Error logging utilities
def log_error(error: Exception, context: str = "", extra_data: dict = None):
    """Log errors with context and additional data."""
    logger = get_logger("errors")
    
    error_info = {
        "error_type": type(error).__name__,
        "error_message": str(error),
        "context": context,
        "extra_data": extra_data or {}
    }
    
    logger.error(f"Error occurred: {error_info}")


# Initialize logging
app_logger = setup_logging(
    level="DEBUG" if settings.debug else "INFO"
)