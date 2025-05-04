# 料理リクエスト取得・更新・削除エンドポイント テストシナリオ

本ドキュメントでは、料理リクエスト（RecipeRequest）の取得・更新・削除APIエンドポイントに対するテストシナリオを定義します。これらのエンドポイントは以下の通りです：

- GET `/api/v1/recipe-requests/{request_id}` - 特定のリクエスト取得
- PUT `/api/v1/recipe-requests/{request_id}` - リクエスト更新
- DELETE `/api/v1/recipe-requests/{request_id}` - リクエスト削除
- PUT `/api/v1/recipe-requests/{request_id}/status` - リクエスト状態更新

## 1. 特定のリクエスト取得テスト (GET)

### 1.1 正常系: 自分のリクエストの取得

**概要**: ユーザーが自分が作成したリクエストを取得できることを確認します。

**前提条件**:
- テストユーザーが存在する
- テストユーザーが作成した料理リクエストが存在する

**テストステップ**:
1. テストユーザーでログインしアクセストークンを取得
2. アクセストークンを使用して自分のリクエストを取得

**期待結果**:
- ステータスコード: 200 OK
- レスポンスボディにリクエスト情報が含まれる
- リクエストの所有者IDがテストユーザーのIDと一致する

**コード例**:
```python
@pytest.mark.asyncio
async def test_get_own_recipe_request(client, user_token, create_test_recipe_request):
    headers = {"Authorization": f"Bearer {user_token}"}
    
    response = client.get(f"/api/v1/recipe-requests/{create_test_recipe_request.id}", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == create_test_recipe_request.id
    assert data["user_id"] == create_test_recipe_request.user_id
    assert data["title"] == create_test_recipe_request.title
```

### 1.2 正常系: ヘルパーが担当ユーザーのリクエストを取得

**概要**: ヘルパーが担当ユーザーのリクエストを取得できることを確認します。

**前提条件**:
- テストヘルパーユーザーが存在する
- テスト一般ユーザーが存在する
- ヘルパーと一般ユーザーの関連付けが存在する
- 一般ユーザーが作成した料理リクエストが存在する

**テストステップ**:
1. ヘルパーユーザーでログインしアクセストークンを取得
2. アクセストークンを使用して担当ユーザーのリクエストを取得

**期待結果**:
- ステータスコード: 200 OK
- レスポンスボディにリクエスト情報が含まれる

**コード例**:
```python
@pytest.mark.asyncio
async def test_helper_get_assigned_user_recipe_request(
    client, helper_token, create_test_recipe_request, create_test_user_helper_assignment
):
    headers = {"Authorization": f"Bearer {helper_token}"}
    
    response = client.get(f"/api/v1/recipe-requests/{create_test_recipe_request.id}", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == create_test_recipe_request.id
```

### 1.3 異常系: 存在しないリクエストID

**概要**: 存在しないリクエストIDを指定した場合にエラーになることを確認します。

**前提条件**:
- テストユーザーが存在する

**テストステップ**:
1. テストユーザーでログインしアクセストークンを取得
2. 存在しないリクエストIDを指定して取得を試みる

**期待結果**:
- ステータスコード: 404 Not Found
- エラーメッセージが返される

**コード例**:
```python
@pytest.mark.asyncio
async def test_get_nonexistent_recipe_request(client, user_token):
    headers = {"Authorization": f"Bearer {user_token}"}
    
    response = client.get("/api/v1/recipe-requests/99999", headers=headers)
    
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
```

### 1.4 異常系: 権限のないリクエストへのアクセス

**概要**: 他のユーザーのリクエストに対して、アクセス権限がない場合のエラーを確認します。

**前提条件**:
- テストユーザー1が存在する
- テストユーザー2が存在する
- テストユーザー2が作成した料理リクエストが存在する

**テストステップ**:
1. テストユーザー1でログインしアクセストークンを取得
2. テストユーザー2のリクエストIDを指定して取得を試みる

**期待結果**:
- ステータスコード: 403 Forbidden
- 権限エラーメッセージが返される

**コード例**:
```python
@pytest.mark.asyncio
async def test_get_unauthorized_recipe_request(
    client, user_token, create_another_user_recipe_request
):
    headers = {"Authorization": f"Bearer {user_token}"}
    
    response = client.get(
        f"/api/v1/recipe-requests/{create_another_user_recipe_request.id}", 
        headers=headers
    )
    
    assert response.status_code == 403
    data = response.json()
    assert "detail" in data
```

## 2. リクエスト更新テスト (PUT)

### 2.1 正常系: 自分のリクエスト情報を更新

**概要**: ユーザーが自分のリクエスト情報を更新できることを確認します。

