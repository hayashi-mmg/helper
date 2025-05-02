# フロントエンドログ実装ドキュメント

## 1. 概要

本ドキュメントでは、ヘルパーシステムフロントエンドにおけるログ機能の実装方法について説明します。バックエンドで実装されている3種類のログと連携し、クライアント側で発生する情報も効率的に収集・保存します。

1. **アプリケーションログ** - フロントエンドでのエラーや警告情報を記録
2. **ユーザーアクションログ** - ユーザーの操作履歴を記録
3. **パフォーマンスログ** - フロントエンド側のパフォーマンス指標を記録

## 2. 全体アーキテクチャ

### 2.1 ログ機能のコンポーネント構成

```
frontend/
├── src/
│   ├── logs/                       # ログ関連モジュール
│   │   ├── index.ts                # エクスポート
│   │   ├── AppLogger.ts            # アプリケーションログ実装
│   │   ├── UserActionLogger.ts     # ユーザーアクションログ実装
│   │   ├── PerformanceLogger.ts    # パフォーマンスログ実装
│   │   ├── LogManager.ts           # ログマネージャー（全体管理）
│   │   ├── LogTransport.ts         # ログ送信モジュール
│   │   └── types.ts                # 型定義
│   ├── services/
│   │   └── api.ts                  # APIサービス（ログエンドポイント含む）
│   ├── hooks/
│   │   └── useLogger.ts            # ログ機能用カスタムフック
│   ├── App.tsx                     # メインアプリケーション
│   └── ...
```

### 2.2 ログフロー

1. **イベント発生** - フロントエンドでのイベント（エラー、ユーザーアクション、ページロードなど）
2. **ログ記録** - 適切なロガーがイベント情報を収集
3. **バッファリング** - ログはメモリバッファに一時保存
4. **送信** - 以下のタイミングでバックエンドに送信:
   - バッファがしきい値に達した時
   - 特定の重要イベント発生時（即時送信）
   - 定期的な間隔（バッチ送信）
   - ページアンロード時
5. **バックエンド処理** - バックエンドがログを受信し、データベースに保存

## 3. ログモジュール実装

### 3.1 共通型定義

```typescript
// src/logs/types.ts
export type LogLevel = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface BaseLogPayload {
  timestamp?: string;      // ISO形式の日時（未設定時は送信時に自動設定）
  sessionId: string;       // セッションID
  userId?: number;         // ユーザーID（認証済みの場合）
  userAgent?: string;      // ユーザーエージェント
  location: string;        // 現在のURL
  clientInfo?: {           // クライアント情報
    browser: string;       // ブラウザ名
    browserVersion: string;// ブラウザバージョン
    os: string;            // OS
    deviceType: string;    // デバイスタイプ（desktop, tablet, mobile）
    screenSize: string;    // 画面サイズ
  };
}

export interface AppLogPayload extends BaseLogPayload {
  level: LogLevel;         // ログレベル
  source: string;          // ログソース（コンポーネント名など）
  message: string;         // ログメッセージ
  stack?: string;          // スタックトレース（エラー時）
  additionalData?: any;    // 追加データ
}

export interface UserActionPayload extends BaseLogPayload {
  action: string;          // アクション名（CLICK, SUBMIT, NAVIGATEなど）
  element?: string;        // 操作対象要素
  elementId?: string;      // 要素ID
  resourceType?: string;   // リソースタイプ（PAGE, FORM, BUTTONなど）
  resourceId?: string;     // リソースID
  previousState?: any;     // 変更前の状態（該当する場合）
  newState?: any;          // 変更後の状態（該当する場合）
  metadata?: any;          // その他のメタデータ
}

export interface PerformancePayload extends BaseLogPayload {
  pageUrl: string;         // ページURL
  loadTime: number;        // ページロード時間（ms）
  domContentLoaded?: number;// DOMContentLoadedイベント時間（ms）
  firstPaint?: number;     // 初回描画時間（ms）
  firstContentfulPaint?: number; // 初回意味のある描画時間（ms）
  largestContentfulPaint?: number; // 最大コンテンツ描画時間（ms）
  firstInputDelay?: number;// 初回入力遅延（ms）
  cumulativeLayoutShift?: number; // 累積レイアウトシフト
  resourceLoadTimes?: {    // リソース読み込み時間
    [key: string]: number; // リソース名: 読み込み時間（ms）
  };
  apiCallTimes?: {         // API呼び出し時間
    endpoint: string;      // エンドポイント
    method: string;        // HTTPメソッド
    duration: number;      // 所要時間（ms）
    status: number;        // HTTPステータスコード
  }[];
  memoryUsage?: number;    // メモリ使用量（MB）
}

export type LogPayload = AppLogPayload | UserActionPayload | PerformancePayload;

export enum LogType {
  APP = 'application',
  USER_ACTION = 'audit',
  PERFORMANCE = 'performance'
}

export interface LogEntry {
  type: LogType;
  payload: LogPayload;
  timestamp: number;       // エポックミリ秒
  sendAttempts?: number;   // 送信試行回数
  priority: number;        // 優先度（高いほど優先）
}

export interface LogTransportConfig {
  batchSize: number;       // 一度に送信するログの最大数
  maxBufferSize: number;   // バッファの最大サイズ
  flushInterval: number;   // 定期送信の間隔（ms）
  retryLimit: number;      // 再試行の最大回数
  retryInterval: number;   // 再試行の間隔（ms）
  endpoint: string;        // ログ送信先エンドポイント
}
```

### 3.2 ユーティリティ関数

```typescript
// src/logs/utils.ts
import Bowser from 'bowser';
import { v4 as uuidv4 } from 'uuid';

// セッションIDの取得（または生成）
export function getSessionId(): string {
  let sessionId = sessionStorage.getItem('log_session_id');
  
  if (!sessionId) {
    sessionId = uuidv4();
    sessionStorage.setItem('log_session_id', sessionId);
  }
  
  return sessionId;
}

// クライアント情報の取得
export function getClientInfo() {
  const bowser = Bowser.getParser(window.navigator.userAgent);
  const browser = bowser.getBrowser();
  const os = bowser.getOS();
  
  // デバイスタイプの判定
  let deviceType = 'desktop';
  if (bowser.getPlatform().type === 'mobile') {
    deviceType = 'mobile';
  } else if (bowser.getPlatform().type === 'tablet') {
    deviceType = 'tablet';
  }
  
  // 画面サイズ
  const screenSize = `${window.screen.width}x${window.screen.height}`;
  
  return {
    browser: browser.name || 'unknown',
    browserVersion: browser.version || 'unknown',
    os: `${os.name} ${os.version}`,
    deviceType,
    screenSize
  };
}

// リソースURLから識別子を取得
export function getResourceName(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // 主要なリソースタイプを識別
    if (pathname.match(/\.(js|jsx)(\?|$)/)) {
      return `JS: ${pathname.split('/').pop()}`;
    } else if (pathname.match(/\.(css)(\?|$)/)) {
      return `CSS: ${pathname.split('/').pop()}`;
    } else if (pathname.match(/\.(png|jpg|jpeg|gif|svg|webp)(\?|$)/)) {
      return `IMG: ${pathname.split('/').pop()}`;
    } else if (pathname.match(/\.(woff|woff2|ttf|otf|eot)(\?|$)/)) {
      return `FONT: ${pathname.split('/').pop()}`;
    } else if (urlObj.pathname.startsWith('/api/')) {
      return `API: ${urlObj.pathname}`;
    }
    
    // その他のリソース
    return pathname;
  } catch (e) {
    return url.substring(0, 100);
  }
}

### 3.7 ログマネージャークラス

```typescript
// src/logs/LogManager.ts
import { LogTransport } from './LogTransport';
import { AppLogger } from './AppLogger';
import { UserActionLogger } from './UserActionLogger';
import { PerformanceLogger } from './PerformanceLogger';
import { Api } from '../services/api';

