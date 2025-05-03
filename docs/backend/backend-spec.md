# ヘルパーシステム バックエンド仕様書

## 1. 概要

本仕様書はヘルパー支援システムのバックエンド実装に関する詳細を定義します。本システムはユーザー（依頼者）がヘルパーに対して食べたい料理やお願いしたいことを事前に登録し、ヘルパーがウェブ上でその情報を確認できるようにするシステムです。

## 2. システムアーキテクチャ

### 2.1 全体構成

- **言語/フレームワーク**: Python + FastAPI
- **データベース**: PostgreSQL + SQLAlchemy (ORM)
- **認証**: JWT + OAuth2
- **API仕様**: OpenAPI (Swagger)

### 2.2 システム構成図

```
クライアント (ブラウザ/モバイル) ←→ Nginx (リバースプロキシ) ←→ FastAPI アプリケーション ←→ PostgreSQL
                                                               ↕
                                                            Redis キャッシュ
```

### 2.3 ディレクトリ構造

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPIのエントリーポイント
│   ├── config.py                   # 設定管理
│   ├── database.py                 # データベース接続設定
│   ├── dependencies.py             # 共通依存性
│   ├── exceptions.py               # カスタム例外クラス
│   ├── api/
│   │   ├── __init__.py
│   │   ├── v1/                     # APIバージョン1
│   │   │   ├── __init__.py
│   │   │   ├── endpoints/          # エンドポイント定義
│   │   │   ├── dependencies.py     # API v1固有の依存性
│   │   │   └── router.py           # v1ルーター集約
│   ├── core/                       # コアモジュール
│   │   ├── __init__.py
│   │   ├── auth.py                 # 認証ロジック
│   │   ├── security.py             # セキュリティ機能
│   │   └── errors.py               # エラーハンドリング
│   ├── crud/                       # データアクセス層
│   │   ├── __init__.py
│   │   ├── base.py                 # 基本CRUD操作
│   │   ├── users.py                # ユーザー関連CRUD
│   │   ├── helpers.py              # ヘルパー関連CRUD
│   │   ├── recipes.py              # レシピ関連CRUD
│   │   ├── requests.py             # リクエスト関連CRUD
│   │   └── feedback.py             # フィードバック関連CRUD
│   ├── db/                         # データベースモデル
│   │   ├── __init__.py
│   │   ├── base.py                 # 基本モデル
│   │   └── models/                 # SQLAlchemyモデル
│   ├── logs/                       # ログ関連モジュール
│   │   ├── __init__.py
│   │   ├── app_logger.py           # アプリケーションログ
│   │   ├── audit_logger.py         # 監査ログ
│   │   └── performance_logger.py   # パフォーマンスログ
│   ├── schemas/                    # Pydanticスキーマ
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── helper.py
│   │   ├── recipe.py
│   │   ├── request.py
│   │   └── feedback.py
│   ├── services/                   # ビジネスロジック
│   │   ├── __init__.py
│   │   ├── user_service.py
│   │   ├── helper_service.py
│   │   ├── recipe_service.py
│   │   ├── request_service.py
│   │   ├── feedback_service.py
│   │   └── qrcode_service.py
│   └── utils/                      # ユーティリティ関数
│       ├── __init__.py
│       ├── recipe_parser.py        # レシピ情報の解析
│       ├── qrcode_generator.py     # QRコード生成
│       └── i18n.py                 # 多言語対応
├── alembic/                        # マイグレーション
├── tests/                          # テスト
│   ├── __init__.py
│   ├── conftest.py                 # テスト設定
│   ├── api/                        # APIテスト
│   └── ...
├── .env                            # 環境変数（バージョン管理外）
├── requirements.txt                # 依存パッケージ
├── Dockerfile                      # Dockerビルド定義
└── docker-compose.yml              # Dockerコンポーズ定義
```

## 3. データモデル設計

### 3.1 エンティティ関連図

```
User (ユーザー) 1 --- * Helper (ヘルパー)
      |
      | 1
      ↓
      * 
Recipe Request (料理リクエスト) --- * Tag (タグ)
      |
      | 1
      ↓
      *
Feedback (フィードバック)
```

### 3.2 データベースモデル

#### 3.2.1 User (ユーザー)

```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    address = Column(String)
    phone = Column(String)
    role = Column(String, default="user")  # user, helper, admin
    is_active = Column(Boolean, default=True)
    preferences = Column(JSONB, nullable=True)  # 好みや制限（アレルギー等）
    language = Column(String, default="ja")
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
```

#### 3.2.2 Helper (ヘルパー)

```python
class Helper(Base):
    __tablename__ = "helpers"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    certification = Column(String, nullable=True)  # 資格情報
    specialties = Column(ARRAY(String), nullable=True)  # 得意な料理等
    introduction = Column(Text, nullable=True)
    working_days = Column(JSONB, nullable=True)  # 稼働曜日・時間帯
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # リレーションシップ
    user = relationship("User", back_populates="helper")
    assigned_users = relationship("UserHelperAssignment", back_populates="helper")
```

#### 3.2.3 UserHelperAssignment (ユーザー・ヘルパー割り当て)

```python
class UserHelperAssignment(Base):
    __tablename__ = "user_helper_assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    helper_id = Column(Integer, ForeignKey("helpers.id"), nullable=False)
    is_primary = Column(Boolean, default=False)  # 主担当フラグ
    created_at = Column(DateTime, default=func.now())
    
    # リレーションシップ
    user = relationship("User", back_populates="assigned_helpers")
    helper = relationship("Helper", back_populates="assigned_users")
```

#### 3.2.4 RecipeRequest (料理リクエスト)

```python
class RecipeRequest(Base):
    __tablename__ = "recipe_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    recipe_url = Column(String, nullable=True)  # クックパッド等のURL
    recipe_content = Column(JSONB, nullable=True)  # 解析されたレシピ情報
    notes = Column(Text, nullable=True)  # 特記事項（アレルギー対応等）
    priority = Column(Integer, default=0)  # 優先度
    scheduled_date = Column(Date, nullable=True)  # 予定日
    status = Column(String, default="requested")  # requested, in_progress, completed, cancelled
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # リレーションシップ
    user = relationship("User", back_populates="recipe_requests")
    tags = relationship("RecipeTag", secondary=recipe_tags, back_populates="recipes")
    feedback = relationship("Feedback", back_populates="recipe_request", uselist=False)
