# GET /api/v1/feedback/{feedback_id} - 特定フィードバック取得テスト

## テスト概要

このテストでは、特定のフィードバックを取得するエンドポイント (`GET /api/v1/feedback/{feedback_id}`) の機能を検証します。
フィードバックIDに基づいて、適切な結果が返されることを確認します。

## テストシナリオ

### 1. 自分のフィードバックを取得

**前提条件:**
- 認証済みの一般ユーザーがログインしている
- ユーザーが作成したフィードバックが存在する

**テストステップ:**
1. `GET /api/v1/feedback/{feedback_id}` エンドポイントにリクエストを送信
2. 認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 200 OK
- レスポンスボディ: 指定したフィードバックの詳細情報が含まれる

**検証項目:**
- フィードバックIDが正しいことを確認
- ユーザーIDが自分のIDと一致することを確認
- 各評価項目（taste_rating, texture_rating, amount_rating）が正しいことを確認
- コメントや次回への要望が正しく含まれていることを確認
- 作成日時や更新日時が含まれていることを確認

### 2. ヘルパーとして担当ユーザーのフィードバックを取得

**前提条件:**
- 認証済みのヘルパーユーザーがログインしている
- 担当ユーザーが作成したフィードバックが存在する

**テストステップ:**
1. `GET /api/v1/feedback/{feedback_id}` エンドポイントにリクエストを送信
2. ヘルパーの認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 200 OK
- レスポンスボディ: 指定したフィードバックの詳細情報が含まれる

**検証項目:**
- フィードバックのユーザーが担当ユーザーであることを確認
- フィードバックデータが完全に取得できることを確認

### 3. 管理者として任意のフィードバックを取得

**前提条件:**
- 認証済みの管理者ユーザーがログインしている
- システム内に任意のユーザーのフィードバックが存在する

**テストステップ:**
1. `GET /api/v1/feedback/{feedback_id}` エンドポイントにリクエストを送信
2. 管理者の認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 200 OK
- レスポンスボディ: 指定したフィードバックの詳細情報が含まれる

**検証項目:**
- 任意のユーザーのフィードバックにアクセスできることを確認
- フィードバックデータが完全に取得できることを確認

### 4. 他のユーザーのフィードバックを取得しようとした場合（権限なし）

**前提条件:**
- 認証済みの一般ユーザーがログインしている
- 他のユーザーが作成したフィードバックが存在する
- ログインユーザーはそのフィードバックに対する閲覧権限を持っていない

**テストステップ:**
1. `GET /api/v1/feedback/{feedback_id}` エンドポイントにリクエストを送信
2. 認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 403 Forbidden
- エラーメッセージが含まれる

**検証項目:**
- 適切なエラーメッセージが返されること
- 権限がないことが明示されること

### 5. 存在しないフィードバックIDでリクエストした場合

**前提条件:**
- 認証済みのユーザーがログインしている

**テストステップ:**
1. `GET /api/v1/feedback/9999` のように存在しないIDでリクエストを送信
2. 認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 404 Not Found
- エラーメッセージが含まれる

**検証項目:**
- 適切なエラーメッセージが返されること
- リソースが見つからないことが明示されること

### 6. 未認証でフィードバックを取得しようとした場合

**前提条件:**
- ユーザーが認証されていない

**テストステップ:**
1. `GET /api/v1/feedback/{feedback_id}` エンドポイントにリクエストを送信
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
async def test_get_feedback_by_id_success(client, user_token, create_test_user, create_test_feedback):
    """自分のフィードバックを正常に取得できることをテスト"""
    headers = {"Authorization": f"Bearer {user_token}"}
    
    response = client.get(f"/api/v1/feedback/{create_test_feedback.id}", headers=headers)
    
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert data["id"] == create_test_feedback.id
    assert data["user_id"] == create_test_user.id
    assert data["recipe_request_id"] == create_test_feedback.recipe_request_id
    assert "taste_rating" in data
    assert "texture_rating" in data
    assert "amount_rating" in data
    assert "comment" in data
    assert "created_at" in data
    
@pytest.mark.asyncio
async def test_get_nonexistent_feedback(client, user_token):
    """存在しないフィードバックを取得しようとした場合のテスト"""
    headers = {"Authorization": f"Bearer {user_token}"}
    
    response = client.get("/api/v1/feedback/9999", headers=headers)
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "detail" in response.json()
```
