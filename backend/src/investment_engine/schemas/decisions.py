from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class TradeExecution(BaseModel):
    trade_id: int
    symbol: str
    side: str  # BUY/SELL
    quantity: float
    price: float
    total_value: float
    executed_at: datetime


class TradeOutcome(BaseModel):
    position_change: str
    unrealized_pnl: Optional[float] = None
    days_held: Optional[int] = None
    outcome_status: str  # "profitable", "loss", "pending"


class DecisionSummary(BaseModel):
    decision_id: int
    action_summary: str
    confidence: float
    model_used: str
    created_at: datetime


class DecisionWithOutcome(BaseModel):
    decision_id: int
    action_summary: str
    confidence: float
    reasoning: str
    model_used: str
    created_at: datetime
    trade: Optional[TradeExecution] = None
    outcome: Optional[TradeOutcome] = None


class DecisionDetail(BaseModel):
    decision_id: int
    portfolio_id: int
    action_summary: str
    confidence: float
    reasoning: str
    raw_llm_output: str
    model_used: str
    created_at: datetime
    trade: Optional[TradeExecution] = None