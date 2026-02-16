from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class Position(BaseModel):
    symbol: str
    quantity: float
    avg_price: float                    # Cost basis per share
    current_price: float                # Current market price per share
    current_value: float                # quantity * current_price
    cost_basis: float                   # quantity * avg_price
    unrealized_pnl: float               # current_value - cost_basis
    unrealized_pnl_pct: float           # (unrealized_pnl / cost_basis) * 100
    days_held: Optional[int] = None     # Days since first purchase


class PortfolioState(BaseModel):
    portfolio_id: int
    current_value: float                # Cash + current equity value
    cash_balance: float
    equity_value: float                 # Sum of current market values
    cost_basis: float                   # Sum of cost basis
    unrealized_pnl: float               # equity_value - cost_basis
    unrealized_pnl_pct: float           # (unrealized_pnl / cost_basis) * 100
    snapshot_date: datetime             # When positions were last updated
    market_data_timestamp: Optional[datetime] = None  # When prices were fetched
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