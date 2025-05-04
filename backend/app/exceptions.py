"""
アプリケーションのグローバル例外ハンドラー
"""
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from app.logs.app_logger import ApplicationLogger

class NotFoundException(Exception):
    """リソースが見つからない例外"""
    pass

class PermissionDeniedException(Exception):
    """権限不足の例外"""
    pass

class BadRequestException(Exception):
    """不正リクエストの例外"""
    pass

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
    
    @app.exception_handler(NotFoundException)
    async def not_found_exception_handler(request: Request, exc: NotFoundException):
        """リソース未検出エラーのハンドラ"""
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"message": str(exc)}
        )
    
    @app.exception_handler(PermissionDeniedException)
    async def permission_denied_exception_handler(request: Request, exc: PermissionDeniedException):
        """アクセス権限エラーのハンドラ"""
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"message": str(exc)}
        )
    
    @app.exception_handler(BadRequestException)
    async def bad_request_exception_handler(request: Request, exc: BadRequestException):
        """不正リクエストエラーのハンドラ"""
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"message": str(exc)}
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
