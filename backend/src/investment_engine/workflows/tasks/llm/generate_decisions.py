from prefect import task
from investment_engine.services.llm.decision_engine import DecisionEngine


@task
def generate_decisions(state, enriched_candidates):
    return DecisionEngine.generate(state, enriched_candidates)
    #return DecisionEngine.generate_ollama(state, candidates=enriched_candidates)