```

#### 3.2.5 Task (お願いごと)

```python
class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, nullable=True)  # 掃除、買い物等
    priority = Column(Integer, default=0)
    scheduled_date = Column(Date, nullable=True)
    status = Column(String, default="requested")  # requested, in_progress, completed, cancelled
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # リレーションシップ
    user = relationship("User", back_populates="tasks")
```

#### 3.2.6 Tag (タグ)

```python
class Tag(Base):
    __tablename__ = "tags"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    category = Column(String, nullable=True)  # 料理カテゴリ等
    created_at = Column(DateTime, default=func.now())
    
    # リレーションシップ
    recipes = relationship("RecipeRequest", secondary=recipe_tags, back_populates="tags")
```

#### 3.2.7 Feedback (フィードバック)

```python
class Feedback(Base):
    __tablename__ = "feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    recipe_request_id = Column(Integer, ForeignKey("recipe_requests.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    taste_rating = Column(Integer, nullable=True)  # 味付け評価(1-5)
    texture_rating = Column(Integer, nullable=True)  # 食感評価(1-5)
    amount_rating = Column(Integer, nullable=True)  # 量の評価(1-5)
    comment = Column(Text, nullable=True)
    next_request = Column(Text, nullable=True)  # 次回への要望
    image_url = Column(String, nullable=True)  # 料理写真URL
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # リレーションシップ
    recipe_request = relationship("RecipeRequest", back_populates="feedback")
    user = relationship("User")
    helper_response = relationship("HelperResponse", back_populates="feedback", uselist=False)
```

#### 3.2.8 HelperResponse (ヘルパー返信)

```python
class HelperResponse(Base):
    __tablename__ = "helper_responses"
    
    id = Column(Integer, primary_key=True, index=True)
    feedback_id = Column(Integer, ForeignKey("feedback.id"), nullable=False)
    helper_id = Column(Integer, ForeignKey("helpers.id"), nullable=False)
    response = Column(Text, nullable=False)
    next_note = Column(Text, nullable=True)  # 次回調理時のメモ
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # リレーションシップ
    feedback = relationship("Feedback", back_populates="helper_response")
    helper = relationship("Helper")
```

#### 3.2.9 QRCode (QRコード)

```python
class QRCode(Base):
    __tablename__ = "qrcodes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_type = Column(String, nullable=False)  # RECIPE, FEEDBACK_FORM等
    target_id = Column(Integer, nullable=True)
    url = Column(String, nullable=False)
    title = Column(String, nullable=False)
    image_path = Column(String, nullable=True)
    expire_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now())
    access_count = Column(Integer, default=0)
    
    # リレーションシップ
    user = relationship("User")
```

## 4. API設計

### 4.1 エンドポイント一覧

#### 4.1.1 認証関連

| エンドポイント | メソッド | 説明 | アクセス権限 |
|--------------|---------|------|------------|
| `/api/v1/auth/login` | POST | ログイン | 全員 |
| `/api/v1/auth/register` | POST | ユーザー登録 | 全員 |
| `/api/v1/auth/refresh` | POST | トークン更新 | 認証済み |
| `/api/v1/auth/password-reset` | POST | パスワードリセット要求 | 全員 |
| `/api/v1/auth/password-reset/confirm` | POST | パスワードリセット確認 | 全員 |

#### 4.1.2 ユーザー関連

| エンドポイント | メソッド | 説明 | アクセス権限 |
|--------------|---------|------|------------|
| `/api/v1/users/me` | GET | 現在のユーザー情報取得 | 認証済み |
| `/api/v1/users/me` | PUT | ユーザー情報更新 | 認証済み |
| `/api/v1/users` | GET | ユーザー一覧取得 | 管理者 |
| `/api/v1/users/{user_id}` | GET | 特定ユーザー情報取得 | 管理者/担当ヘルパー |
| `/api/v1/users/{user_id}` | PUT | 特定ユーザー情報更新 | 管理者 |
| `/api/v1/users/{user_id}` | DELETE | ユーザー削除 | 管理者 |

#### 4.1.3 ヘルパー関連

| エンドポイント | メソッド | 説明 | アクセス権限 |
|--------------|---------|------|------------|
| `/api/v1/helpers` | GET | ヘルパー一覧取得 | 認証済み |
| `/api/v1/helpers/me` | GET | 自分のヘルパー情報 | ヘルパー |
| `/api/v1/helpers/me` | PUT | ヘルパー情報更新 | ヘルパー |
| `/api/v1/helpers/{helper_id}` | GET | 特定ヘルパー情報取得 | 管理者/担当ユーザー |
| `/api/v1/helpers/{helper_id}` | PUT | ヘルパー情報更新 | 管理者 |
| `/api/v1/helpers/{helper_id}` | DELETE | ヘルパー削除 | 管理者 |

#### 4.1.4 ユーザー・ヘルパー割り当て

| エンドポイント | メソッド | 説明 | アクセス権限 |
|--------------|---------|------|------------|
| `/api/v1/users/{user_id}/helpers` | GET | ユーザーの担当ヘルパー一覧 | 認証済み |
| `/api/v1/users/{user_id}/helpers` | POST | ヘルパー割り当て追加 | 管理者/ユーザー |
| `/api/v1/users/{user_id}/helpers/{helper_id}` | DELETE | ヘルパー割り当て削除 | 管理者/ユーザー |
| `/api/v1/helpers/{helper_id}/users` | GET | ヘルパーの担当ユーザー一覧 | ヘルパー/管理者 |

#### 4.1.5 料理リクエスト関連

| エンドポイント | メソッド | 説明 | アクセス権限 |
|--------------|---------|------|------------|
| `/api/v1/recipe-requests` | GET | 料理リクエスト一覧取得 | 認証済み |
| `/api/v1/recipe-requests` | POST | 料理リクエスト作成 | ユーザー |
| `/api/v1/recipe-requests/{request_id}` | GET | 特定リクエスト取得 | 認証済み |
| `/api/v1/recipe-requests/{request_id}` | PUT | リクエスト更新 | ユーザー/管理者 |
| `/api/v1/recipe-requests/{request_id}` | DELETE | リクエスト削除 | ユーザー/管理者 |
| `/api/v1/recipe-requests/{request_id}/status` | PUT | リクエスト状態更新 | ヘルパー/管理者 |
| `/api/v1/users/{user_id}/recipe-requests` | GET | ユーザーの料理リクエスト一覧 | ユーザー/ヘルパー/管理者 |

#### 4.1.6 タスク（お願いごと）関連

| エンドポイント | メソッド | 説明 | アクセス権限 |
|--------------|---------|------|------------|
| `/api/v1/tasks` | GET | タスク一覧取得 | 認証済み |
| `/api/v1/tasks` | POST | タスク作成 | ユーザー |
| `/api/v1/tasks/{task_id}` | GET | 特定タスク取得 | 認証済み |
| `/api/v1/tasks/{task_id}` | PUT | タスク更新 | ユーザー/管理者 |
| `/api/v1/tasks/{task_id}` | DELETE | タスク削除 | ユーザー/管理者 |
| `/api/v1/tasks/{task_id}/status` | PUT | タスク状態更新 | ヘルパー/管理者 |
| `/api/v1/users/{user_id}/tasks` | GET | ユーザーのタスク一覧 | ユーザー/ヘルパー/管理者 |

#### 4.1.7 フィードバック関連

| エンドポイント | メソッド | 説明 | アクセス権限 |
|--------------|---------|------|------------|
| `/api/v1/feedback` | GET | フィードバック一覧取得 | 認証済み |
| `/api/v1/feedback` | POST | フィードバック作成 | ユーザー |
| `/api/v1/feedback/{feedback_id}` | GET | 特定フィードバック取得 | 認証済み |
| `/api/v1/feedback/{feedback_id}` | PUT | フィードバック更新 | ユーザー/管理者 |
| `/api/v1/feedback/{feedback_id}/response` | POST | ヘルパー返信作成 | ヘルパー |
| `/api/v1/feedback/{feedback_id}/response` | PUT | ヘルパー返信更新 | ヘルパー |
| `/api/v1/recipe-requests/{request_id}/feedback` | GET | リクエストのフィードバック取得 | 認証済み |

#### 4.1.8 QRコード関連

| エンドポイント | メソッド | 説明 | アクセス権限 |
|--------------|---------|------|------------|
| `/api/v1/qrcodes` | GET | QRコード一覧取得 | 認証済み |
| `/api/v1/qrcodes` | POST | QRコード生成 | 認証済み |
| `/api/v1/qrcodes/{qrcode_id}` | GET | 特定QRコード取得 | 認証済み |
| `/api/v1/qrcodes/{qrcode_id}` | DELETE | QRコード削除 | 認証済み |
| `/api/v1/qrcodes/{qrcode_id}/image` | GET | QRコード画像取得 | 全員 |
| `/api/v1/qrcodes/batch` | POST | 複数QRコード生成 | 認証済み |

### 4.2 エンドポイント詳細

#### 4.2.1 認証関連

##### POST /api/v1/auth/login
```python
# リクエスト
{
    "username": "string",
    "password": "string"
}

