from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, DateTime, ForeignKey, Numeric
from datetime import datetime

from investment_engine.db.base import Base


class PositionSnapshot(Base):
    __tablename__ = "position_snapshots"

    id: Mapped[int] = mapped_column(primary_key=True)

    snapshot_id: Mapped[int] = mapped_column(
        ForeignKey("portfolio_snapshots.id"),
        index=True
    )

    symbol: Mapped[str] = mapped_column(String(10), index=True)

    quantity: Mapped[float] = mapped_column(Numeric(14, 4))

    avg_price: Mapped[float] = mapped_column(Numeric(14, 2))