export class LogManager {
  private transport: LogTransport;
  private appLogger: AppLogger;
  private userActionLogger: UserActionLogger;
  private performanceLogger: PerformanceLogger;
  private isInitialized: boolean = false;
  
  constructor(api: Api, config?: any) {
    this.transport = new LogTransport(api, config);
    this.appLogger = new AppLogger(this.transport);
    this.userActionLogger = new UserActionLogger(this.transport);
    this.performanceLogger = new PerformanceLogger(this.transport);
    
    // グローバルエラーハンドラーの設定
    this.setupGlobalErrorHandling();
    this.isInitialized = true;
  }
  
  // グローバルエラーハンドラーの設定
  private setupGlobalErrorHandling(): void {
    // 未処理のエラーをキャッチ
    window.addEventListener('error', (event) => {
      this.appLogger.error(
        `未処理のエラー: ${event.message}`,
        event.error,
        { filename: event.filename, lineno: event.lineno, colno: event.colno }
      );
    });
    
    // 未処理のPromise例外をキャッチ
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      this.appLogger.error('未処理のPromise例外', error);
    });
  }
  
  // ロガーインスタンスを取得
  public getAppLogger(source: string = 'APP'): AppLogger {
    const logger = new AppLogger(this.transport, source);
    return logger;
  }
  
  public getUserActionLogger(): UserActionLogger {
    return this.userActionLogger;
  }
  
  public getPerformanceLogger(): PerformanceLogger {
    return this.performanceLogger;
  }
  
  // 直接アクセス用の便利メソッド
  public logInfo(message: string, source: string = 'APP', additionalData?: any): void {
    this.appLogger.setSource(source);
    this.appLogger.info(message, additionalData);
  }
  
  public logWarning(message: string, source: string = 'APP', additionalData?: any): void {
    this.appLogger.setSource(source);
    this.appLogger.warning(message, additionalData);
  }
  
  public logError(message: string, error?: Error, source: string = 'APP', additionalData?: any): void {
    this.appLogger.setSource(source);
    this.appLogger.error(message, error, additionalData);
  }
  
  public logUserAction(
    action: string,
    element?: string,
    elementId?: string,
    resourceType?: string,
    resourceId?: string,
    previousState?: any,
    newState?: any,
    metadata?: any
  ): void {
    this.userActionLogger.logAction(
      action, element, elementId, resourceType, resourceId, previousState, newState, metadata
    );
  }
  
  // APIインターセプターの設定
  public setupApiInterceptors(api: Api): void {
    // リクエスト送信前
    api.interceptors.request.use((config) => {
      const callId = this.performanceLogger.startApiCall(
        config.url || '', 
        config.method?.toUpperCase() || 'GET'
      );
      
      // リクエスト設定にcallIdを追加
      config.metadata = {
        ...config.metadata,
        logCallId: callId
      };
      
      return config;
    });
    
    // レスポンス受信時
    api.interceptors.response.use(
      (response) => {
        // 成功レスポンス
        const callId = response.config.metadata?.logCallId;
        if (callId) {
          this.performanceLogger.endApiCall(callId, response.status);
        }
        return response;
      },
      (error) => {
        // エラーレスポンス
        const callId = error.config?.metadata?.logCallId;
        if (callId) {
          this.performanceLogger.endApiCall(
            callId, 
            error.response?.status || 0
          );
        }
        return Promise.reject(error);
      }
    );
  }
  
  // クリーンアップ
  public destroy(): void {
    this.transport.destroy();
    this.performanceLogger.destroy();
  }
}
```

## 4. Reactコンポーネントでの使用例

### 4.1 ログマネージャーの初期化

```typescript
// src/services/logger.ts
import { LogManager } from '../logs/LogManager';
import { api } from './api';

// LogManagerのシングルトンインスタンス
const logManager = new LogManager(api, {
  batchSize: 10,
  flushInterval: 15000,
  endpoint: '/api/logs/client'
});

// APIインターセプターの設定
logManager.setupApiInterceptors(api);

export default logManager;
```

### 4.2 ロガー用カスタムフック

```typescript
// src/hooks/useLogger.ts
import { useRef, useEffect } from 'react';
import logManager from '../services/logger';
import { AppLogger } from '../logs/AppLogger';
import { UserActionLogger } from '../logs/UserActionLogger';
import { PerformanceLogger } from '../logs/PerformanceLogger';

