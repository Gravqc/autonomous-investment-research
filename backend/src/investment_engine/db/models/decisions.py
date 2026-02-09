from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, DateTime, ForeignKey, Numeric, Text
from datetime import datetime

from investment_engine.db.base import Base


class Decision(Base):
    __tablename__ = "decisions"

    id: Mapped[int] = mapped_column(primary_key=True)

    portfolio_id: Mapped[int] = mapped_column(
        ForeignKey("portfolios.id"), index=True
    )

    action_summary: Mapped[str] = mapped_column(String(255))

    confidence: Mapped[float] = mapped_column(Numeric(5, 4))

    reasoning: Mapped[str] = mapped_column(Text)

    raw_llm_output: Mapped[str] = mapped_column(Text)

    model_used: Mapped[str] = mapped_column(String(50))

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    portfolio = relationship("Portfolio", back_populates="decisions")