# レスポンス
{
    "access_token": "string",
    "token_type": "bearer",
    "expires_in": 3600,
    "refresh_token": "string",
    "user": {
        "id": 0,
        "username": "string",
        "email": "string",
        "role": "string",
        "full_name": "string"
    }
}
```

##### POST /api/v1/auth/register
```python
# リクエスト
{
    "username": "string",
    "email": "string",
    "password": "string",
    "full_name": "string",
    "address": "string",
    "phone": "string",
    "language": "ja"
}

# レスポンス
{
    "id": 0,
    "username": "string",
    "email": "string",
    "full_name": "string",
    "role": "user",
    "created_at": "2025-01-01T00:00:00"
}
```

#### 4.2.2 料理リクエスト関連

##### POST /api/v1/recipe-requests
```python
# リクエスト
{
    "title": "string",
    "description": "string",
    "recipe_url": "string", # オプション
    "notes": "string", # オプション
    "priority": 0,
    "scheduled_date": "2025-01-01", # オプション
    "tags": ["string"] # オプション
}

# レスポンス
{
    "id": 0,
    "user_id": 0,
    "title": "string",
    "description": "string",
    "recipe_url": "string",
    "recipe_content": {
        "title": "string",
        "ingredients": [
            {
                "name": "string",
                "amount": "string"
            }
        ],
        "steps": [
            "string"
        ],
        "servings": "string",
        "cooking_time": "string"
    },
    "notes": "string",
    "priority": 0,
    "scheduled_date": "2025-01-01",
    "status": "requested",
    "created_at": "2025-01-01T00:00:00",
    "updated_at": "2025-01-01T00:00:00",
    "tags": [
        {
            "id": 0,
            "name": "string"
        }
    ]
}
```

#### 4.2.3 フィードバック関連

##### POST /api/v1/feedback
```python
# リクエスト
{
    "recipe_request_id": 0,
    "taste_rating": 5,
    "texture_rating": 4,
    "amount_rating": 3,
    "comment": "string",
    "next_request": "string", # オプション
    "image": "base64エンコードされた画像" # オプション
}

# レスポンス
{
    "id": 0,
    "recipe_request_id": 0,
    "user_id": 0,
    "taste_rating": 5,
    "texture_rating": 4,
    "amount_rating": 3,
    "comment": "string",
    "next_request": "string",
    "image_url": "string",
    "created_at": "2025-01-01T00:00:00",
    "updated_at": "2025-01-01T00:00:00"
}
```

#### 4.2.4 QRコード関連

##### POST /api/v1/qrcodes
```python
# リクエスト
{
    "target_type": "RECIPE", # RECIPE, TASK, FEEDBACK_FORM など
    "target_id": 0,
    "title": "string",
    "expire_in": 86400 # オプション：有効期限（秒）
}

# レスポンス
{
    "id": 0,
    "user_id": 0,
    "target_type": "RECIPE",
    "target_id": 0,
    "url": "string",
    "title": "string",
    "image_url": "string",
    "expire_at": "2025-01-02T00:00:00",
    "created_at": "2025-01-01T00:00:00"
}
```

## 5. ビジネスロジック実装

### 5.1 レシピ解析

クックパッドなどのレシピURLから情報を抽出するモジュールを実装します。

```python
# app/utils/recipe_parser.py
import httpx
from bs4 import BeautifulSoup
from typing import Dict, List, Optional, Any