export function useLogger(componentName: string) {
  // コンポーネント名をソースとしたアプリケーションロガーを作成
  const appLogger = useRef<AppLogger>(logManager.getAppLogger(componentName));
  
  // 他のロガーも取得
  const userActionLogger = useRef<UserActionLogger>(logManager.getUserActionLogger());
  const performanceLogger = useRef<PerformanceLogger>(logManager.getPerformanceLogger());
  
  // コンポーネントマウント時にログを記録（開発環境のみ）
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      appLogger.current.debug(`${componentName} マウント`);
      
      return () => {
        appLogger.current.debug(`${componentName} アンマウント`);
      };
    }
  }, [componentName]);
  
  return {
    log: appLogger.current,
    action: userActionLogger.current,
    performance: performanceLogger.current
  };
}
```

### 4.3 ルーターナビゲーションの監視

```typescript
// src/router/RouterWrapper.tsx
import { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import logManager from '../services/logger';

const RouterWrapper = ({ children }) => {
  const history = useHistory();
  const location = useLocation();
  const actionLogger = logManager.getUserActionLogger();
  
  useEffect(() => {
    // パス変更を検出して記録
    const unlisten = history.listen((location, action) => {
      const prevPath = window.location.pathname;
      const newPath = location.pathname;
      
      // ナビゲーションメソッドをマッピング
      let navigationMethod: 'LINK' | 'REDIRECT' | 'HISTORY' | 'DIRECT' = 'LINK';
      if (action === 'PUSH') navigationMethod = 'LINK';
      else if (action === 'REPLACE') navigationMethod = 'REDIRECT';
      else if (action === 'POP') navigationMethod = 'HISTORY';
      
      // ユーザーアクションとして記録
      actionLogger.logNavigation(prevPath, newPath, navigationMethod);
    });
    
    // 初回アクセスを記録
    actionLogger.logNavigation('', location.pathname, 'DIRECT');
    
    return () => {
      unlisten();
    };
  }, [history, location, actionLogger]);
  
  return <>{children}</>;
};

export default RouterWrapper;
```

### 4.4 コンポーネントでのロガー使用例

```tsx
// src/components/PostEditor.tsx
import React, { useState, useEffect } from 'react';
import { useLogger } from '../hooks/useLogger';
import api from '../services/api';

interface Post {
  id?: number;
  title: string;
  content: string;
}

const PostEditor: React.FC<{ postId?: number }> = ({ postId }) => {
  const { log, action } = useLogger('PostEditor');
  const [post, setPost] = useState<Post>({ title: '', content: '' });
  const [error, setError] = useState<string | null>(null);
  
  // 投稿データの取得
  useEffect(() => {
    if (postId) {
      const fetchPost = async () => {
        try {
          log.info(`投稿データを取得中 ID: ${postId}`);
          const response = await api.get(`/api/posts/${postId}`);
          setPost(response.data);
          log.info(`投稿データ取得完了 ID: ${postId}`);
        } catch (err) {
          const errorMessage = err.response?.data?.message || '投稿データの取得中にエラーが発生しました';
          log.error(errorMessage, err, { postId });
          setError(errorMessage);
        }
      };
      
      fetchPost();
    }
  }, [postId, log]);
  
  // フォーム送信ハンドラ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      log.info('投稿フォーム送信中', { postId: post.id, title: post.title });
      
      const previousState = postId ? { ...post } : null;
      let response;
      
      if (postId) {
        // 既存投稿の更新
        response = await api.put(`/api/posts/${postId}`, post);
        log.info(`投稿を更新しました ID: ${postId}`);
      } else {
        // 新規投稿の作成
        response = await api.post('/api/posts', post);
        log.info('新規投稿を作成しました');
      }
      
      const newState = response.data;
      
      // ユーザーアクションとして記録
      action.logAction(
        postId ? 'UPDATE' : 'CREATE',
        'FORM',
        'post-editor-form',
        'POST',
        postId?.toString(),
        previousState,
        newState
      );
      
      // 成功時の処理...
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || '投稿の保存中にエラーが発生しました';
      log.error(errorMessage, err, { post });
      setError(errorMessage);
    }
  };
  
  // 入力変更ハンドラ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPost(prev => ({ ...prev, [name]: value }));
  };
  
  // クリックイベントの記録例
  const handlePreviewClick = () => {
    action.logClick('BUTTON', 'preview-button', 'POST', postId?.toString(), { postTitle: post.title });
    // プレビュー処理...
  };
  
  return (
    <div className="post-editor">
      <h2>{postId ? '投稿を編集' : '新規投稿'}</h2>
      
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit} id="post-editor-form">
        <div className="form-group">
          <label htmlFor="title">タイトル</label>
          <input
            type="text"
            id="title"
            name="title"
            value={post.title}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="content">本文</label>
          <textarea
            id="content"
            name="content"
            value={post.content}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="button-group">
          <button type="button" onClick={handlePreviewClick}>
            プレビュー
          </button>
          <button type="submit">
            {postId ? '更新' : '投稿'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostEditor;
```

## 5. バックエンドAPI実装

フロントエンドから送信されたログを受け取り、処理するバックエンドAPIエンドポイントを実装します。

### 5.1 クライアントログ受信エンドポイント

```python
# app/routes/logs.py (追加エンドポイント)
from fastapi import APIRouter, Depends, HTTPException, Body, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.logs.app_logger import ApplicationLogger
from app.logs.audit_logger import AuditLogger
from app.logs.performance_logger import PerformanceLogger
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid

@router.post("/client", status_code=202)
async def receive_client_logs(
    request: Request,
    logs_data: Dict[str, List[Dict[str, Any]]] = Body(...),
    db: AsyncSession = Depends(get_db)
):
    """フロントエンドから送信されたログを受信して保存"""
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    
    # アプリケーションログの処理
    if "application" in logs_data and logs_data["application"]:
        app_logger = ApplicationLogger(db)
        for log_entry in logs_data["application"]:
            # 必須フィールドの検証
            if not all(k in log_entry for k in ["level", "source", "message"]):
                continue
            
            # クライアント情報を追加
            log_entry["ip_address"] = client_ip
            if "userAgent" not in log_entry:
                log_entry["userAgent"] = user_agent
            
            # バックエンドのログモデルに変換
            await app_logger.log(
                level=log_entry["level"],
                source=f"CLIENT:{log_entry['source']}",
                message=log_entry["message"],
                user_id=log_entry.get("userId"),
                endpoint=log_entry.get("location"),
                ip_address=client_ip,
                user_agent=log_entry.get("userAgent"),
                request_id=log_entry.get("sessionId", str(uuid.uuid4())),
                additional_data={
                    "stack": log_entry.get("stack"),
                    "additionalData": log_entry.get("additionalData"),
                    "clientInfo": log_entry.get("clientInfo")
                }
            )
    
    # 監査ログ（ユーザーアクション）の処理
    if "audit" in logs_data and logs_data["audit"]:
        audit_logger = AuditLogger(db)
        for log_entry in logs_data["audit"]:
            # 必須フィールドの検証
            if not all(k in log_entry for k in ["action", "sessionId"]):
                continue
            
            # バックエンドの監査ログモデルに変換
            await audit_logger.log_action(
                user_id=log_entry.get("userId", 0),  # 未認証の場合は0
                action=log_entry["action"],
                resource_type=log_entry.get("resourceType", "UNKNOWN"),
                resource_id=log_entry.get("resourceId"),
                previous_state=log_entry.get("previousState"),
                new_state=log_entry.get("newState"),
                ip_address=client_ip,
                user_agent=log_entry.get("userAgent", user_agent),
                additional_data={
                    "element": log_entry.get("element"),
                    "elementId": log_entry.get("elementId"),
                    "location": log_entry.get("location"),
                    "sessionId": log_entry.get("sessionId"),
                    "metadata": log_entry.get("metadata"),
                    "clientInfo": log_entry.get("clientInfo")
                }
            )
    
    # パフォーマンスログの処理
    if "performance" in logs_data and logs_data["performance"]:
        perf_logger = PerformanceLogger(db)
        for log_entry in logs_data["performance"]:
            # 必須フィールドの検証
            if not all(k in log_entry for k in ["pageUrl", "loadTime"]):
                continue
            
            # APIコール情報があれば処理
            api_call_metrics = {}
            if log_entry.get("apiCallTimes"):
                api_endpoints = {}
                for api_call in log_entry["apiCallTimes"]:
                    endpoint = api_call["endpoint"]
                    if endpoint not in api_endpoints:
                        api_endpoints[endpoint] = []
                    api_endpoints[endpoint].append(api_call["duration"])
                
                # エンドポイントごとの平均応答時間を計算
                for endpoint, durations in api_endpoints.items():
                    avg_duration = sum(durations) / len(durations)
                    api_call_metrics[f"api:{endpoint}"] = avg_duration
            
            # フロントエンド固有のメトリクスを追加
            metrics = {
                "first_paint": log_entry.get("firstPaint"),
                "first_contentful_paint": log_entry.get("firstContentfulPaint"),
                "largest_contentful_paint": log_entry.get("largestContentfulPaint"),
                "first_input_delay": log_entry.get("firstInputDelay"),
                "cumulative_layout_shift": log_entry.get("cumulativeLayoutShift"),
                "memory_usage": log_entry.get("memoryUsage"),
                "client_info": log_entry.get("clientInfo")
            }
            
            # リソース読み込み時間があれば追加
            if log_entry.get("resourceLoadTimes"):
                for resource, duration in log_entry["resourceLoadTimes"].items():
                    metrics[f"resource:{resource}"] = duration
            
            # API呼び出し時間メトリクスを追加
            metrics.update(api_call_metrics)
            
            # バックエンドのパフォーマンスログモデルに変換
            await perf_logger.log_request(
                endpoint=log_entry["pageUrl"],  # ページURLをエンドポイントとして使用
                status_code=200,  # クライアントからのログなので通常は200
                request_method="GET",  # 主にページ読み込みを想定
                request_size=None,
                response_size=None,
                user_id=log_entry.get("userId"),
                ip_address=client_ip,
                additional_metrics=metrics
            )
    
    await db.commit()
    return {"message": "ログが正常に受信されました"}
```

### 5.2 バックエンドモデルの拡張

クライアントログを適切に保存するために、既存のバックエンドモデルを拡張します。

```python
# app/logs/models.py (AuditLogモデルの拡張)
class AuditLog(Base):
    # 既存のフィールド...
    
    # 追加フィールド
    additional_data = Column(JSON, nullable=True)  # クライアント固有の情報
```

## 6. フロントエンドログの監視と分析

### 6.1 ダッシュボード用APIエンドポイント

```python
# app/routes/logs.py (追加エンドポイント)
@router.get("/dashboard/frontend")
async def get_frontend_logs_dashboard(
    days: int = Query(7, description="過去何日分のデータを取得するか"),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(get_current_admin_user)
):
    """フロントエンドログ用ダッシュボードデータを取得（管理者専用）"""
    end_time = datetime.utcnow()
    start_time = end_time - timedelta(days=days)
    
    # クライアントエラーの集計
    client_error_query = select(
        func.date_trunc('day', ApplicationLog.timestamp).label("day"),
        ApplicationLog.source,
        func.count().label("count")
    ).filter(
        ApplicationLog.timestamp >= start_time,
        ApplicationLog.timestamp <= end_time,
        ApplicationLog.source.like('CLIENT:%'),
        ApplicationLog.level.in_(["ERROR", "CRITICAL"])
    ).group_by(
        func.date_trunc('day', ApplicationLog.timestamp),
        ApplicationLog.source
    ).order_by(
        func.date_trunc('day', ApplicationLog.timestamp),
        desc(func.count())
    )
    
    client_error_result = await db.execute(client_error_query)
    client_errors = []
    
    for row in client_error_result:
        client_errors.append({
            "day": row.day.strftime("%Y-%m-%d"),
            "source": row.source.replace('CLIENT:', ''),
            "count": row.count
        })
    
    # パフォーマンスメトリクスの集計
    perf_query = select(
        func.avg(PerformanceLog.response_time).label("avg_load_time"),
        func.json_extract_path_text(
            PerformanceLog.additional_metrics, 
            'first_contentful_paint'
        ).cast(Float).label("avg_fcp"),
        func.json_extract_path_text(
            PerformanceLog.additional_metrics, 
            'largest_contentful_paint'
        ).cast(Float).label("avg_lcp")
    ).filter(
        PerformanceLog.timestamp >= start_time,
        PerformanceLog.timestamp <= end_time,
        PerformanceLog.additional_metrics.isnot(None)
    )
    
    perf_result = await db.execute(perf_query)
    perf_data = perf_result.first()
    
    # ユーザーアクション集計
    action_query = select(
        AuditLog.action,
        func.count().label("count")
    ).filter(
        AuditLog.timestamp >= start_time,
        AuditLog.timestamp <= end_time,
        AuditLog.additional_data.isnot(None)
    ).group_by(
        AuditLog.action
    ).order_by(desc(func.count())).limit(10)
    
    action_result = await db.execute(action_query)
    user_actions = [{"action": row.action, "count": row.count} for row in action_result]
    
    # ブラウザ/OS情報の集計
    browser_query = select(
        func.json_extract_path_text(
            ApplicationLog.additional_data, 
            'clientInfo', 'browser'
        ).label("browser"),
        func.count().label("count")
    ).filter(
        ApplicationLog.timestamp >= start_time,
        ApplicationLog.timestamp <= end_time,
        ApplicationLog.additional_data.isnot(None)
    ).group_by(
        func.json_extract_path_text(
            ApplicationLog.additional_data, 
            'clientInfo', 'browser'
        )
    ).order_by(desc(func.count()))
    
    browser_result = await db.execute(browser_query)
    browsers = [{"browser": row.browser or "Unknown", "count": row.count} for row in browser_result]
    
    return {
        "time_range": {
            "start": start_time.isoformat(),
            "end": end_time.isoformat(),
            "days": days
        },
        "client_errors": client_errors,
        "performance": {
            "avg_load_time": round(perf_data.avg_load_time or 0, 2),
            "avg_first_contentful_paint": round(perf_data.avg_fcp or 0, 2),
            "avg_largest_contentful_paint": round(perf_data.avg_lcp or 0, 2)
        },
        "user_actions": user_actions,
        "browsers": browsers
    }
```

## 7. ベストプラクティスと注意点

### 7.1 プライバシーとセキュリティ

1. **個人情報の保護**:
   - ユーザーの個人情報はログに記録しないでください
   - 必要に応じてIPアドレスやユーザーIDをハッシュ化します
   - EUユーザーに対してはGDPRに準拠する必要があります

2. **機密データのフィルタリング**:
   - パスワードやトークンなどの機密情報は自動的にフィルタリングします
   - フォームデータ送信時に機密フィールドを検出して置換します

3. **通信の暗号化**:
   - すべてのログデータはHTTPS経由で送信されるようにします
   - 特に監査ログには機密性の高い変更情報が含まれる可能性があります

### 7.2 パフォーマンスへの影響

1. **ログ収集のオーバーヘッド**:
   - 過度にログを収集するとアプリケーションのパフォーマンスに影響します
   - 重要なイベントに絞ってログを収集しましょう
   - 開発環境ではより詳細なログを、本番環境では必要最小限のログを収集します

2. **バッチ処理とバッファリング**:
   - 小さなログを頻繁に送信せず、バッファリングして一括送信します
   - クリティカルなイベント以外は即時送信を避けます

3. **非同期処理**:
   - ログ処理はメインスレッドをブロックしないように非同期で行います
   - ページのロード時間やインタラクションに影響しないようにします

### 7.3 実装のヒント

1. **段階的な実装**:
   - 最初はクリティカルな部分（エラー、重要なユーザーアクション）から実装します
   - データを分析しながら徐々にログの種類を増やしていきます

2. **フォールバックメカニズム**:
   - ログサーバーに障害が発生した場合のフォールバック機能を実装します
   - ローカルストレージに一時保存し、接続回復時に送信するなどの対策を検討します

3. **サンプリング率の調整**:
   - トラフィックが多いサイトでは、すべてのユーザーからログを収集するのではなく、
     サンプリング率を設定して一部のユーザーからのみ詳細なログを収集します
   - トラフィックの多いページではより低いサンプリング率を、重要ページではより高い率を設定します

## 8. APIインターフェース仕様

### 8.1 クライアントログ送信API

**エンドポイント**: `/api/logs/client`  
**メソッド**: POST  
**ヘッダー**: Content-Type: application/json  
**認証**: 不要（アクセストークンは必要なし）

**リクエスト本文**:
```json
{
  "application": [
    {
      "level": "ERROR",
      "source": "PostEditor",
      "message": "投稿データの取得に失敗しました",
      "timestamp": "2025-04-30T12:34:56.789Z",
      "sessionId": "550e8400-e29b-41d4-a716-446655440000",
      "userId": 123,
      "location": "https://example.com/editor/5",
      "userAgent": "Mozilla/5.0 ...",
      "clientInfo": {
        "browser": "Chrome",
        "browserVersion": "112.0.0",
        "os": "Windows 11",
        "deviceType": "desktop",
        "screenSize": "1920x1080"
      },
      "stack": "Error: Failed to fetch post\n    at fetchPost (PostEditor.tsx:25)\n    ...",
      "additionalData": {
        "postId": 5
      }
    }
  ],
  "audit": [
    {
      "action": "CLICK",
      "element": "BUTTON",
      "elementId": "save-button",
      "resourceType": "POST",
      "resourceId": "5",
      "timestamp": "2025-04-30T12:35:00.123Z",
      "sessionId": "550e8400-e29b-41d4-a716-446655440000",
      "userId": 123,
      "location": "https://example.com/editor/5",
      "metadata": {
        "postTitle": "サンプル投稿"
      }
    }
  ],
  "performance": [
    {
      "pageUrl": "https://example.com/editor/5",
      "loadTime": 1250,
      "domContentLoaded": 850,
      "firstPaint": 650,
      "firstContentfulPaint": 750,
      "largestContentfulPaint": 1100,
      "firstInputDelay": 25,
      "cumulativeLayoutShift": 0.05,
      "timestamp": "2025-04-30T12:33:45.678Z",
      "sessionId": "550e8400-e29b-41d4-a716-446655440000",
      "userId": 123,
      "resourceLoadTimes": {
        "JS: main.js": 350,
        "CSS: styles.css": 120,
        "IMG: logo.png": 80
      },
      "apiCallTimes": [
        {
          "endpoint": "/api/posts/5",
          "method": "GET",
          "duration": 230,
          "status": 200
        }
      ],
      "memoryUsage": 56
    }
  ]
}
```

**レスポンス**:
```json
{
  "message": "ログが正常に受信されました"
}
```

### 8.2 フロントエンドログ検索API

**エンドポイント**: `/api/logs/client/search`  
**メソッド**: GET  
**認証**: 管理者権限が必要

**クエリパラメータ**:
- `logType`: 検索するログタイプ (`application`, `audit`, `performance`)
- `startTime`: 開始日時（ISO形式）
- `endTime`: 終了日時（ISO形式）
- `sessionId`: セッションID（特定のユーザーセッションのログを検索）
- `userId`: ユーザーID
- `level`: ログレベル（アプリケーションログの場合）
- `action`: アクション（監査ログの場合）
- `limit`: 取得件数制限（デフォルト: 100）
- `offset`: オフセット（デフォルト: 0）

**レスポンス例**:
```json
{
  "total": 120,
  "limit": 10,
  "offset": 0,
  "logs": [
    {
      "id": 1,
      "timestamp": "2025-04-30T12:34:56.789Z",
      "sessionId": "550e8400-e29b-41d4-a716-446655440000",
      "userId": 123,
      "level": "ERROR",
      "source": "CLIENT:PostEditor",
      "message": "投稿データの取得に失敗しました",
      "location": "https://example.com/editor/5",
      "additionalData": {
        "stack": "Error: Failed to fetch post\n    at fetchPost (PostEditor.tsx:25)\n    ...",
        "postId": 5,
        "clientInfo": {
          "browser": "Chrome",
          "browserVersion": "112.0.0",
          "os": "Windows 11",
          "deviceType": "desktop",
          "screenSize": "1920x1080"
        }
      }
    },
    // 他のログエントリ...
  ]
}
```

## 9. セッショントラッキングと分析

### 9.1 ユーザーセッションの追跡

```typescript
// src/logs/session-tracker.ts
import { v4 as uuidv4 } from 'uuid';
import logManager from '../services/logger';

export class SessionTracker {
  private static instance: SessionTracker;
  private sessionId: string;
  private sessionStartTime: number;
  private lastActivityTime: number;
  private pageViews: number = 0;
  private interactions: number = 0;
  
  private constructor() {
    // 既存のセッションIDがあるか確認
    const existingSessionId = sessionStorage.getItem('log_session_id');
    
    if (existingSessionId) {
      this.sessionId = existingSessionId;
      
      // セッション開始時間
      const startTime = sessionStorage.getItem('log_session_start');
      this.sessionStartTime = startTime ? parseInt(startTime, 10) : Date.now();
      
      // ページビュー数を取得
      const pageViews = sessionStorage.getItem('log_page_views');
      this.pageViews = pageViews ? parseInt(pageViews, 10) : 0;
    } else {
      // 新しいセッションを作成
      this.sessionId = uuidv4();
      this.sessionStartTime = Date.now();
      
      // セッション情報を保存
      sessionStorage.setItem('log_session_id', this.sessionId);
      sessionStorage.setItem('log_session_start', this.sessionStartTime.toString());
      sessionStorage.setItem('log_page_views', '0');
    }
    
    this.lastActivityTime = Date.now();
    
    // イベントリスナーを設定
    this.setupEventListeners();
  }
  
  public static getInstance(): SessionTracker {
    if (!SessionTracker.instance) {
      SessionTracker.instance = new SessionTracker();
    }
    
    return SessionTracker.instance;
  }
  
  private setupEventListeners(): void {
    // ページビューの追跡
    window.addEventListener('load', () => this.trackPageView());
    
    // ユーザーインタラクションの追跡
    ['click', 'keypress', 'scroll', 'touchstart'].forEach(eventType => {
      window.addEventListener(eventType, () => this.trackUserActivity());
    });
    
    // ページアンロード時の処理
    window.addEventListener('beforeunload', () => this.logSessionData());
  }
  
  private trackPageView(): void {
    this.pageViews++;
    sessionStorage.setItem('log_page_views', this.pageViews.toString());
    
    // ページビューをログに記録
    logManager.logInfo('ページビュー', 'SessionTracker', {
      pageUrl: window.location.href,
      pageTitle: document.title,
      referrer: document.referrer,
      pageViews: this.pageViews
    });
  }
  
  private trackUserActivity(): void {
    this.lastActivityTime = Date.now();
    this.interactions++;
  }
  
  private logSessionData(): void {
    const sessionDuration = Date.now() - this.sessionStartTime;
    
    // セッション情報をログに記録
    logManager.logInfo('セッション終了', 'SessionTracker', {
      sessionId: this.sessionId,
      sessionDuration,
      pageViews: this.pageViews,
      interactions: this.interactions,
      inactiveTime: Date.now() - this.lastActivityTime
    });
  }
  
  public getSessionId(): string {
    return this.sessionId;
  }
  
  public getSessionDuration(): number {
    return Date.now() - this.sessionStartTime;
  }
}

// アプリケーション起動時に初期化
export const sessionTracker = SessionTracker.getInstance();
```

### 9.2 ユーザージャーニー分析

```typescript
// src/logs/journey-tracker.ts
import logManager from '../services/logger';
import { SessionTracker } from './session-tracker';

interface JourneyStep {
  page: string;
  timestamp: number;
  duration?: number;
  interactions: number;
  events: Array<{
    type: string;
    element?: string;
    timestamp: number;
    data?: any;
  }>;
}

export class JourneyTracker {
  private static instance: JourneyTracker;
  private sessionTracker: SessionTracker;
  private steps: JourneyStep[] = [];
  private currentPage: string = '';
  private currentPageStartTime: number = 0;
  private interactionCount: number = 0;
  private events: JourneyStep['events'] = [];
  
  private constructor() {
    this.sessionTracker = SessionTracker.getInstance();
    
    // 現在のページ情報を取得
    this.currentPage = window.location.pathname;
    this.currentPageStartTime = Date.now();
    
    // ページ遷移を監視
    this.setupNavigationTracking();
    
    // 主要なユーザーインタラクションを監視
    this.setupInteractionTracking();
  }
  
  public static getInstance(): JourneyTracker {
    if (!JourneyTracker.instance) {
      JourneyTracker.instance = new JourneyTracker();
    }
    
    return JourneyTracker.instance;
  }
  
  private setupNavigationTracking(): void {
    // SPAのナビゲーション監視
    window.addEventListener('popstate', () => this.handleNavigation());
    
    // クリック監視（リンククリック検出用）
    document.addEventListener('click', event => {
      const target = event.target as HTMLElement;
      const linkElement = target.closest('a');
      
      if (linkElement && linkElement.href && !linkElement.hasAttribute('target')) {
        // 同一オリジン内のナビゲーション
        const url = new URL(linkElement.href);
        if (url.origin === window.location.origin) {
          setTimeout(() => {
            if (window.location.pathname !== this.currentPage) {
              this.handleNavigation();
            }
          }, 100);
        }
      }
    });
  }
  
  private setupInteractionTracking(): void {
    // クリックイベントの追跡
    document.addEventListener('click', event => {
      this.interactionCount++;
      
      const target = event.target as HTMLElement;
      if (!target) return;
      
      const elementType = target.tagName;
      const elementId = target.id || '';
      const elementClass = target.className || '';
      
      // 要素に関連するデータを収集
      let actionData: any = {
        elementType,
        elementId,
        elementClass
      };
      
      // データ属性の収集
      if (target.dataset) {
        const dataAttributes: Record<string, string> = {};
        Object.keys(target.dataset).forEach(key => {
          dataAttributes[key] = target.dataset[key] || '';
        });
        
        if (Object.keys(dataAttributes).length > 0) {
          actionData.dataAttributes = dataAttributes;
        }
      }
      
      // イベントを記録
      this.events.push({
        type: 'CLICK',
        element: elementType,
        timestamp: Date.now(),
        data: actionData
      });
    });
    
    // フォーム送信イベントの追跡
    document.addEventListener('submit', event => {
      const form = event.target as HTMLFormElement;
      if (!form) return;
      
      this.interactionCount++;
      
      // フォームのIDや名前を取得
      const formId = form.id || '';
      const formName = form.getAttribute('name') || '';
      
      // 送信先URLを取得
      const formAction = form.action || '';
      
      // 機密情報を含まないフォームフィールド名を収集
      const formFields = Array.from(form.elements).map(element => {
        const input = element as HTMLInputElement;
        return input.name || input.id || '';
      }).filter(name => name && !['password', 'token'].includes(name.toLowerCase()));
      
      // イベントを記録
      this.events.push({
        type: 'FORM_SUBMIT',
        element: 'FORM',
        timestamp: Date.now(),
        data: {
          formId,
          formName,
          formAction,
          formFields
        }
      });
    });
  }
  
  private handleNavigation(): void {
    // 現在のページステップを完了
    this.completeCurrentStep();
    
    // 新しいページステップを開始
    this.currentPage = window.location.pathname;
    this.currentPageStartTime = Date.now();
    this.interactionCount = 0;
    this.events = [];
    
    // ページ遷移をログに記録
    logManager.logInfo('ページ遷移', 'JourneyTracker', {
      page: this.currentPage,
      referrer: document.referrer,
      title: document.title
    });
  }
  
  private completeCurrentStep(): void {
    // 滞在時間を計算
    const duration = Date.now() - this.currentPageStartTime;
    
    // 手順を記録
    this.steps.push({
      page: this.currentPage,
      timestamp: this.currentPageStartTime,
      duration,
      interactions: this.interactionCount,
      events: [...this.events]
    });
    
    // ジャーニーの進行状況をログに記録
    if (this.steps.length > 0) {
      logManager.logInfo('ユーザージャーニーステップ完了', 'JourneyTracker', {
        page: this.currentPage,
        duration,
        interactions: this.interactionCount,
        eventCount: this.events.length,
        stepNumber: this.steps.length
      });
    }
  }
  
  public getCurrentJourney(): JourneyStep[] {
    // 現在のステップを含むジャーニー全体を返す
    const currentJourney = [...this.steps];
    
    // 現在のページ（未完了ステップ）を追加
    const currentDuration = Date.now() - this.currentPageStartTime;
    currentJourney.push({
      page: this.currentPage,
      timestamp: this.currentPageStartTime,
      duration: currentDuration,
      interactions: this.interactionCount,
      events: [...this.events]
    });
    
    return currentJourney;
  }
  
  public logFullJourney(): void {
    // 最終ステップを完了
    this.completeCurrentStep();
    
    // 完全なジャーニーをログに記録
    logManager.getAppLogger('JourneyTracker').info('ユーザージャーニー完了', {
      sessionId: this.sessionTracker.getSessionId(),
      sessionDuration: this.sessionTracker.getSessionDuration(),
      stepCount: this.steps.length,
      journey: this.steps
    });
  }
}

// アプリケーション起動時に初期化
export const journeyTracker = JourneyTracker.getInstance();
```

## 10. エラー追跡と解析

### 10.1 グローバルエラーハンドラー

```typescript
// src/logs/error-tracker.ts
import logManager from '../services/logger';

export class ErrorTracker {
  private static instance: ErrorTracker;
  private appLogger = logManager.getAppLogger('ErrorTracker');
  private isInitialized: boolean = false;
  
  // 無視するエラーパターン
  private ignorePatterns: RegExp[] = [
    /Script error/i,
    /ResizeObserver loop/i,
    /Extension context invalidated/i
  ];
  
  private constructor() {
    this.initialize();
  }
  
  public static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    
    return ErrorTracker.instance;
  }
  
  private initialize(): void {
    if (this.isInitialized) return;
    
    // グローバルエラーハンドラー
    window.addEventListener('error', event => {
      this.handleError(event);
    });
    
    // 未処理のPromise例外ハンドラー
    window.addEventListener('unhandledrejection', event => {
      this.handlePromiseRejection(event);
    });
    
    // React エラー境界との統合（オプション）
    // window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__ = this.handleReactError.bind(this);
    
    this.isInitialized = true;
  }
  
  private shouldIgnoreError(message: string): boolean {
    return this.ignorePatterns.some(pattern => pattern.test(message));
  }
  
  private handleError(event: ErrorEvent): void {
    // 無視すべきエラーはスキップ
    if (this.shouldIgnoreError(event.message)) {
      return;
    }
    
    const errorInfo = {
      message: event.message,
      source: event.filename,
      line: event.lineno,
      column: event.colno,
      stack: event.error?.stack,
      timestamp: new Date().toISOString()
    };
    
    // コンテキスト情報の追加
    const contextInfo = {
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    };
    
    // エラーをログに記録
    this.appLogger.error(
      `JavaScriptエラー: ${event.message}`,
      event.error,
      {
        ...errorInfo,
        context: contextInfo
      }
    );
  }
  
  private handlePromiseRejection(event: PromiseRejectionEvent): void {
    const reason = event.reason;
    const message = reason instanceof Error ? reason.message : String(reason);
    
    // 無視すべきエラーはスキップ
    if (this.shouldIgnoreError(message)) {
      return;
    }
    
    const errorInfo = {
      message,
      stack: reason instanceof Error ? reason.stack : undefined,
      timestamp: new Date().toISOString()
    };
    
    // コンテキスト情報の追加
    const contextInfo = {
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    };
    
    // エラーをログに記録
    this.appLogger.error(
      `未処理のPromise例外: ${message}`,
      reason instanceof Error ? reason : new Error(message),
      {
        ...errorInfo,
        context: contextInfo
      }
    );
  }
  
  // 手動エラー記録メソッド
  public captureError(error: Error, context?: any): void {
    // 無視すべきエラーはスキップ
    if (this.shouldIgnoreError(error.message)) {
      return;
    }
    
    // コンテキスト情報の追加
    const contextInfo = {
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      ...context
    };
    
    // エラーをログに記録
    this.appLogger.error(
      `キャプチャしたエラー: ${error.message}`,
      error,
      { context: contextInfo }
    );
  }
  
  // React エラー境界用ハンドラー
  public captureReactError(error: Error, componentStack: string, componentName?: string): void {
    // 無視すべきエラーはスキップ
    if (this.shouldIgnoreError(error.message)) {
      return;
    }
    
    // エラーをログに記録
    this.appLogger.error(
      `Reactコンポーネントエラー: ${componentName || 'Unknown'}`,
      error,
      {
        componentStack,
        url: window.location.href
      }
    );
  }
}

