"""
FastAPIエントリーポイント。
"""
import logging
from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.v1.router import router as v1_router
from app.database import get_db
from app.exceptions import setup_exception_handlers
from app.logs.middleware import LoggingMiddleware
from app.logs.async_log_handler import async_log_handler

# ロガー設定
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

app = FastAPI(title="Helper System API")

# CORS設定
origins = ["http://localhost:3000", "http://localhost:8080"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ロギングミドルウェア追加
app.add_middleware(LoggingMiddleware)

# 例外ハンドラのセットアップ
setup_exception_handlers(app)

# ルーター追加
app.include_router(v1_router, prefix="/api/v1")

@app.get("/ping")
def ping():
    """
    ヘルスチェック用エンドポイント。
    Returns: pong
    """
    return {"message": "pong"}

# アプリケーション起動/終了イベント
@app.on_event("startup")
async def startup_event():
    """アプリケーション起動時の処理"""
    # ログハンドラーの起動
    await async_log_handler.start()

@app.on_event("shutdown")
async def shutdown_event():
    """アプリケーション終了時の処理"""
    # ログハンドラーの停止
    await async_log_handler.stop()

# リクエストごとのDBセッション設定
@app.middleware("http")
async def db_session_middleware(request: Request, call_next):
    """リクエストごとにDBセッションを設定"""
    db = next(get_db())
    request.state.db = db
    response = await call_next(request)
    return response
