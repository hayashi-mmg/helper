# POST /api/v1/feedback - フィードバック作成テスト

## テスト概要

このテストでは、新しいフィードバックを作成するエンドポイント (`POST /api/v1/feedback`) の機能を検証します。
ユーザーが料理リクエストに対するフィードバックを正しく登録できることを確認します。

## テストシナリオ

### 1. 有効なデータで新規フィードバックを作成

**前提条件:**
- 認証済みの一般ユーザーがログインしている
- ユーザーが作成した料理リクエストが存在する
- リクエストは完了状態 (completed) になっている
- まだそのリクエストに対するフィードバックは作成されていない

**テストステップ:**
1. `POST /api/v1/feedback` エンドポイントに以下のデータを送信:
   ```json
   {
     "recipe_request_id": 1,
     "taste_rating": 5,
     "texture_rating": 4,
     "amount_rating": 3,
     "comment": "とても美味しかったです。次回も楽しみにしています。",
     "next_request": "もう少し辛くしていただけると嬉しいです。"
   }
   ```
2. 認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 201 Created
- レスポンスボディ: 作成されたフィードバック情報が含まれる

**検証項目:**
- レスポンスに正しいフィードバック情報が含まれていること
- 料理リクエストIDが正しいこと
- 各評価値が正しく保存されていること
- コメントと次回への要望が正しく保存されていること
- user_idが現在のユーザーIDであること
- created_atが現在時刻に近いこと

### 2. 画像付きでフィードバックを作成

**前提条件:**
- 認証済みの一般ユーザーがログインしている
- ユーザーが作成した料理リクエストが存在する
- リクエストは完了状態 (completed) になっている

**テストステップ:**
1. `POST /api/v1/feedback` エンドポイントに以下のようなデータを送信:
   ```json
   {
     "recipe_request_id": 1,
     "taste_rating": 4,
     "texture_rating": 4,
     "amount_rating": 5,
     "comment": "とても美味しかったです。",
     "image": "base64エンコードされた画像データ"
   }
   ```
2. 認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 201 Created
- レスポンスボディ: 作成されたフィードバック情報（画像URL情報を含む）

**検証項目:**
- 画像が正しく保存されていること
- レスポンスに画像URLが含まれていること
- 画像URLにアクセスできること

### 3. 存在しない料理リクエストIDでフィードバックを作成しようとした場合

**前提条件:**
- 認証済みの一般ユーザーがログインしている

**テストステップ:**
1. `POST /api/v1/feedback` エンドポイントに存在しないrecipe_request_idを含むデータを送信:
   ```json
   {
     "recipe_request_id": 9999,
     "taste_rating": 5,
     "texture_rating": 4,
     "amount_rating": 3,
     "comment": "コメント"
   }
   ```
2. 認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 404 Not Found
- エラーメッセージが含まれる

**検証項目:**
- 適切なエラーメッセージが返されること
- リクエストが存在しないことが明示されること

### 4. 他のユーザーの料理リクエストに対してフィードバックを作成しようとした場合

**前提条件:**
- 認証済みの一般ユーザーがログインしている
- 他のユーザーが作成した料理リクエストが存在する

**テストステップ:**
1. `POST /api/v1/feedback` エンドポイントに他のユーザーのrecipe_request_idを含むデータを送信
2. 認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 403 Forbidden
- エラーメッセージが含まれる

**検証項目:**
- 適切なエラーメッセージが返されること
- 権限がないことが明示されること

### 5. 未完了の料理リクエストに対してフィードバックを作成しようとした場合

**前提条件:**
- 認証済みの一般ユーザーがログインしている
- ユーザーが作成した料理リクエストが存在する
- リクエストはまだ完了状態 (completed) になっていない

**テストステップ:**
1. `POST /api/v1/feedback` エンドポイントに未完了のリクエストIDを含むデータを送信
2. 認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 400 Bad Request
- エラーメッセージが含まれる

**検証項目:**
- 適切なエラーメッセージが返されること
- リクエストが完了していないことが明示されること

### 6. 既にフィードバックが存在する料理リクエストに対して再度フィードバックを作成しようとした場合

**前提条件:**
- 認証済みの一般ユーザーがログインしている
- ユーザーが作成した料理リクエストが存在する
- そのリクエストに対するフィードバックが既に存在する

**テストステップ:**
1. `POST /api/v1/feedback` エンドポイントに既にフィードバックが作成されているリクエストIDを含むデータを送信
2. 認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 400 Bad Request
- エラーメッセージが含まれる

**検証項目:**
- 適切なエラーメッセージが返されること
- 既にフィードバックが存在することが明示されること

### 7. バリデーションエラー（必須フィールドの欠落）でフィードバックを作成しようとした場合

**前提条件:**
- 認証済みの一般ユーザーがログインしている

**テストステップ:**
1. `POST /api/v1/feedback` エンドポイントに必須フィールドが欠けたデータを送信:
   ```json
   {
     "recipe_request_id": 1,
     "comment": "コメントのみ"
   }
   ```
2. 認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 422 Unprocessable Entity
- バリデーションエラーメッセージが含まれる

**検証項目:**
- 適切なバリデーションエラーメッセージが返されること
- 欠けているフィールドが明示されること

## 実装例

```python
import pytest
from fastapi import status
import base64
from pathlib import Path

@pytest.mark.asyncio
async def test_create_feedback_success(client, user_token, create_test_user, create_completed_recipe_request):
    """有効なデータで新規フィードバックを正常に作成できることをテスト"""
    headers = {"Authorization": f"Bearer {user_token}"}
    
    feedback_data = {
        "recipe_request_id": create_completed_recipe_request.id,
        "taste_rating": 5,
        "texture_rating": 4,
        "amount_rating": 3,
        "comment": "とても美味しかったです。次回も楽しみにしています。",
        "next_request": "もう少し辛くしていただけると嬉しいです。"
    }
    
    response = client.post("/api/v1/feedback", json=feedback_data, headers=headers)
    
    assert response.status_code == status.HTTP_201_CREATED
    
    data = response.json()
    assert data["recipe_request_id"] == create_completed_recipe_request.id
    assert data["taste_rating"] == feedback_data["taste_rating"]
    assert data["texture_rating"] == feedback_data["texture_rating"]
    assert data["amount_rating"] == feedback_data["amount_rating"]
    assert data["comment"] == feedback_data["comment"]
    assert data["next_request"] == feedback_data["next_request"]
    assert data["user_id"] == create_test_user.id
    assert "created_at" in data
```