// アプリケーション起動時に初期化
export const errorTracker = ErrorTracker.getInstance();

// Reactエラー境界コンポーネント用のヘルパー
export const reportReactError = (error: Error, componentStack: string, componentName?: string): void => {
  ErrorTracker.getInstance().captureReactError(error, componentStack, componentName);
};
```

## 11. まとめ

本ドキュメントでは、ヘルパーシステムフロントエンドにおけるログ機能の実装方法について説明しました。特に以下の点に焦点を当てています：

1. **包括的なログ収集**: アプリケーションログ、ユーザーアクションログ、パフォーマンスログの3種類のログを実装し、クライアント側で発生する重要な情報を収集します。

2. **効率的なデータ送信**: バッファリングと非同期送信を活用して、アプリケーションのパフォーマンスへの影響を最小限に抑えながら、必要なデータを確実に送信します。

3. **プライバシーとセキュリティ**: 個人情報や機密データの適切な処理と保護を行い、ユーザーのプライバシーを尊重します。

4. **バックエンド連携**: バックエンドのログシステムとシームレスに連携し、エンドツーエンドのログ分析を可能にします。

5. **ユーザー体験の理解**: セッショントラッキングとユーザージャーニー分析によって、実際のユーザー行動を可視化し、アプリケーションの改善に役立てます。

これらの機能により、開発チームはアプリケーションの動作状況を総合的に監視し、問題の早期発見や機能改善に必要なデータを取得できるようになります。

最終更新日: 2025-05-01
```

