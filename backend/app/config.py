"""
アプリケーション設定管理。
"""
from pydantic import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Helper System API"
    debug: bool = True
    redis_url: str = "redis://localhost:6379/0"  # Redis接続URL

    class Config:
        env_file = ".env"

settings = Settings()
