from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, DateTime
from datetime import datetime

from investment_engine.db.base import Base


class Portfolio(Base):
    # Table name in postgres
    __tablename__ = "portfolios"

    # Primary key
    # Mapped[int] means the column is an integer
    # primary_key=True means the column is the primary key
    id: Mapped[int] = mapped_column(primary_key=True)

    # String(100) means the column is a string with a maximum length of 100
    # nullable=False means the column is not nullable
    name: Mapped[str] = mapped_column(String(100), nullable=False)

    # String(100) means the column is a string with a maximum length of 100
    # nullable=True means the column is nullable

    strategy_name: Mapped[str] = mapped_column(String(100), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    # Relationships (optional but nice)
    trades = relationship("Trade", back_populates="portfolio")
    snapshots = relationship("PortfolioSnapshot", back_populates="portfolio")
    decisions = relationship("Decision", back_populates="portfolio")
