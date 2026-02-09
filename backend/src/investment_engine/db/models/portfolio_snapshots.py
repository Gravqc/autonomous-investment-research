from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import DateTime, ForeignKey, Numeric
from datetime import datetime

from investment_engine.db.base import Base


class PortfolioSnapshot(Base):
    __tablename__ = "portfolio_snapshots"

    id: Mapped[int] = mapped_column(primary_key=True)

    portfolio_id: Mapped[int] = mapped_column(
        ForeignKey("portfolios.id"), index=True
    )

    cash_balance: Mapped[float] = mapped_column(Numeric(16, 2))

    equity_value: Mapped[float] = mapped_column(Numeric(16, 2))

    total_value: Mapped[float] = mapped_column(Numeric(16, 2))

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, index=True
    )

    portfolio = relationship("Portfolio", back_populates="snapshots")
