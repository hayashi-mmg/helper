# FastAPI バックエンドテスト計画

## 1. テスト概要

本ドキュメントでは、ヘルパーシステム バックエンド (FastAPI) のテスト計画について説明します。システムの品質と信頼性を確保するため、以下のテストカテゴリを網羅的に実施します。

## 2. テストカテゴリ

### 2.1 ユニットテスト

個々のコンポーネントやクラス、関数のテスト。ビジネスロジックの正確性を検証します。

### 2.2 統合テスト

複数のコンポーネントが連携して正常に動作するかをテストします。

### 2.3 API テスト

各エンドポイントの正確な動作とレスポンスを検証します。

### 2.4 データベーステスト

データモデルとデータ操作の正確性を検証します。

### 2.5 セキュリティテスト

認証・認可およびその他のセキュリティ対策の有効性をテストします。

### 2.6 パフォーマンステスト

高負荷時のシステムの応答性と安定性をテストします。

## 3. テスト環境

### 3.1 開発環境

- ローカル開発マシン
- Docker コンテナ環境
- SQLite または PostgreSQL テスト用データベース

### 3.2 テスト環境

- CI/CD パイプライン (GitHub Actions)
- テスト用データベース (PostgreSQL)
- テスト用キャッシュサーバー (Redis)

### 3.3 ステージング環境

- 本番と同等の構成
- 既存データをコピーした環境

## 4. ユニットテスト計画

### 4.1 テスト対象コンポーネント

| コンポーネント | 説明 | テストファイル |
|------------|-----|-------------|
| サービス層 | ビジネスロジック | `tests/services/*.py` |
| CRUD 層 | データアクセスロジック | `tests/crud/*.py` |
| スキーマ | データバリデーション | `tests/schemas/*.py` |
| ユーティリティ | ヘルパー関数 | `tests/utils/*.py` |
| ログ機能 | ログ処理関数 | `tests/logs/*.py` |
| 認証機能 | 認証ロジック | `tests/core/test_auth.py` |

### 4.2 テスト方針

- 各関数の正常系と異常系をテスト
- モックを活用して外部依存を分離
- パラメータ化テストで複数のケースを効率的に検証
- コードカバレッジ目標: 90%以上

### 4.3 テスト例 (ユーザーサービス)

```python
# tests/services/test_user_service.py
import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from unittest.mock import AsyncMock, patch
from app.services.user_service import create_user, get_user_by_id, update_user
from app.schemas.user import UserCreate, UserUpdate
from app.db.models.user import User

@pytest.mark.asyncio
async def test_create_user(test_db: AsyncSession):
    # テストデータ
    user_data = UserCreate(
        username="testuser",
        email="test@example.com",
        password="password123"
    )
    
    # テスト実行
    user = await create_user(test_db, user_data)
    
    # 検証
    assert user is not None
    assert user.username == user_data.username
    assert user.email == user_data.email
    assert user.password_hash != user_data.password  # パスワードがハッシュ化されていること
    assert user.role == "user"  # デフォルトロール
    assert user.is_active == True

@pytest.mark.asyncio
async def test_get_user_by_id_not_found(test_db: AsyncSession):
    # 存在しないIDでテスト
    user = await get_user_by_id(test_db, 999)
    
    # 検証
    assert user is None

@pytest.mark.asyncio
async def test_update_user(test_db: AsyncSession, create_test_user):
    # 更新データ
    update_data = UserUpdate(
        username="updateduser"
    )
    
    # テスト実行
    updated_user = await update_user(test_db, create_test_user.id, update_data)
    
    # 検証
    assert updated_user is not None
    assert updated_user.username == "updateduser"
    assert updated_user.email == create_test_user.email  # 変更なし
```

## 5. API テスト計画

### 5.1 テスト対象エンドポイント

