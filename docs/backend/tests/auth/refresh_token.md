# トークン更新エンドポイント テストシナリオ

## エンドポイント情報
- **URL**: `/api/v1/auth/refresh`
- **メソッド**: POST
- **認証**: リフレッシュトークンを使用

## テストシナリオ

### 1. 正常系: 有効なリフレッシュトークンでの更新
**準備**:
- 有効なリフレッシュトークンを持つユーザーを用意

**リクエスト**:
```json
{
    "refresh_token": "valid_refresh_token"
}
```

**期待される結果**:
- ステータスコード: 200
- 新しいアクセストークンが返される
- 以前のトークンとは異なる新しいトークンが発行される
- トークンに含まれるユーザー情報が正確である

### 2. 異常系: 無効なリフレッシュトークン
**リクエスト**:
```json
{
    "refresh_token": "invalid_refresh_token"
}
```

**期待される結果**:
- ステータスコード: 401
- エラーメッセージ: "無効な認証情報"

### 3. 異常系: 期限切れのリフレッシュトークン
**準備**:
- 期限切れのリフレッシュトークンを生成

**リクエスト**:
```json
{
    "refresh_token": "expired_refresh_token"
}
```

**期待される結果**:
- ステータスコード: 401
- エラーメッセージ: "トークンの有効期限が切れています"

### 4. 異常系: 存在しないユーザーのトークン
**準備**:
- 存在しないユーザーIDを持つトークンを生成

**リクエスト**:
```json
{
    "refresh_token": "nonexistent_user_token"
}
```

**期待される結果**:
- ステータスコード: 401
- エラーメッセージ: "無効な認証情報"

### 5. 異常系: リフレッシュトークンが欠落
**リクエスト**:
```json
{}
```

**期待される結果**:
- ステータスコード: 422
- バリデーションエラーメッセージ

## テスト実装コード例

```python
import pytest
from fastapi import status
from app.core.auth import create_refresh_token
from datetime import datetime, timedelta
from jose import jwt
from app.config import settings

@pytest.mark.asyncio
async def test_refresh_token_success(client, test_user):
    # 有効なリフレッシュトークンを生成
    refresh_token = create_refresh_token(
        {"sub": test_user["username"]}
    )
    
    response = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    
    # 新しいトークンを検証
    token = data["access_token"]
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    assert payload["sub"] == test_user["username"]

@pytest.mark.asyncio
async def test_refresh_token_expired(client, test_user):
    # 期限切れのリフレッシュトークンを生成
    expire = datetime.utcnow() - timedelta(days=1)
    to_encode = {"exp": expire, "sub": test_user["username"]}
    expired_token = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    response = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": expired_token}
    )
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "トークンの有効期限が切れています" in response.json()["detail"]
```

## 注意点
- リフレッシュトークンの有効期限が適切に検証されているか確認
- 新しいアクセストークンの有効期限が適切に設定されているか確認
- 不正なトークンに対するセキュリティ対策が適切か確認
- トークン更新が監査ログに記録されているか確認
