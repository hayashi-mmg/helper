# 料理リクエスト一覧取得・作成エンドポイント テストシナリオ

## エンドポイント情報

### 料理リクエスト一覧取得
- **URL**: `/api/v1/recipe-requests`
- **メソッド**: GET
- **認証**: JWT認証必須

### 料理リクエスト作成
- **URL**: `/api/v1/recipe-requests`
- **メソッド**: POST
- **認証**: ユーザー権限必須

## テストシナリオ（GET）

### 1. 正常系: 一般ユーザーによる自分の料理リクエスト一覧取得
**準備**:
- 一般ユーザーと認証トークンを用意
- ユーザーに関連する複数の料理リクエストをデータベースに追加

**リクエスト**:
```
GET /api/v1/recipe-requests
Authorization: Bearer {user_token}
```

**期待される結果**:
- ステータスコード: 200
- ユーザーの料理リクエストのリストが返される
- 料理リクエストの基本情報（ID、タイトル、説明、ステータスなど）が含まれる

### 2. 正常系: ヘルパーによる担当ユーザーの料理リクエスト一覧取得
**準備**:
- ヘルパーユーザーと認証トークンを用意
- 担当ユーザーを用意し、関連する料理リクエストをデータベースに追加
- ヘルパーとユーザーの担当関係を設定

**リクエスト**:
```
GET /api/v1/recipe-requests
Authorization: Bearer {helper_token}
```

**期待される結果**:
- ステータスコード: 200
- 担当ユーザーの料理リクエストのリストが返される
- 料理リクエストの基本情報にユーザー情報も含まれる

### 3. 正常系: 管理者による全ユーザーの料理リクエスト一覧取得
**準備**:
- 管理者ユーザーと認証トークンを用意
- 複数のユーザーに関連する料理リクエストをデータベースに追加

**リクエスト**:
```
GET /api/v1/recipe-requests
Authorization: Bearer {admin_token}
```

**期待される結果**:
- ステータスコード: 200
- 全ユーザーの料理リクエストのリストが返される
- 各リクエストにユーザー情報が含まれる

### 4. 正常系: ページネーションを利用したリクエスト一覧取得
**準備**:
- 認証済みユーザーと認証トークンを用意
- 多数の料理リクエスト（20以上）をデータベースに追加

**リクエスト**:
```
GET /api/v1/recipe-requests?skip=5&limit=10
Authorization: Bearer {user_token}
```

**期待される結果**:
- ステータスコード: 200
- 指定したオフセットと制限に基づいたリクエストリストが返される
- 返されるリクエスト数が10以下である

### 5. 正常系: フィルター条件を指定したリクエスト一覧取得
**準備**:
- 認証済みユーザーと認証トークンを用意
- 様々なステータス（requested, in_progress, completed, cancelled）の料理リクエストをデータベースに追加

**リクエスト**:
```
GET /api/v1/recipe-requests?status=requested&scheduled_date=2025-01-15
Authorization: Bearer {user_token}
```

**期待される結果**:
- ステータスコード: 200
- フィルター条件に一致するリクエストのみが返される
- 返されるリクエストはすべてステータスが "requested" で、予定日が2025-01-15である

### 6. 異常系: 認証なしでのアクセス
**リクエスト**:
```
GET /api/v1/recipe-requests
```

**期待される結果**:
- ステータスコード: 401
- エラーメッセージ: "認証されていません"

## テストシナリオ（POST）

### 1. 正常系: 基本情報による料理リクエスト作成
**準備**:
- 一般ユーザーと認証トークンを用意

**リクエスト**:
```json
{
    "title": "肉じゃが",
    "description": "祖母の作ってくれた味を再現してください",
    "notes": "じゃがいもは少し固めがいいです",
    "priority": 3,
    "scheduled_date": "2025-01-15"
}
```

**期待される結果**:
- ステータスコード: 201
- 作成された料理リクエストの情報が返される
- デフォルト値（status = "requested"など）が適切に設定されている
- ユーザーIDが現在のユーザーに設定されている

### 2. 正常系: クックパッドURLを含むリクエスト作成
**準備**:
- 一般ユーザーと認証トークンを用意
- クックパッドURLパーサーのモック（必要に応じて）

**リクエスト**:
```json
{
    "title": "ミートソースパスタ",
    "description": "このレシピ通りに作ってください",
    "recipe_url": "https://cookpad.com/recipe/123456",
    "notes": "チーズを多めにかけてください",
    "priority": 2,
    "scheduled_date": "2025-01-20"
}
```

**期待される結果**:
- ステータスコード: 201
- 作成された料理リクエストの情報が返される
- recipe_urlが保存されている
- URLから解析されたレシピ情報（recipe_content）が含まれる

### 3. 正常系: タグを含むリクエスト作成
**準備**:
- 一般ユーザーと認証トークンを用意
- データベースに既存のタグを追加

**リクエスト**:
```json
{
    "title": "チキンカレー",
    "description": "スパイシーなカレーをお願いします",
    "notes": "辛さは中辛でお願いします",
    "tags": ["カレー", "鶏肉", "スパイシー"]
}
```

**期待される結果**:
- ステータスコード: 201
- 作成された料理リクエストの情報が返される
- 指定したタグが関連付けられている
- 存在しないタグが自動的に作成されている

### 4. 異常系: 必須フィールドの欠落
**準備**:
- 一般ユーザーと認証トークンを用意

