from datetime import datetime

# force model registration
import investment_engine.db.models  

from investment_engine.db.session import session_scope
from investment_engine.db.models.portfolios import Portfolio
from investment_engine.db.models.portfolio_snapshots import PortfolioSnapshot


def main():
    """
    Seed the database with an initial portfolio + snapshot.
    """

    with session_scope() as session:

        portfolio = Portfolio(
            name="Primary Portfolio",
            strategy_name="Mock Strategy",
        )

        session.add(portfolio)
        session.flush()

        snapshot = PortfolioSnapshot(
            portfolio_id=portfolio.id,
            cash_balance=1_000_000,
            equity_value=0,
            total_value=1_000_000,
            created_at=datetime.utcnow(),
        )

        session.add(snapshot)


if __name__ == "__main__":
    main()
