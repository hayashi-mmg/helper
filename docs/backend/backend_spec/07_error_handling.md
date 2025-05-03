## 7. エラーハンドリング

### 7.1 グローバル例外ハンドラー

```python
# app/core/errors.py
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from app.logs.app_logger import ApplicationLogger

def setup_exception_handlers(app: FastAPI) -> None:
    """アプリケーションに例外ハンドラを登録"""
    
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        """リクエスト検証エラーのハンドラ"""
        # エラーログの記録
        db = request.state.db
        logger = ApplicationLogger(db)
        await logger.log(
            level="WARNING",
            source="API",
            message="リクエスト検証エラー",
            endpoint=request.url.path,
            ip_address=request.client.host,
            user_agent=request.headers.get("user-agent"),
            additional_data={"errors": exc.errors()}
        )
        
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "detail": exc.errors(),
                "message": "入力値の検証に失敗しました"
            }
        )
    
    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
        """データベースエラーのハンドラ"""
        # エラーログの記録
        db = request.state.db
        logger = ApplicationLogger(db)
        await logger.log(
            level="ERROR",
            source="DATABASE",
            message=f"データベースエラー: {str(exc)}",
            endpoint=request.url.path,
            ip_address=request.client.host,
            user_agent=request.headers.get("user-agent"),
            additional_data={"error_details": str(exc)}
        )
        
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "message": "データベース操作中にエラーが発生しました"
            }
        )
    
    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        """一般的な例外のハンドラ"""
        # エラーログの記録
        db = request.state.db
        logger = ApplicationLogger(db)
        await logger.log(
            level="ERROR",
            source="SERVER",
            message=f"予期しないエラー: {str(exc)}",
            endpoint=request.url.path,
            ip_address=request.client.host,
            user_agent=request.headers.get("user-agent"),
            additional_data={"error_details": str(exc), "error_type": type(exc).__name__}
        )
        
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "message": "予期しないエラーが発生しました"
            }
        )
```

### 7.2 カスタム例外

```python
# app/exceptions.py
class BaseException(Exception):
    """ベース例外クラス"""
    def __init__(self, detail: str = "エラーが発生しました"):
        self.detail = detail
        super().__init__(self.detail)

class NotFoundException(BaseException):
    """リソースが見つからない場合の例外"""
    def __init__(self, detail: str = "リソースが見つかりません"):
        super().__init__(detail)

class PermissionDeniedException(BaseException):
    """アクセス権限がない場合の例外"""
    def __init__(self, detail: str = "この操作を実行する権限がありません"):
        super().__init__(detail)

class BadRequestException(BaseException):
    """リクエストが不正な場合の例外"""
    def __init__(self, detail: str = "リクエストが不正です"):
        super().__init__(detail)

class BusinessLogicException(BaseException):
    """ビジネスロジック違反の場合の例外"""
    def __init__(self, detail: str = "ビジネスルール違反が発生しました"):
        super().__init__(detail)
```