async def parse_recipe_url(url: str) -> Optional[Dict[str, Any]]:
    """
    レシピURLからレシピ情報を抽出
    
    Args:
        url: レシピのURL（クックパッドなど）
        
    Returns:
        Dict[str, Any]: 抽出されたレシピ情報
            {
                "title": "レシピタイトル",
                "ingredients": [{"name": "材料名", "amount": "量"}],
                "steps": ["手順1", "手順2", ...],
                "servings": "〇人前",
                "cooking_time": "〇分"
            }
    """
    # URLが対応サイトかチェック
    supported_sites = ["cookpad.com", "recipe.rakuten.co.jp", "erecipe.woman.excite.co.jp"]
    if not any(site in url for site in supported_sites):
        return None
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            
            html = response.text
            soup = BeautifulSoup(html, 'html.parser')
            
            # サイトによって異なるパーサーを呼び出し
            if "cookpad.com" in url:
                return parse_cookpad(soup)
            elif "recipe.rakuten.co.jp" in url:
                return parse_rakuten_recipe(soup)
            elif "erecipe.woman.excite.co.jp" in url:
                return parse_excite_recipe(soup)
            
            return None
            
    except Exception as e:
        # エラーログを記録
        return None

def parse_cookpad(soup: BeautifulSoup) -> Dict[str, Any]:
    """クックパッドのHTMLからレシピ情報を抽出"""
    # 実装詳細...
    
def parse_rakuten_recipe(soup: BeautifulSoup) -> Dict[str, Any]:
    """楽天レシピのHTMLからレシピ情報を抽出"""
    # 実装詳細...
    
def parse_excite_recipe(soup: BeautifulSoup) -> Dict[str, Any]:
    """エキサイトレシピのHTMLからレシピ情報を抽出"""
    # 実装詳細...
```

### 5.2 QRコード生成

リクエストやフィードバックフォームへのアクセスを容易にするQRコード生成機能を実装します。

```python
# app/utils/qrcode_generator.py
import qrcode
from io import BytesIO
import base64
from datetime import datetime, timedelta
import os
from typing import Optional

def generate_qrcode(
    url: str,
    size: int = 200,
    file_path: Optional[str] = None
) -> str:
    """
    URLからQRコードを生成
    
    Args:
        url: QRコード化するURL
        size: QRコードのサイズ（ピクセル）
        file_path: 保存先パ
## 5. ビジネスロジック実装（続き）

### 5.2 QRコード生成（続き）

```python
# app/utils/qrcode_generator.py (続き)
def generate_qrcode(
    url: str,
    size: int = 200,
    file_path: Optional[str] = None
) -> str:
    """
    URLからQRコードを生成
    
    Args:
        url: QRコード化するURL
        size: QRコードのサイズ（ピクセル）
        file_path: 保存先パス（指定がなければBase64エンコード文字列を返す）
        
    Returns:
        str: QRコードの画像パスまたはBase64エンコード文字列
    """
    # QRコードの生成
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # ファイルに保存する場合
    if file_path:
        # ディレクトリが存在しない場合は作成
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        img.save(file_path)
        return file_path
    
    # Base64エンコード文字列として返す場合
    else:
        buffered = BytesIO()
        img.save(buffered)
        img_str = base64.b64encode(buffered.getvalue()).decode()
        return f"data:image/png;base64,{img_str}"
```

### 5.3 多言語対応

国際化（i18n）のためのユーティリティモジュールを実装します。

```python
# app/utils/i18n.py
from typing import Dict, Any, Optional
import json
import os

class I18n:
    """多言語対応のためのクラス"""
    
    def __init__(self):
        self.translations: Dict[str, Dict[str, str]] = {}
        self.load_translations()
    
    def load_translations(self):
        """翻訳リソースの読み込み"""
        # 翻訳ファイルのあるディレクトリ
        trans_dir = os.path.join(os.path.dirname(__file__), "../locales")
        
        # 各言語のJSONファイルを読み込む
        for filename in os.listdir(trans_dir):
            if filename.endswith(".json"):
                lang = filename.split(".")[0]  # 'ja.json' -> 'ja'
                with open(os.path.join(trans_dir, filename), 'r', encoding='utf-8') as f:
                    self.translations[lang] = json.load(f)
    
    def translate(self, key: str, lang: str = "ja", params: Optional[Dict[str, Any]] = None) -> str:
        """
        翻訳を取得
        
        Args:
            key: 翻訳キー
            lang: 言語コード
            params: 置換パラメータ
            
        Returns:
            str: 翻訳されたテキスト
        """
        # 言語が存在しない場合はデフォルト言語を使用
        if lang not in self.translations:
            lang = "ja"
        
        # キーが存在しない場合はキーをそのまま返す
        if key not in self.translations[lang]:
            return key
        
        text = self.translations[lang][key]
        
        # パラメータを置換
        if params:
            for param_key, param_value in params.items():
                text = text.replace(f"{{{param_key}}}", str(param_value))
        
        return text

# シングルトンインスタンス
i18n = I18n()
```

## 6. ユーザー認証と認可

### 6.1 JWT認証の実装

```python
# app/core/auth.py
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.crud.users import get_user_by_username
from app.db.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """パスワードを検証"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """パスワードをハッシュ化"""
    return pwd_context.hash(password)

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """アクセストークンを作成"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    return encoded_jwt

def create_refresh_token(data: Dict[str, Any]) -> str:
    """リフレッシュトークンを作成"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    return encoded_jwt

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """現在のユーザーを取得"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="無効な認証情報",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.JWTError:
        raise credentials_exception
    
    user = await get_user_by_username(db, username)
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="無効なユーザー")
    
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """アクティブなユーザーを取得"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="無効なユーザー")
    return current_user

async def get_current_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """管理者ユーザーを取得"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="権限がありません"
        )
    return current_user

async def get_current_helper_user(current_user: User = Depends(get_current_user)) -> User:
    """ヘルパーユーザーを取得"""
    if current_user.role != "helper" and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="権限がありません"
        )
    return current_user
