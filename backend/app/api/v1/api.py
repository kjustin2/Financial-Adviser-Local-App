"""Main API router for v1 endpoints."""

from fastapi import APIRouter

from .endpoints import auth, holdings, portfolios, recommendations

router = APIRouter()

# Include endpoint routers
router.include_router(auth.router, prefix="/auth", tags=["authentication"])
router.include_router(portfolios.router, prefix="/portfolios", tags=["portfolios"])
router.include_router(holdings.router, prefix="/holdings", tags=["holdings"])
router.include_router(
    recommendations.router, prefix="/recommendations", tags=["recommendations"]
)

# TODO: Add other endpoint routers when ready
# router.include_router(reports.router, prefix="/reports", tags=["reports"])
# router.include_router(market_data.router, prefix="/market-data", tags=["market-data"])
