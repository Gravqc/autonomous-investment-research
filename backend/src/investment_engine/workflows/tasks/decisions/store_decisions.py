import random
from investment_engine.services.decision_service import DecisionService
from prefect import task


@task
def store_decisions(decisions, state):
    return DecisionService.persist(decisions, portfolio_id=state["portfolio_id"])