### 3.3 ログ送信モジュール

```typescript
// src/logs/LogTransport.ts
import { LogEntry, LogTransportConfig, LogType } from './types';
import { Api } from '../services/api';

const DEFAULT_CONFIG: LogTransportConfig = {
  batchSize: 20,
  maxBufferSize: 100,
  flushInterval: 30000, // 30秒
  retryLimit: 3,
  retryInterval: 5000, // 5秒
  endpoint: '/api/logs/client'
};

export class LogTransport {
  private buffer: LogEntry[] = [];
  private config: LogTransportConfig;
  private flushTimerId: any = null;
  private isSending: boolean = false;
  private api: Api;
  private isPageUnloading: boolean = false;

  constructor(api: Api, config: Partial<LogTransportConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.api = api;
    
    // フラッシュタイマーの開始
    this.startFlushTimer();
    
    // ページアンロード時の処理
    window.addEventListener('beforeunload', this.handleBeforeUnload);
    
    // オフライン/オンライン検出
    window.addEventListener('online', this.handleOnline);
  }

  public addLog(entry: LogEntry): void {
    // タイムスタンプの設定
    if (!entry.timestamp) {
      entry.timestamp = Date.now();
    }
    
    // 送信試行回数の初期化
    if (entry.sendAttempts === undefined) {
      entry.sendAttempts = 0;
    }
    
    this.buffer.push(entry);
    
    // バッファがしきい値を超えた場合、フラッシュ
    if (this.buffer.length >= this.config.batchSize) {
      this.flush();
    }
    
    // クリティカルなエラーは即時送信
    if (
      entry.type === LogType.APP && 
      'level' in entry.payload && 
      entry.payload.level === 'CRITICAL'
    ) {
      this.flush();
    }
  }

  public async flush(): Promise<void> {
    if (this.isSending || this.buffer.length === 0) {
      return;
    }
    
    this.isSending = true;
    
    try {
      // バッファからログを取得（優先度順）
      const sortedBuffer = [...this.buffer].sort((a, b) => b.priority - a.priority);
      const logsToSend = sortedBuffer.slice(0, this.config.batchSize);
      
      // カテゴリごとにログを分類
      const logsByType: Record<LogType, any[]> = {
        [LogType.APP]: [],
        [LogType.USER_ACTION]: [],
        [LogType.PERFORMANCE]: []
      };
      
      logsToSend.forEach(entry => {
        logsByType[entry.type].push(entry.payload);
      });
      
      // 非同期送信（ページアンロード時はbeacon APIを使用）
      if (this.isPageUnloading) {
        const blob = new Blob([JSON.stringify(logsByType)], { type: 'application/json' });
        navigator.sendBeacon(this.config.endpoint, blob);
        
        // ページアンロード時は送信成功と見なし、バッファをクリア
        this.buffer = this.buffer.filter(entry => !logsToSend.includes(entry));
      } else {
        // 通常の非同期リクエスト
        await this.api.post(this.config.endpoint, logsByType);
        
        // 送信成功したログをバッファから削除
        this.buffer = this.buffer.filter(entry => !logsToSend.includes(entry));
      }
    } catch (error) {
      // 送信失敗時の再試行カウント更新
      this.buffer.forEach(entry => {
        if (entry.sendAttempts !== undefined && entry.sendAttempts >= this.config.retryLimit) {
          // 再試行上限に達したログは削除
          this.buffer = this.buffer.filter(e => e !== entry);
        }
      });
      
      console.error('ログの送信に失敗しました', error);
    } finally {
      this.isSending = false;
    }
  }

  private startFlushTimer(): void {
    this.flushTimerId = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  private stopFlushTimer(): void {
    if (this.flushTimerId) {
      clearInterval(this.flushTimerId);
      this.flushTimerId = null;
    }
  }

  private handleBeforeUnload = (): void => {
    this.isPageUnloading = true;
    this.stopFlushTimer();
    this.flush();
  }

  private handleOnline = (): void => {
    // オンラインに戻った時、保留中のログを送信
    this.flush();
  }

  // クリーンアップ
  public destroy(): void {
    this.stopFlushTimer();
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    window.removeEventListener('online', this.handleOnline);
  }
}
```

