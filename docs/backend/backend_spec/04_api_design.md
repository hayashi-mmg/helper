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

