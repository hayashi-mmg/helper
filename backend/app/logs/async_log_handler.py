"""
非同期でログを処理するためのハンドラー
"""
import asyncio
from typing import List, Dict, Any
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.db.models.logs import ApplicationLog, AuditLog, PerformanceLog
from app.config import settings

class AsyncLogHandler:
    """
    非同期ログハンドラー
    バックグラウンドでログをキューから取得し、バッチ処理で保存する
    """
    def __init__(self):
        self.app_log_queue = asyncio.Queue()
        self.audit_log_queue = asyncio.Queue()
        self.perf_log_queue = asyncio.Queue()
        self.running = False
        self.worker_task = None
    
    async def start(self):
        """ログハンドラーを起動"""
        if not self.running:
            self.running = True
            self.worker_task = asyncio.create_task(self._worker())
    
    async def stop(self):
        """ログハンドラーを停止"""
        if self.running:
            self.running = False
            if self.worker_task:
                await self.worker_task
    
    async def add_application_log(self, log_data: Dict[str, Any]):
        """アプリケーションログをキューに追加"""
        await self.app_log_queue.put(log_data)
    
    async def add_audit_log(self, log_data: Dict[str, Any]):
        """監査ログをキューに追加"""
        await self.audit_log_queue.put(log_data)
    
    async def add_performance_log(self, log_data: Dict[str, Any]):
        """パフォーマンスログをキューに追加"""
        await self.perf_log_queue.put(log_data)
    
    async def _worker(self):
        """バックグラウンドでログを処理するワーカー"""
        # 非同期セッションの作成
        engine = create_async_engine(settings.database_url)
        async_session = sessionmaker(
            engine, class_=AsyncSession, expire_on_commit=False
        )
        
        while self.running or not (
            self.app_log_queue.empty() and 
            self.audit_log_queue.empty() and 
            self.perf_log_queue.empty()
        ):
            # バッチサイズ（一度に処理するログの数）
            batch_size = 50
            
            # 各ログタイプのバッチを処理
            await self._process_app_logs(batch_size, async_session)
            await self._process_audit_logs(batch_size, async_session)
            await self._process_perf_logs(batch_size, async_session)
            
            # 短い待機時間
            await asyncio.sleep(0.1)
    
    async def _process_app_logs(self, batch_size: int, async_session):
        """アプリケーションログのバッチ処理"""
        if self.app_log_queue.empty():
            return
        
        async with async_session() as session:
            async with session.begin():
                logs_to_process = []
                
                # キューからログを取得
                for _ in range(min(batch_size, self.app_log_queue.qsize())):
                    try:
                        log_data = self.app_log_queue.get_nowait()
                        logs_to_process.append(log_data)
                    except asyncio.QueueEmpty:
                        break
                
                if logs_to_process:
                    # ログをデータベースに一括挿入
                    session.add_all([
                        ApplicationLog(**log_data) for log_data in logs_to_process
                    ])
                    
                    # 各ログの処理完了をマーク
                    for _ in range(len(logs_to_process)):
                        self.app_log_queue.task_done()
    
    async def _process_audit_logs(self, batch_size: int, async_session):
        """監査ログのバッチ処理"""
        if self.audit_log_queue.empty():
            return
        
        async with async_session() as session:
            async with session.begin():
                logs_to_process = []
                
                # キューからログを取得
                for _ in range(min(batch_size, self.audit_log_queue.qsize())):
                    try:
                        log_data = self.audit_log_queue.get_nowait()
                        logs_to_process.append(log_data)
                    except asyncio.QueueEmpty:
                        break
                
                if logs_to_process:
                    # ログをデータベースに一括挿入
                    session.add_all([
                        AuditLog(**log_data) for log_data in logs_to_process
                    ])
                    
                    # 各ログの処理完了をマーク
                    for _ in range(len(logs_to_process)):
                        self.audit_log_queue.task_done()
    
    async def _process_perf_logs(self, batch_size: int, async_session):
        """パフォーマンスログのバッチ処理"""
        if self.perf_log_queue.empty():
            return
        
        async with async_session() as session:
            async with session.begin():
                logs_to_process = []
                
                # キューからログを取得
                for _ in range(min(batch_size, self.perf_log_queue.qsize())):
                    try:
                        log_data = self.perf_log_queue.get_nowait()
                        logs_to_process.append(log_data)
                    except asyncio.QueueEmpty:
                        break
                
                if logs_to_process:
                    # ログをデータベースに一括挿入
                    session.add_all([
                        PerformanceLog(**log_data) for log_data in logs_to_process
                    ])
                    
                    # 各ログの処理完了をマーク
                    for _ in range(len(logs_to_process)):
                        self.perf_log_queue.task_done()

# グローバルなインスタンス
async_log_handler = AsyncLogHandler()