### 3.4 アプリケーションロガー

```typescript
// src/logs/AppLogger.ts
import { AppLogPayload, LogLevel, LogType } from './types';
import { LogTransport } from './LogTransport';
import { getClientInfo, getSessionId } from './utils';

export class AppLogger {
  private transport: LogTransport;
  private source: string;

  constructor(transport: LogTransport, source: string = 'APP') {
    this.transport = transport;
    this.source = source;
  }

  // ログレベルに応じたメソッド
  public debug(message: string, additionalData?: any): void {
    this.log('DEBUG', message, additionalData);
  }

  public info(message: string, additionalData?: any): void {
    this.log('INFO', message, additionalData);
  }

  public warning(message: string, additionalData?: any): void {
    this.log('WARNING', message, additionalData);
  }

  public error(message: string, error?: Error, additionalData?: any): void {
    this.log('ERROR', message, additionalData, error);
  }

  public critical(message: string, error?: Error, additionalData?: any): void {
    this.log('CRITICAL', message, additionalData, error);
  }

  // 内部ログメソッド
  private log(level: LogLevel, message: string, additionalData?: any, error?: Error): void {
    const userId = this.getUserId();
    const sessionId = getSessionId();
    
    const payload: AppLogPayload = {
      level,
      source: this.source,
      message,
      timestamp: new Date().toISOString(),
      sessionId,
      userId,
      location: window.location.href,
      userAgent: navigator.userAgent,
      clientInfo: getClientInfo(),
      additionalData
    };
    
    // エラーがある場合はスタックトレースを追加
    if (error && error.stack) {
      payload.stack = error.stack;
    }
    
    // ログトランスポートに送信（優先度はレベルに応じて設定）
    this.transport.addLog({
      type: LogType.APP,
      payload,
      timestamp: Date.now(),
      priority: this.getPriorityFromLevel(level)
    });
    
    // コンソールにも出力（開発環境のみ）
    if (process.env.NODE_ENV === 'development') {
      const method = level.toLowerCase() as keyof Console;
      if (typeof console[method] === 'function') {
        console[method](`[${level}][${this.source}] ${message}`, additionalData, error);
      } else {
        console.log(`[${level}][${this.source}] ${message}`, additionalData, error);
      }
    }
  }

  // ログレベルから優先度を取得
  private getPriorityFromLevel(level: LogLevel): number {
    switch (level) {
      case 'CRITICAL': return 100;
      case 'ERROR': return 80;
      case 'WARNING': return 60;
      case 'INFO': return 40;
      case 'DEBUG': return 20;
      default: return 0;
    }
  }

  // ユーザーIDを取得（認証情報から）
  private getUserId(): number | undefined {
    try {
      // ローカルストレージやステートから認証情報を取得
      const authData = JSON.parse(localStorage.getItem('auth') || '{}');
      return authData.userId;
    } catch (e) {
      return undefined;
    }
  }

  // ソース（コンポーネント名など）を設定
  public setSource(source: string): void {
    this.source = source;
  }
}
```

