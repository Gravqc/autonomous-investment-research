from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional

from investment_engine.services.trade_service import TradeService
from investment_engine.schemas.trades import RecentTrades, TradeRecord

router = APIRouter(
    prefix="/api/trades",
    tags=["trades"]
)


@router.get("/recent", response_model=RecentTrades)
async def get_recent_trades(
    limit: int = Query(20, ge=1, le=100, description="Number of recent trades to retrieve"),
    portfolio_id: Optional[int] = None
):
    """Get recent trade executions"""
    try:
        return TradeService.get_recent_trades(limit, portfolio_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/for-decision/{decision_id}", response_model=List[TradeRecord])
async def get_trades_for_decision(decision_id: int):
    """Get all trades associated with a specific decision"""
    try:
        return TradeService.get_trades_for_decision(decision_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")