from prefect import task
from investment_engine.services.portfolio_service import PortfolioService

@task
def build_state(current_prices=None):
    """
    Build portfolio state with optional current market prices
    
    Args:
        current_prices: dict of {symbol: current_price} from market data
    """
    return PortfolioService.build_state(current_prices=current_prices)
