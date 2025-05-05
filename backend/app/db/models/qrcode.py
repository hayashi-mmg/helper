"""
QRコードモデル定義
"""
from sqlalchemy import Column, Integer, String, ForeignKey, TIMESTAMP, Index
from sqlalchemy.orm import relationship
from app.db.base import Base, BaseModel
import enum
from sqlalchemy import Enum

class QRCodeTargetType(str, enum.Enum):
    """QRコードの対象タイプ"""
    RECIPE = "recipe"
    TASK = "task"
    FEEDBACK_FORM = "feedback_form"

class QRCode(Base, BaseModel):
    """QRコードモデル"""
    __tablename__ = "qr_codes"
    
    target_type = Column(Enum(QRCodeTargetType), nullable=False)
    target_id = Column(Integer, nullable=False)
    url = Column(String(512), nullable=False)
    title = Column(String(200), nullable=False)
    expire_at = Column(TIMESTAMP(timezone=True))
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=False)
    access_count = Column(Integer, default=0, nullable=False)
    
    # リレーションシップ
    creator = relationship("User", backref="created_qr_codes")
      # インデックス用のテーブル引数
    __table_args__ = (
        Index('ix_qr_codes_target_type_target_id', 'target_type', 'target_id', postgresql_using='btree'),
    )
    
    def __repr__(self) -> str:
        """文字列表現"""
        return f"<QRCode(id={self.id}, title={self.title}, target_type={self.target_type}, target_id={self.target_id})>"
