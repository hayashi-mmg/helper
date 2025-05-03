## 10. テスト戦略

### 10.1 テスト環境のセットアップ

```python
# tests/conftest.py
import asyncio
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import get_db, Base
from app.config import settings
from app.core.auth import create_access_token
from app.db.models.user import User

# テスト用データベースURL
TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

# テスト用の非同期エンジンとセッションファクトリ
@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
async def test_engine():
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()

@pytest.fixture(scope="function")
async def test_db(test_engine):
    # テストセッションファクトリの作成
    TestingSessionLocal = sessionmaker(
        test_engine, class_=AsyncSession, expire_on_commit=False
    )
    
    # テスト用DBセッションの生成
    async with TestingSessionLocal() as session:
        yield session
        # テスト後にロールバック
        await session.rollback()

@pytest.fixture(scope="function")
async def client(test_db):
    # テスト用の依存性オーバーライド
    async def override_get_db():
        yield test_db
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as client:
        yield client
    
    # テスト後に依存性をリセット
    app.dependency_overrides.clear()
```

### 10.2 エンドポイントのテスト例

```python
# tests/api/test_recipe_requests.py
import pytest
from fastapi import status

@pytest.mark.asyncio
async def test_create_recipe_request(client, user_token, create_test_user):
    """料理リクエスト作成のテスト"""
    recipe_data = {
        "title": "テスト料理",
        "description": "おいしいテスト料理のリクエストです。",
        "recipe_url": "https://cookpad.com/recipe/123456",
        "notes": "辛くしないでください",
        "priority": 2,
        "scheduled_date": "2025-01-15"
    }
    
    # ヘッダーに認証トークンを設定
    headers = {"Authorization": f"Bearer {user_token}"}
    
    response = client.post("/api/v1/recipe-requests/", json=recipe_data, headers=headers)
    
    assert response.status_code == status.HTTP_201_CREATED
    
    # レスポンスの検証
    data = response.json()
    assert data["title"] == recipe_data["title"]
    assert data["description"] == recipe_data["description"]
    assert data["recipe_url"] == recipe_data["recipe_url"]
    assert data["notes"] == recipe_data["notes"]
    assert data["priority"] == recipe_data["priority"]
    assert data["scheduled_date"] == recipe_data["scheduled_date"]
    assert data["status"] == "requested"
    assert data["user_id"] == create_test_user.id
    assert "id" in data
    assert "created_at" in data

@pytest.mark.asyncio
async def test_get_recipe_request_not_found(client, user_token, create_test_user):
    """存在しない料理リクエストの取得テスト"""
    headers = {"Authorization": f"Bearer {user_token}"}
    
    response = client.get("/api/v1/recipe-requests/999", headers=headers)
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
```

