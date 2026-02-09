from investment_engine.workflows.tasks.market.fetch_prices import fetch_prices
from investment_engine.workflows.tasks.portfolio.build_state import build_state
from investment_engine.workflows.tasks.decisions.mock_decision import mock_decision
from investment_engine.workflows.tasks.execution.execute_trade import execute_trade
from investment_engine.workflows.tasks.snapshot.create_snapshot import create_snapshot

class DailyInvestmentOrchestrator:
    @staticmethod
    def run():
        # Call Prefect tasks as Python callables; Prefect will handle task runs
        #state = build_state.fn()

        prices = fetch_prices.fn()

        decision = mock_decision.fn(prices)

        execute_trade.fn(decision)

        create_snapshot.fn()