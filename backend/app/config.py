"""
アプリケーション設定管理。
"""
from pydantic import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Helper System API"
    debug: bool = True

settings = Settings()
