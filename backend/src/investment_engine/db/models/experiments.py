from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import DateTime, Numeric, String
from datetime import datetime

from investment_engine.db.base import Base


class Experiment(Base):
    __tablename__ = "experiments"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(String(100))

    starting_cash: Mapped[float] = mapped_column(Numeric(16, 2))

    start_date: Mapped[datetime] = mapped_column(DateTime)

    llm_model: Mapped[str] = mapped_column(String(50))

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )
