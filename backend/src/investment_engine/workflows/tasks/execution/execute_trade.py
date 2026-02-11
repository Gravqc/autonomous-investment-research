from prefect import task
from investment_engine.services.trade_service import TradeService

@task
def execute_trade(decisions, state, market_snapshot):
    """
    market_snapshot -> list of stocks from your fetch task
    """

    price_lookup = {
        s["symbol"]: s["current_price"]
        for s in market_snapshot
    }

    TradeService.execute(
        decision_response=decisions,
        state=state,
        price_lookup=price_lookup,
    )
