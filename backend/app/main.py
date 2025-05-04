"""
FastAPIエントリーポイント。
"""
from fastapi import FastAPI
from app.api.v1.router import router as v1_router

app = FastAPI(title="Helper System API")

app.include_router(v1_router, prefix="/api/v1")

@app.get("/ping")
def ping():
    """
    ヘルスチェック用エンドポイント。
    Returns: pong
    """
    return {"message": "pong"}