| エンドポイント | メソッド | 説明 | テストファイル |
|------------|------|-----|-------------|
| `/api/v1/auth/login` | POST | ログイン | `tests/api/test_auth.py` |
| `/api/v1/auth/register` | POST | ユーザー登録 | `tests/api/test_auth.py` |
| `/api/v1/users/me` | GET | 現在のユーザー取得 | `tests/api/test_users.py` |
| `/api/v1/posts` | GET | 投稿一覧取得 | `tests/api/test_posts.py` |
| `/api/v1/posts` | POST | 投稿作成 | `tests/api/test_posts.py` |
| `/api/v1/posts/{id}` | GET | 投稿詳細取得 | `tests/api/test_posts.py` |
| `/api/v1/posts/{id}` | PUT | 投稿更新 | `tests/api/test_posts.py` |
| `/api/v1/posts/{id}` | DELETE | 投稿削除 | `tests/api/test_posts.py` |
| `/api/v1/tags` | GET | タグ一覧取得 | `tests/api/test_tags.py` |
| `/api/v1/categories` | GET | カテゴリ一覧取得 | `tests/api/test_categories.py` |
| `/api/v1/search` | GET | 検索 | `tests/api/test_search.py` |
| `/api/logs/*` | GET | ログ取得（管理者） | `tests/api/test_logs.py` |

### 5.2 テスト方針

- 正常系レスポンスを検証（ステータスコード、レスポンス形式）
- 異常系レスポンスを検証（不正パラメータ、権限不足など）
- 認証/認可の動作を検証
- ページネーション動作の検証
- フィルタリング機能の検証

### 5.3 テスト例 (投稿API)

```python
# tests/api/test_posts.py
import pytest
from fastapi.testclient import TestClient
from fastapi import status

def test_create_post_success(client, user_token, create_test_user):
    """投稿作成成功のテスト"""
    headers = {"Authorization": f"Bearer {user_token}"}
    
    post_data = {
        "title": "テスト投稿",
        "content": "これはテスト投稿です。",
        "category_id": 1,
        "published": False
    }
    
    response = client.post("/api/v1/posts/", json=post_data, headers=headers)
    
    assert response.status_code == status.HTTP_201_CREATED
    
    data = response.json()
    assert data["title"] == post_data["title"]
    assert data["content"] == post_data["content"]
    assert data["author_id"] == create_test_user.id
    assert "id" in data
    assert "created_at" in data

def test_create_post_unauthorized(client):
    """認証なしでの投稿作成失敗テスト"""
    post_data = {
        "title": "テスト投稿",
        "content": "これはテスト投稿です。",
        "category_id": 1
    }
    
    response = client.post("/api/v1/posts/", json=post_data)
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_get_posts_pagination(client, user_token, create_test_posts):
    """投稿一覧のページネーションテスト"""
    headers = {"Authorization": f"Bearer {user_token}"}
    
    # 1ページ目
    response = client.get("/api/v1/posts/?page=1&page_size=2", headers=headers)
    
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert "items" in data
    assert "page_info" in data
    assert len(data["items"]) == 2
    assert data["page_info"]["page"] == 1
    assert data["page_info"]["has_next"] == True
    
    # 2ページ目
    response = client.get("/api/v1/posts/?page=2&page_size=2", headers=headers)
    
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert "items" in data
    assert len(data["items"]) > 0
```

## 6. データベーステスト計画

### 6.1 テスト対象

| モデル | 説明 | テストファイル |
|------|-----|-------------|
| User | ユーザーモデル | `tests/db/models/test_user.py` |
| Post | 投稿モデル | `tests/db/models/test_post.py` |
| Category | カテゴリモデル | `tests/db/models/test_category.py` |
| Tag | タグモデル | `tests/db/models/test_tag.py` |
| Comment | コメントモデル | `tests/db/models/test_comment.py` |
| ApplicationLog | アプリケーションログ | `tests/db/models/test_app_log.py` |
| AuditLog | 監査ログ | `tests/db/models/test_audit_log.py` |
| PerformanceLog | パフォーマンスログ | `tests/db/models/test_perf_log.py` |

### 6.2 テスト方針

- モデルのCRUD操作を検証
- リレーションシップの動作を検証
- マイグレーションの適用を検証
- インデックスの動作検証（必要に応じて）

### 6.3 テスト例 (投稿モデル)

