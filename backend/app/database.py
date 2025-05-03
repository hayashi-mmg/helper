"""
データベース接続設定（PostgreSQL/SQLAlchemy/asyncpg）。
"""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
DATABASE_URL = "postgresql+asyncpg://postgres:postgres@db:5432/markdown_cms"
engine = create_async_engine(DATABASE_URL, echo=True, future=True)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False, autoflush=False, autocommit=False)
async def get_db():
    db = AsyncSessionLocal()
    try:
        yield db
    finally:
        await db.close()
