from sqlalchemy import select, desc

from investment_engine.db.session import session_scope
from investment_engine.db.models.portfolios import Portfolio
from investment_engine.db.models.portfolio_snapshots import PortfolioSnapshot
from investment_engine.db.models.position_snapshots import PositionSnapshot


class PortfolioService:
    def build_state():
        """
            Returns the latest portfolio state:
            - cash
            - equity
            - holdings
        """

        with session_scope() as session:

            portfolio = session.query(Portfolio).first()

            latest_snapshot = (
                session.query(PortfolioSnapshot)
                .filter(PortfolioSnapshot.portfolio_id == portfolio.id)
                .order_by(PortfolioSnapshot.created_at.desc())
                .first()
            )

            positions = (
                session.query(PositionSnapshot)
                .filter(PositionSnapshot.snapshot_id == latest_snapshot.id)
                .all()
            )

            holdings = [
                {
                    "symbol": p.symbol,
                    "quantity": p.quantity,
                    "avg_price": float(p.avg_price),
                }
                for p in positions
            ]

            return {
                "portfolio_id": portfolio.id,
                "cash_balance": float(latest_snapshot.cash_balance),
                "equity_value": float(latest_snapshot.equity_value),
                "total_value": float(latest_snapshot.total_value),
                "holdings": holdings,
            }