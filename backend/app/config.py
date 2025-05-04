"""
アプリケーション設定管理。
環境に応じた設定の読み込み、バリデーション、キャッシュを提供します。
"""

import json
import os
import logging
from functools import lru_cache
from typing import Any, Dict, List, Optional, Union

from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    """アプリケーション設定クラス"""
    # 基本設定
    app_name: str = "ヘルパーシステム"
    app_env: str = "development"
    app_version: str = "0.1.0"
    debug: bool = True
    
    # データベース設定
    database_url: str = "postgresql+asyncpg://postgres:postgres@db:5432/markdown_cms"
    database_pool_size: int = 20
    database_max_overflow: int = 10
    database_pool_recycle: int = 3600
    
    # Redis設定
    redis_url: str = "redis://localhost:6379/0"
    redis_timeout: int = 5
    redis_pool_size: int = 10
    
    # セキュリティ設定
    secret_key: str = "devsecretkey"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    password_reset_token_expire_hours: int = 24
    
    # CORS設定
    backend_cors_origins: str = "[\"http://localhost:8080\"]"
      # メール設定
    smtp_host: str = "mailhog"
    smtp_port: int = 1025
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_sender: str = "test@example.com"
    smtp_use_tls: bool = False
    smtp_use_ssl: bool = False
    
    # ファイル保存設定
    media_root: str = "/app/media"
    MEDIA_DIR: str = "/app/media"  # 画像、QRコード等のメディアファイル保存ディレクトリ
    base_url: str = "http://localhost:8000"
    
    # URL設定
    api_prefix: str = "/api/v1"
    frontend_url: str = "http://localhost:8080"
    
    # ログ関連設定
    log_level: str = "INFO"
    log_to_file: bool = False
    log_file_path: str = "logs/app.log"
    log_rotation: bool = True
    log_rotation_size: str = "10 MB"
    log_retention_days: int = 30
    
    # 多言語対応
    default_language: str = "ja"
    supported_languages: str = "[\"ja\", \"en\"]"
    
    # キャッシュ設定
    cache_ttl_seconds: int = 300
    
    # レート制限設定
    rate_limit_enabled: bool = True
    rate_limit_requests: int = 100
    rate_limit_timeframe_seconds: int = 60
    
    # モデル設定
    model_config = SettingsConfigDict(
        env_file = f".env.{os.getenv('APP_ENV', 'development')}",
        case_sensitive = True,
        extra = "forbid"
    )
    
    # バリデータ
    @field_validator("backend_cors_origins", mode="before")
    @classmethod
    def validate_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        """CORS設定の検証と変換"""
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return [i.strip() for i in v.split(",")]
        return v
    
    @field_validator("supported_languages", mode="before")
    @classmethod
    def validate_supported_languages(cls, v: Union[str, List[str]]) -> List[str]:
        """サポート言語リストの検証と変換"""
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return [i.strip() for i in v.split(",")]
        return v
    
    # シリアライザ
    @field_serializer("backend_cors_origins", "supported_languages")
    def serialize_list_as_json(self, v: List[str]) -> str:
        """リスト型の項目をJSON文字列に変換"""
        return json.dumps(v)
    
    def get_cors_origins(self) -> List[str]:
        """CORS設定を取得"""
        return self.validate_cors_origins(self.backend_cors_origins)
    
    def get_supported_languages(self) -> List[str]:
        """サポート言語リストを取得"""
        return self.validate_supported_languages(self.supported_languages)
    
    def is_production(self) -> bool:
        """本番環境かどうかを判定"""
        return self.app_env == "production"
    
    def is_testing(self) -> bool:
        """テスト環境かどうかを判定"""
        return self.app_env == "testing"
    
    def is_development(self) -> bool:
        """開発環境かどうかを判定"""
        return self.app_env == "development"
    
    def get_database_args(self) -> Dict[str, Any]:
        """データベース接続引数を取得"""
        return {
            "url": self.database_url,
            "pool_size": self.database_pool_size,
            "max_overflow": self.database_max_overflow,
            "pool_recycle": self.database_pool_recycle,
        }


@lru_cache()
def get_settings() -> Settings:
    """
    設定クラスのインスタンスをキャッシュして返す
    :return: 設定インスタンス
    """
    app_env = os.getenv("APP_ENV", "development")
    logger.info(f"Loading settings for: {app_env}")
    return Settings()


settings = get_settings()
