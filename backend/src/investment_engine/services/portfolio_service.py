from sqlalchemy import select, desc

from investment_engine.db.session import session_scope
from investment_engine.db.models.portfolios import Portfolio
from investment_engine.db.models.portfolio_snapshots import PortfolioSnapshot
from investment_engine.db.models.position_snapshots import PositionSnapshot


class PortfolioService:

    @staticmethod
    def get_current_state(portfolio_id: int = 1):

        with session_scope() as session:

            portfolio = session.get(Portfolio, portfolio_id)

            if not portfolio:
                raise ValueError("Portfolio does not exist.")

            latest_snapshot = session.execute(
                select(PortfolioSnapshot)
                .where(PortfolioSnapshot.portfolio_id == portfolio_id)
                .order_by(desc(PortfolioSnapshot.created_at))
                .limit(1)
            ).scalar_one_or_none()

            # positions = session.execute(
            #     select(PositionSnapshot)
            #     .where(PositionSnapshot.portfolio_id == portfolio_id)
            # ).scalars().all()

            return {
                "portfolio_id": portfolio.id,
                "cash_balance": latest_snapshot.cash_balance if latest_snapshot else 0,
                "total_value": latest_snapshot.total_value if latest_snapshot else 0,
                # "positions": [
                #     {
                #         "symbol": p.symbol,
                #         "quantity": float(p.quantity),
                #         "avg_price": float(p.avg_price),
                #     }
                #     for p in positions
                # ],
            }
