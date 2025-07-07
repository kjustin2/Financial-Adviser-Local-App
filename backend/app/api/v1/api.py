"""Main API router for v1 endpoints."""

from fastapi import APIRouter

from .endpoints import auth, clients

router = APIRouter()

# Include endpoint routers
router.include_router(auth.router, prefix="/auth", tags=["authentication"])
router.include_router(clients.router, prefix="/clients", tags=["clients"])

# TODO: Add other endpoint routers
# router.include_router(portfolios.router, prefix="/portfolios", tags=["portfolios"])
# router.include_router(holdings.router, prefix="/holdings", tags=["holdings"])
# router.include_router(goals.router, prefix="/goals", tags=["goals"])
# router.include_router(reports.router, prefix="/reports", tags=["reports"])