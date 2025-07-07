"""Main FastAPI application entry point."""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from pydantic import ValidationError
from datetime import datetime
import uvicorn
import traceback

from .config import settings
from .database import create_tables
from .utils.logging import get_logger, LoggingMiddleware, log_error, log_security_event

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
        extra_data={"client_ip": client_ip, "errors": exc.errors()}
    )
    
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Invalid input data",
                "details": exc.errors()
            },
            "timestamp": datetime.utcnow().isoformat()
        }
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
            "traceback": traceback.format_exc() if settings.debug else None
        }
    )
    
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An internal server error occurred",
                "details": str(exc) if settings.debug else "Contact support for assistance"
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    )

# Health check endpoint
@app.get("/health")
@limiter.limit("30/minute")
async def health_check(request: Request):
    """Health check endpoint."""
    logger.debug("Health check requested")
    return {
        "success": True,
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": settings.app_version
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
        "health": "/health"
    }

# Create database tables on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    try:
        create_tables()
        logger.info(f"✅ {settings.app_name} started successfully")
        logger.info(f"📊 Database: {settings.database_url}")
        logger.info(f"🔧 Debug mode: {settings.debug}")
        logger.info(f"🌐 Allowed origins: {settings.allowed_origins}")
    except Exception as e:
        logger.error(f"❌ Failed to start application: {str(e)}")
        raise

# Include API routes
from .api.v1.api import router as api_router
app.include_router(api_router, prefix="/api/v1")

# Graceful shutdown
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info(f"🛑 {settings.app_name} shutting down...")

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if settings.debug else False,
        log_level="debug" if settings.debug else "info"
    )