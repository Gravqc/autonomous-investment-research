from collections import defaultdict
from datetime import datetime
from investment_engine.db.models import PositionSnapshot
from sqlalchemy import select, func

from investment_engine.workflows.utils.type_conversion import to_decimal

from investment_engine.db.session import session_scope
from investment_engine.db.models.trades import Trade
from investment_engine.db.models.portfolio_snapshots import PortfolioSnapshot


class SnapshotService:
    @staticmethod
    def create(portfolio_id, price_lookup):
        decimal_prices = {k: to_decimal(v) for k, v in price_lookup.items()}

        with session_scope() as session:

            trades = (
                session.query(Trade)
                .filter(Trade.portfolio_id == portfolio_id)
                .all()
            )

            positions = defaultdict(lambda: {"qty": 0, "cost": 0})

            latest_snapshot = (
                session.query(PortfolioSnapshot)
                .filter(PortfolioSnapshot.portfolio_id == portfolio_id)
                .order_by(PortfolioSnapshot.created_at.desc())
                .first()
            )

            if not latest_snapshot:
                raise RuntimeError("No initial snapshot found. Seed the portfolio first.")

            cash = latest_snapshot.cash_balance

            for t in trades:

                if t.side == "BUY":
                    # SQLAlchemy `Numeric` columns are returned as `Decimal`,
                    # so keep everything in Decimal space to avoid type errors.
                    trade_value = t.quantity * t.price
                    positions[t.symbol]["qty"] += t.quantity
                    positions[t.symbol]["cost"] += trade_value
                    cash -= trade_value

                elif t.side == "SELL":
                    qty = positions[t.symbol]["qty"]
                    trade_value = qty * t.price
                    cash += trade_value
                    positions[t.symbol] = {"qty": 0, "cost": 0}

            equity_value = 0

            snapshot = PortfolioSnapshot(
                portfolio_id=portfolio_id,
                cash_balance=cash,
                equity_value=0,  # fill after computing
                total_value=0,
                created_at=datetime.utcnow(),
            )

            session.add(snapshot)
            session.flush()

            for symbol, pos in positions.items():

                if pos["qty"] <= 0:
                    continue

                price = decimal_prices.get(symbol, 0)
                market_value = pos["qty"] * price
                equity_value += market_value

                avg_price = pos["cost"] / pos["qty"]

                position = PositionSnapshot(
                    snapshot_id=snapshot.id,
                    symbol=symbol,
                    quantity=pos["qty"],
                    avg_price=avg_price,
                )

                session.add(position)

            snapshot.equity_value = equity_value
            snapshot.total_value = equity_value + cash