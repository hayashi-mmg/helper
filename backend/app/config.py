"""
アプリケーション設定管理。
"""
from pydantic import BaseSettings

class Settings(BaseSettings):
    appName: str = "Helper System API"
    debug: bool = True
    redisUrl: str = "redis://localhost:6379/0"  # Redis接続URL
    appEnv: str = "development"
    databaseUrl: str = "postgresql+asyncpg://postgres:postgres@db:5432/markdown_cms"
    secretKey: str = "devsecretkey"
    backendCorsOrigins: str = "[\"http://localhost:8080\"]"
    smtpHost: str = "mailhog"
    smtpPort: int = 1025
    smtpUsername: str = ""
    smtpPassword: str = ""
    smtpSender: str = "test@example.com"
    frontendUrl: str = "http://localhost:8080"

    class Config:
        env_file = f".env.{BaseSettings().env or 'development'}"

settings = Settings()
