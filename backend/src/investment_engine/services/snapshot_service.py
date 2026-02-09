from datetime import datetime
from sqlalchemy import select, func

from investment_engine.db.session import session_scope
from investment_engine.db.models.trades import Trade
from investment_engine.db.models.portfolio_snapshots import PortfolioSnapshot
from investment_engine.services.data_sources.market_client import MarketDataClient


class SnapshotService:

    @staticmethod
    def create_snapshot(portfolio_id: int = 1):

        with session_scope() as session:

            trades = session.execute(
                select(Trade).where(Trade.portfolio_id == portfolio_id)
            ).scalars().all()

            cash = 1_000_000  # replace later with experiment starting cash
            positions = {}

            for trade in trades:

                if trade.symbol not in positions:
                    positions[trade.symbol] = 0

                if trade.side == "BUY":
                    positions[trade.symbol] += float(trade.quantity)
                    cash -= float(trade.total_value)

                else:
                    positions[trade.symbol] -= float(trade.quantity)
                    cash += float(trade.total_value)

            equity_value = 0

            for symbol, qty in positions.items():

                if qty <= 0:
                    continue

                price = MarketDataClient.get_latest_price(symbol)
                equity_value += price * qty

            snapshot = PortfolioSnapshot(
                portfolio_id=portfolio_id,
                cash_balance=cash,
                equity_value=equity_value,
                total_value=cash + equity_value,
                created_at=datetime.utcnow(),
            )

            session.add(snapshot)

            return snapshot
