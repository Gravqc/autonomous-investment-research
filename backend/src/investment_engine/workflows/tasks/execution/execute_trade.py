from prefect import task
from investment_engine.services.trade_service import TradeService

@task
def execute_trade(decision):

    TradeService.execute_trade(
        portfolio_id=1,
        symbol=decision["symbol"],
        side=decision["action"],
        quantity=decision["quantity"],
    )