```

### 6.2 認可ミドルウェア

```python
# app/api/v1/dependencies.py
from typing import List, Optional
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.core.auth import get_current_user
from app.db.models.user import User
from app.crud.helpers import get_user_helpers
from app.crud.recipe_requests import get_recipe_request
from app.db.models.recipe_request import RecipeRequest

async def check_recipe_request_access(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> RecipeRequest:
    """
    ユーザーがレシピリクエストにアクセスする権限があるか確認
    - ユーザー自身のリクエスト
    - 担当ヘルパーのリクエスト
    - 管理者
    """
    recipe_request = await get_recipe_request(db, request_id)
    if not recipe_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="レシピリクエストが見つかりません"
        )
    
    # 自分のリクエストか管理者の場合はアクセス許可
    if recipe_request.user_id == current_user.id or current_user.role == "admin":
        return recipe_request
    
    # ヘルパーの場合は、担当ユーザーのリクエストかチェック
    if current_user.role == "helper":
        assigned_users = await get_assigned_users_for_helper(db, current_user.id)
        if recipe_request.user_id in [user.id for user in assigned_users]:
            return recipe_request
    
    # それ以外はアクセス拒否
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="このリクエストにアクセスする権限がありません"
    )
```

## 7. エラーハンドリング

### 7.1 グローバル例外ハンドラー

```python
# app/core/errors.py
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from app.logs.app_logger import ApplicationLogger

def setup_exception_handlers(app: FastAPI) -> None:
    """アプリケーションに例外ハンドラを登録"""
    
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        """リクエスト検証エラーのハンドラ"""
        # エラーログの記録
        db = request.state.db
        logger = ApplicationLogger(db)
        await logger.log(
            level="WARNING",
            source="API",
            message="リクエスト検証エラー",
            endpoint=request.url.path,
            ip_address=request.client.host,
            user_agent=request.headers.get("user-agent"),
            additional_data={"errors": exc.errors()}
        )
        
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "detail": exc.errors(),
                "message": "入力値の検証に失敗しました"
            }
        )
    
    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
        """データベースエラーのハンドラ"""
        # エラーログの記録
        db = request.state.db
        logger = ApplicationLogger(db)
        await logger.log(
            level="ERROR",
            source="DATABASE",
            message=f"データベースエラー: {str(exc)}",
            endpoint=request.url.path,
            ip_address=request.client.host,
            user_agent=request.headers.get("user-agent"),
            additional_data={"error_details": str(exc)}
        )
        
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "message": "データベース操作中にエラーが発生しました"
            }
        )
    
    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        """一般的な例外のハンドラ"""
        # エラーログの記録
        db = request.state.db
        logger = ApplicationLogger(db)
        await logger.log(
            level="ERROR",
            source="SERVER",
            message=f"予期しないエラー: {str(exc)}",
            endpoint=request.url.path,
            ip_address=request.client.host,
            user_agent=request.headers.get("user-agent"),
            additional_data={"error_details": str(exc), "error_type": type(exc).__name__}
        )
        
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "message": "予期しないエラーが発生しました"
            }
        )
```

### 7.2 カスタム例外

```python
# app/exceptions.py
class BaseException(Exception):
    """ベース例外クラス"""
    def __init__(self, detail: str = "エラーが発生しました"):
        self.detail = detail
        super().__init__(self.detail)

class NotFoundException(BaseException):
    """リソースが見つからない場合の例外"""
    def __init__(self, detail: str = "リソースが見つかりません"):
        super().__init__(detail)

class PermissionDeniedException(BaseException):
    """アクセス権限がない場合の例外"""
    def __init__(self, detail: str = "この操作を実行する権限がありません"):
        super().__init__(detail)

class BadRequestException(BaseException):
    """リクエストが不正な場合の例外"""
    def __init__(self, detail: str = "リクエストが不正です"):
        super().__init__(detail)

class BusinessLogicException(BaseException):
    """ビジネスロジック違反の場合の例外"""
    def __init__(self, detail: str = "ビジネスルール違反が発生しました"):
        super().__init__(detail)
```

## 8. ロギング

### 8.1 アプリケーションログ

```python
# app/logs/app_logger.py
import logging
from contextvars import ContextVar
from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.application_log import ApplicationLog

# リクエストIDの文脈変数
request_id_var = ContextVar('request_id', default=None)

class ApplicationLogger:
    def __init__(self, db_session: AsyncSession):
        self.db_session = db_session
        self.logger = logging.getLogger("app")
    
    async def log(self, level: str, source: str, message: str, user_id: int = None, 
                  endpoint: str = None, ip_address: str = None, user_agent: str = None,
                  additional_data: dict = None):
        """
        アプリケーションログをデータベースに記録する
        
        Args:
            level: ログレベル (INFO, WARNING, ERROR, CRITICAL)
            source: ログソース (API, UI, SYSTEM など)
            message: ログメッセージ
            user_id: 関連ユーザーID
            endpoint: APIエンドポイント
            ip_address: IPアドレス
            user_agent: ユーザーエージェント
            additional_data: 追加データ (辞書形式)
        """
        # ログレベルに応じたPythonロガーの呼び出し
        log_method = getattr(self.logger, level.lower(), self.logger.info)
        log_method(f"{source}: {message}")
        
        # データベースへの保存
        log_entry = ApplicationLog(
            level=level,
            source=source,
            message=message,
            user_id=user_id,
            endpoint=endpoint,
            ip_address=ip_address,
            user_agent=user_agent,
            request_id=request_id_var.get(),
            additional_data=additional_data
        )
        
        self.db_session.add(log_entry)
        await self.db_session.flush()
        
        return log_entry

    @classmethod
    def from_request(cls, request: Request, db_session: AsyncSession):
        """リクエストからロガーインスタンスを生成"""
        return cls(db_session)
```

## 9. パフォーマンス最適化

### 9.1 キャッシュの実装

```python
# app/core/cache.py
from functools import wraps
import json
from typing import Any, Callable, Dict, Optional, TypeVar, cast
import redis.asyncio as redis
from app.config import settings

# Redis接続
redis_client = redis.from_url(settings.REDIS_URL)

T = TypeVar("T")

async def set_cache(key: str, value: Any, expire: int = 3600) -> None:
    """キャッシュに値を設定"""
    serialized = json.dumps(value)
    await redis_client.set(key, serialized, ex=expire)

