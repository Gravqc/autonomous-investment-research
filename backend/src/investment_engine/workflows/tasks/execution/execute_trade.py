from prefect import task
from investment_engine.services.trade_service import TradeService

@task
def execute_trade(decision_rows, state, market_snapshot):
    """
    decision_rows -> persisted Decision rows with IDs & raw LLM Output
    state -> Portfolio state with cash balance
    market_snapshot -> list of stocks from your fetch task
    """

    price_lookup = {
        s["symbol"]: s["current_price"]
        for s in market_snapshot
    }

    TradeService.execute(
        decision_rows=decision_rows,
        state=state,
        price_lookup=price_lookup        
    )
