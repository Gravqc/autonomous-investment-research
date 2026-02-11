from prefect import task, get_run_logger
from typing import List, Dict, Any
from investment_engine.services.data_sources.news_client import MarketAuxClient
from investment_engine.settings import settings

@task()
def enrich_candidates(candidates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Takes the filtered list of candidates and appends news context 
    using the Marketaux API.
    """
    news_client = MarketAuxClient(api_key=settings.market_aux_api_key, base_url=settings.market_aux_base_url)
    return news_client.enrich_stock_candidates(candidates=candidates)