async def get_cache(key: str) -> Optional[Any]:
    """キャッシュから値を取得"""
    cached = await redis_client.get(key)
    if cached:
        return json.loads(cached)
    return None

async def delete_cache(key: str) -> None:
    """キャッシュから値を削除"""
    await redis_client.delete(key)

async def delete_pattern(pattern: str) -> None:
    """パターンに一致するキャッシュを削除"""
    keys = await redis_client.keys(pattern)
    if keys:
        await redis_client.delete(*keys)

def cached(prefix: str, expire: int = 3600):
    """
    関数の結果をキャッシュするデコレータ
    
    Args:
        prefix: キャッシュキーのプレフィックス
        expire: キャッシュの有効期間（秒）
    """
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> T:
            # 最初の引数がselfの場合は除外（クラスメソッド用）
            cache_args = args[1:] if args and hasattr(args[0], "__class__") else args
            
            # キャッシュキーの作成
            key_parts = [prefix, func.__name__]
            if cache_args:
                key_parts.extend([str(arg) for arg in cache_args])
            if kwargs:
                key_parts.extend([f"{k}:{v}" for k, v in sorted(kwargs.items())])
            
            cache_key = ":".join(key_parts)
            
            # キャッシュから取得
            cached_result = await get_cache(cache_key)
            if cached_result is not None:
                return cached_result
            
            # キャッシュにない場合は関数を実行
            result = await func(*args, **kwargs)
            
            # 結果をキャッシュ
            await set_cache(cache_key, result, expire)
            
            return result
        
        return cast(Callable[..., T], wrapper)
    
    return decorator
```

### 9.2 データベースクエリの最適化

```python
# app/crud/recipe_requests.py
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_, and_
from sqlalchemy.orm import joinedload, selectinload

from app.db.models.recipe_request import RecipeRequest
from app.db.models.tag import Tag, recipe_tags
from app.core.cache import cached

