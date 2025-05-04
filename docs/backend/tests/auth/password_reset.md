# パスワードリセットエンドポイント テストシナリオ

## エンドポイント情報
### パスワードリセット要求
- **URL**: `/api/v1/auth/password-reset`
- **メソッド**: POST
- **認証**: 不要

### パスワードリセット確認
- **URL**: `/api/v1/auth/password-reset/confirm`
- **メソッド**: POST
- **認証**: 不要

## テストシナリオ

### 1. 正常系: 有効なメールアドレスでのパスワードリセット要求
**準備**:
- 有効なユーザーがデータベースに存在する状態を作成

**リクエスト**:
```json
{
    "email": "existinguser@example.com"
}
```

**期待される結果**:
- ステータスコード: 200
- 成功メッセージが返される
- 指定したメールアドレスにリセットリンクが送信される
- パスワードリセットトークンがデータベースに記録される

### 2. 正常系: 存在しないメールアドレスでのパスワードリセット要求
**リクエスト**:
```json
{
    "email": "nonexistent@example.com"
}
```

**期待される結果**:
- ステータスコード: 200（情報漏洩防止のため）
- 成功メッセージが返される（実際にはメールは送信されない）

### 3. 異常系: 無効なメールアドレス形式
**リクエスト**:
```json
{
    "email": "invalid-email"
}
```

**期待される結果**:
- ステータスコード: 422
- バリデーションエラーメッセージ

### 4. 正常系: 有効なトークンでのパスワードリセット確認
**準備**:
- パスワードリセットトークンを持つユーザーを用意

**リクエスト**:
```json
{
    "token": "valid_reset_token",
    "new_password": "new_secure_password"
}
```

**期待される結果**:
- ステータスコード: 200
- 成功メッセージが返される
- ユーザーのパスワードが更新される
- パスワードリセットトークンが無効化される

### 5. 異常系: 無効なトークンでのパスワードリセット確認
**リクエスト**:
```json
{
    "token": "invalid_token",
    "new_password": "new_secure_password"
}
```

**期待される結果**:
- ステータスコード: 400
- エラーメッセージ: "無効なリセットトークン"

### 6. 異常系: 期限切れのトークンでのパスワードリセット確認
**準備**:
- 期限切れのパスワードリセットトークンを生成

**リクエスト**:
```json
{
    "token": "expired_token",
    "new_password": "new_secure_password"
}
```

**期待される結果**:
- ステータスコード: 400
- エラーメッセージ: "トークンの有効期限が切れています"

### 7. 異常系: 安全でない新しいパスワード
**リクエスト**:
```json
{
    "token": "valid_reset_token",
    "new_password": "short"
}
```

**期待される結果**:
- ステータスコード: 422
- バリデーションエラーメッセージ: パスワードの強度に関する指摘

## テスト実装コード例

```python
import pytest
from fastapi import status
from unittest.mock import patch

@pytest.mark.asyncio
async def test_password_reset_request_success(client, test_user):
    # メール送信モックを設定
    with patch('app.services.email_service.send_email') as mock_send_email:
        response = client.post(
            "/api/v1/auth/password-reset",
            json={"email": test_user["email"]}
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert "パスワードリセット手順をメールで送信しました" in response.json()["message"]
        
        # メールが送信されたことを確認
        mock_send_email.assert_called_once()
        
        # メールの内容を確認
        call_args = mock_send_email.call_args
        assert test_user["email"] in call_args[1]["to_email"]
        assert "パスワードリセット" in call_args[1]["subject"]
        assert "リセットするには" in call_args[1]["body"]

@pytest.mark.asyncio
async def test_password_reset_confirm_success(client, test_user, test_db):
    # リセットトークンを生成して保存
    from app.services.user_service import create_password_reset_token
    reset_token = await create_password_reset_token(test_db, test_user["id"])
    
    response = client.post(
        "/api/v1/auth/password-reset/confirm",
        json={
            "token": reset_token,
            "new_password": "newSecurePassword123"
        }
    )
    
    assert response.status_code == status.HTTP_200_OK
    assert "パスワードがリセットされました" in response.json()["message"]
    
    # パスワードが更新されたか確認
    from app.db.models.user import User
    from sqlalchemy.future import select
    from app.core.auth import verify_password
    
    result = await test_db.execute(select(User).filter(User.id == test_user["id"]))
    user = result.scalar_one()
    
    assert verify_password("newSecurePassword123", user.hashed_password)
```

## 注意点
- メール送信が実際に行われるか確認（テストではモック化）
- パスワードリセットトークンの有効期限が適切に設定・検証されているか確認
- 新しいパスワードの安全性要件を確認
- 連続してリセット要求を行った場合の処理を確認
- パスワードリセット操作が監査ログに記録されているか確認
