from prefect import task 
from investment_engine.services.snapshot_service import SnapshotService

@task
def create_snapshot():

    SnapshotService.create_snapshot(portfolio_id=1)