```python
# tests/db/models/test_post.py
import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from app.db.models.post import Post
from app.db.models.user import User
from app.db.models.category import Category

@pytest.mark.asyncio
async def test_post_create(test_db: AsyncSession, create_test_user, create_test_category):
    """投稿モデル作成テスト"""
    post = Post(
        title="テスト投稿",
        content="これはテスト投稿です。",
        slug="test-post",
        published=True,
        author_id=create_test_user.id,
        category_id=create_test_category.id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    test_db.add(post)
    await test_db.commit()
    await test_db.refresh(post)
    
    assert post.id is not None
    assert post.title == "テスト投稿"
    assert post.content == "これはテスト投稿です。"
    assert post.slug == "test-post"
    assert post.published == True
    assert post.author_id == create_test_user.id
    assert post.category_id == create_test_category.id

@pytest.mark.asyncio
async def test_post_relationships(test_db: AsyncSession, create_test_post):
    """投稿のリレーションシップテスト"""
    # 投稿を取得（リレーションを含む）
    result = await test_db.execute(
        select(Post)
        .options(
            joinedload(Post.author),
            joinedload(Post.category),
            selectinload(Post.tags)
        )
        .filter(Post.id == create_test_post.id)
    )
    post = result.scalar_one()
    
    # 著者のリレーションシップ
    assert post.author is not None
    assert isinstance(post.author, User)
    assert post.author.id == create_test_post.author_id
    
    # カテゴリのリレーションシップ
    assert post.category is not None
    assert isinstance(post.category, Category)
    assert post.category.id == create_test_post.category_id
```

## 7. セキュリティテスト計画

### 7.1 テスト対象

| セキュリティ機能 | 説明 | テストファイル |
|-------------|-----|-------------|
| 認証 | JWT認証、パスワード検証 | `tests/security/test_auth.py` |
| 認可 | ロールベースアクセス制御 | `tests/security/test_permissions.py` |
| 入力検証 | リクエストバリデーション | `tests/security/test_validation.py` |
| レート制限 | APIレート制限 | `tests/security/test_rate_limit.py` |
| CORS | CORSポリシー | `tests/security/test_cors.py` |

### 7.2 テスト方針

- 認証ロジックの正常動作と脆弱性をテスト
- 権限チェックの正確性を検証
- 適切なバリデーションが行われることを検証
- レート制限の動作を検証
- 不正なCORSリクエストが拒否されることを検証

### 7.3 テスト例 (認証・認可)

```python
# tests/security/test_auth.py
import pytest
from fastapi import status
from app.core.auth import verify_password, create_jwt_token, decode_jwt_token
from datetime import datetime, timedelta

def test_password_verification():
    """パスワード検証機能のテスト"""
    password = "strong_password123"
    hashed = get_password_hash(password)
    
    # 正しいパスワード
    assert verify_password(password, hashed) == True
    
    # 誤ったパスワード
    assert verify_password("wrong_password", hashed) == False

def test_jwt_token_flow():
    """JWTトークンの生成と検証フローのテスト"""
    # トークン生成
    user_id = 123
    token = create_jwt_token(user_id)
    
    # トークン検証
    payload = decode_jwt_token(token)
    
    assert "sub" in payload
    assert int(payload["sub"]) == user_id
    assert "exp" in payload

def test_jwt_token_expiration():
    """JWTトークンの有効期限テスト"""
    # 有効期限切れのトークンを生成
    user_id = 123
    expires_delta = timedelta(minutes=-1)  # 過去の時間
    expired_token = create_jwt_token(user_id, expires_delta)
    
    # 有効期限切れのトークンを検証
    with pytest.raises(JWTError):
        decode_jwt_token(expired_token)

# tests/security/test_permissions.py
def test_admin_only_endpoint(client, admin_token, user_token):
    """管理者専用エンドポイントのテスト"""
    # 管理者でアクセス
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    admin_response = client.get("/api/logs/application", headers=admin_headers)
    
    assert admin_response.status_code == status.HTTP_200_OK
    
    # 一般ユーザーでアクセス
    user_headers = {"Authorization": f"Bearer {user_token}"}
    user_response = client.get("/api/logs/application", headers=user_headers)
    
    assert user_response.status_code == status.HTTP_403_FORBIDDEN

def test_post_owner_permission(client, user_token, other_user_token, create_test_post):
    """投稿所有者の権限テスト"""
    # 投稿所有者でアクセス
    owner_headers = {"Authorization": f"Bearer {user_token}"}
    update_data = {"title": "更新されたタイトル"}
    
    owner_response = client.put(
        f"/api/v1/posts/{create_test_post.id}", 
        json=update_data,
        headers=owner_headers
    )
    
    assert owner_response.status_code == status.HTTP_200_OK
    
    # 他のユーザーでアクセス
    other_headers = {"Authorization": f"Bearer {other_user_token}"}
    
    other_response = client.put(
        f"/api/v1/posts/{create_test_post.id}", 
        json=update_data,
        headers=other_headers
    )
    
    assert other_response.status_code == status.HTTP_403_FORBIDDEN
```