async def get_recipe_request_with_relations(db: AsyncSession, id: int) -> Optional[RecipeRequest]:
    """リクエストとその関連データを取得（1回のクエリで）"""
    stmt = (
        select(RecipeRequest)
        .options(
            joinedload(RecipeRequest.user),
            selectinload(RecipeRequest.tags)
        )
        .filter(RecipeRequest.id == id)
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

@cached(prefix="recipe_requests", expire=300)  # 5分間キャッシュ
async def get_recipe_requests_for_user(
    db: AsyncSession,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None
) -> List[RecipeRequest]:
    """ユーザーの料理リクエスト一覧取得（キャッシュ付き）"""
    stmt = (
        select(RecipeRequest)
        .filter(RecipeRequest.user_id == user_id)
        .order_by(RecipeRequest.created_at.desc())
    )
    
    if status:
        stmt = stmt.filter(RecipeRequest.status == status)
    
    stmt = stmt.offset(skip).limit(limit)
    
    # 関連データのロード
    stmt = stmt.options(
        selectinload(RecipeRequest.tags)
    )
    
    result = await db.execute(stmt)
    return result.scalars().all()
```

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

## 11. セキュリティ対策

### 11.1 CORS設定

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

app = FastAPI(title=settings.PROJECT_NAME)

# CORSミドルウェアの設定
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
```

### 11.2 レート制限の実装

```python
# app/core/security.py
from typing import Callable
from fastapi import FastAPI, Request, Response
import redis.asyncio as redis
import time
from app.config import settings

# Redis接続
redis_client = redis.from_url(settings.REDIS_URL)

# レート制限ミドルウェア
async def rate_limit_middleware(
    request: Request,
    call_next: Callable,
    limit: int = 100,
    window: int = 60
) -> Response:
    """
    レート制限ミドルウェア
    
    Args:
        request: リクエストオブジェクト
        call_next: 次のミドルウェア/ハンドラ
        limit: 単位時間あたりの最大リクエスト数
        window: 時間枠（秒）
    """
    # クライアントIPの取得
    client_ip = request.client.host
    
    # レート制限キーの作成
    key = f"rate_limit:{client_ip}"
    
    # 現在時刻
    current_time = int(time.time())
    
    # キー存在チェック
    exists = await redis_client.exists(key)
    
    if not exists:
        # 新規キーの作成
        pipeline = redis_client.pipeline()
        pipeline.zadd(key, {str(current_time): current_time})
        pipeline.expire(key, window)
        await pipeline.execute()
        
        # 次のミドルウェア/ハンドラを呼び出し
        return await call_next(request)
    
    # 古いリクエストを削除
    cutoff_time = current_time - window
    await redis_client.zremrangebyscore(key, 0, cutoff_time)
    
    # 残りのリクエスト数をカウント
    count = await redis_client.zcard(key)
    
    # 新しいリクエストを追加
    await redis_client.zadd(key, {str(current_time): current_time})
    
    # リクエスト数が制限以内の場合
    if count < limit:
        # 有効期限を更新
        await redis_client.expire(key, window)
        
        # ヘッダーを設定
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(limit - count - 1)
        response.headers["X-RateLimit-Reset"] = str(current_time + window)
        
        return response
    else:
        # レート制限超過
        from fastapi.responses import JSONResponse
        from fastapi import status
        
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "detail": "レート制限を超過しました。しばらく時間を置いて再試行してください。"
            },
            headers={
                "X-RateLimit-Limit": str(limit),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(current_time + window),
                "Retry-After": str(window)
            }
        )
```

## 12. デプロイメント設定

### 12.1 Dockerfile

```dockerfile
# Dockerfile
FROM python:3.10-slim

WORKDIR /app/

# 依存関係をコピー
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションコードをコピー
COPY . /app/

# Gunicornと起動スクリプト
RUN pip install gunicorn uvicorn[standard]
COPY ./start.sh /start.sh
RUN chmod +x /start.sh

# 起動
CMD ["/start.sh"]
```

### 12.2 起動スクリプト

```bash
#!/bin/bash
# start.sh

set -e

# 環境変数の設定
export PYTHONPATH=/app

# 実行モードの確認
if [ "$APP_ENV" = "development" ]; then
    # 開発モード - uvicornを直接実行（ホットリロード有効）
    exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
else
    # 本番モード - gunicornを使用
    exec gunicorn app.main:app \
        -k uvicorn.workers.UvicornWorker \
        -c app/core/gunicorn_conf.py
fi
```

### 12.3 Docker Compose

```yaml
# docker-compose.yml
version: '3'

services:
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    env_file:
      - .env
    environment:
      - APP_ENV=development
      - DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/helper_system
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
    networks:
      - app-network

  db:
    image: postgres:14
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=helper_system
    ports:
      - "5432:5432"
    networks:
      - app-network

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
    networks:
      - app-network

networks:
  app-network:

volumes:
  postgres_data:
```

## 13. Alembic マイグレーション設定

### 13.1 初期設定

```bash
# alembic初期化
$ alembic init alembic
```

### 13.2 環境設定

```python
# alembic/env.py
from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
import asyncio
from app.config import settings
from app.db.base import Base

# Alembic設定
config = context.config

# ログ設定
fileConfig(config.config_file_name)

# モデルのメタデータ
target_metadata = Base.metadata

# 接続文字列
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

def run_migrations_offline():
    """オフラインでマイグレーションを実行"""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection):
    context.configure(
        connection=connection,
        target_metadata=target_metadata
    )

    with context.begin_transaction():
        context.run_migrations()

async def run_migrations_online():
    """オンラインでマイグレーションを実行"""
    configuration = config.get_section(config.config_ini_section)
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        do_run_migrations(connection)

def run_migrations_online_asyncio():
    """非同期のDB URLを処理するための関数"""
    connectable = AsyncEngine(
        engine_from_config(
            config.get_section(config.config_ini_section),
            prefix="sqlalchemy.",
            poolclass=pool.NullPool,
            future=True,
        )
    )

    asyncio.run(run_async_migrations(connectable))

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

### 13.3 マイグレーションの作成と実行

```bash
# マイグレーション作成
$ alembic revision --autogenerate -m "初期マイグレーション"

# マイグレーション実行
$ alembic upgrade head
```

## 14. フロントエンドとの連携

### 14.1 クライアントサイドエラーログの受信API

```python
# app/api/v1/endpoints/logs.py
from fastapi import APIRouter, Depends, Body, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.logs.app_logger import ApplicationLogger
from app.logs.audit_logger import AuditLogger
from app.logs.performance_logger import PerformanceLogger
from typing import Dict, List, Any
import uuid

router = APIRouter(prefix="/logs", tags=["logs"])

@router.post("/client", status_code=202)
async def receive_client_logs(
    request: Request,
    logs_data: Dict[str, List[Dict[str, Any]]] = Body(...),
    db: AsyncSession = Depends(get_db)
):
    """フロントエンドから送信されたログを受信して保存"""
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    
    # アプリケーションログの処理
    if "application" in logs_data and logs_data["application"]:
        app_logger = ApplicationLogger(db)
        for log_entry in logs_data["application"]:
            # 必須フィールドの検証
            if not all(k in log_entry for k in ["level", "source", "message"]):
                continue
            
            # クライアント情報を追加
            log_entry["ip_address"] = client_ip
            if "userAgent" not in log_entry:
                log_entry["userAgent"] = user_agent
            
            # バックエンドのログモデルに変換
            await app_logger.log(
                level=log_entry["level"],
                source=f"CLIENT:{log_entry['source']}",
                message=log_entry["message"],
                user_id=log_entry.get("userId"),
                endpoint=log_entry.get("location"),
                ip_address=client_ip,
                user_agent=log_entry.get("userAgent"),
                request_id=log_entry.get("sessionId", str(uuid.uuid4())),
                additional_data={
                    "stack": log_entry.get("stack"),
                    "additionalData": log_entry.get("additionalData"),
                    "clientInfo": log_entry.get("clientInfo")
                }
            )
    
    # 監査ログ（ユーザーアクション）の処理
    if "audit" in logs_data and logs_data["audit"]:
        audit_logger = AuditLogger(db)
        for log_entry in logs_data["audit"]:
            # 必須フィールドの検証
            if not all(k in log_entry for k in ["action", "sessionId"]):
                continue
            
            # バックエンドの監査ログモデルに変換
            await audit_logger.log_action(
                user_id=log_entry.get("userId", 0),
                action=log_entry["action"],
                resource_type=log_entry.get("resourceType", "UNKNOWN"),
                resource_id=log_entry.get("resourceId"),
                previous_state=log_entry.get("previousState"),
                new_state=log_entry.get("newState"),
                ip_address=client_ip,
                user_agent=log_entry.get("userAgent", user_agent),
                additional_data={
                    "element": log_entry.get("element"),
                    "elementId": log_entry.get("elementId"),
                    "location": log_entry.get("location"),
                    "sessionId": log_entry.get("sessionId"),
                    "metadata": log_entry.get("metadata"),
                    "clientInfo": log_entry.get("clientInfo")
                }
            )
    
    # パフォーマンスログの処理
    if "performance" in logs_data and logs_data["performance"]:
        perf_logger = PerformanceLogger(db)
        for log_entry in logs_data["performance"]:
            # 必須フィールドの検証
            if not all(k in log_entry for k in ["pageUrl", "loadTime"]):
                continue
            
            # フロントエンド固有のメトリクス
            metrics = {
                "first_paint": log_entry.get("firstPaint"),
                "first_contentful_paint": log_entry.get("firstContentfulPaint"),
                "largest_contentful_paint": log_entry.get("largestContentfulPaint"),
                "first_input_delay": log_entry.get("firstInputDelay"),
                "cumulative_layout_shift": log_entry.get("cumulativeLayoutShift"),
                "memory_usage": log_entry.get("memoryUsage"),
                "client_info": log_entry.get("clientInfo")
            }
            
            # バックエンドのパフォーマンスログモデルに変換
            await perf_logger.log_request(
                endpoint=log_entry["pageUrl"],
                status_code=200,
                request_method="GET",
                request_size=None,
                response_size=None,
                user_id=log_entry.get("userId"),
                ip_address=client_ip,
                additional_metrics=metrics
            )
    
    await db.commit()
    return {"message": "ログが正常に受信されました"}
```

## 15. API仕様のドキュメント化

### 15.1 OpenAPIドキュメントのカスタマイズ

```python
# app/main.py
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from app.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="ヘルパーシステム用のAPIサーバー",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title=settings.PROJECT_NAME,
        version="1.0.0",
        description="ヘルパーシステム用のAPIサーバー。料理リクエスト管理、ヘルパー・ユーザー連携、フィードバック機能などを提供します。",
        routes=app.routes,
    )
    
    # サーバー情報
    openapi_schema["servers"] = [
        {
            "url": "https://api.example.com",
            "description": "本番環境"
        },
        {
            "url": "https://staging-api.example.com",
            "description": "ステージング環境"
        },
        {
            "url": "http://localhost:8000",
            "description": "開発環境"
        }
    ]
    
    # セキュリティスキーマ
    openapi_schema["components"]["securitySchemes"] = {
        "OAuth2PasswordBearer": {
            "type": "oauth2",
            "flows": {
                "password": {
                    "tokenUrl": f"{settings.API_V1_STR}/auth/login",
                    "scopes": {}
                }
            }
        }
    }
    
    # グローバルセキュリティ要件
    openapi_schema["security"] = [
        {
            "OAuth2PasswordBearer": []
        }
    ]
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
```

## 16. リクエスト・レスポンス処理

### 16.1 レシピURL解析リクエストの処理

```python
# app/api/v1/endpoints/recipe_requests.py
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.core.auth import get_current_user
from app.db.models.user import User
from app.utils.recipe_parser import parse_recipe_url
from app.crud.recipe_requests import create_recipe_request
from app.schemas.recipe_request import RecipeRequestCreate, RecipeRequestResponse
from app.schemas.recipe import RecipeContent

