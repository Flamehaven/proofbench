# [*] ProofBench Backend - Async Session Management
# Dependency injection for FastAPI endpoints

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base import async_session_maker


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that provides a database session.

    Usage in endpoints:
        @router.get("/example")
        async def example(db: AsyncSession = Depends(get_db_session)):
            # Use db here
            pass
    """
    if async_session_maker is None:
        raise RuntimeError("Database not initialized. Call init_db() in startup event.")

    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
