# ユーザー情報更新エンドポイント テストシナリオ

## エンドポイント情報
- **URL**: `/api/v1/users/me`
- **メソッド**: PUT
- **認証**: JWT認証必須

## テストシナリオ

### 1. 正常系: ユーザー情報の部分更新
**準備**:
- 有効なユーザーと認証トークンを用意

**リクエスト**:
```json
{
    "full_name": "更新された名前",
    "address": "更新された住所"
}
```

**期待される結果**:
- ステータスコード: 200
- 更新されたユーザー情報が返される
- 指定したフィールド（full_name, address）が更新されている
- 指定していないフィールドは変更されていない

### 2. 正常系: 全フィールドの更新
**準備**:
- 有効なユーザーと認証トークンを用意

**リクエスト**:
```json
{
    "email": "updated@example.com",
    "full_name": "更新された名前",
    "address": "更新された住所",
    "phone": "090-9876-5432",
    "language": "en",
    "preferences": {
        "food_preferences": ["和食", "イタリアン"],
        "allergies": ["卵"]
    }
}
```

**期待される結果**:
- ステータスコード: 200
- 全てのフィールドが更新されている
- パスワードは変更されていない

### 3. 正常系: パスワード更新
**準備**:
- 有効なユーザーと認証トークンを用意

**リクエスト**:
```json
{
    "current_password": "current_password",
    "new_password": "new_secure_password"
}
```

**期待される結果**:
- ステータスコード: 200
- 成功メッセージが返される
- パスワードが更新されている（現在のパスワードが正しく検証された場合）

### 4. 異常系: 重複するメールアドレスへの更新
**準備**:
- 他のユーザーが既に使用しているメールアドレスを把握

**リクエスト**:
```json
{
    "email": "existing@example.com"
}
```

**期待される結果**:
- ステータスコード: 400
- エラーメッセージ: "このメールアドレスは既に使用されています"

### 5. 異常系: 無効なメールアドレス形式
**リクエスト**:
```json
{
    "email": "invalid-email"
}
```

**期待される結果**:
- ステータスコード: 422
- バリデーションエラーメッセージ

### 6. 異常系: パスワード更新時に現在のパスワードが間違っている
**リクエスト**:
```json
{
    "current_password": "wrong_current_password",
    "new_password": "new_secure_password"
}
```

**期待される結果**:
- ステータスコード: 400
- エラーメッセージ: "現在のパスワードが正しくありません"

### 7. 異常系: 安全でない新しいパスワード
**リクエスト**:
```json
{
    "current_password": "current_password",
    "new_password": "short"
}
```

**期待される結果**:
- ステータスコード: 422
- バリデーションエラーメッセージ

## テスト実装コード例

```python
import pytest
from fastapi import status

@pytest.mark.asyncio
async def test_update_user_info_partial(client, test_user, user_token, test_db):
    # 部分的なユーザー情報更新
    update_data = {
        "full_name": "更新された名前",
        "address": "更新された住所"
    }
    
    response = client.put(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {user_token}"},
        json=update_data
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["full_name"] == update_data["full_name"]
    assert data["address"] == update_data["address"]
    assert data["email"] == test_user["email"]  # 変更されていないことを確認
    
    # データベースで更新を確認
    from app.db.models.user import User
    from sqlalchemy.future import select
    
    result = await test_db.execute(select(User).filter(User.id == test_user["id"]))
    user = result.scalar_one()
    
    assert user.full_name == update_data["full_name"]
    assert user.address == update_data["address"]

@pytest.mark.asyncio
async def test_update_user_password(client, test_user, user_token, test_db):
    # パスワード更新
    password_data = {
        "current_password": "testpassword",  # テストユーザーの現在のパスワード
        "new_password": "newSecurePassword123"
    }
    
    response = client.put(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {user_token}"},
        json=password_data
    )
    
    assert response.status_code == status.HTTP_200_OK
    
    # パスワードが更新されたことを確認
    from app.db.models.user import User
    from sqlalchemy.future import select
    from app.core.auth import verify_password
    
    result = await test_db.execute(select(User).filter(User.id == test_user["id"]))
    user = result.scalar_one()
    
    assert verify_password("newSecurePassword123", user.hashed_password)
    assert not verify_password("testpassword", user.hashed_password)
```

## 注意点
- メールアドレスやユーザー名の一意性が適切に検証されているか確認
- パスワード更新時に現在のパスワードが正しく検証されているか確認
- 異常な入力値に対するバリデーションが適切に機能しているか確認
- ユーザー情報の更新が監査ログに記録されているか確認
- パスワード更新が監査ログに記録されているか確認（パスワード自体はログに記録されない）
