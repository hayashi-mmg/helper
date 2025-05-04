# フィードバックテスト用フィクスチャ

このドキュメントでは、フィードバック機能のテストで使用するフィクスチャ（テスト用データ）を定義します。これらのフィクスチャは `tests/conftest.py` に実装されます。

## ユーザー関連フィクスチャ

```python
@pytest.fixture
def create_test_user(test_db):
    """テスト用ユーザーを作成"""
    user = User(
        id=1,
        username="testuser",
        email="test@example.com",
        hashed_password="$2b$12$IKEQb00u5eHpYx/7lWfZK.XBXU0xfYT8/grTHZtgTn4xbth91QM66",  # 'testpassword'
        full_name="テストユーザー",
        role="user",
        is_active=True
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    return user

@pytest.fixture
def create_test_helper(test_db):
    """テスト用ヘルパーユーザーを作成"""
    # ユーザーアカウント作成
    helper_user = User(
        id=2,
        username="helper",
        email="helper@example.com",
        hashed_password="$2b$12$IKEQb00u5eHpYx/7lWfZK.XBXU0xfYT8/grTHZtgTn4xbth91QM66",  # 'testpassword'
        full_name="テストヘルパー",
        role="helper",
        is_active=True
    )
    test_db.add(helper_user)
    test_db.commit()
    test_db.refresh(helper_user)
    
    # ヘルパー情報作成
    helper = Helper(
        id=1,
        user_id=helper_user.id,
        certification="介護福祉士",
        specialties=["和食", "洋食"],
        introduction="テスト用ヘルパーです"
    )
    test_db.add(helper)
    test_db.commit()
    test_db.refresh(helper)
    return helper

@pytest.fixture
def create_test_admin(test_db):
    """テスト用管理者ユーザーを作成"""
    admin = User(
        id=3,
        username="admin",
        email="admin@example.com",
        hashed_password="$2b$12$IKEQb00u5eHpYx/7lWfZK.XBXU0xfYT8/grTHZtgTn4xbth91QM66",  # 'testpassword'
        full_name="テスト管理者",
        role="admin",
        is_active=True
    )
    test_db.add(admin)
    test_db.commit()
    test_db.refresh(admin)
    return admin

@pytest.fixture
def user_token(create_test_user):
    """一般ユーザー用のトークンを生成"""
    return create_access_token({"sub": create_test_user.id})

@pytest.fixture
def helper_token(create_test_helper):
    """ヘルパー用のトークンを生成"""
    # ヘルパーは User テーブルに保存されているので、
    # Helper.user_id ではなく create_test_helper.user_id を使用
    return create_access_token({"sub": create_test_helper.user_id})

@pytest.fixture
def admin_token(create_test_admin):
    """管理者用のトークンを生成"""
    return create_access_token({"sub": create_test_admin.id})
```

## ユーザー・ヘルパー関連付けフィクスチャ

```python
@pytest.fixture
def create_user_helper_assignment(test_db, create_test_user, create_test_helper):
    """ユーザーとヘルパーの関連付けを作成"""
    assignment = UserHelperAssignment(
        user_id=create_test_user.id,
        helper_id=create_test_helper.id,
        is_primary=True
    )
    test_db.add(assignment)
    test_db.commit()
    test_db.refresh(assignment)
    return assignment
```

## リクエスト関連フィクスチャ

