from prefect import flow
from investment_engine.domain.orchestrators.daily_investment_orchestrator import DailyInvestmentOrchestrator


@flow
def daily_flow():
    DailyInvestmentOrchestrator.run()