**前提条件**:
- テストユーザーが存在する
- テストユーザーが作成した料理リクエストが存在する

**テストステップ**:
1. テストユーザーでログインしアクセストークンを取得
2. アクセストークンを使用して自分のリクエスト情報を更新

**期待結果**:
- ステータスコード: 200 OK
- 更新後のリクエスト情報が返される
- 指定したフィールドが更新されている

**コード例**:
```python
@pytest.mark.asyncio
async def test_update_own_recipe_request(client, user_token, create_test_recipe_request):
    headers = {"Authorization": f"Bearer {user_token}"}
    
    update_data = {
        "title": "更新されたテストレシピ",
        "description": "これは更新後の説明です。",
        "priority": 3
    }
    
    response = client.put(
        f"/api/v1/recipe-requests/{create_test_recipe_request.id}", 
        json=update_data,
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == update_data["title"]
    assert data["description"] == update_data["description"]
    assert data["priority"] == update_data["priority"]
```

### 2.2 正常系: 部分的な更新

**概要**: 一部のフィールドのみを指定して更新できることを確認します。

**前提条件**:
- テストユーザーが存在する
- テストユーザーが作成した料理リクエストが存在する

**テストステップ**:
1. テストユーザーでログインしアクセストークンを取得
2. 一部のフィールドのみを指定してリクエスト情報を更新

**期待結果**:
- ステータスコード: 200 OK
- 指定したフィールドのみが更新され、他のフィールドは元の値を保持する

**コード例**:
```python
@pytest.mark.asyncio
async def test_partial_update_recipe_request(client, user_token, create_test_recipe_request):
    headers = {"Authorization": f"Bearer {user_token}"}
    
    # タイトルのみ更新
    update_data = {
        "title": "タイトルのみ更新"
    }
    
    response = client.put(
        f"/api/v1/recipe-requests/{create_test_recipe_request.id}", 
        json=update_data,
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == update_data["title"]
    assert data["description"] == create_test_recipe_request.description  # 変更なし
    assert data["priority"] == create_test_recipe_request.priority  # 変更なし
```

### 2.3 異常系: 権限のないリクエスト更新

**概要**: 他のユーザーのリクエストを更新しようとした場合のエラーを確認します。

**前提条件**:
- テストユーザー1が存在する
- テストユーザー2が存在する
- テストユーザー2が作成した料理リクエストが存在する

**テストステップ**:
1. テストユーザー1でログインしアクセストークンを取得
2. テストユーザー2のリクエストを更新しようとする

**期待結果**:
- ステータスコード: 403 Forbidden
- 権限エラーメッセージが返される

**コード例**:
```python
@pytest.mark.asyncio
async def test_update_unauthorized_recipe_request(
    client, user_token, create_another_user_recipe_request
):
    headers = {"Authorization": f"Bearer {user_token}"}
    
    update_data = {"title": "権限のない更新を試みる"}
    
    response = client.put(
        f"/api/v1/recipe-requests/{create_another_user_recipe_request.id}", 
        json=update_data,
        headers=headers
    )
    
    assert response.status_code == 403
    data = response.json()
    assert "detail" in data
```

### 2.4 異常系: 無効なデータによる更新

**概要**: バリデーションエラーが発生するデータで更新を試みた場合のエラーを確認します。

**前提条件**:
- テストユーザーが存在する
- テストユーザーが作成した料理リクエストが存在する

**テストステップ**:
1. テストユーザーでログインしアクセストークンを取得
2. 無効なデータ（空のタイトルなど）で更新を試みる

**期待結果**:
- ステータスコード: 422 Unprocessable Entity
- バリデーションエラーメッセージが返される

**コード例**:
```python
@pytest.mark.asyncio
async def test_update_recipe_request_with_invalid_data(client, user_token, create_test_recipe_request):
    headers = {"Authorization": f"Bearer {user_token}"}
    
    # 空のタイトル（必須フィールド）
    update_data = {
        "title": ""
    }
    
    response = client.put(
        f"/api/v1/recipe-requests/{create_test_recipe_request.id}", 
        json=update_data,
        headers=headers
    )
    
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data
```

## 3. リクエスト削除テスト (DELETE)

### 3.1 正常系: 自分のリクエストを削除

**概要**: ユーザーが自分のリクエストを削除できることを確認します。

**前提条件**:
- テストユーザーが存在する
- テストユーザーが作成した料理リクエストが存在する

**テストステップ**:
1. テストユーザーでログインしアクセストークンを取得
2. アクセストークンを使用して自分のリクエストを削除

**期待結果**:
- ステータスコード: 204 No Content
- 削除後、そのリクエストを取得しようとすると404エラーになる