### 3.5 ユーザーアクションロガー

```typescript
// src/logs/UserActionLogger.ts
import { UserActionPayload, LogType } from './types';
import { LogTransport } from './LogTransport';
import { getClientInfo, getSessionId } from './utils';

export class UserActionLogger {
  private transport: LogTransport;

  constructor(transport: LogTransport) {
    this.transport = transport;
  }

  // ユーザーアクションを記録
  public logAction(
    action: string,
    element?: string,
    elementId?: string,
    resourceType?: string,
    resourceId?: string,
    previousState?: any,
    newState?: any,
    metadata?: any
  ): void {
    const userId = this.getUserId();
    const sessionId = getSessionId();
    
    const payload: UserActionPayload = {
      action,
      element,
      elementId,
      resourceType,
      resourceId,
      previousState,
      newState,
      metadata,
      timestamp: new Date().toISOString(),
      sessionId,
      userId,
      location: window.location.href,
      userAgent: navigator.userAgent,
      clientInfo: getClientInfo()
    };
    
    this.transport.addLog({
      type: LogType.USER_ACTION,
      payload,
      timestamp: Date.now(),
      priority: 50 // 標準優先度
    });
  }

  // クリック操作を記録
  public logClick(
    element: string,
    elementId?: string,
    resourceType?: string,
    resourceId?: string,
    metadata?: any
  ): void {
    this.logAction('CLICK', element, elementId, resourceType, resourceId, null, null, metadata);
  }

  // フォーム送信を記録
  public logSubmit(
    formId: string,
    formData: any,
    resourceType?: string,
    resourceId?: string
  ): void {
    // 機密情報（パスワードなど）をフィルタリング
    const safeFormData = this.sanitizeFormData(formData);
    
    this.logAction('SUBMIT', 'FORM', formId, resourceType, resourceId, null, safeFormData);
  }

  // ページナビゲーションを記録
  public logNavigation(
    fromPath: string,
    toPath: string,
    navigationMethod: 'LINK' | 'REDIRECT' | 'HISTORY' | 'DIRECT' = 'LINK'
  ): void {
    this.logAction('NAVIGATE', 'PAGE', undefined, 'PAGE', undefined, 
      { path: fromPath }, 
      { path: toPath }, 
      { navigationMethod }
    );
  }

  // ユーザーIDを取得（認証情報から）
  private getUserId(): number | undefined {
    try {
      const authData = JSON.parse(localStorage.getItem('auth') || '{}');
      return authData.userId;
    } catch (e) {
      return undefined;
    }
  }

  // 機密情報をフィルタリング
  private sanitizeFormData(formData: any): any {
    if (!formData) return formData;
    
    const sensitiveFields = ['password', 'newPassword', 'currentPassword', 'passwordConfirmation', 'credit_card', 'creditCard'];
    const sanitized = { ...formData };
    
    sensitiveFields.forEach(field => {
      if (field in sanitized) {
        sanitized[field] = '********';
      }
    });
    
    return sanitized;
  }
}
```

