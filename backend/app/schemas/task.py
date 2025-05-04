"""
お願いごとのスキーマ定義
"""
from typing import Optional, List
from pydantic import BaseModel, Field, validator
from datetime import datetime, date
from app.db.models.task import TaskStatus
from app.schemas.validators import (
    validate_future_date,
    validate_task_description,
    validate_tags
)

class TaskBase(BaseModel):
    """お願いごと基本スキーマ"""
    title: str = Field(..., min_length=1, max_length=200, description="お願いごとのタイトル")
    description: str = Field(..., min_length=5, description="お願いごとの詳細説明")
    priority: int = Field(3, ge=1, le=5, description="優先度（1: 高 - 5: 低）")
    scheduled_date: Optional[date] = Field(None, description="実施予定日")
    status: TaskStatus = Field(TaskStatus.PENDING, description="ステータス")
    location: Optional[str] = Field(None, max_length=200, description="実施場所")
    estimated_time: Optional[int] = Field(None, ge=0, description="予想所要時間（分）")
    
    # バリデータ
    _validate_date = validator('scheduled_date', allow_reuse=True)(validate_future_date)
    _validate_description = validator('description', allow_reuse=True)(validate_task_description)
    
    @validator('estimated_time')
    def validate_estimated_time(cls, v):
        """予想時間が現実的かチェック"""
        if v is not None and v > 1440:  # 24時間（1440分）以上は異常値とみなす
            raise ValueError("予想所要時間は24時間（1440分）未満にしてください")
        return v

class TaskCreate(TaskBase):
    """お願いごと作成スキーマ"""
    user_id: int = Field(..., description="お願いごと作成者のユーザーID")
    tags: List[str] = Field([], description="タグのリスト")
    
    # タグのバリデーション
    _validate_tags = validator('tags', allow_reuse=True)(validate_tags)

class TaskUpdate(BaseModel):
    """お願いごと更新スキーマ"""
    title: Optional[str] = Field(None, min_length=1, max_length=200, description="お願いごとのタイトル")
    description: Optional[str] = Field(None, min_length=5, description="お願いごとの詳細説明")
    priority: Optional[int] = Field(None, ge=1, le=5, description="優先度（1: 高 - 5: 低）")
    scheduled_date: Optional[date] = Field(None, description="実施予定日")
    status: Optional[TaskStatus] = Field(None, description="ステータス")
    location: Optional[str] = Field(None, max_length=200, description="実施場所")
    estimated_time: Optional[int] = Field(None, ge=0, description="予想所要時間（分）")
    tags: Optional[List[str]] = Field(None, description="タグのリスト")
    
    # バリデータ（Noneの場合は検証をスキップ）
    _validate_date = validator('scheduled_date', allow_reuse=True, pre=True)(
        lambda v: validate_future_date(v) if v else None
    )
    _validate_description = validator('description', allow_reuse=True, pre=True)(
        lambda v: validate_task_description(v) if v else None
    )
    _validate_tags = validator('tags', allow_reuse=True, pre=True)(
        lambda v: validate_tags(v) if v else None
    )
    
    @validator('estimated_time')
    def validate_estimated_time(cls, v):
        """予想時間が現実的かチェック"""
        if v is not None and v > 1440:  # 24時間（1440分）以上は異常値とみなす
            raise ValueError("予想所要時間は24時間（1440分）未満にしてください")
        return v
        
    class Config:
        validate_assignment = True

class TaskResponse(TaskBase):
    """お願いごとレスポンススキーマ"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