**コード例**:
```python
@pytest.mark.asyncio
async def test_delete_own_recipe_request(client, user_token, create_test_recipe_request):
    headers = {"Authorization": f"Bearer {user_token}"}
    
    # 削除リクエスト
    response = client.delete(
        f"/api/v1/recipe-requests/{create_test_recipe_request.id}", 
        headers=headers
    )
    
    assert response.status_code == 204
    
    # 削除確認（取得を試みる）
    get_response = client.get(
        f"/api/v1/recipe-requests/{create_test_recipe_request.id}", 
        headers=headers
    )
    
    assert get_response.status_code == 404
```

### 3.2 異常系: 権限のないリクエスト削除

**概要**: 他のユーザーのリクエストを削除しようとした場合のエラーを確認します。

**前提条件**:
- テストユーザー1が存在する
- テストユーザー2が存在する
- テストユーザー2が作成した料理リクエストが存在する

**テストステップ**:
1. テストユーザー1でログインしアクセストークンを取得
2. テストユーザー2のリクエストを削除しようとする

**期待結果**:
- ステータスコード: 403 Forbidden
- 権限エラーメッセージが返される

**コード例**:
```python
@pytest.mark.asyncio
async def test_delete_unauthorized_recipe_request(
    client, user_token, create_another_user_recipe_request
):
    headers = {"Authorization": f"Bearer {user_token}"}
    
    response = client.delete(
        f"/api/v1/recipe-requests/{create_another_user_recipe_request.id}", 
        headers=headers
    )
    
    assert response.status_code == 403
    data = response.json()
    assert "detail" in data
```

### 3.3 正常系: 管理者がリクエストを削除

**概要**: 管理者権限を持つユーザーが他のユーザーのリクエストを削除できることを確認します。

**前提条件**:
- テスト管理者ユーザーが存在する
- テスト一般ユーザーが存在する
- テスト一般ユーザーが作成した料理リクエストが存在する

**テストステップ**:
1. テスト管理者ユーザーでログインしアクセストークンを取得
2. 一般ユーザーのリクエストを削除する

**期待結果**:
- ステータスコード: 204 No Content

**コード例**:
```python
@pytest.mark.asyncio
async def test_admin_delete_user_recipe_request(
    client, admin_token, create_test_recipe_request
):
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    response = client.delete(
        f"/api/v1/recipe-requests/{create_test_recipe_request.id}", 
        headers=headers
    )
    
    assert response.status_code == 204
```

## 4. リクエスト状態更新テスト (PUT /status)

### 4.1 正常系: ヘルパーがリクエスト状態を更新

**概要**: 担当ヘルパーがリクエストの状態を更新できることを確認します。

**前提条件**:
- テストヘルパーユーザーが存在する
- テスト一般ユーザーが存在する
- ヘルパーと一般ユーザーの関連付けが存在する
- 一般ユーザーが作成した料理リクエストが存在する

**テストステップ**:
1. ヘルパーユーザーでログインしアクセストークンを取得
2. アクセストークンを使用してリクエスト状態を更新

**期待結果**:
- ステータスコード: 200 OK
- 更新後のリクエスト情報が返される
- 状態が指定した値に更新されている

**コード例**:
```python
@pytest.mark.asyncio
async def test_helper_update_recipe_request_status(
    client, helper_token, create_test_recipe_request, create_test_user_helper_assignment
):
    headers = {"Authorization": f"Bearer {helper_token}"}
    
    update_data = {
        "status": "in_progress"
    }
    
    response = client.put(
        f"/api/v1/recipe-requests/{create_test_recipe_request.id}/status", 
        json=update_data,
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "in_progress"
```

### 4.2 正常系: 管理者がリクエスト状態を更新

**概要**: 管理者がリクエストの状態を更新できることを確認します。

**前提条件**:
- テスト管理者ユーザーが存在する
- テスト一般ユーザーが存在する
- 一般ユーザーが作成した料理リクエストが存在する

**テストステップ**:
1. 管理者ユーザーでログインしアクセストークンを取得
2. アクセストークンを使用してリクエスト状態を更新

**期待結果**:
- ステータスコード: 200 OK
- 更新後のリクエスト情報が返される
- 状態が指定した値に更新されている

**コード例**:
```python
@pytest.mark.asyncio
async def test_admin_update_recipe_request_status(
    client, admin_token, create_test_recipe_request
):
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    update_data = {
        "status": "completed"
    }
    
    response = client.put(
        f"/api/v1/recipe-requests/{create_test_recipe_request.id}/status", 
        json=update_data,
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
```

### 4.3 異常系: 一般ユーザーがリクエスト状態を更新

**概要**: 状態更新の権限がない一般ユーザーが更新を試みた場合のエラーを確認します。

