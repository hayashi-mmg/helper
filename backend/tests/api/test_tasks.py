"""
お願いごと関連エンドポイントのテスト
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date, timedelta

from app.main import app
from app.db.models.user import User, UserRole
from app.db.models.task import Task, TaskStatus


@pytest.fixture
async def create_test_task(test_db: AsyncSession, normal_user_token_headers: dict):
    """テスト用お願いごと作成フィクスチャー"""
    from app.core.auth import get_user_from_token
    
    # トークンからユーザー情報取得
    token = normal_user_token_headers["Authorization"].split(" ")[1]
    user_info = get_user_from_token(token)
    
    # ユーザーIDの取得（テストユーザーは conftest.py で作成済み）
    from app.crud.users import crud_user
    user = await crud_user.get_by_email(test_db, email=user_info.get("sub"))
    
    # お願いごと作成
    task = Task(
        user_id=user.id,
        title="テストお願いごと",
        description="これはテスト用のお願いごとです。",
        priority=2,
        scheduled_date=date.today() + timedelta(days=1),
        status=TaskStatus.PENDING
    )
    test_db.add(task)
    await test_db.commit()
    await test_db.refresh(task)
    
    return {
        "id": task.id,
        "user_id": user.id,
        "title": task.title,
        "priority": task.priority
    }


@pytest.mark.asyncio
async def test_create_task(
    test_client: AsyncClient,
    normal_user_token_headers: dict
):
    """お願いごと作成エンドポイントのテスト"""
    # 自分のお願いごとを作成する
    user_response = await test_client.get(
        "/api/v1/users/me",
        headers=normal_user_token_headers
    )
    user_id = user_response.json()["id"]
    
    task_data = {
        "user_id": user_id,
        "title": "新しいお願いごと",
        "description": "これは新しいお願いごとのテストです。",
        "priority": 1,
        "scheduled_date": str(date.today() + timedelta(days=2)),
        "status": "pending"
    }
    
    response = await test_client.post(
        "/api/v1/tasks/",
        headers=normal_user_token_headers,
        json=task_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == task_data["title"]
    assert data["user_id"] == user_id
    assert data["priority"] == task_data["priority"]
    
    # 他ユーザーのお願いごとを作成しようとする（エラー）
    task_data["user_id"] = user_id + 1
    
    response = await test_client.post(
        "/api/v1/tasks/",
        headers=normal_user_token_headers,
        json=task_data
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_read_tasks(
    test_client: AsyncClient,
    normal_user_token_headers: dict,
    admin_user_token_headers: dict,
    create_test_task: dict
):
    """お願いごと一覧取得エンドポイントのテスト"""
    # 一般ユーザーが自分のお願いごと一覧取得
    response = await test_client.get(
        "/api/v1/tasks/",
        headers=normal_user_token_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(t["id"] == create_test_task["id"] for t in data)
    
    # 管理者が全お願いごと一覧取得
    response = await test_client.get(
        "/api/v1/tasks/",
        headers=admin_user_token_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1


@pytest.mark.asyncio
async def test_read_task_by_id(
    test_client: AsyncClient,
    normal_user_token_headers: dict,
    admin_user_token_headers: dict,
    create_test_task: dict
):
    """お願いごと個別取得エンドポイントのテスト"""
    task_id = create_test_task["id"]
    
    # 自分のお願いごと取得
    response = await test_client.get(
        f"/api/v1/tasks/{task_id}",
        headers=normal_user_token_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == task_id
    assert data["title"] == create_test_task["title"]
    
    # 管理者が任意のお願いごと取得
    response = await test_client.get(
        f"/api/v1/tasks/{task_id}",
        headers=admin_user_token_headers
    )
    assert response.status_code == 200
    assert response.json()["id"] == task_id


@pytest.mark.asyncio
async def test_update_task(
    test_client: AsyncClient,
    normal_user_token_headers: dict,
    admin_user_token_headers: dict,
    create_test_task: dict
):
    """お願いごと更新エンドポイントのテスト"""
    task_id = create_test_task["id"]
    
    # お願いごと更新
    update_data = {
        "title": "更新されたお願いごと",
        "description": "これは更新されたお願いごとです。",
        "priority": 3
    }
    
    response = await test_client.put(
        f"/api/v1/tasks/{task_id}",
        headers=normal_user_token_headers,
        json=update_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == update_data["title"]
    assert data["description"] == update_data["description"]
    assert data["priority"] == update_data["priority"]


@pytest.mark.asyncio
async def test_update_task_status(
    test_client: AsyncClient,
    normal_user_token_headers: dict,
    helper_user_token_headers: dict,
    create_test_task: dict
):
    """お願いごとステータス更新エンドポイントのテスト"""
    task_id = create_test_task["id"]
    
    # ヘルパーがステータス更新
    status_data = {
        "status": "active"
    }
    
    response = await test_client.patch(
        f"/api/v1/tasks/{task_id}/status",
        headers=helper_user_token_headers,
        params=status_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "active"
    
    # ユーザーがキャンセルに更新
    status_data = {
        "status": "cancelled"
    }
    
    response = await test_client.patch(
        f"/api/v1/tasks/{task_id}/status",
        headers=normal_user_token_headers,
        params=status_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "cancelled"
    
    # ユーザーが完了に更新（エラー）
    status_data = {
        "status": "completed"
    }
    
    response = await test_client.patch(
        f"/api/v1/tasks/{task_id}/status",
        headers=normal_user_token_headers,
        params=status_data
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_delete_task(
    test_client: AsyncClient,
    normal_user_token_headers: dict,
    admin_user_token_headers: dict,
    test_db: AsyncSession
):
    """お願いごと削除エンドポイントのテスト"""
    # 新しいお願いごとを作成
    user_response = await test_client.get(
        "/api/v1/users/me",
        headers=normal_user_token_headers
    )
    user_id = user_response.json()["id"]
    
    task_data = {
        "user_id": user_id,
        "title": "削除用お願いごと",
        "description": "これは削除テスト用のお願いごとです。",
        "priority": 4,
        "status": "pending"
    }
    
    response = await test_client.post(
        "/api/v1/tasks/",
        headers=normal_user_token_headers,
        json=task_data
    )
    task_id = response.json()["id"]
    
    # お願いごと削除
    response = await test_client.delete(
        f"/api/v1/tasks/{task_id}",
        headers=normal_user_token_headers
    )
    assert response.status_code == 204
    
    # 削除されたことを確認
    response = await test_client.get(
        f"/api/v1/tasks/{task_id}",
        headers=normal_user_token_headers
    )
    assert response.status_code == 404
