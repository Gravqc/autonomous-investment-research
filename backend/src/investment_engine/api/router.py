from fastapi import APIRouter
from investment_engine.api.routers import health, portfolio, decisions, trades

router = APIRouter()

router.include_router(health.router)
router.include_router(portfolio.router)
router.include_router(decisions.router)
router.include_router(trades.router)
