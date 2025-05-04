"""
フィードバック、QRコード、ログモデルのユニットテスト
"""
import pytest
from datetime import datetime, timedelta
from sqlalchemy import select
from app.db.models import (
    User, UserRole, RecipeRequest, RecipeRequestStatus,
    Feedback, HelperResponse, QRCode, QRCodeTargetType, 
    ApplicationLog, LogLevel, AuditLog, AuditAction, PerformanceLog
)

@pytest.mark.asyncio
async def test_feedback_and_response(db_session):
    """フィードバックとレスポンスモデルのテスト"""
    # ユーザーとヘルパー作成
    user = User(
        username="feedbackuser",
        email="feedback@example.com",
        password_hash="hashedpassword",
        role=UserRole.USER
    )
    
    helper = User(
        username="helperuser",
        email="helper_feedback@example.com",
        password_hash="hashedpassword",
        role=UserRole.HELPER
    )
    
    db_session.add_all([user, helper])
    await db_session.flush()
    
    # レシピリクエスト作成
    recipe = RecipeRequest(
        user_id=user.id,
        title="ハンバーグの作り方",
        status=RecipeRequestStatus.COMPLETED
    )
    
    db_session.add(recipe)
    await db_session.flush()
    
    # フィードバック作成
    feedback = Feedback(
        recipe_request_id=recipe.id,
        user_id=user.id,
        taste_rating=5,
        texture_rating=4,
        quantity_rating=5,
        overall_rating=5,
        comments="とても美味しかったです！",
        request_for_next="次回はもう少し大きめにお願いします。"
    )
    
    db_session.add(feedback)
    await db_session.flush()
    
    # ヘルパーからの返信
    response = HelperResponse(
        feedback_id=feedback.id,
        helper_id=helper.id,
        response_text="ありがとうございます。次回もよろしくお願いします。",
        cooking_notes="次回はサイズを大きくする。"
    )
    
    db_session.add(response)
    await db_session.commit()
    
    # 検証
    result = await db_session.execute(select(Feedback).where(Feedback.recipe_request_id == recipe.id))
    db_feedback = result.scalars().first()
    
    assert db_feedback is not None
    assert db_feedback.overall_rating == 5
    assert db_feedback.comments == "とても美味しかったです！"
    
    # 返信も検証
    result = await db_session.execute(select(HelperResponse).where(HelperResponse.feedback_id == feedback.id))
    db_response = result.scalars().first()
    
    assert db_response is not None
    assert db_response.response_text == "ありがとうございます。次回もよろしくお願いします。"
    assert db_response.cooking_notes == "次回はサイズを大きくする。"

@pytest.mark.asyncio
async def test_qrcode_model(db_session):
    """QRコードモデルのテスト"""
    # ユーザー作成
    user = User(
        username="qruser",
        email="qr@example.com",
        password_hash="hashedpassword",
        role=UserRole.ADMIN
    )
    
    db_session.add(user)
    await db_session.flush()
    
    # QRコード作成
    expiration = datetime.utcnow() + timedelta(days=7)
    qrcode = QRCode(
        target_type=QRCodeTargetType.RECIPE,
        target_id=123,
        url="https://example.com/recipe/123",
        title="カレーライスのレシピ",
        expire_at=expiration,
        created_by=user.id,
        access_count=0
    )
    
    db_session.add(qrcode)
    await db_session.commit()
    
    # 検証
    result = await db_session.execute(select(QRCode).where(QRCode.title == "カレーライスのレシピ"))
    db_qrcode = result.scalars().first()
    
    assert db_qrcode is not None
    assert db_qrcode.target_type == QRCodeTargetType.RECIPE
    assert db_qrcode.target_id == 123
    assert db_qrcode.url == "https://example.com/recipe/123"
    assert db_qrcode.access_count == 0

@pytest.mark.asyncio
async def test_log_models(db_session):
    """各種ログモデルのテスト"""
    # ユーザー作成
    user = User(
        username="loguser",
        email="log@example.com",
        password_hash="hashedpassword",
        role=UserRole.USER
    )
    
    db_session.add(user)
    await db_session.flush()
    
    # アプリケーションログ
    app_log = ApplicationLog(
        timestamp=datetime.utcnow(),
        level=LogLevel.ERROR,
        source="login_service",
        message="ログインに失敗しました",
        user_id=user.id,
        endpoint="/api/v1/auth/login",
        ip_address="192.168.1.1",
        request_id="req-123",
        additional_data={"reason": "invalid_password"}
    )
    
    # 監査ログ
    audit_log = AuditLog(
        timestamp=datetime.utcnow(),
        user_id=user.id,
        action=AuditAction.UPDATE,
        resource_type="USER",
        resource_id=user.id,
        previous_state={"email": "old@example.com"},
        new_state={"email": "log@example.com"},
        ip_address="192.168.1.1"
    )
    
    # パフォーマンスログ
    perf_log = PerformanceLog(
        timestamp=datetime.utcnow(),
        endpoint="/api/v1/users/me",
        response_time=150,  # 150ms
        status_code=200,
        request_method="GET",
        user_id=user.id,
        ip_address="192.168.1.1"
    )
    
    db_session.add_all([app_log, audit_log, perf_log])
    await db_session.commit()
    
    # アプリケーションログ検証
    result = await db_session.execute(select(ApplicationLog).where(ApplicationLog.user_id == user.id))
    db_app_log = result.scalars().first()
    
    assert db_app_log is not None
    assert db_app_log.level == LogLevel.ERROR
    assert db_app_log.source == "login_service"
    assert db_app_log.message == "ログインに失敗しました"
    assert db_app_log.additional_data["reason"] == "invalid_password"
    
    # 監査ログ検証
    result = await db_session.execute(select(AuditLog).where(AuditLog.user_id == user.id))
    db_audit_log = result.scalars().first()
    
    assert db_audit_log is not None
    assert db_audit_log.action == AuditAction.UPDATE
    assert db_audit_log.resource_type == "USER"
    assert db_audit_log.previous_state["email"] == "old@example.com"
    assert db_audit_log.new_state["email"] == "log@example.com"
    
    # パフォーマンスログ検証
    result = await db_session.execute(select(PerformanceLog).where(PerformanceLog.user_id == user.id))
    db_perf_log = result.scalars().first()
    
    assert db_perf_log is not None
    assert db_perf_log.endpoint == "/api/v1/users/me"
    assert db_perf_log.response_time == 150
    assert db_perf_log.status_code == 200
    assert db_perf_log.request_method == "GET"
