from investment_engine.workflows.tasks.decisions import store_decisions
from prefect import flow
from investment_engine.services.decision_service import DecisionService
from investment_engine.workflows.tasks.market.fetch_stock_candidates import fetch_market_snapshot
from investment_engine.workflows.tasks.market.filter_stock_candidates import filter_stock_candidates
from investment_engine.workflows.tasks.external.enrich_stock_candidates import enrich_candidates
from investment_engine.workflows.tasks.llm.generate_decisions import generate_decisions
from investment_engine.workflows.tasks.portfolio.build_state import build_state
from investment_engine.workflows.tasks.decisions.store_decisions import store_decisions
from investment_engine.workflows.tasks.execution.execute_trade import execute_trade
from investment_engine.workflows.tasks.snapshot.create_snapshot import create_snapshot


@flow
def daily_flow():
    """
    Daily investment workflow with real-time portfolio valuation
    
    Key improvement: Fetch market data FIRST, then build portfolio state with current prices
    This ensures the LLM gets real-time portfolio values for better decision making
    """
    # 1. Fetch current market data FIRST
    market_snapshot = fetch_market_snapshot()
    
    # 2. Create price lookup for real-time portfolio valuation
    price_lookup = {
        s["symbol"]: s["current_price"]
        for s in market_snapshot
    }
    
    # 3. Build portfolio state with current market prices
    # This gives the LLM real-time portfolio values instead of stale snapshot data
    state = build_state(current_prices=price_lookup)

    # 4. Filter top stock candidates based on market conditions
    stock_candidates = filter_stock_candidates(market_snapshot=market_snapshot)

    # 5. Enrich candidates with recent news and market context
    stock_candidates_with_news_data = enrich_candidates(candidates=stock_candidates)

    # 6. LLM Decision Phase - now with real-time portfolio context
    decisions = generate_decisions(state, enriched_candidates=stock_candidates_with_news_data)

    # 7. Store decisions and return decision_id's
    decision_rows = store_decisions(decisions, state=state)

    # 8. Execute trades based on decisions
    execute_trade(decision_rows=decision_rows, state=state, market_snapshot=market_snapshot)

    # 9. Create new portfolio snapshot with current market prices
    create_snapshot.fn(state=state, market_snapshot=market_snapshot)