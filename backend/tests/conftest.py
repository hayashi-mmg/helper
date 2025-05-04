import pytest
import os
import subprocess

# テスト用DBのURL（本番と分離）
TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL", "postgresql+asyncpg://postgres:postgres@db:5432/test_markdown_cms")

# マイグレーションは同期で先に実行
@pytest.fixture(scope="session", autouse=True)
def apply_migrations():
    subprocess.run([
        "alembic", "-x", f"db_url={TEST_DATABASE_URL}", "upgrade", "head"
    ], check=True, cwd=os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
    yield

# DBセッションfixtureはマイグレーション後にimport
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.db.base import Base

import asyncio



# テストごとにusersテーブルをTRUNCATEするfixture（asyncで実行）
@pytest_asyncio.fixture(scope="function", autouse=True)
async def reset_db():
    engine = create_async_engine(TEST_DATABASE_URL, echo=False, future=True)
    async with engine.begin() as conn:
        await conn.execute("TRUNCATE TABLE users RESTART IDENTITY CASCADE;")
        await conn.commit()
    yield
    await engine.dispose()

@pytest_asyncio.fixture(scope="function")
async def db_session(reset_db):
    engine = create_async_engine(TEST_DATABASE_URL, echo=False, future=True)
    TestSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
    async with TestSessionLocal() as session:
        yield session
    await engine.dispose()
