"""
SQLAlchemy Baseモデル定義
共通フィールドと機能を提供するBaseModelクラスも定義
"""
from datetime import datetime
from typing import Any, Dict
from sqlalchemy import Column, DateTime, func, Integer
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.orm import declarative_base

# 基本ベースクラス
Base = declarative_base()

# 共通フィールドと機能を持つBaseModelクラス
class BaseModel:
    """
    すべてのモデルの基底クラス
    共通のフィールドと機能を提供
    """
    # 自動的にテーブル名をクラス名の複数形に設定
    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower() + "s"

    # 共通フィールド
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def to_dict(self) -> Dict[str, Any]:
        """
        モデルを辞書に変換
        :return: モデルの辞書表現
        """
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    def __repr__(self) -> str:
        """
        モデルの文字列表現
        :return: クラス名とID
        """
        return f"<{self.__class__.__name__}(id={self.id})>"
