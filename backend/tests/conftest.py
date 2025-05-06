import pytest
import os
import subprocess
from pydantic_settings import BaseSettings
from pydantic import field_serializer
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
from app.db.models.user import UserRole
from app.core.auth import create_access_token

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

# テスト用ヘルパープロファイルを作成するフィクスチャー
@pytest_asyncio.fixture
async def create_test_helper_profile(test_db: AsyncSession, helper_user_token_headers: dict):
    from app.db.models.user import User, UserRole
    from app.db.models.helper_profile import HelperProfile
    from app.core.auth import get_user_from_token
    
    # トークンからヘルパーユーザー情報を取得
    token = helper_user_token_headers["Authorization"].split(" ")[1]
    user_info = get_user_from_token(token)
    
    # ユーザーが存在しない場合は作成
    user = User(
        id=100,  # テスト用に固定ID
        username="testhelper",
        email=user_info.get("sub"),
        password_hash="$2b$12$lQ7oQICtAnns6Fo9FzIAAuMZ3vV8HYPSrN0kvJ3ESabR6wS.4EiDO",
        role=UserRole.HELPER,
        is_active=True
    )
    test_db.add(user)
    await test_db.commit()
    await test_db.refresh(user)
    
    # ヘルパープロファイル作成
    helper_profile = HelperProfile(
        user_id=user.id,
        qualification="介護士",
        specialties={"categories": ["和食", "中華"], "dishes": ["カレー", "餃子"]},
        availability={"weekdays": ["月", "水", "金"], "hours": {"start": 9, "end": 17}}
    )
    test_db.add(helper_profile)
    await test_db.commit()
    await test_db.refresh(helper_profile)
    
    return {
        "user_id": user.id,
        "profile_id": helper_profile.id,
        "qualification": helper_profile.qualification
    }

# テスト用ユーザーとヘルパーの関連付けを作成するフィクスチャー
@pytest_asyncio.fixture
async def create_test_user_helper_relationship(
    test_db: AsyncSession, 
    normal_user_token_headers: dict,
    create_test_helper_profile: dict
):
    from app.db.models.user import User
    from app.db.models.user_helper_assignment import UserHelperAssignment, RelationshipStatus
    from app.core.auth import get_user_from_token
    
    # トークンから一般ユーザー情報を取得
    token = normal_user_token_headers["Authorization"].split(" ")[1]
    user_info = get_user_from_token(token)
    
    # ユーザーが存在しない場合は作成
    user = User(
        id=200,  # テスト用に固定ID
        username="testuser",
        email=user_info.get("sub"),
        password_hash="$2b$12$lQ7oQICtAnns6Fo9FzIAAuMZ3vV8HYPSrN0kvJ3ESabR6wS.4EiDO",
        role=UserRole.USER,
        is_active=True
    )
    test_db.add(user)
    await test_db.commit()
    await test_db.refresh(user)
    
    # 関連付け作成
    assignment = UserHelperAssignment(
        user_id=user.id,
        helper_id=create_test_helper_profile["user_id"],
        status=RelationshipStatus.ACTIVE
    )
    test_db.add(assignment)
    await test_db.commit()
    await test_db.refresh(assignment)
    
    return {
        "id": assignment.id,
        "user_id": user.id,
        "helper_id": create_test_helper_profile["user_id"],
        "status": assignment.status
    }

@pytest_asyncio.fixture
async def helper_user_token_headers() -> dict:
    """ヘルパーユーザーのアクセストークン付きヘッダーを返す"""
    access_token = create_access_token(
        data={"sub": "testhelper@example.com", "role": UserRole.HELPER}
    )
    return {"Authorization": f"Bearer {access_token}"}

@pytest_asyncio.fixture(scope="function")
async def db_session(reset_db):
    engine = create_async_engine(TEST_DATABASE_URL, echo=False, future=True)
    TestSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
    async with TestSessionLocal() as session:
        yield session
    await engine.dispose()
