"""
材料関連のPydanticスキーマ
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class IngredientBase(BaseModel):
    """材料基本情報"""
    name: str = Field(..., min_length=1, max_length=100)
    quantity: str = Field(..., min_length=1, max_length=50)
    recipe_request_id: int
    
    class Config:
        from_attributes = True

class IngredientCreate(IngredientBase):
    """材料作成用"""
    pass

class IngredientUpdate(BaseModel):
    """材料更新用"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    quantity: Optional[str] = Field(None, min_length=1, max_length=50)

class IngredientInDBBase(IngredientBase):
    """データベース保存用材料情報"""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class Ingredient(IngredientInDBBase):
    """API応答用材料情報"""
    pass