**リクエスト**:
```json
{
    "description": "タイトルなしのリクエスト",
    "priority": 1
}
```

**期待される結果**:
- ステータスコード: 422
- バリデーションエラーメッセージ（titleが必須など）

### 5. 異常系: 無効な優先度値
**準備**:
- 一般ユーザーと認証トークンを用意

**リクエスト**:
```json
{
    "title": "サラダ",
    "description": "野菜サラダをお願いします",
    "priority": 10  // 範囲外の値
}
```

**期待される結果**:
- ステータスコード: 422
- バリデーションエラーメッセージ（priorityの範囲制限など）

### 6. 異常系: 無効な予定日
**準備**:
- 一般ユーザーと認証トークンを用意

**リクエスト**:
```json
{
    "title": "朝食オムレツ",
    "description": "ふわふわオムレツをお願いします",
    "scheduled_date": "invalid-date"
}
```

**期待される結果**:
- ステータスコード: 422
- バリデーションエラーメッセージ（日付形式に関するエラー）

### 7. 異常系: URLパース失敗
**準備**:
- 一般ユーザーと認証トークンを用意
- URLパーサーが失敗するようにモック設定（必要に応じて）

**リクエスト**:
```json
{
    "title": "鍋料理",
    "description": "このレシピを参考にしてください",
    "recipe_url": "https://example.com/not-a-recipe-site"
}
```

**期待される結果**:
- ステータスコード: 201（URLパース失敗はエラーではなく、recipe_contentがnullになる）
- レスポンスにrecipe_urlは含まれるが、recipe_contentは含まれない

## テスト実装コード例

```python
import pytest
from fastapi import status

@pytest.mark.asyncio
async def test_get_recipe_requests_user(client, user_token, test_user, test_db):
    # テスト用の料理リクエストを作成
    from app.db.models.recipe_request import RecipeRequest
    from datetime import datetime
    
    for i in range(5):
        recipe_request = RecipeRequest(
            user_id=test_user["id"],
            title=f"テストリクエスト{i}",
            description=f"テスト説明{i}",
            status="requested",
            priority=i % 5,
            created_at=datetime.utcnow()
        )
        test_db.add(recipe_request)
    
    await test_db.commit()
    
    # 一般ユーザーとして自分のリクエスト一覧を取得
    response = client.get(
        "/api/v1/recipe-requests",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 5  # 少なくとも5件のテストデータ
    
    # リクエスト情報の検証
    for request in data:
        assert "id" in request
        assert "title" in request
        assert "description" in request
        assert "status" in request
        assert request["user_id"] == test_user["id"]

@pytest.mark.asyncio
async def test_get_recipe_requests_pagination(client, user_token, test_user):
    # ページネーションを使用してリクエスト一覧を取得
    response = client.get(
        "/api/v1/recipe-requests?skip=2&limit=3",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) <= 3  # limit=3なので最大3件

@pytest.mark.asyncio
async def test_create_recipe_request_basic(client, user_token, test_user):
    # 基本的な料理リクエストを作成
    request_data = {
        "title": "肉じゃが",
        "description": "祖母の作ってくれた味を再現してください",
        "notes": "じゃがいもは少し固めがいいです",
        "priority": 3,
        "scheduled_date": "2025-01-15"
    }
    
    response = client.post(
        "/api/v1/recipe-requests",
        headers={"Authorization": f"Bearer {user_token}"},
        json=request_data
    )
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == request_data["title"]
    assert data["description"] == request_data["description"]
    assert data["notes"] == request_data["notes"]
    assert data["priority"] == request_data["priority"]
    assert data["scheduled_date"] == request_data["scheduled_date"]
    assert data["status"] == "requested"
    assert data["user_id"] == test_user["id"]
    assert "id" in data
    assert "created_at" in data

@pytest.mark.asyncio
async def test_create_recipe_request_with_url(client, user_token):
    # クックパッドURLを含むリクエストを作成
    request_data = {
        "title": "ミートソースパスタ",
        "description": "このレシピ通りに作ってください",
        "recipe_url": "https://cookpad.com/recipe/123456",
        "notes": "チーズを多めにかけてください",
        "priority": 2
    }
    
    response = client.post(
        "/api/v1/recipe-requests",
        headers={"Authorization": f"Bearer {user_token}"},
        json=request_data
    )
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["recipe_url"] == request_data["recipe_url"]
    assert "recipe_content" in data  # URLから解析されたレシピ情報があるはず

@pytest.mark.asyncio
async def test_create_recipe_request_missing_title(client, user_token):
    # 必須フィールドが欠けたリクエストを作成
    request_data = {
        "description": "タイトルなしのリクエスト",
        "priority": 1
    }
    
    response = client.post(
        "/api/v1/recipe-requests",
        headers={"Authorization": f"Bearer {user_token}"},
        json=request_data
    )
    
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert "title" in response.json()["detail"][0]["loc"]
```

## 注意点
- 認証とユーザー権限の検証が適切に行われているか確認
- レシピURLからの情報解析が正しく機能しているか確認（テスト時はモック化を検討）
- ページネーションとフィルタリングが適切に機能しているか確認
- リクエスト作成時のバリデーションが適切に機能しているか確認
- タグの関連付けが正しく行われるか確認
- 作成された料理リクエストがデータベースに正しく保存されるか確認
- リクエスト作成が監査ログに記録されているか確認
