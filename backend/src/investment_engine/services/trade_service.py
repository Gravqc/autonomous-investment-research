from datetime import datetime

from investment_engine.db.session import session_scope
from investment_engine.db.models.trades import Trade
from investment_engine.services.data_sources.market_client import MarketDataClient


class TradeService:

    @staticmethod
    def execute_trade(
        portfolio_id: int,
        symbol: str,
        side: str,
        quantity: float,
        decision_id: int | None = None,
    ):

        with session_scope() as session:

            price = MarketDataClient.get_latest_price(symbol)

            trade = Trade(
                portfolio_id=portfolio_id,
                symbol=symbol,
                side=side,
                quantity=quantity,
                price=price,
                total_value=price * quantity,
                executed_at=datetime.utcnow(),
                decision_id=decision_id,
            )

            session.add(trade)

            return {
                "symbol": symbol,
                "price": price,
                "quantity": quantity,
            }
