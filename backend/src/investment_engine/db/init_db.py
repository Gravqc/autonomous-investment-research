from investment_engine.db.base import Base
from investment_engine.db.session import engine

# IMPORTANT: import models so metadata registers
import investment_engine.db.models.portfolios
import investment_engine.db.models.trades
import investment_engine.db.models.decisions
import investment_engine.db.models.portfolio_snapshots
import investment_engine.db.models.position_snapshots
import investment_engine.db.models.experiments

import investment_engine.db.models

"""
    - Run this file to initialize tables in postgres
"""
def init_db():
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully 🚀")


if __name__ == "__main__":
    init_db()