```python
@pytest.fixture
def create_test_request(test_db, create_test_user):
    """テスト用の料理リクエストを作成"""
    recipe_request = RecipeRequest(
        id=1,
        user_id=create_test_user.id,
        title="テスト料理",
        description="テスト用の料理リクエストです",
        recipe_url="https://example.com/recipe/123",
        recipe_content={
            "title": "テスト料理",
            "ingredients": [
                {"name": "材料1", "amount": "100g"},
                {"name": "材料2", "amount": "適量"}
            ],
            "steps": ["手順1", "手順2", "手順3"]
        },
        notes="辛くしないでください",
        priority=2,
        status="requested"
    )
    test_db.add(recipe_request)
    test_db.commit()
    test_db.refresh(recipe_request)
    return recipe_request

@pytest.fixture
def create_completed_recipe_request(test_db, create_test_user):
    """完了状態のテスト用料理リクエストを作成"""
    recipe_request = RecipeRequest(
        id=2,
        user_id=create_test_user.id,
        title="完了した料理",
        description="完了状態の料理リクエストです",
        recipe_url="https://example.com/recipe/456",
        notes="甘めにしてください",
        priority=1,
        status="completed"  # 完了状態
    )
    test_db.add(recipe_request)
    test_db.commit()
    test_db.refresh(recipe_request)
    return recipe_request

@pytest.fixture
def create_other_user_request(test_db):
    """他のユーザーの料理リクエストを作成（テスト用）"""
    other_user = User(
        id=10,
        username="otheruser",
        email="other@example.com",
        hashed_password="$2b$12$IKEQb00u5eHpYx/7lWfZK.XBXU0xfYT8/grTHZtgTn4xbth91QM66",
        full_name="その他ユーザー",
        role="user",
        is_active=True
    )
    test_db.add(other_user)
    
    recipe_request = RecipeRequest(
        id=3,
        user_id=other_user.id,
        title="他ユーザーの料理",
        description="他のユーザーの料理リクエストです",
        status="completed"
    )
    test_db.add(recipe_request)
    test_db.commit()
    test_db.refresh(recipe_request)
    return recipe_request
```

## フィードバック関連フィクスチャ

```python
@pytest.fixture
def create_test_feedback(test_db, create_test_user, create_completed_recipe_request):
    """テスト用フィードバックを作成"""
    feedback = Feedback(
        id=1,
        recipe_request_id=create_completed_recipe_request.id,
        user_id=create_test_user.id,
        taste_rating=5,
        texture_rating=4,
        amount_rating=3,
        comment="とても美味しかったです。",
        next_request="次回はもう少し辛くしてください。"
    )
    test_db.add(feedback)
    test_db.commit()
    test_db.refresh(feedback)
    return feedback

@pytest.fixture
def create_feedback_with_image(test_db, create_test_user, create_completed_recipe_request):
    """画像付きのテスト用フィードバックを作成"""
    feedback = Feedback(
        id=2,
        recipe_request_id=create_completed_recipe_request.id,
        user_id=create_test_user.id,
        taste_rating=4,
        texture_rating=5,
        amount_rating=4,
        comment="美味しかったです。",
        image_url="/media/feedback/test_image.jpg"
    )
    test_db.add(feedback)
    test_db.commit()
    test_db.refresh(feedback)
    return feedback

@pytest.fixture
def create_other_user_feedback(test_db, create_other_user_request):
    """他のユーザーのフィードバックを作成（テスト用）"""
    feedback = Feedback(
        id=3,
        recipe_request_id=create_other_user_request.id,
        user_id=create_other_user_request.user_id,
        taste_rating=3,
        texture_rating=3,
        amount_rating=4,
        comment="他のユーザーのフィードバックです。"
    )
    test_db.add(feedback)
    test_db.commit()
    test_db.refresh(feedback)
    return feedback

@pytest.fixture
def create_assigned_feedback(test_db, create_test_user, create_test_helper, create_user_helper_assignment, create_completed_recipe_request):
    """ヘルパー担当ユーザーのフィードバックを作成（テスト用）"""
    feedback = Feedback(
        id=4,
        recipe_request_id=create_completed_recipe_request.id,
        user_id=create_test_user.id,
        taste_rating=4,
        texture_rating=4,
        amount_rating=4,
        comment="担当ヘルパー用のフィードバックです。"
    )
    test_db.add(feedback)
    test_db.commit()
    test_db.refresh(feedback)
    return feedback

@pytest.fixture
def create_unassigned_feedback(test_db, create_other_user_request):
    """担当外ユーザーのフィードバックを作成（テスト用）"""
    feedback = Feedback(
        id=5,
        recipe_request_id=create_other_user_request.id,
        user_id=create_other_user_request.user_id,
        taste_rating=2,
        texture_rating=3,
        amount_rating=3,
        comment="担当外ユーザーのフィードバックです。"
    )
    test_db.add(feedback)
    test_db.commit()
    test_db.refresh(feedback)
    return feedback
```