## 8. パフォーマンステスト計画

### 8.1 テスト対象

| テスト種別 | 説明 | テストファイル |
|---------|-----|-------------|
| 負荷テスト | 高負荷時の応答性能 | `tests/performance/test_load.py` |
| 耐久テスト | 長時間実行時の安定性 | `tests/performance/test_endurance.py` |
| スケーラビリティテスト | スケールアウト時の性能 | `tests/performance/test_scalability.py` |
| キャッシュテスト | キャッシュ機能の効果 | `tests/performance/test_cache.py` |
| データベースパフォーマンス | クエリの効率性 | `tests/performance/test_db_performance.py` |

### 8.2 テスト方針

- k6などのツールを使用した負荷テスト
- 複数同時リクエストのシミュレーション
- キャッシュの有効性検証
- データベースクエリの最適化検証
- パフォーマンスログ分析

### 8.3 テスト例 (k6負荷テスト)

```javascript
// tests/performance/load_test.js
import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },   // 20秒かけて20ユーザーまで増加
    { duration: '1m', target: 20 },    // 1分間20ユーザーを維持
    { duration: '30s', target: 50 },   // 30秒かけて50ユーザーまで増加
    { duration: '1m', target: 50 },    // 1分間50ユーザーを維持
    { duration: '30s', target: 0 },    // 30秒かけて0ユーザーまで減少
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95%のリクエストが500ms以内に完了すること
    http_req_failed: ['rate<0.01'],   // 失敗率が1%未満であること
  },
};

// ユーザー認証とトークン取得
function getAuthToken() {
  const loginRes = http.post('http://localhost:8000/api/v1/auth/login', {
    username: 'testuser',
    password: 'password123'
  });
  
  if (loginRes.status !== 200) {
    console.log('認証に失敗しました:', loginRes.body);
    return null;
  }
  
  return JSON.parse(loginRes.body).access_token;
}

export default function() {
  const token = getAuthToken();
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  // 公開投稿一覧取得
  const postsRes = http.get('http://localhost:8000/api/v1/posts?published=true&page=1&page_size=10');
  check(postsRes, {
    '投稿一覧が正常に取得できること': (r) => r.status === 200,
    '投稿一覧のレスポンスタイムが200ms以内であること': (r) => r.timings.duration < 200
  });
  
  // 検索機能テスト
  const searchRes = http.get('http://localhost:8000/api/v1/search?q=test');
  check(searchRes, {
    '検索が正常に動作すること': (r) => r.status === 200,
    '検索のレスポンスタイムが500ms以内であること': (r) => r.timings.duration < 500
  });
  
  // 投稿詳細取得
  const postDetailRes = http.get('http://localhost:8000/api/v1/posts/1');
  check(postDetailRes, {
    '投稿詳細が正常に取得できること': (r) => r.status === 200,
    '投稿詳細のレスポンスタイムが100ms以内であること': (r) => r.timings.duration < 100
  });
  
  sleep(1);
}
```

## 9. 継続的インテグレーション設定

### 9.1 GitHub Actions 設定

```yaml
# .github/workflows/backend-tests.yml
name: Backend Tests

on:
  push:
    branches: [ main, develop ]
    paths:
      - 'backend/**'
  pull_request:
    branches: [ main, develop ]
    paths:
      - 'backend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:6-alpine
        ports:
          - 6379:6379
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.10'
    
    - name: Install dependencies
      run: |
        cd backend
        python -m pip install --upgrade pip
        pip install -r requirements-dev.txt
    
    - name: Run tests
      env:
        DATABASE_URL: postgresql+asyncpg://postgres:postgres@localhost:5432/test_db
        REDIS_URL: redis://localhost:6379/0
        SECRET_KEY: test_secret_key
        TESTING: true
      run: |
        cd backend
        pytest -xvs --cov=app --cov-report=xml
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./backend/coverage.xml
        flags: backend
```

