from datetime import datetime

from investment_engine.db.session import session_scope
from investment_engine.db.models.trades import Trade
from investment_engine.services.data_sources.market_client import MarketDataClient


class TradeService:

    MAX_POSITION_PCT = 0.20   # 20% cap
    MIN_CONFIDENCE = 0.60

    @staticmethod
    def execute(decision_response, state, price_lookup):

        with session_scope() as session:

            cash = state["cash_balance"]
            portfolio_id = state["portfolio_id"]

            for d in decision_response.decisions:

                if d.confidence < TradeService.MIN_CONFIDENCE:
                    continue

                symbol = d.symbol
                price = price_lookup.get(symbol)

                if not price:
                    continue

                requested_qty = d.quantity

                if requested_qty <= 0:
                    continue

                # 🔥 HARD RISK CAP
                max_alloc_cash = cash * TradeService.MAX_POSITION_PCT
                max_qty_allowed = int(max_alloc_cash // price)

                final_qty = min(requested_qty, max_qty_allowed)
                total_val = final_qty * price

                if final_qty <= 0:
                    continue

                if d.action == "BUY":

                    trade = Trade(
                        portfolio_id=portfolio_id,
                        symbol=symbol,
                        side="BUY",
                        total_value=total_val,
                        quantity=final_qty,
                        price=price,
                    )

                    session.add(trade)

                    cash -= final_qty * price

                elif d.action == "SELL":

                    trade = Trade(
                        portfolio_id=portfolio_id,
                        symbol=symbol,
                        side="SELL",
                        total_value = total_val,
                        quantity=final_qty,
                        price=price,
                    )

                    session.add(trade)
