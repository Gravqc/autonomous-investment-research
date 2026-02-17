from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from investment_engine.services.portfolio_service import PortfolioService
from investment_engine.services.data_sources.market_client import MarketDataClient
from investment_engine.services.portfolio_validation_service import PortfolioValidationService
from investment_engine.workflows.utils.nifty_50 import NIFTY_50
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
async def get_current_portfolio(
    portfolio_id: Optional[int] = None,
    real_time: bool = Query(True, description="Use real-time market prices for valuation")
):
    """Get current portfolio state with optional real-time market valuation"""
    try:
        current_prices = None
        if real_time:
            try:
                # Fetch current market prices for real-time valuation
                market_data = MarketDataClient.get_market_snapshot(NIFTY_50)
                current_prices = {
                    stock["symbol"]: stock["current_price"] 
                    for stock in market_data
                }
            except Exception as e:
                # If market data fetch fails, fall back to snapshot prices
                print(f"Warning: Could not fetch real-time prices, using snapshot prices: {e}")
        
        return PortfolioService.get_current_portfolio_state(portfolio_id, current_prices)
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


@router.get("/validate")
async def validate_portfolio_data(portfolio_id: Optional[int] = None):
    """Validate portfolio data consistency and return detailed report"""
    try:
        if portfolio_id is None:
            # Get first portfolio
            from investment_engine.db.session import session_scope
            from investment_engine.db.models.portfolios import Portfolio
            
            with session_scope() as session:
                portfolio = session.query(Portfolio).first()
                if not portfolio:
                    raise HTTPException(status_code=404, detail="No portfolio found")
                portfolio_id = portfolio.id
        
        validation_report = PortfolioValidationService.validate_portfolio_consistency(portfolio_id)
        return validation_report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/expected-state")
async def get_expected_portfolio_state(portfolio_id: Optional[int] = None):
    """Get what the portfolio state should be based on trade history"""
    try:
        if portfolio_id is None:
            # Get first portfolio
            from investment_engine.db.session import session_scope
            from investment_engine.db.models.portfolios import Portfolio
            
            with session_scope() as session:
                portfolio = session.query(Portfolio).first()
                if not portfolio:
                    raise HTTPException(status_code=404, detail="No portfolio found")
                portfolio_id = portfolio.id
        
        expected_state = PortfolioValidationService.fix_portfolio_data(portfolio_id)
        return expected_state
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# Legacy endpoint for backward compatibility
@router.get("/")
async def get_portfolio():
    """Legacy endpoint - redirects to current portfolio state"""
    try:
        # Use real-time prices for legacy endpoint too
        try:
            market_data = MarketDataClient.get_market_snapshot(NIFTY_50)
            current_prices = {
                stock["symbol"]: stock["current_price"] 
                for stock in market_data
            }
        except Exception:
            current_prices = None
            
        portfolio_state = PortfolioService.get_current_portfolio_state(current_prices=current_prices)
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
