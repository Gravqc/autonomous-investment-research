from prefect import task
from investment_engine.services.portfolio_service import PortfolioService

@task
def build_state():

    return PortfolioService.get_current_state()
