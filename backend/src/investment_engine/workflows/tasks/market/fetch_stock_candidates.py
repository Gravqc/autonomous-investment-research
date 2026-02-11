from prefect import task
from investment_engine.services.data_sources.market_client import MarketDataClient
from investment_engine.workflows.utils.nifty_50 import NIFTY_50

@task
def fetch_market_snapshot():
    # Returns a list of dicts with price AND change data
    return MarketDataClient.get_market_snapshot(NIFTY_50)
