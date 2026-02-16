from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional

from investment_engine.services.decision_service import DecisionService
from investment_engine.schemas.decisions import (
    DecisionSummary,
    DecisionWithOutcome,
    DecisionDetail
)

router = APIRouter(
    prefix="/api/decisions",
    tags=["decisions"]
)


@router.get("/recent", response_model=List[DecisionSummary])
async def get_recent_decisions(
    limit: int = Query(10, ge=1, le=50, description="Number of recent decisions to retrieve"),
    portfolio_id: Optional[int] = None
):
    """Get recent AI decisions with basic information"""
    try:
        return DecisionService.get_recent_decisions(limit, portfolio_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/with-outcomes", response_model=List[DecisionWithOutcome])
async def get_decisions_with_outcomes(
    limit: int = Query(20, ge=1, le=100, description="Number of decisions to retrieve"),
    portfolio_id: Optional[int] = None
):
    """Get decisions with their trade executions and outcomes"""
    try:
        return DecisionService.get_decisions_with_outcomes(limit, portfolio_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{decision_id}", response_model=DecisionDetail)
async def get_decision_detail(decision_id: int):
    """Get detailed information about a specific decision"""
    try:
        return DecisionService.get_decision_by_id(decision_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# Legacy endpoint for backward compatibility
@router.get("/")
async def get_decisions():
    """Legacy endpoint - returns recent decisions in old format"""
    try:
        decisions = DecisionService.get_recent_decisions(limit=10)
        return [
            {
                "symbol": decision.action_summary.split()[-1] if len(decision.action_summary.split()) > 1 else "UNKNOWN",
                "action": decision.action_summary.split()[0] if decision.action_summary.split() else "UNKNOWN",
                "confidence": decision.confidence
            }
            for decision in decisions
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
