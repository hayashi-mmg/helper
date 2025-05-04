# PUT /api/v1/feedback/{feedback_id} - フィードバック更新テスト

## テスト概要

このテストでは、既存のフィードバックを更新するエンドポイント (`PUT /api/v1/feedback/{feedback_id}`) の機能を検証します。
ユーザーが自分のフィードバックを正しく更新できることを確認します。

## テストシナリオ

### 1. 有効なデータで自分のフィードバックを更新

**前提条件:**
- 認証済みの一般ユーザーがログインしている
- ユーザーが作成したフィードバックが存在する

**テストステップ:**
1. `PUT /api/v1/feedback/{feedback_id}` エンドポイントに以下のデータを送信:
   ```json
   {
     "taste_rating": 4,
     "texture_rating": 5,
     "amount_rating": 4,
     "comment": "更新されたコメントです。",
     "next_request": "更新された次回への要望です。"
   }
   ```
2. 認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 200 OK
- レスポンスボディ: 更新されたフィードバック情報が含まれる

**検証項目:**
- 各評価値が正しく更新されていること
- コメントと次回への要望が正しく更新されていること
- 更新日時が現在時刻に近いこと
- user_idが変更されていないこと
- recipe_request_idが変更されていないこと

### 2. 部分的な更新を行う

**前提条件:**
- 認証済みの一般ユーザーがログインしている
- ユーザーが作成したフィードバックが存在する

**テストステップ:**
1. `PUT /api/v1/feedback/{feedback_id}` エンドポイントに一部のフィールドのみを含むデータを送信:
   ```json
   {
     "comment": "コメントのみ更新します"
   }
   ```
2. 認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 200 OK
- レスポンスボディ: 部分的に更新されたフィードバック情報が含まれる

**検証項目:**
- 指定したフィールド（この場合はcomment）のみが更新されていること
- 他のフィールドは元の値が維持されていること

### 3. 画像の更新を行う

**前提条件:**
- 認証済みの一般ユーザーがログインしている
- ユーザーが作成したフィードバックが存在する（画像あり/なし両方のケースでテスト）

**テストステップ:**
1. `PUT /api/v1/feedback/{feedback_id}` エンドポイントに新しい画像データを含むJSONを送信:
   ```json
   {
     "image": "新しいbase64エンコードされた画像データ"
   }
   ```
2. 認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 200 OK
- レスポンスボディ: 更新された画像URLを含むフィードバック情報

**検証項目:**
- 画像が正しく更新されていること
- 以前の画像が適切に削除または置換されていること
- 新しい画像URLが返されていること

### 4. 他のユーザーのフィードバックを更新しようとした場合

**前提条件:**
- 認証済みの一般ユーザーがログインしている
- 他のユーザーが作成したフィードバックが存在する

**テストステップ:**
1. `PUT /api/v1/feedback/{feedback_id}` エンドポイントに他のユーザーのフィードバックIDを指定してデータを送信
2. 認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 403 Forbidden
- エラーメッセージが含まれる

**検証項目:**
- 適切なエラーメッセージが返されること
- 権限がないことが明示されること

### 5. 管理者として他のユーザーのフィードバックを更新

**前提条件:**
- 認証済みの管理者ユーザーがログインしている
- 一般ユーザーが作成したフィードバックが存在する

**テストステップ:**
1. `PUT /api/v1/feedback/{feedback_id}` エンドポイントに一般ユーザーのフィードバックIDを指定してデータを送信
2. 管理者の認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 200 OK
- レスポンスボディ: 更新されたフィードバック情報が含まれる

**検証項目:**
- フィードバックが正しく更新されていること
- 管理者が他のユーザーのフィードバックを更新できることを確認

### 6. 存在しないフィードバックIDで更新しようとした場合

**前提条件:**
- 認証済みのユーザーがログインしている

**テストステップ:**
1. `PUT /api/v1/feedback/9999` のように存在しないIDでリクエストを送信
2. 認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 404 Not Found
- エラーメッセージが含まれる

**検証項目:**
- 適切なエラーメッセージが返されること
- リソースが見つからないことが明示されること

### 7. バリデーションエラーのあるデータで更新しようとした場合

**前提条件:**
- 認証済みの一般ユーザーがログインしている
- ユーザーが作成したフィードバックが存在する

**テストステップ:**
1. `PUT /api/v1/feedback/{feedback_id}` エンドポイントに無効なデータを送信:
   ```json
   {
     "taste_rating": 10,
     "texture_rating": -1
   }
   ```
2. 認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 422 Unprocessable Entity
- バリデーションエラーメッセージが含まれる

**検証項目:**
- 適切なバリデーションエラーメッセージが返されること
- 無効なフィールドが明示されること

### 8. 未認証でフィードバックを更新しようとした場合

**前提条件:**
- ユーザーが認証されていない

**テストステップ:**
1. `PUT /api/v1/feedback/{feedback_id}` エンドポイントにデータを送信
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
async def test_update_feedback_success(client, user_token, create_test_user, create_test_feedback):
    """自分のフィードバックを正常に更新できることをテスト"""
    headers = {"Authorization": f"Bearer {user_token}"}
    
    update_data = {
        "taste_rating": 4,
        "texture_rating": 5,
        "amount_rating": 4,
        "comment": "更新されたコメントです。",
        "next_request": "更新された次回への要望です。"
    }
    
    response = client.put(
        f"/api/v1/feedback/{create_test_feedback.id}", 
        json=update_data, 
        headers=headers
    )
    
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert data["id"] == create_test_feedback.id
    assert data["user_id"] == create_test_user.id
    assert data["recipe_request_id"] == create_test_feedback.recipe_request_id
    assert data["taste_rating"] == update_data["taste_rating"]
    assert data["texture_rating"] == update_data["texture_rating"]
    assert data["amount_rating"] == update_data["amount_rating"]
    assert data["comment"] == update_data["comment"]
    assert data["next_request"] == update_data["next_request"]
    assert "updated_at" in data

@pytest.mark.asyncio
async def test_partial_update_feedback(client, user_token, create_test_feedback):
    """フィードバックの部分的な更新ができることをテスト"""
    headers = {"Authorization": f"Bearer {user_token}"}
    
    # オリジナルの値を記録
    original_taste_rating = create_test_feedback.taste_rating
    
    update_data = {
        "comment": "コメントのみ更新します"
    }
    
    response = client.put(
        f"/api/v1/feedback/{create_test_feedback.id}", 
        json=update_data, 
        headers=headers
    )
    
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert data["comment"] == update_data["comment"]
    assert data["taste_rating"] == original_taste_rating  # 変更されていないことを確認
```