### 3.6 パフォーマンスロガー

```typescript
// src/logs/PerformanceLogger.ts
import { PerformancePayload, LogType } from './types';
import { LogTransport } from './LogTransport';
import { getClientInfo, getSessionId, getResourceName } from './utils';

interface ApiCallTiming {
  endpoint: string;
  method: string;
  startTime: number;
  endTime?: number;
  status?: number;
}

export class PerformanceLogger {
  private transport: LogTransport;
  private navigationStartTime: number;
  private apiCalls: Map<string, ApiCallTiming> = new Map();
  private isInitialized: boolean = false;
  
  // Web Vitalsメトリクス
  private metrics: {
    firstPaint?: number;
    firstContentfulPaint?: number;
    largestContentfulPaint?: number;
    firstInputDelay?: number;
    cumulativeLayoutShift?: number;
  } = {};

  constructor(transport: LogTransport) {
    this.transport = transport;
    this.navigationStartTime = performance.now();
    
    // 初期化
    this.initialize();
  }

  private initialize(): void {
    if (this.isInitialized) return;
    
    // パフォーマンスオブザーバーの設定（モダンブラウザのみ）
    if ('PerformanceObserver' in window) {
      this.setupPerformanceObservers();
    }
    
    // ページロード完了時のメトリクス記録
    window.addEventListener('load', this.handlePageLoad);
    
    this.isInitialized = true;
  }

  // パフォーマンスオブザーバーを設定
  private setupPerformanceObservers(): void {
    // 初回描画と初回コンテンツ描画の監視
    const paintObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-paint') {
          this.metrics.firstPaint = entry.startTime;
        } else if (entry.name === 'first-contentful-paint') {
          this.metrics.firstContentfulPaint = entry.startTime;
        }
      }
    });
    
    paintObserver.observe({ type: 'paint', buffered: true });
    
    // 最大コンテンツ描画の監視（Core Web Vitals）
    if (PerformanceObserver.supportedEntryTypes.includes('largest-contentful-paint')) {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.metrics.largestContentfulPaint = lastEntry.startTime;
        }
      });
      
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    }
    
    // 初回入力遅延の監視（Core Web Vitals）
    if (PerformanceObserver.supportedEntryTypes.includes('first-input')) {
      const fidObserver = new PerformanceObserver((entryList) => {
        const firstInput = entryList.getEntries()[0];
        if (firstInput) {
          this.metrics.firstInputDelay = firstInput.processingStart - firstInput.startTime;
        }
      });
      
      fidObserver.observe({ type: 'first-input', buffered: true });
    }
    
    // 累積レイアウトシフトの監視（Core Web Vitals）
    if (PerformanceObserver.supportedEntryTypes.includes('layout-shift')) {
      let cumulativeScore = 0;
      
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          // 予期しないレイアウトシフトのみ加算
          if (!(entry as any).hadRecentInput) {
            cumulativeScore += (entry as any).value;
          }
        }
        
        this.metrics.cumulativeLayoutShift = cumulativeScore;
      });
      
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    }
  }

  // API呼び出しの開始を記録
  public startApiCall(endpoint: string, method: string): string {
    const callId = `${method}:${endpoint}:${Date.now()}`;
    this.apiCalls.set(callId, {
      endpoint,
      method,
      startTime: performance.now()
    });
    
    return callId;
  }

  // API呼び出しの終了を記録
  public endApiCall(callId: string, status: number): void {
    const call = this.apiCalls.get(callId);
    if (call) {
      call.endTime = performance.now();
      call.status = status;
    }
  }

  // ページロード時のパフォーマンスメトリクスを記録
  private handlePageLoad = (): void => {
    setTimeout(() => {
      this.logPageLoad();
    }, 0);
  }

  // パフォーマンスメトリクスを収集して送信
  private logPageLoad(): void {
    // 基本的なタイミング情報を取得
    const performanceEntries = performance.getEntriesByType('navigation');
    let loadTime = 0;
    let domContentLoaded = 0;
    
    if (performanceEntries.length > 0 && 'domComplete' in performanceEntries[0]) {
      const navigationEntry = performanceEntries[0] as PerformanceNavigationTiming;
      loadTime = navigationEntry.loadEventEnd - navigationEntry.startTime;
      domContentLoaded = navigationEntry.domContentLoadedEventEnd - navigationEntry.startTime;
    } else {
      // フォールバック: 従来のAPIを使用
      const timings = performance.timing;
      loadTime = timings.loadEventEnd - timings.navigationStart;
      domContentLoaded = timings.domContentLoadedEventEnd - timings.navigationStart;
    }
    
    // リソース読み込み時間の収集
    const resourceLoadTimes: Record<string, number> = {};
    const resources = performance.getEntriesByType('resource');
    resources.forEach(resource => {
      const name = getResourceName(resource.name);
      resourceLoadTimes[name] = resource.duration;
    });
    
    // メモリ使用量（Chrome系ブラウザのみ）
    let memoryUsage: number | undefined;
    if (performance.memory) {
      memoryUsage
    };
    
    // ログの送信
    this.transport.addLog({
      type: LogType.PERFORMANCE,
      payload,
      timestamp: Date.now(),
      priority: 40 // パフォーマンスログの標準優先度
    });
    
    // APIコール履歴をリセット
    this.apiCalls.clear();
  }
  
  // ユーザーIDを取得（認証情報から）
  private getUserId(): number | undefined {
    try {
      const authData = JSON.parse(localStorage.getItem('auth') || '{}');
      return authData.userId;
    } catch (e) {
      return undefined;
    }
  }
  
  // クリーンアップ
  public destroy(): void {
    window.removeEventListener('load', this.handlePageLoad);
  }
} = Math.round(performance.memory.usedJSHeapSize / (1024 * 1024));
    }
    
    // API呼び出し時間の収集
    const apiCallTimes = Array.from(this.apiCalls.values())
      .filter(call => call.endTime !== undefined)
      .map(call => ({
        endpoint: call.endpoint,
        method: call.method,
        duration: (call.endTime as number) - call.startTime,
        status: call.status as number
      }));
    
    // ペイロードの作成
    const userId = this.getUserId();
    const sessionId = getSessionId();
    
    const payload: PerformancePayload = {
      pageUrl: window.location.href,
      loadTime,
      domContentLoaded,
      timestamp: new Date().toISOString(),
      sessionId,
      userId,
      location: window.location.href,
      userAgent: navigator.userAgent,
      clientInfo: getClientInfo(),
      firstPaint: this.metrics.firstPaint,
      firstContentfulPaint: this.metrics.firstContentfulPaint,
      largestContentfulPaint: this.metrics.largestContentfulPaint,
      firstInputDelay: this.metrics.firstInputDelay,
      cumulativeLayoutShift: this.metrics.cumulativeLayoutShift,
      resourceLoadTimes,
      apiCallTimes,
      memoryUsage