**前提条件**:
- テスト一般ユーザーが存在する
- テスト一般ユーザーが作成した料理リクエストが存在する

**テストステップ**:
1. 一般ユーザーでログインしアクセストークンを取得
2. 自分のリクエストの状態を更新しようとする

**期待結果**:
- ステータスコード: 403 Forbidden
- 権限エラーメッセージが返される

**コード例**:
```python
@pytest.mark.asyncio
async def test_user_cannot_update_recipe_request_status(
    client, user_token, create_test_recipe_request
):
    headers = {"Authorization": f"Bearer {user_token}"}
    
    update_data = {
        "status": "completed"
    }
    
    response = client.put(
        f"/api/v1/recipe-requests/{create_test_recipe_request.id}/status", 
        json=update_data,
        headers=headers
    )
    
    assert response.status_code == 403
    data = response.json()
    assert "detail" in data
```

### 4.4 異常系: 無効な状態値での更新

**概要**: 無効な状態値で更新を試みた場合のエラーを確認します。

**前提条件**:
- テストヘルパーユーザーが存在する
- テスト一般ユーザーが存在する
- ヘルパーと一般ユーザーの関連付けが存在する
- 一般ユーザーが作成した料理リクエストが存在する

**テストステップ**:
1. ヘルパーユーザーでログインしアクセストークンを取得
2. 無効な状態値でリクエスト状態を更新しようとする

**期待結果**:
- ステータスコード: 422 Unprocessable Entity
- バリデーションエラーメッセージが返される

**コード例**:
```python
@pytest.mark.asyncio
async def test_update_recipe_request_status_with_invalid_value(
    client, helper_token, create_test_recipe_request, create_test_user_helper_assignment
):
    headers = {"Authorization": f"Bearer {helper_token}"}
    
    update_data = {
        "status": "invalid_status"  # 無効な状態値
    }
    
    response = client.put(
        f"/api/v1/recipe-requests/{create_test_recipe_request.id}/status", 
        json=update_data,
        headers=headers
    )
    
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data
```

## 5. テスト用フィクスチャ

テスト実行に必要なフィクスチャを以下に示します。これらは `conftest.py` などに定義します。

```python
@pytest.fixture
async def create_test_recipe_request(test_db, create_test_user):
    """テストユーザー用のレシピリクエストを作成"""
    recipe_request = RecipeRequest(
        user_id=create_test_user.id,
        title="テストレシピ",
        description="これはテスト用のレシピリクエストです。",
        notes="特記事項テスト",
        priority=1,
        scheduled_date=datetime.date.today() + datetime.timedelta(days=1),
        status="requested"
    )
    test_db.add(recipe_request)
    await test_db.commit()
    await test_db.refresh(recipe_request)
    return recipe_request

@pytest.fixture
async def create_another_user_recipe_request(test_db, create_another_user):
    """別のテストユーザー用のレシピリクエストを作成"""
    recipe_request = RecipeRequest(
        user_id=create_another_user.id,
        title="別ユーザーのテストレシピ",
        description="これは別のユーザーのテスト用レシピリクエストです。",
        priority=2,
        status="requested"
    )
    test_db.add(recipe_request)
    await test_db.commit()
    await test_db.refresh(recipe_request)
    return recipe_request

@pytest.fixture
async def create_test_user_helper_assignment(test_db, create_test_user, create_test_helper):
    """テストユーザーとヘルパーの関連付けを作成"""
    assignment = UserHelperAssignment(
        user_id=create_test_user.id,
        helper_id=create_test_helper.id,
        is_primary=True
    )
    test_db.add(assignment)
    await test_db.commit()
    await test_db.refresh(assignment)
    return assignment
```

## 6. まとめ

このテストシナリオドキュメントでは、料理リクエストの取得・更新・削除エンドポイントに対する以下のテストケースを定義しました：

1. 特定のリクエスト取得テスト
   - 自分のリクエスト取得
   - ヘルパーによる担当ユーザーのリクエスト取得
   - 存在しないリクエストID
   - 権限のないリクエストへのアクセス

2. リクエスト更新テスト
   - 自分のリクエスト情報更新
   - 部分的な更新
   - 権限のないリクエスト更新
   - 無効なデータによる更新

3. リクエスト削除テスト
   - 自分のリクエスト削除
   - 権限のないリクエスト削除
   - 管理者によるリクエスト削除

4. リクエスト状態更新テスト
   - ヘルパーによるリクエスト状態更新
   - 管理者によるリクエスト状態更新
   - 一般ユーザーによるリクエスト状態更新試行
   - 無効な状態値での更新

これらのテストケースをすべて実装し、すべてのテストがパスすることを確認することで、料理リクエスト関連エンドポイントの品質と信頼性を確保することができます。
