# ユーザー登録エンドポイント テストシナリオ

## エンドポイント情報
- **URL**: `/api/v1/auth/register`
- **メソッド**: POST
- **認証**: 不要

## テストシナリオ

### 1. 正常系: 有効なデータでのユーザー登録
**リクエスト**:
```json
{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "securepassword123",
    "full_name": "新規 ユーザー",
    "address": "東京都渋谷区",
    "phone": "090-1234-5678",
    "language": "ja"
}
```

**期待される結果**:
- ステータスコード: 200
- レスポンスボディにユーザー情報が含まれる
- パスワードはレスポンスに含まれない
- ユーザーがデータベースに正しく保存されている
- パスワードがハッシュ化されている

### 2. 異常系: すでに存在するユーザー名
**準備**:
- 「existinguser」というユーザー名がデータベースに存在する状態を作成

**リクエスト**:
```json
{
    "username": "existinguser",
    "email": "new@example.com",
    "password": "securepassword123",
    "full_name": "新規 ユーザー",
    "language": "ja"
}
```

**期待される結果**:
- ステータスコード: 400
- エラーメッセージ: "このユーザー名は既に使用されています"

### 3. 異常系: すでに存在するメールアドレス
**準備**:
- 「existing@example.com」というメールアドレスがデータベースに存在する状態を作成

**リクエスト**:
```json
{
    "username": "brandnewuser",
    "email": "existing@example.com",
    "password": "securepassword123",
    "full_name": "新規 ユーザー",
    "language": "ja"
}
```

**期待される結果**:
- ステータスコード: 400
- エラーメッセージ: "このメールアドレスは既に登録されています"

### 4. 異常系: パスワードが短すぎる
**リクエスト**:
```json
{
    "username": "newuser2",
    "email": "newuser2@example.com",
    "password": "short",
    "full_name": "新規 ユーザー2",
    "language": "ja"
}
```

**期待される結果**:
- ステータスコード: 422
- バリデーションエラーメッセージ: パスワードの長さに関する指摘

### 5. 異常系: 無効なメールアドレス形式
**リクエスト**:
```json
{
    "username": "newuser3",
    "email": "invalid-email",
    "password": "securepassword123",
    "full_name": "新規 ユーザー3",
    "language": "ja"
}
```

**期待される結果**:
- ステータスコード: 422
- バリデーションエラーメッセージ: メールアドレス形式に関する指摘

### 6. 異常系: 必須フィールドの欠落
**リクエスト**:
```json
{
    "username": "newuser4",
    "password": "securepassword123"
}
```

**期待される結果**:
- ステータスコード: 422
- バリデーションエラーメッセージ: email必須フィールドに関する指摘

### 7. 正常系: 最小限の情報でのユーザー登録
**リクエスト**:
```json
{
    "username": "minimaluser",
    "email": "minimal@example.com",
    "password": "securepassword123"
}
```

**期待される結果**:
- ステータスコード: 200
- ユーザーがデフォルト値（例: language = "ja"）で作成される

## テスト実装コード例

```python
import pytest
from fastapi import status

@pytest.mark.asyncio
async def test_register_user_success(client, test_db):
    # 新規ユーザー登録
    user_data = {
        "username": "testregister",
        "email": "testregister@example.com",
        "password": "securepassword123",
        "full_name": "テスト ユーザー",
        "language": "ja"
    }
    
    response = client.post(
        "/api/v1/auth/register",
        json=user_data
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["username"] == user_data["username"]
    assert data["email"] == user_data["email"]
    assert "password" not in data
    
    # データベースに保存されたか確認
    from app.db.models.user import User
    from sqlalchemy.future import select
    
    result = await test_db.execute(select(User).filter(User.username == user_data["username"]))
    user = result.scalar_one_or_none()
    
    assert user is not None
    assert user.email == user_data["email"]
    assert user.hashed_password != user_data["password"]  # ハッシュ化されていることを確認

@pytest.mark.asyncio
async def test_register_existing_username(client, test_user):
    # 既存のユーザー名で登録を試みる
    user_data = {
        "username": test_user["username"],
        "email": "newemail@example.com",
        "password": "securepassword123"
    }
    
    response = client.post(
        "/api/v1/auth/register",
        json=user_data
    )
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "このユーザー名は既に使用されています" in response.json()["detail"]
```

## 注意点
- ユーザー名とメールアドレスの一意性の検証を確認
- パスワードの安全性要件を確認
- 入力値の適切なバリデーションを確認
- デフォルト値（言語等）が正しく設定されているか確認
- ユーザー作成が監査ログに記録されているか確認
