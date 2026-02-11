from pydantic import BaseModel, Field
from typing import List


class StockDecision(BaseModel):
    symbol: str = Field(..., description="Ticker symbol")
    action: str = Field(..., description="BUY, SELL, or HOLD")
    confidence: float = Field(..., ge=0, le=1)
    reasoning: str = Field(..., max_length=300)


class DecisionResponse(BaseModel):
    decisions: List[StockDecision]
