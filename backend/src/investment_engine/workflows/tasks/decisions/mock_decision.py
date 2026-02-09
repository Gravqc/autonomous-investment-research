import random
from prefect import task


@task
def mock_decision(prices):

    symbol = random.choice(list(prices.keys()))

    return {
        "symbol": symbol,
        "action": "BUY",
        "quantity": 1,
    }
