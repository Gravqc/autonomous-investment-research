from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from investment_engine.settings import settings

engine = create_engine(
    str(settings.postgres_url),
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)
