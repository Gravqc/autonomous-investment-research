from datetime import datetime
from typing import List, Optional
import json

from investment_engine.db.session import session_scope
from investment_engine.db.models.trades import Trade
from investment_engine.db.models.portfolios import Portfolio
from investment_engine.services.data_sources.market_client import MarketDataClient
from investment_engine.schemas.trades import TradeRecord, RecentTrades


class TradeService:

    MAX_POSITION_PCT = 0.20   # 20% cap
    MIN_CONFIDENCE = 0.60

    @staticmethod
    def execute(decision_rows, state, price_lookup):
        with session_scope() as session:
            cash = state["cash_balance"]
            portfolio_id = state["portfolio_id"]

            for decision_row in decision_rows:
                # Parse the decision data from raw_llm_output
                decision_data = json.loads(decision_row.raw_llm_output)

                symbol = decision_data["symbol"]
                action = decision_data["action"]
                requested_qty = decision_data["quantity"]
                confidence = decision_data["confidence"]

                if confidence < TradeService.MIN_CONFIDENCE:
                    continue

                price = price_lookup.get(symbol)

                if not price:
                    continue

                if requested_qty <= 0:
                    continue

                # 🔥 HARD RISK CAP
                max_alloc_cash = cash * TradeService.MAX_POSITION_PCT
                max_qty_allowed = int(max_alloc_cash // price)

                final_qty = min(requested_qty, max_qty_allowed)
                total_val = final_qty * price

                if final_qty <= 0:
                    continue

                if action == "BUY":
                    trade = Trade(
                        portfolio_id=portfolio_id,
                        symbol=symbol,
                        side="BUY",
                        total_value=total_val,
                        quantity=final_qty,
                        price=price,
                        decision_id=decision_row.id,
                    )

                    session.add(trade)
                    cash -= final_qty * price

                elif action == "SELL":
                    trade = Trade(
                        portfolio_id=portfolio_id,
                        symbol=symbol,
                        side="SELL",
                        total_value=total_val,
                        quantity=final_qty,
                        price=price,
                        decision_id=decision_row.id,
                    )

                    session.add(trade)

    @staticmethod
    def get_recent_trades(limit: int = 20, portfolio_id: Optional[int] = None) -> RecentTrades:
        """Get recent trade executions"""
        with session_scope() as session:
            # Get the first portfolio if no ID specified
            if portfolio_id is None:
                portfolio = session.query(Portfolio).first()
                if not portfolio:
                    raise ValueError("No portfolio found")
                portfolio_id = portfolio.id

            trades = (
                session.query(Trade)
                .filter(Trade.portfolio_id == portfolio_id)
                .order_by(Trade.executed_at.desc())
                .limit(limit)
                .all()
            )

            # Get total count
            total_count = (
                session.query(Trade)
                .filter(Trade.portfolio_id == portfolio_id)
                .count()
            )

            trade_records = [
                TradeRecord(
                    trade_id=trade.id,
                    portfolio_id=trade.portfolio_id,
                    symbol=trade.symbol,
                    side=trade.side,
                    quantity=float(trade.quantity),
                    price=float(trade.price),
                    total_value=float(trade.total_value),
                    executed_at=trade.executed_at,
                    decision_id=trade.decision_id
                )
                for trade in trades
            ]

            return RecentTrades(
                trades=trade_records,
                total_trades=total_count
            )

    @staticmethod
    def get_trades_for_decision(decision_id: int) -> List[TradeRecord]:
        """Get all trades associated with a specific decision"""
        with session_scope() as session:
            trades = (
                session.query(Trade)
                .filter(Trade.decision_id == decision_id)
                .order_by(Trade.executed_at.desc())
                .all()
            )

            return [
                TradeRecord(
                    trade_id=trade.id,
                    portfolio_id=trade.portfolio_id,
                    symbol=trade.symbol,
                    side=trade.side,
                    quantity=float(trade.quantity),
                    price=float(trade.price),
                    total_value=float(trade.total_value),
                    executed_at=trade.executed_at,
                    decision_id=trade.decision_id
                )
                for trade in trades
            ]
