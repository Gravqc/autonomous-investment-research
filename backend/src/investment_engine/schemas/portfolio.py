from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class Position(BaseModel):
    symbol: str
    quantity: float
    avg_price: float
    current_value: Optional[float] = None
    unrealized_pnl: Optional[float] = None


class PortfolioState(BaseModel):
    portfolio_id: int
    current_value: float
    cash_balance: float
    equity_value: float
    snapshot_date: datetime
    positions: List[Position]


class PortfolioSnapshot(BaseModel):
    date: str
    total_value: float
    cash_balance: float
    equity_value: float


class PortfolioValueHistory(BaseModel):
    snapshots: List[PortfolioSnapshot]
    latest_snapshot_date: datetime
    total_return_pct: float
    days_tracked: int


class PerformanceMetrics(BaseModel):
    total_return_pct: float
    total_return_amount: float
    max_drawdown_pct: float
    days_tracked: int
    starting_value: float
    current_value: float
    best_day_return: float
    worst_day_return: float