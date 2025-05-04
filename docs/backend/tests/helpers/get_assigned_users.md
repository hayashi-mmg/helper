# ヘルパーの担当ユーザー一覧エンドポイント テストシナリオ

## エンドポイント情報
- **URL**: `/api/v1/helpers/{helper_id}/users`
- **メソッド**: GET
- **認証**: ヘルパー本人または管理者権限必須

## テストシナリオ

### 1. 正常系: ヘルパー本人による担当ユーザー一覧取得
**準備**:
- ヘルパーユーザーと認証トークンを用意
- 複数の担当ユーザーをヘルパーに割り当て

**リクエスト**:
```
GET /api/v1/helpers/{helper_id}/users
Authorization: Bearer {helper_token}
```

**期待される結果**:
- ステータスコード: 200
- 担当ユーザーのリストが返される
- 各ユーザーの基本情報が含まれる
- 割り当て関係の情報（主担当フラグなど）も含まれる

### 2. 正常系: 管理者による特定ヘルパーの担当ユーザー一覧取得
**準備**:
- 管理者ユーザーと認証トークンを用意
- 対象ヘルパーに複数の担当ユーザーを割り当て

**リクエスト**:
```
GET /api/v1/helpers/{helper_id}/users
Authorization: Bearer {admin_token}
```

**期待される結果**:
- ステータスコード: 200
- 担当ユーザーのリストが返される
- 各ユーザーの詳細情報が含まれる
- 管理者に表示される追加情報も含まれる

### 3. 異常系: 他のヘルパーの担当ユーザー一覧へのアクセス
**準備**:
- ヘルパーユーザーと認証トークンを用意
- 別のヘルパーIDを用意

**リクエスト**:
```
GET /api/v1/helpers/{other_helper_id}/users
Authorization: Bearer {helper_token}
```

**期待される結果**:
- ステータスコード: 403
- エラーメッセージ: "他のヘルパーの担当ユーザー情報にアクセスする権限がありません"

### 4. 異常系: 一般ユーザー（ヘルパーでない）によるアクセス
**準備**:
- 一般ユーザー（ヘルパーでない）と認証トークンを用意

**リクエスト**:
```
GET /api/v1/helpers/{helper_id}/users
Authorization: Bearer {user_token}
```

**期待される結果**:
- ステータスコード: 403
- エラーメッセージ: "権限がありません"

### 5. 異常系: 存在しないヘルパーID
**準備**:
- ヘルパーユーザーまたは管理者と認証トークンを用意
- 存在しないヘルパーIDを用意

**リクエスト**:
```
GET /api/v1/helpers/999/users
Authorization: Bearer {admin_token}
```

**期待される結果**:
- ステータスコード: 404
- エラーメッセージ: "ヘルパーが見つかりません"

### 6. 正常系: 担当ユーザーがいない場合
**準備**:
- ヘルパーユーザーと認証トークンを用意
- ヘルパーに担当ユーザーが割り当てられていない状態を確認

**リクエスト**:
```
GET /api/v1/helpers/{helper_id}/users
Authorization: Bearer {helper_token}
```

**期待される結果**:
- ステータスコード: 200
- 空のユーザーリストが返される

## テスト実装コード例

```python
import pytest
from fastapi import status

@pytest.mark.asyncio
async def test_get_helper_assigned_users(client, helper_token, helper_user, test_db):
    # テスト用の担当ユーザーを作成
    from app.db.models.user_helper_assignment import UserHelperAssignment
    from app.db.models.user import User
    from app.db.models.helper import Helper
    from sqlalchemy.future import select
    
    # ヘルパー情報を取得
    result = await test_db.execute(
        select(Helper).join(Helper.user).filter(Helper.user.has(username=helper_user["username"]))
    )
    helper = result.scalar_one()
    
    # テストユーザーを作成
    from app.core.auth import get_password_hash
    
    for i in range(3):
        user = User(
            username=f"testuser{i}",
            email=f"testuser{i}@example.com",
            hashed_password=get_password_hash("testpassword"),
            full_name=f"テストユーザー{i}",
            role="user"
        )
        test_db.add(user)
    
    await test_db.commit()
    
    # ユーザーを取得
    result = await test_db.execute(select(User).filter(User.username.like("testuser%")))
    users = result.scalars().all()
    
    # 担当関係を作成
    for i, user in enumerate(users):
        assignment = UserHelperAssignment(
            user_id=user.id,
            helper_id=helper.id,
            is_primary=(i == 0)  # 最初のユーザーを主担当に
        )
        test_db.add(assignment)
    
    await test_db.commit()
    
    # ヘルパー本人として担当ユーザー一覧を取得
    response = client.get(
        f"/api/v1/helpers/{helper.id}/users",
        headers={"Authorization": f"Bearer {helper_token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 3  # 3人のテストユーザー
    
    # ユーザー情報と割り当て情報の確認
    for user_data in data:
        assert "id" in user_data
        assert "username" in user_data
        assert "email" in user_data
        assert "assignment" in user_data
        assert "is_primary" in user_data["assignment"]
        assert "password" not in user_data
        assert "hashed_password" not in user_data

@pytest.mark.asyncio
async def test_get_helper_assigned_users_admin(client, admin_token, test_db):
    # ヘルパー情報を取得
    from app.db.models.helper import Helper
    from sqlalchemy.future import select
    
    result = await test_db.execute(select(Helper).limit(1))
    helper = result.scalar_one()
    
    # 管理者として担当ユーザー一覧を取得
    response = client.get(
        f"/api/v1/helpers/{helper.id}/users",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)

@pytest.mark.asyncio
async def test_get_other_helper_assigned_users(client, helper_token, helper_user, test_db):
    # 別のヘルパーを取得（または作成）
    from app.db.models.helper import Helper
    from app.db.models.user import User
    from sqlalchemy.future import select
    from app.core.auth import get_password_hash
    
    # 別のヘルパーユーザーを作成
    other_user = User(
        username="otherhelper",
        email="otherhelper@example.com",
        hashed_password=get_password_hash("testpassword"),
        full_name="別のヘルパー",
        role="helper"
    )
    test_db.add(other_user)
    await test_db.commit()
    
    # ヘルパー情報を作成
    other_helper = Helper(
        user_id=other_user.id,
        certification="介護福祉士",
        specialties=["和食", "洋食"],
        introduction="別のヘルパーです"
    )
    test_db.add(other_helper)
    await test_db.commit()
    
    # 自分とは別のヘルパーの担当ユーザー一覧を取得
    response = client.get(
        f"/api/v1/helpers/{other_helper.id}/users",
        headers={"Authorization": f"Bearer {helper_token}"}
    )
    
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert "他のヘルパーの担当ユーザー情報にアクセスする権限がありません" in response.json()["detail"]

@pytest.mark.asyncio
async def test_get_nonexistent_helper_assigned_users(client, admin_token):
    # 存在しないヘルパーIDで担当ユーザー一覧を取得
    response = client.get(
        "/api/v1/helpers/999/users",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "ヘルパーが見つかりません" in response.json()["detail"]
```

## 注意点
- ヘルパー自身と管理者のみがアクセスできることを確認
- 他のヘルパーの情報へのアクセス制限が適切に機能しているか確認
- 存在しないヘルパーIDに対する適切なエラー処理を確認
- 担当ユーザーが存在しない場合の処理が適切か確認
- ユーザー情報にセンシティブなデータが含まれていないことを確認
- アクセスが監査ログに記録されているか確認
