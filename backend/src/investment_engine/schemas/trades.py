from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class TradeRecord(BaseModel):
    trade_id: int
    portfolio_id: int
    symbol: str
    side: str
    quantity: float
    price: float
    total_value: float
    executed_at: datetime
    decision_id: Optional[int] = None


class RecentTrades(BaseModel):
    trades: list[TradeRecord]
    total_trades: int