from investment_engine.db.session import session_scope
from investment_engine.db.models.decisions import Decision


class DecisionService:

    @staticmethod
    def persist(decision_response, portfolio_id, model_name="gpt-4.1-mini"):

        with session_scope() as session:

            decision_rows = []

            for d in decision_response.decisions:

                row = Decision(
                    portfolio_id=portfolio_id,
                    action_summary=f"{d.action} {d.quantity} {d.symbol}",
                    confidence=d.confidence,
                    reasoning=d.reasoning,
                    raw_llm_output=d.model_dump_json(),
                    model_used=model_name,
                )

                session.add(row)
                decision_rows.append(row)

            session.flush()  # gets IDs

            return decision_rows
