from investment_engine.domain.orchestrators.daily_investment_orchestrator import (
    DailyInvestmentOrchestrator,
)
from investment_engine.workflows.flows import daily_flow


def main():
    daily_flow()


if __name__ == "__main__":
    main()
