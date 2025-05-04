# POST /api/v1/feedback/{feedback_id}/response - ヘルパー返信作成テスト

## テスト概要

このテストでは、フィードバックに対するヘルパーの返信を作成するエンドポイント (`POST /api/v1/feedback/{feedback_id}/response`) の機能を検証します。
ヘルパーが担当ユーザーのフィードバックに対して適切に返信できることを確認します。

## テストシナリオ

### 1. 有効なデータでヘルパー返信を作成

**前提条件:**
- 認証済みのヘルパーユーザーがログインしている
- 担当ユーザーが作成したフィードバックが存在する
- そのフィードバックにはまだヘルパー返信が作成されていない

**テストステップ:**
1. `POST /api/v1/feedback/{feedback_id}/response` エンドポイントに以下のデータを送信:
   ```json
   {
     "response": "フィードバックありがとうございます。次回も美味しく作れるよう努めます。",
     "next_note": "次回はもう少し辛さを加えるようにする。"
   }
   ```
2. ヘルパーの認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 201 Created
- レスポンスボディ: 作成されたヘルパー返信情報が含まれる

**検証項目:**
- レスポンスにfeedback_idが正しく含まれていること
- レスポンスにhelper_id（現在のヘルパーID）が含まれていること
- 返信内容が正しく保存されていること
- 次回調理時のメモが正しく保存されていること
- created_atが現在時刻に近いこと

### 2. 担当外のフィードバックに返信しようとした場合

**前提条件:**
- 認証済みのヘルパーユーザーがログインしている
- ヘルパーが担当していないユーザーのフィードバックが存在する

**テストステップ:**
1. `POST /api/v1/feedback/{feedback_id}/response` エンドポイントに担当外のフィードバックIDを指定してデータを送信
2. ヘルパーの認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 403 Forbidden
- エラーメッセージが含まれる

**検証項目:**
- 適切なエラーメッセージが返されること
- 権限がないことが明示されること

### 3. 一般ユーザーがヘルパー返信を作成しようとした場合

**前提条件:**
- 認証済みの一般ユーザーがログインしている
- フィードバックが存在する

**テストステップ:**
1. `POST /api/v1/feedback/{feedback_id}/response` エンドポイントにデータを送信
2. 一般ユーザーの認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 403 Forbidden
- エラーメッセージが含まれる

**検証項目:**
- 適切なエラーメッセージが返されること
- 権限がないことが明示されること

### 4. 管理者がヘルパー返信を作成

**前提条件:**
- 認証済みの管理者ユーザーがログインしている
- フィードバックが存在する

**テストステップ:**
1. `POST /api/v1/feedback/{feedback_id}/response` エンドポイントにデータを送信
2. 管理者の認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 201 Created
- レスポンスボディ: 作成されたヘルパー返信情報が含まれる

**検証項目:**
- 管理者が任意のフィードバックに返信を作成できることを確認
- 返信内容が正しく保存されていること

### 5. 既に返信が存在するフィードバックに再度返信しようとした場合

**前提条件:**
- 認証済みのヘルパーユーザーがログインしている
- 担当ユーザーのフィードバックが存在する
- そのフィードバックには既にヘルパー返信が作成されている

**テストステップ:**
1. `POST /api/v1/feedback/{feedback_id}/response` エンドポイントに既に返信のあるフィードバックIDを指定してデータを送信
2. ヘルパーの認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 400 Bad Request
- エラーメッセージが含まれる

**検証項目:**
- 適切なエラーメッセージが返されること
- 既に返信が存在することが明示されること

### 6. 存在しないフィードバックIDで返信しようとした場合

**前提条件:**
- 認証済みのヘルパーユーザーがログインしている

**テストステップ:**
1. `POST /api/v1/feedback/9999/response` のように存在しないIDでリクエストを送信
2. ヘルパーの認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 404 Not Found
- エラーメッセージが含まれる

**検証項目:**
- 適切なエラーメッセージが返されること
- リソースが見つからないことが明示されること

### 7. バリデーションエラーのあるデータで返信しようとした場合

**前提条件:**
- 認証済みのヘルパーユーザーがログインしている
- 担当ユーザーのフィードバックが存在する

**テストステップ:**
1. `POST /api/v1/feedback/{feedback_id}/response` エンドポイントに無効なデータを送信:
   ```json
   {
     // responseフィールドを省略（必須フィールド）
     "next_note": "次回メモのみ"
   }
   ```
2. ヘルパーの認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 422 Unprocessable Entity
- バリデーションエラーメッセージが含まれる

**検証項目:**
- 適切なバリデーションエラーメッセージが返されること
- 欠けているフィールドが明示されること

### 8. 未認証で返信しようとした場合

**前提条件:**
- ユーザーが認証されていない

**テストステップ:**
1. `POST /api/v1/feedback/{feedback_id}/response` エンドポイントにデータを送信
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
async def test_create_helper_response_success(
    client, helper_token, create_test_helper, create_assigned_feedback
):
    """ヘルパーが担当ユーザーのフィードバックに返信を正常に作成できることをテスト"""
    headers = {"Authorization": f"Bearer {helper_token}"}
    
    response_data = {
        "response": "フィードバックありがとうございます。次回も美味しく作れるよう努めます。",
        "next_note": "次回はもう少し辛さを加えるようにする。"
    }
    
    response = client.post(
        f"/api/v1/feedback/{create_assigned_feedback.id}/response", 
        json=response_data, 
        headers=headers
    )
    
    assert response.status_code == status.HTTP_201_CREATED
    
    data = response.json()
    assert data["feedback_id"] == create_assigned_feedback.id
    assert data["helper_id"] == create_test_helper.id
    assert data["response"] == response_data["response"]
    assert data["next_note"] == response_data["next_note"]
    assert "created_at" in data

@pytest.mark.asyncio
async def test_create_helper_response_unassigned_feedback(
    client, helper_token, create_unassigned_feedback
):
    """担当外のフィードバックに返信しようとした場合のテスト"""
    headers = {"Authorization": f"Bearer {helper_token}"}
    
    response_data = {
        "response": "返信テスト",
        "next_note": "メモテスト"
    }
    
    response = client.post(
        f"/api/v1/feedback/{create_unassigned_feedback.id}/response", 
        json=response_data, 
        headers=headers
    )
    
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert "detail" in response.json()
```
