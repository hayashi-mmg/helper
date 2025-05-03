"""
FastAPIエントリーポイント。
"""
from fastapi import FastAPI

app = FastAPI(title="Helper System API")

@app.get("/ping")
def ping():
    """
    ヘルスチェック用エンドポイント。
    Returns: pong
    """
    return {"message": "pong"}
