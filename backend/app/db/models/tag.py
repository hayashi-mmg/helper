"""
タグモデルとタグ関連付けモデル定義
"""
from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.db.base import Base, BaseModel

# 料理リクエストとタグのマッピングテーブル
recipe_request_tags = Table(
    "recipe_request_tags",
    Base.metadata,
    Column("recipe_request_id", Integer, ForeignKey("recipe_requests.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True)
)

# お願いごととタグのマッピングテーブル
task_tags = Table(
    "task_tags",
    Base.metadata,
    Column("task_id", Integer, ForeignKey("task_requests.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True)
)

class Tag(Base, BaseModel):
    """タグモデル"""
    __tablename__ = "tags"
    
    name = Column(String(50), unique=True, nullable=False, index=True)
    color = Column(String(20))
    
    # リレーションシップ
    recipe_requests = relationship("RecipeRequest", secondary=recipe_request_tags, backref="tags")
    tasks = relationship("Task", secondary=task_tags, backref="tags")
    
    def __repr__(self) -> str:
        """文字列表現"""
        return f"<Tag(id={self.id}, name={self.name})>"
