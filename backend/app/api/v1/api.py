"""Main API router for v1 endpoints."""

from fastapi import APIRouter

from .endpoints import auth, goals, holdings, portfolios, recommendations, transactions

router = APIRouter()

# Include endpoint routers
router.include_router(auth.router, prefix="/auth", tags=["authentication"])
router.include_router(portfolios.router, prefix="/portfolios", tags=["portfolios"])
router.include_router(goals.router, prefix="/goals", tags=["goals"])
router.include_router(holdings.router, prefix="/holdings", tags=["holdings"])
router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
router.include_router(
    recommendations.router, prefix="/recommendations", tags=["recommendations"]
)

# TODO: Add other endpoint routers when ready
# router.include_router(reports.router, prefix="/reports", tags=["reports"])
