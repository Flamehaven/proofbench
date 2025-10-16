# [T] ProofBench Backend - Pytest Configuration
# Shared test fixtures and configuration

import pytest
import asyncio
from typing import AsyncGenerator, Generator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import Settings
from app.db.base import Base
from app.models.proof import Proof, ProofStep


# [=] Test Settings Override
@pytest.fixture(scope="session")
def test_settings() -> Settings:
    """Override settings for testing environment"""
    return Settings(
        DATABASE_URL="sqlite+aiosqlite:///:memory:",  # In-memory SQLite for tests
        DEBUG=True,
        API_KEY="test-api-key",
        CORS_ORIGINS=["http://localhost:3000"],
        # No real API keys needed for unit tests
        OPENAI_API_KEY=None,
        ANTHROPIC_API_KEY=None,
        GOOGLE_API_KEY=None,
    )


# [=] Async Event Loop Fixture
@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create event loop for async tests"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


# [=] Test Database Engine
@pytest.fixture(scope="function")
async def test_db_engine(test_settings: Settings):
    """Create test database engine with in-memory SQLite"""
    engine = create_async_engine(
        test_settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False,
    )

    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    # Drop all tables after test
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


# [=] Test Database Session
@pytest.fixture(scope="function")
async def db_session(test_db_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create test database session"""
    session_maker = async_sessionmaker(
        test_db_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async with session_maker() as session:
        yield session


# [=] Sample Proof Data Fixtures
@pytest.fixture
def sample_proof_data():
    """Sample proof data for testing"""
    return {
        "domain": "algebra",
        "steps": [
            {
                "claim": "Addition is commutative",
                "equation": {"lhs": "x + 2", "rhs": "2 + x"},
                "reasoning": "By the commutative property of addition",
                "dependencies": []
            },
            {
                "claim": "Simplify expression",
                "equation": {"lhs": "2*x + x", "rhs": "3*x"},
                "reasoning": "Combine like terms",
                "dependencies": [0]
            }
        ]
    }


@pytest.fixture
async def sample_proof(db_session: AsyncSession, sample_proof_data):
    """Create a sample proof in database for testing"""
    from app.crud.crud_proof import proof as crud_proof
    from app.schemas.proof import ProofCreate

    proof_create = ProofCreate(**sample_proof_data)
    db_proof = await crud_proof.create_with_steps(db=db_session, obj_in=proof_create)

    return db_proof


# [=] Mock LLM Response Fixture
@pytest.fixture
def mock_llm_response():
    """Mock LLM response for testing semantic evaluation"""
    return {
        "score": 85,
        "reasoning": "The proof step is logically sound and correctly applies mathematical principles."
    }
