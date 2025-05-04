"""
アプリケーション設定管理。
"""

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_env: str = "development"
    debug: bool = True
    redis_url: str = "redis://localhost:6379/0"  # Redis接続URL
    database_url: str = "postgresql+asyncpg://postgres:postgres@db:5432/markdown_cms"
    secret_key: str = "devsecretkey"
    backend_cors_origins: str = "[\"http://localhost:8080\"]"
    smtp_host: str = "mailhog"
    smtp_port: int = 1025
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_sender: str = "test@example.com"
    frontend_url: str = "http://localhost:8080"
    
    # ログ関連設定
    log_level: str = "INFO"
    log_to_file: bool = False
    log_file_path: str = "logs/app.log"
    
    # 多言語対応
    default_language: str = "ja"
    supported_languages: str = "[\"ja\", \"en\"]"

    model_config = SettingsConfigDict(
        env_file = ".env.development",
        extra = "forbid"
    )

settings = Settings()
