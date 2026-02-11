from prefect import task 
from investment_engine.services.snapshot_service import SnapshotService

@task
def create_snapshot(state, market_snapshot):

    price_lookup = {
        s["symbol"]: s["current_price"]
        for s in market_snapshot
    }

    SnapshotService.create(
        portfolio_id=state["portfolio_id"],
        price_lookup=price_lookup,
    )
