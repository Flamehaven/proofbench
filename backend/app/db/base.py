# [*] ProofBench Backend - Database Base Configuration
# SQLAlchemy 2.0 async declarative base

from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

class Base(DeclarativeBase):
    """Base class for all database models"""
    pass


# Global engine and session maker (will be initialized in session.py)
async_engine: AsyncEngine | None = None
async_session_maker: async_sessionmaker[AsyncSession] | None = None


async def init_db(database_url: str) -> None:
    """
    Initialize the database engine and session maker.

    Args:
        database_url: PostgreSQL connection string (async format)
                     Example: "postgresql+asyncpg://user:pass@localhost/dbname"
    """
    global async_engine, async_session_maker

    async_engine = create_async_engine(
        database_url,
        echo=False,  # Set to True for SQL query logging during development
        future=True,
        pool_size=10,
        max_overflow=20,
    )

    async_session_maker = async_sessionmaker(
        async_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )


async def create_tables() -> None:
    """Create all tables defined in models (for development/testing)"""
    if async_engine is None:
        raise RuntimeError("Database not initialized. Call init_db() first.")

    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def drop_tables() -> None:
    """Drop all tables (for testing cleanup)"""
    if async_engine is None:
        raise RuntimeError("Database not initialized. Call init_db() first.")

    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
