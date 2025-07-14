"""Main FastAPI application entry point."""

import traceback
from datetime import datetime

import uvicorn
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from .config import settings
from .database import create_tables
from .utils.logging import LoggingMiddleware, get_logger, log_error

# Initialize logger
logger = get_logger("main")

# Create rate limiter
limiter = Limiter(key_func=get_remote_address)

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Comprehensive API for personal financial management and advisory services",
    debug=settings.debug,
)

# Add rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add logging middleware
app.add_middleware(LoggingMiddleware)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# Global exception handlers
@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    """Handle Pydantic validation errors."""
    client_ip = request.client.host if request.client else "unknown"
    log_error(
        exc,
        context=f"Validation error on {request.method} {request.url.path}",
        extra_data={"client_ip": client_ip, "errors": exc.errors()},
    )

    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Invalid input data",
                "details": exc.errors(),
            },
            "timestamp": datetime.now().isoformat(),
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions."""
    client_ip = request.client.host if request.client else "unknown"
    log_error(
        exc,
        context=f"Unhandled exception on {request.method} {request.url.path}",
        extra_data={
            "client_ip": client_ip,
            "traceback": traceback.format_exc() if settings.debug else None,
        },
    )

    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An internal server error occurred",
                "details": str(exc)
                if settings.debug
                else "Contact support for assistance",
            },
            "timestamp": datetime.now().isoformat(),
        },
    )


# Health check endpoint
@app.get("/health")
@limiter.limit("1000/minute")
async def health_check(request: Request):
    """Enhanced health check endpoint with system status."""
    from .database import engine
    from sqlalchemy import text
    
    logger.debug("Health check requested")
    
    health_status = {
        "success": True,
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": settings.app_version,
        "environment": "development" if settings.debug else "production",
        "components": {
            "database": "unknown",
            "logging": "healthy",
            "auth": "healthy"
        }
    }
    
    # Check database connectivity
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        health_status["components"]["database"] = "healthy"
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        health_status["components"]["database"] = "unhealthy"
        health_status["status"] = "degraded"
    
    return health_status


# Debug endpoint for development
@app.get("/debug")
@limiter.limit("500/minute")
async def debug_info(request: Request):
    """Debug information endpoint (development only)."""
    if not settings.debug:
        raise HTTPException(status_code=404, detail="Not found")
    
    from .database import engine
    from sqlalchemy import text
    
    debug_data = {
        "success": True,
        "timestamp": datetime.now().isoformat(),
        "server_info": {
            "version": settings.app_version,
            "debug_mode": settings.debug,
            "database_url": settings.database_url.split("://")[0] + "://[REDACTED]",
            "allowed_origins": settings.allowed_origins,
        },
        "request_info": {
            "client_ip": request.client.host if request.client else "unknown",
            "user_agent": request.headers.get("user-agent", "unknown"),
            "method": request.method,
            "url": str(request.url),
        },
        "database_info": {
            "connected": False,
            "tables": []
        }
    }
    
    # Get database information
    try:
        with engine.connect() as connection:
            debug_data["database_info"]["connected"] = True
            # Get table names (SQLite specific)
            result = connection.execute(text(
                "SELECT name FROM sqlite_master WHERE type='table'"
            ))
            tables = [row[0] for row in result]
            debug_data["database_info"]["tables"] = tables
    except Exception as e:
        logger.error(f"Debug database info failed: {str(e)}")
        debug_data["database_info"]["error"] = str(e)
    
    return debug_data


# Validation rules endpoint
@app.get("/validation-rules")
@limiter.limit("1000/minute")
async def validation_rules(request: Request):
    """Get validation rules for frontend validation."""
    return {
        "success": True,
        "rules": {
            "email": {
                "required": True,
                "format": "email",
                "description": "Valid email address"
            },
            "password": {
                "required": True,
                "min_length": 8,
                "max_length": 100,
                "requirements": [
                    "At least 8 characters",
                    "At least one lowercase letter",
                    "At least one uppercase letter",
                    "At least one number",
                    "At least one special character"
                ],
                "description": "Strong password with mixed case, numbers, and special characters"
            },
            "first_name": {
                "required": True,
                "min_length": 1,
                "max_length": 100,
                "description": "First name (1-100 characters)"
            },
            "last_name": {
                "required": True,
                "min_length": 1,
                "max_length": 100,
                "description": "Last name (1-100 characters)"
            },
            "firm_name": {
                "required": False,
                "max_length": 255,
                "description": "Optional firm name (max 255 characters)"
            },
            "license_number": {
                "required": False,
                "max_length": 50,
                "description": "Optional license number (max 50 characters)"
            },
            "phone": {
                "required": False,
                "max_length": 20,
                "description": "Optional phone number (max 20 characters)"
            }
        }
    }


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": f"Welcome to {settings.app_name}",
        "version": settings.app_version,
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health",
        "debug": "/debug" if settings.debug else None,
        "validation_rules": "/validation-rules"
    }


# Include API routes
from .api.v1.api import router as api_router

app.include_router(api_router, prefix="/api/v1")


# Application lifespan handler (replaces deprecated on_event)
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    try:
        create_tables()
        if not settings.is_production_ready:
            logger.warning("⚠️  Using default secret key - change for production!")
        logger.info(f"✅ {settings.app_name} started successfully")
        logger.info(f"📊 Database: {settings.database_url}")
        logger.info(f"🔧 Debug mode: {settings.debug}")
        logger.info(f"🌐 Allowed origins: {settings.allowed_origins}")
    except Exception as e:
        logger.error(f"❌ Failed to start application: {str(e)}")
        raise

    yield

    # Shutdown
    logger.info(f"🛑 {settings.app_name} shutting down...")


# Update FastAPI app with lifespan
app.router.lifespan_context = lifespan


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if settings.debug else False,
        log_level="debug" if settings.debug else "info",
    )
