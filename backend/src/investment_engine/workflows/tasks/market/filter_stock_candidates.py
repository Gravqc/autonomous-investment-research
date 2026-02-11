from prefect import task
from typing import List, Dict, Any
from investment_engine.services.data_sources.market_client import MarketDataClient

@task
def filter_stock_candidates(
    market_snapshot: List[Dict[str, Any]], 
    min_change_pct: float = 1.5, 
    top_n: int = 10
) -> List[Dict[str, Any]]:
    """
    Filters the market snapshot for 'Active Movers'.
    
    Logic:
    1. Filter stocks where absolute(daily_change) >= min_change_pct.
    2. Sort by magnitude of move (biggest movers first).
    3. Return top_n candidates.
    """
    return MarketDataClient.filter_candidates(market_snapshot, min_change_pct, top_n)