## 10. テスト文書化と報告

### 10.1 テストドキュメント

- テスト計画書（本ドキュメント）
- テスト結果レポート
- カバレッジレポート
- パフォーマンステストレポート

### 10.2 テストレポート例

```
=============================== テスト概要 ===============================
実行したテスト: 137
成功: 135
失敗: 2
スキップ: 3
実行時間: 25.64秒
コードカバレッジ: 92%

================================ 失敗 =================================
1. tests/services/test_post_service.py::test_update_post_with_invalid_slug
2. tests/api/test_search.py::test_search_with_complex_query

============================= スキップ ================================
1. tests/performance/test_load.py::test_high_concurrency - 開発環境では実行不可
2. tests/security/test_rate_limit.py::test_rate_limit_exceed - 時間がかかるため
3. tests/api/test_media.py::test_large_file_upload - 環境設定不足

========================= コードカバレッジ詳細 =========================
app/services/: 95%
app/api/: 93%
app/crud/: 94%
app/schemas/: 100%
app/logs/: 87%
app/core/: 89%
```

## 11. テスト自動化計画

### 11.1 自動化の範囲

- ユニットテスト・統合テスト: CI/CDパイプライン（プッシュ/PR時）
- API テスト: CI/CDパイプライン（プッシュ/PR時）
- セキュリティテスト: 週次スケジュール
- パフォーマンステスト: 週次スケジュール

### 11.2 テスト環境の自動デプロイ

```yaml
# .github/workflows/deploy-test-env.yml
name: Deploy Test Environment

on:
  workflow_dispatch:
  schedule:
    - cron: '0 0 * * 1'  # 毎週月曜日の午前0時

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Build and deploy test environment
      run: |
        cd deploy
        docker-compose -f docker-compose.test.yml up -d
    
    - name: Run integration tests
      run: |
        cd backend
        pytest tests/integration
    
    - name: Run performance tests
      run: |
        cd backend
        pytest tests/performance
```

## 12. テスト適用ガイド

### 12.1 ローカル開発でのテスト実行

```bash
# 全テスト実行
cd backend
pytest

# 特定のテストファイル実行
pytest tests/services/test_post_service.py

# 特定のテストケース実行
pytest tests/services/test_post_service.py::test_create_post

# カバレッジレポート生成
pytest --cov=app --cov-report=html

# 特定のマーカーのテストのみ実行
pytest -m "slow"
```

### 12.2 テストデータの準備

プロジェクトには以下のテストフィクスチャを用意しています:

1. `test_db` - テスト用DBセッション
2. `create_test_user` - テストユーザー作成
3. `create_test_admin` - テスト管理者作成
4. `create_test_category` - テストカテゴリ作成
5. `create_test_post` - テスト投稿作成
6. `create_test_tags` - テストタグ作成

これらのフィクスチャは `tests/conftest.py` に定義されており、テストでパラメータとして利用できます。

## 13. テスト優先度と実行計画

| テストカテゴリ | 優先度 | 頻度 | 実行環境 |
|------------|------|-----|---------|
| ユニットテスト | 高 | 常時（CI/CD） | ローカル・CI |
| 統合テスト | 高 | 常時（CI/CD） | ローカル・CI |
| API テスト | 高 | 常時（CI/CD） | ローカル・CI |
| データベーステスト | 中 | 日次 | CI |
| セキュリティテスト | 中 | 週次 | テスト環境 |
| パフォーマンステスト | 低 | 週次 | テスト環境 |

## 14. テスト改善計画

### 14.1 短期改善項目

- コードカバレッジの向上（特にログ機能）
- テスト実行時間の最適化
- テスト環境の安定化

### 14.2 中長期改善項目

- プロパティベーステストの導入
- モンキーテストの導入
- テスト自動生成ツールの導入検討
- AIを活用したバグ予測
