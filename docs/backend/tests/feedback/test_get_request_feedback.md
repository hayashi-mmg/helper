# GET /api/v1/recipe-requests/{request_id}/feedback - リクエストのフィードバック取得テスト

## テスト概要

このテストでは、特定の料理リクエストに関連するフィードバックを取得するエンドポイント (`GET /api/v1/recipe-requests/{request_id}/feedback`) の機能を検証します。
リクエストIDに基づいて、適切なフィードバック情報が返されることを確認します。

## テストシナリオ

### 1. ユーザーが自分のリクエストのフィードバックを取得

**前提条件:**
- 認証済みの一般ユーザーがログインしている
- ユーザーが作成した料理リクエストが存在する
- そのリクエストに対するフィードバックが存在する

**テストステップ:**
1. `GET /api/v1/recipe-requests/{request_id}/feedback` エンドポイントにリクエストを送信
2. 認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 200 OK
- レスポンスボディ: リクエストに関連するフィードバック情報が含まれる

**検証項目:**
- フィードバックのrecipe_request_idがリクエストIDと一致すること
- フィードバックのuser_idがログインユーザーのIDと一致すること
- 評価項目（taste_rating, texture_rating, amount_rating）が正しく含まれていること
- コメントや次回への要望が正しく含まれていること
- ヘルパー返信が存在する場合、その情報も含まれていること

### 2. ヘルパーが担当ユーザーのリクエストフィードバックを取得

**前提条件:**
- 認証済みのヘルパーユーザーがログインしている
- 担当ユーザーの料理リクエストが存在する
- そのリクエストに対するフィードバックが存在する

**テストステップ:**
1. `GET /api/v1/recipe-requests/{request_id}/feedback` エンドポイントにリクエストを送信
2. ヘルパーの認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 200 OK
- レスポンスボディ: リクエストに関連するフィードバック情報が含まれる

**検証項目:**
- フィードバックデータが完全に取得できること
- ヘルパー返信情報も正しく含まれていること（存在する場合）

### 3. 管理者が任意のリクエストのフィードバックを取得

**前提条件:**
- 認証済みの管理者ユーザーがログインしている
- システム内の任意のユーザーの料理リクエストが存在する
- そのリクエストに対するフィードバックが存在する

**テストステップ:**
1. `GET /api/v1/recipe-requests/{request_id}/feedback` エンドポイントにリクエストを送信
2. 管理者の認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 200 OK
- レスポンスボディ: リクエストに関連するフィードバック情報が含まれる

**検証項目:**
- 任意のリクエストのフィードバックにアクセスできることを確認
- フィードバックデータが完全に取得できること

### 4. 担当外ユーザーのリクエストフィードバックを取得しようとした場合

**前提条件:**
- 認証済みの一般ユーザーがログインしている
- 他のユーザーの料理リクエストが存在する
- そのリクエストに対するフィードバックが存在する

**テストステップ:**
1. `GET /api/v1/recipe-requests/{request_id}/feedback` エンドポイントにリクエストを送信
2. 認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 403 Forbidden
- エラーメッセージが含まれる

**検証項目:**
- 適切なエラーメッセージが返されること
- 権限がないことが明示されること

### 5. フィードバックが存在しないリクエストでフィードバックを取得しようとした場合

**前提条件:**
- 認証済みの一般ユーザーがログインしている
- ユーザーが作成した料理リクエストが存在する
- そのリクエストにはまだフィードバックが作成されていない

**テストステップ:**
1. `GET /api/v1/recipe-requests/{request_id}/feedback` エンドポイントにリクエストを送信
2. 認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 404 Not Found
- エラーメッセージが含まれる

**検証項目:**
- 適切なエラーメッセージが返されること
- フィードバックが存在しないことが明示されること

### 6. 存在しないリクエストIDでフィードバックを取得しようとした場合

**前提条件:**
- 認証済みのユーザーがログインしている

**テストステップ:**
1. `GET /api/v1/recipe-requests/9999/feedback` のように存在しないIDでリクエストを送信
2. 認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 404 Not Found
- エラーメッセージが含まれる

**検証項目:**
- 適切なエラーメッセージが返されること
- リクエストが見つからないことが明示されること

### 7. 未認証でフィードバックを取得しようとした場合

**前提条件:**
- ユーザーが認証されていない

**テストステップ:**
1. `GET /api/v1/recipe-requests/{request_id}/feedback` エンドポイントにリクエストを送信
2. 認証トークンを含めない

**期待結果:**
- ステータスコード: 401 Unauthorized
- エラーメッセージが含まれる

**検証項目:**
- 適切なエラーメッセージが返されること
- 認証が必要であることが明示されること

## 実装例

```python
import pytest
from fastapi import status

@pytest.mark.asyncio
async def test_get_request_feedback_own_request(
    client, user_token, create_test_user, create_test_request, create_test_feedback
):
    """ユーザーが自分のリクエストのフィードバックを正常に取得できることをテスト"""
    headers = {"Authorization": f"Bearer {user_token}"}
    
    response = client.get(
        f"/api/v1/recipe-requests/{create_test_request.id}/feedback", 
        headers=headers
    )
    
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert data["recipe_request_id"] == create_test_request.id
    assert data["user_id"] == create_test_user.id
    assert "taste_rating" in data
    assert "texture_rating" in data
    assert "amount_rating" in data
    assert "comment" in data
    assert "created_at" in data
    
    # ヘルパー返信が存在する場合は検証
    if "helper_response" in data and data["helper_response"]:
        assert "response" in data["helper_response"]
        assert "helper_id" in data["helper_response"]

@pytest.mark.asyncio
async def test_get_nonexistent_request_feedback(client, user_token):
    """存在しないリクエストのフィードバックを取得しようとした場合のテスト"""
    headers = {"Authorization": f"Bearer {user_token}"}
    
    response = client.get(
        "/api/v1/recipe-requests/9999/feedback", 
        headers=headers
    )
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "detail" in response.json()
```
