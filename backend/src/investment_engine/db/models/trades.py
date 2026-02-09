from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, DateTime, ForeignKey, Numeric
from datetime import datetime

from investment_engine.db.base import Base


class Trade(Base):
    __tablename__ = "trades"

    id: Mapped[int] = mapped_column(primary_key=True)

    portfolio_id: Mapped[int] = mapped_column(
        ForeignKey("portfolios.id"), index=True
    )
    # Name of the stock/asset
    symbol: Mapped[str] = mapped_column(String(10), index=True)

    side: Mapped[str] = mapped_column(String(10))  # BUY / SELL (consider Enum later)   


    quantity: Mapped[float] = mapped_column(Numeric(14, 4)) # Quantity of the stock/asset
    price: Mapped[float] = mapped_column(Numeric(14, 2)) # Price of the stock/asset
    total_value: Mapped[float] = mapped_column(Numeric(16, 2)) # Total value of the trade

    executed_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, index=True
    )

    decision_id: Mapped[int] = mapped_column(
        ForeignKey("decisions.id"), nullable=True
    )

    portfolio = relationship("Portfolio", back_populates="trades")