## ヘルパー返信フィクスチャ

```python
@pytest.fixture
def create_helper_response(test_db, create_test_helper, create_assigned_feedback):
    """テスト用ヘルパー返信を作成"""
    helper_response = HelperResponse(
        id=1,
        feedback_id=create_assigned_feedback.id,
        helper_id=create_test_helper.id,
        response="フィードバックありがとうございます。次回も美味しく作ります。",
        next_note="次回は辛さを少し強めにする"
    )
    test_db.add(helper_response)
    test_db.commit()
    test_db.refresh(helper_response)
    return helper_response

@pytest.fixture
def create_other_helper_response(test_db, create_other_user_feedback):
    """他のヘルパーの返信を作成（テスト用）"""
    # 他のヘルパーを作成
    other_helper_user = User(
        id=11,
        username="otherhelper",
        email="otherhelper@example.com",
        hashed_password="$2b$12$IKEQb00u5eHpYx/7lWfZK.XBXU0xfYT8/grTHZtgTn4xbth91QM66",
        full_name="その他ヘルパー",
        role="helper",
        is_active=True
    )
    test_db.add(other_helper_user)
    
    other_helper = Helper(
        id=2,
        user_id=other_helper_user.id,
        certification="ホームヘルパー2級",
        introduction="他のヘルパーです"
    )
    test_db.add(other_helper)
    test_db.commit()
    
    # 他のヘルパーの返信を作成
    helper_response = HelperResponse(
        id=2,
        feedback_id=create_other_user_feedback.id,
        helper_id=other_helper.id,
        response="他のヘルパーからの返信です。",
        next_note="他のヘルパーのメモ"
    )
    test_db.add(helper_response)
    test_db.commit()
    test_db.refresh(helper_response)
    return helper_response
```

## テスト設定サポート関数

```python
def clear_test_data(test_db):
    """テストデータをクリア"""
    test_db.execute(delete(HelperResponse))
    test_db.execute(delete(Feedback))
    test_db.execute(delete(UserHelperAssignment))
    test_db.execute(delete(RecipeRequest))
    test_db.execute(delete(Helper))
    test_db.execute(delete(User))
    test_db.commit()

@pytest.fixture(autouse=True)
def setup_and_teardown(test_db):
    """各テスト前後の設定と後処理"""
    # テスト前の処理
    
    yield
    
    # テスト後の処理
    clear_test_data(test_db)
```

## 使用例

これらのフィクスチャは、テストファイル内で次のように使用できます。

```python
@pytest.mark.asyncio
async def test_get_feedback(
    client, user_token, create_test_user, create_test_feedback
):
    """フィードバック取得テスト"""
    headers = {"Authorization": f"Bearer {user_token}"}
    
    response = client.get(f"/api/v1/feedback/{create_test_feedback.id}", headers=headers)
    
    assert response.status_code == 200
    
    data = response.json()
    assert data["id"] == create_test_feedback.id
    assert data["user_id"] == create_test_user.id
```

フィクスチャを組み合わせることで、様々なテストケースを効率的に実装できます。例えば、ヘルパーが担当ユーザーのフィードバックを取得するテストでは、`helper_token`、`create_test_helper`、`create_user_helper_assignment`、`create_assigned_feedback` を組み合わせることで、テストに必要な環境を簡単に構築できます。
