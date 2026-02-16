from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from investment_engine.services.portfolio_service import PortfolioService
from investment_engine.schemas.portfolio import (
    PortfolioState, 
    PortfolioValueHistory, 
    PerformanceMetrics
)

router = APIRouter(
    prefix="/api/portfolio",
    tags=["portfolio"]
)


@router.get("/current", response_model=PortfolioState)
async def get_current_portfolio(portfolio_id: Optional[int] = None):
    """Get current portfolio state with positions"""
    try:
        return PortfolioService.get_current_portfolio_state(portfolio_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/value-history", response_model=PortfolioValueHistory)
async def get_portfolio_value_history(
    days: int = Query(30, ge=1, le=365, description="Number of days of history to retrieve"),
    portfolio_id: Optional[int] = None
):
    """Get portfolio value history for specified number of days"""
    try:
        return PortfolioService.get_portfolio_value_history(days, portfolio_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/performance", response_model=PerformanceMetrics)
async def get_portfolio_performance(portfolio_id: Optional[int] = None):
    """Get comprehensive portfolio performance metrics"""
    try:
        return PortfolioService.get_portfolio_performance_metrics(portfolio_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# Legacy endpoint for backward compatibility
@router.get("/")
async def get_portfolio():
    """Legacy endpoint - redirects to current portfolio state"""
    try:
        portfolio_state = PortfolioService.get_current_portfolio_state()
        return {
            "total_value": portfolio_state.current_value,
            "cash": portfolio_state.cash_balance,
            "positions": [
                {"symbol": pos.symbol, "shares": pos.quantity}
                for pos in portfolio_state.positions
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
