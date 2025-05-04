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



# テストごとに全テーブルをTRUNCATEするfixture（asyncで実行）
@pytest_asyncio.fixture(scope="function", autouse=True)
async def reset_db():
    engine = create_async_engine(TEST_DATABASE_URL, echo=False, future=True)
    async with engine.begin() as conn:
        # トランケートするテーブルの一覧（順序はリレーションシップに依存するものから）
        tables = [
            "feedback_responses", "recipe_feedbacks", 
            "recipe_request_tags", "task_tags",
            "qr_codes", "application_logs", "audit_logs", "performance_logs", 
            "user_helper_relationships", "recipe_requests", "task_requests", 
            "helper_profiles", "user_profiles", "tags", "users"
        ]
        
        # すべてのテーブルを削除（CASCADE指定で外部キー制約を無視）
        for table in tables:
            try:
                await conn.execute(f'TRUNCATE TABLE "{table}" RESTART IDENTITY CASCADE;')
            except Exception as e:
                print(f"Warning: Could not truncate {table}: {e}")
                
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
