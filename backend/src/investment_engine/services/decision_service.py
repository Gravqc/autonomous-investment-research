from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import joinedload

from investment_engine.db.session import session_scope
from investment_engine.db.models.decisions import Decision
from investment_engine.db.models.trades import Trade
from investment_engine.db.models.portfolios import Portfolio
from investment_engine.schemas.decisions import (
    DecisionSummary,
    DecisionWithOutcome,
    DecisionDetail,
    TradeExecution,
    TradeOutcome
)


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

    @staticmethod
    def get_recent_decisions(limit: int = 10, portfolio_id: Optional[int] = None) -> List[DecisionSummary]:
        """Get recent decisions with basic information"""
        with session_scope() as session:
            # Get the first portfolio if no ID specified
            if portfolio_id is None:
                portfolio = session.query(Portfolio).first()
                if not portfolio:
                    raise ValueError("No portfolio found")
                portfolio_id = portfolio.id

            decisions = (
                session.query(Decision)
                .filter(Decision.portfolio_id == portfolio_id)
                .order_by(Decision.created_at.desc())
                .limit(limit)
                .all()
            )

            return [
                DecisionSummary(
                    decision_id=decision.id,
                    action_summary=decision.action_summary,
                    confidence=float(decision.confidence),
                    model_used=decision.model_used,
                    created_at=decision.created_at
                )
                for decision in decisions
            ]

    @staticmethod
    def get_decisions_with_outcomes(limit: int = 20, portfolio_id: Optional[int] = None) -> List[DecisionWithOutcome]:
        """Get decisions with their trade executions and outcomes"""
        with session_scope() as session:
            # Get the first portfolio if no ID specified
            if portfolio_id is None:
                portfolio = session.query(Portfolio).first()
                if not portfolio:
                    raise ValueError("No portfolio found")
                portfolio_id = portfolio.id

            # Get decisions with their associated trades
            decisions = (
                session.query(Decision)
                .outerjoin(Trade, Decision.id == Trade.decision_id)
                .filter(Decision.portfolio_id == portfolio_id)
                .order_by(Decision.created_at.desc())
                .limit(limit)
                .all()
            )

            result = []
            for decision in decisions:
                # Get associated trade
                trade = (
                    session.query(Trade)
                    .filter(Trade.decision_id == decision.id)
                    .first()
                )

                trade_execution = None
                trade_outcome = None

                if trade:
                    trade_execution = TradeExecution(
                        trade_id=trade.id,
                        symbol=trade.symbol,
                        side=trade.side,
                        quantity=float(trade.quantity),
                        price=float(trade.price),
                        total_value=float(trade.total_value),
                        executed_at=trade.executed_at
                    )

                    # Calculate basic outcome (this could be enhanced with actual P&L calculation)
                    days_since_trade = (datetime.utcnow() - trade.executed_at).days
                    trade_outcome = TradeOutcome(
                        position_change=f"{'+' if trade.side == 'BUY' else '-'}{trade.quantity} {trade.symbol}",
                        days_held=days_since_trade,
                        outcome_status="pending"  # Could be enhanced with actual P&L calculation
                    )

                result.append(DecisionWithOutcome(
                    decision_id=decision.id,
                    action_summary=decision.action_summary,
                    confidence=float(decision.confidence),
                    reasoning=decision.reasoning,
                    model_used=decision.model_used,
                    created_at=decision.created_at,
                    trade=trade_execution,
                    outcome=trade_outcome
                ))

            return result

    @staticmethod
    def get_decision_by_id(decision_id: int) -> DecisionDetail:
        """Get detailed information about a specific decision"""
        with session_scope() as session:
            decision = (
                session.query(Decision)
                .filter(Decision.id == decision_id)
                .first()
            )

            if not decision:
                raise ValueError(f"Decision {decision_id} not found")

            # Get associated trade
            trade = (
                session.query(Trade)
                .filter(Trade.decision_id == decision_id)
                .first()
            )

            trade_execution = None
            if trade:
                trade_execution = TradeExecution(
                    trade_id=trade.id,
                    symbol=trade.symbol,
                    side=trade.side,
                    quantity=float(trade.quantity),
                    price=float(trade.price),
                    total_value=float(trade.total_value),
                    executed_at=trade.executed_at
                )

            return DecisionDetail(
                decision_id=decision.id,
                portfolio_id=decision.portfolio_id,
                action_summary=decision.action_summary,
                confidence=float(decision.confidence),
                reasoning=decision.reasoning,
                raw_llm_output=decision.raw_llm_output,
                model_used=decision.model_used,
                created_at=decision.created_at,
                trade=trade_execution
            )
