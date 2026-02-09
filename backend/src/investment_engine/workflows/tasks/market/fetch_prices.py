from prefect import task
from investment_engine.services.data_sources.market_client import MarketDataClient

NIFTY_10 = [
    "RELIANCE",
    "TCS",
    "INFY",
    "HDFCBANK",
    "ICICIBANK",
]

@task
def fetch_prices():

    return MarketDataClient.get_prices(NIFTY_10)
