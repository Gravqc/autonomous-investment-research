from investment_engine.workflows.tasks.market.fetch_stock_candidates import fetch_market_snapshot
from investment_engine.workflows.tasks.market.filter_stock_candidates import filter_stock_candidates
from investment_engine.workflows.tasks.external.enrich_stock_candidates import enrich_candidates
from investment_engine.workflows.tasks.llm.generate_decisions import generate_decisions
from investment_engine.workflows.tasks.portfolio.build_state import build_state
from investment_engine.workflows.tasks.decisions.mock_decision import mock_decision
from investment_engine.workflows.tasks.execution.execute_trade import execute_trade
from investment_engine.workflows.tasks.snapshot.create_snapshot import create_snapshot


class DailyInvestmentOrchestrator:
    @staticmethod
    def run():
        # Call Prefect tasks as Python callables; Prefect will handle task runs
        #state = build_state.fn()

        # Fetch nifty 50 stock data
        market_snapshot = fetch_market_snapshot.fn()
        # Filter top 10 stocks 
        stock_candidates = filter_stock_candidates.fn(market_snapshot=market_snapshot)
        # Fill our stock candidates with recent news abt said stock and industry
        #stock_candidates_with_news_data = enrich_candidates.fn(candidates=stock_candidates)

        # 4. LLM Decision Phase (New Step)
        decisions = generate_decisions.fn(enriched_candidates=stock_candidates)

        print("done")
        # decision = mock_decision.fn(prices)

        # execute_trade.fn(decision)

        # create_snapshot.fn()