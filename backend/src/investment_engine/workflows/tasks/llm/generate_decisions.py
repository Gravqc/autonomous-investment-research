from prefect import task
from investment_engine.services.llm.decision_engine import DecisionEngine


@task
def generate_decisions(enriched_candidates):
    #return DecisionEngine.generate(enriched_candidates)
    return DecisionEngine.generate_ollama(candidates=enriched_candidates)
