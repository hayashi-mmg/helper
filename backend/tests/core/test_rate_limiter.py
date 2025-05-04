"""
レート制限ミドルウェアのテスト
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from starlette.requests import Request
from starlette.responses import Response
from starlette.status import HTTP_429_TOO_MANY_REQUESTS
from app.core.rate_limiter import RateLimiter

@pytest.fixture
def mock_redis_client():
    """Redisクライアントのモック"""
    mock_client = AsyncMock()
    mock_client.pipeline.return_value = mock_client
    mock_client.incr.return_value = AsyncMock()
    mock_client.expire.return_value = AsyncMock()
    mock_client.execute.return_value = [1]  # デフォルトでカウンター=1を返す
    return mock_client

@pytest.fixture
def mock_app():
    """FastAPIアプリケーションのモック"""
    return MagicMock()

@pytest.fixture
def mock_request():
    """リクエストのモック"""
    mock_req = MagicMock(spec=Request)
    mock_req.url.path = "/api/test"
    mock_req.client = MagicMock()
    mock_req.client.host = "192.168.1.1"
    return mock_req

@pytest.fixture
def mock_response():
    """レスポンスのモック"""
    mock_resp = MagicMock(spec=Response)
    mock_resp.headers = {}
    return mock_resp

@pytest.mark.asyncio
async def test_rate_limiter_under_limit(mock_app, mock_redis_client, mock_request):
    """制限内のリクエストのテスト"""
    # カウンターが制限未満の場合
    mock_redis_client.execute.return_value = [10]  # カウンター=10
    
    middleware = RateLimiter(mock_app, mock_redis_client, limit=100, timeframe=60)
    
    # コールネクストの準備
    mock_app.return_value = AsyncMock()
    mock_app.return_value.headers = {}
    
    # ミドルウェアの実行
    await middleware.dispatch(mock_request, mock_app)
    
    # 検証
    mock_app.assert_called_once()
    mock_redis_client.pipeline.assert_called_once()
    mock_redis_client.incr.assert_called_once()
    mock_redis_client.expire.assert_called_once()

@pytest.mark.asyncio
async def test_rate_limiter_over_limit(mock_app, mock_redis_client, mock_request):
    """制限超過のリクエストのテスト"""
    # カウンターが制限を超えた場合
    mock_redis_client.execute.return_value = [101]  # カウンター=101
    
    middleware = RateLimiter(mock_app, mock_redis_client, limit=100, timeframe=60)
    
    # ミドルウェアの実行
    response = await middleware.dispatch(mock_request, mock_app)
    
    # 検証
    mock_app.assert_not_called()  # next handlerは呼ばれない
    assert response.status_code == HTTP_429_TOO_MANY_REQUESTS
    assert "Too many requests" in response.body.decode()

@pytest.mark.asyncio
async def test_rate_limiter_whitelist_path(mock_app, mock_redis_client, mock_request):
    """ホワイトリストパスのテスト"""
    # ホワイトリストのパスを設定
    mock_request.url.path = "/ping"
    
    middleware = RateLimiter(
        mock_app, 
        mock_redis_client, 
        limit=100, 
        timeframe=60,
        whitelist_paths=["/ping"]
    )
    
    # ミドルウェアの実行
    await middleware.dispatch(mock_request, mock_app)
    
    # 検証
    mock_app.assert_called_once()
    # カウンター更新は行われない
    mock_redis_client.pipeline.assert_not_called()
    mock_redis_client.incr.assert_not_called()

@pytest.mark.asyncio
async def test_rate_limiter_whitelist_ip(mock_app, mock_redis_client, mock_request):
    """ホワイトリストIPのテスト"""
    # ホワイトリストのIPを設定
    mock_request.client.host = "127.0.0.1"
    
    middleware = RateLimiter(
        mock_app, 
        mock_redis_client, 
        limit=100, 
        timeframe=60,
        whitelist_ips=["127.0.0.1"]
    )
    
    # ミドルウェアの実行
    await middleware.dispatch(mock_request, mock_app)
    
    # 検証
    mock_app.assert_called_once()
    # カウンター更新は行われない
    mock_redis_client.pipeline.assert_not_called()
    mock_redis_client.incr.assert_not_called()

@pytest.mark.asyncio
async def test_rate_limiter_headers(mock_app, mock_redis_client, mock_request):
    """リミットヘッダーのテスト"""
    # カウンターが制限未満の場合
    mock_redis_client.execute.return_value = [10]  # カウンター=10
    
    # レスポンスモックの準備
    mock_response = MagicMock()
    mock_response.headers = {}
    mock_app.return_value = mock_response
    
    middleware = RateLimiter(mock_app, mock_redis_client, limit=100, timeframe=60)
    
    # ミドルウェアの実行
    result = await middleware.dispatch(mock_request, mock_app)
    
    # 検証
    assert result.headers["X-RateLimit-Limit"] == "100"
    assert result.headers["X-RateLimit-Remaining"] == "90"  # 100-10
    assert "X-RateLimit-Reset" in result.headers
