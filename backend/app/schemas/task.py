"""
お願いごとのスキーマ定義
"""
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime, date
from app.db.models.task import TaskStatus

class TaskBase(BaseModel):
    """お願いごと基本スキーマ"""
    title: str = Field(..., min_length=1, max_length=200)
    description: str
    priority: int = Field(3, ge=1, le=5)  # 1: 高 - 5: 低
    scheduled_date: Optional[date] = None
    status: TaskStatus = TaskStatus.PENDING

class TaskCreate(TaskBase):
    """お願いごと作成スキーマ"""
    user_id: int

class TaskUpdate(BaseModel):
    """お願いごと更新スキーマ"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    priority: Optional[int] = Field(None, ge=1, le=5)
    scheduled_date: Optional[date] = None
    status: Optional[TaskStatus] = None

class TaskResponse(TaskBase):
    """お願いごとレスポンススキーマ"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