router = APIRouter()

@router.post("/parse-url", response_model=RecipeContent)
async def parse_recipe_url_endpoint(
    url: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    レシピURLを解析してレシピ情報を取得
    
    Parameters:
    - url: 解析対象のレシピURL（クックパッドなど）
    
    Returns:
    - レシピ情報（タイトル、材料、手順など）
    """
    recipe_data = await parse_recipe_url(url)
    
    if not recipe_data:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="指定されたURLからレシピ情報を取得できませんでした。対応しているレシピサイトのURLか確認してください。"
        )
    
    return recipe_data

@router.post("/", response_model=RecipeRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_recipe_request_endpoint(
    request_data: RecipeRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    新しい料理リクエストを作成
    
    Parameters:
    - title: リクエストのタイトル
    - description: リクエストの説明
    - recipe_url: レシピURL（オプション）
    - notes: 特記事項（オプション）
    - priority: 優先度（0-5）
    - scheduled_date: 予定日（オプション）
    - tags: タグリスト（オプション）
    
    Returns:
    - 作成されたリクエスト情報
    """
    # レシピURLが指定されている場合は解析
    recipe_content = None
    if request_data.recipe_url:
        recipe_content = await parse_recipe_url(request_data.recipe_url)
    
    # リクエストの作成
    new_request = await create_recipe_request(
        db=db,
        data=request_data,
        user_id=current_user.id,
        recipe_content=recipe_content
    )
    
    return new_request
```

### 16.2 QRコード生成リクエストの処理

```python
# app/api/v1/endpoints/qrcodes.py
from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import os
from app.database import get_db
from app.core.auth import get_current_user
from app.db.models.user import User
from app.crud.qrcodes import create_qrcode, get_qrcode, get_user_qrcodes, delete_qrcode
from app.schemas.qrcode import QRCodeCreate, QRCodeResponse, QRCodeBatchCreate

router = APIRouter()

@router.post("/", response_model=QRCodeResponse)
async def create_qrcode_endpoint(
    qrcode_data: QRCodeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    新しいQRコードを生成
    
    Parameters:
    - target_type: 対象タイプ（RECIPE, TASK, FEEDBACK_FORM など）
    - target_id: 対象ID
    - title: QRコードのタイトル
    - expire_in: 有効期限（秒）（オプション）
    
    Returns:
    - 生成されたQRコード情報
    """
    qrcode = await create_qrcode(
        db=db,
        data=qrcode_data,
        user_id=current_user.id
    )
    
    return qrcode

@router.get("/{qrcode_id}/image")
async def get_qrcode_image(
    qrcode_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    QRコード画像を取得
    
    Parameters:
    - qrcode_id: QRコードID
    
    Returns:
    - QRコード画像ファイル
    """
    qrcode = await get_qrcode(db, qrcode_id)
    
    if not qrcode:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="QRコードが見つかりません"
        )
    
    # 有効期限チェック
    if qrcode.expire_at and qrcode.expire_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="このQRコードは有効期限が切れています"
        )
    
    # 画像パスが存在するか確認
    if not qrcode.image_path or not os.path.exists(qrcode.image_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="QRコード画像が見つかりません"
        )
    
    # アクセスカウンターのインクリメント
    qrcode.access_count += 1
    db.add(qrcode)
    await db.commit()
    
    return FileResponse(qrcode.image_path)

@router.post("/batch", response_model=List[QRCodeResponse])
async def create_qrcodes_batch(
    qrcodes_data: QRCodeBatchCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    複数のQRコードを一度に生成
    
    Parameters:
    - qrcodes: QRコード作成データのリスト
    
    Returns:
    - 生成されたQRコード情報のリスト
    """
    results = []
    
    for qrcode_data in qrcodes_data.qrcodes:
        qrcode = await create_qrcode(
            db=db,
            data=qrcode_data,
            user_id=current_user.id
        )
        results.append(qrcode)
    
    return results
```

## 17. 環境変数・設定管理

```python
# app/config.py
from typing import List, Union
from pydantic import AnyHttpUrl, BaseSettings, PostgresDsn, validator
import secrets

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "ヘルパーシステム API"
    
    # セキュリティ設定
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS設定
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []
    
    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    # データベース設定
    DATABASE_URL: PostgresDsn
    DB_ECHO: bool = False
    
    # Redis設定
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # ログ設定
    LOG_LEVEL: str = "INFO"
    
    # メール設定
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAILS_FROM_EMAIL: str = ""
    EMAILS_FROM_NAME: str = ""
    
    # 静的ファイル
    STATIC_DIR: str = "static"
    MEDIA_DIR: str = "media"
    QRCODE_DIR: str = "media/qrcodes"
    
    # フロントエンド
    FRONTEND_URL: AnyHttpUrl
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
```
