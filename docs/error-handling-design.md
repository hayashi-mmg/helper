# ヘルパーシステム エラーハンドリング設計書

## 1. 概要

本設計書はヘルパーシステムにおけるエラーハンドリングの詳細設計を定義します。バックエンドとフロントエンドでの一貫したエラー処理を実現し、ユーザーに適切なフィードバックを提供するための設計を示します。

## 2. エラー分類体系

エラーを以下のカテゴリに分類し、一貫した処理を適用します。

### 2.1 エラーカテゴリ

| エラーカテゴリ | コードプレフィックス | 説明 |
|------------|-----------------|------|
| 認証・認可エラー | AUTH | ログイン、認証トークン、権限に関するエラー |
| 入力検証エラー | VALID | ユーザー入力の検証に関するエラー |
| リソースエラー | RSRC | リソースの存在・アクセスに関するエラー |
| 外部サービスエラー | EXT | 外部APIやサービスとの連携に関するエラー |
| システムエラー | SYS | 内部システムエラー |
| ネットワークエラー | NET | ネットワーク通信に関するエラー |

### 2.2 エラーコード体系

エラーコードは以下の形式で定義します。

```
ERR_[カテゴリ]_[3桁の連番]
```

例：
- `ERR_AUTH_001` - ログイン認証失敗
- `ERR_VALID_001` - 必須フィールド未入力
- `ERR_RSRC_001` - リソースが見つからない

## 3. バックエンドエラー処理

### 3.1 エラーレスポンス形式

すべてのAPIエラーレスポンスは以下の統一された形式で返却します。

```json
{
  "status": "error",
  "code": "ERR_XXX_NNN",
  "message": "人間が理解できるエラーメッセージ",
  "details": {
    "field": "エラーが発生したフィールド（該当する場合）",
    "reason": "詳細な理由",
    "timestamp": "2025-05-01T12:34:56Z",
    "request_id": "一意のリクエスト識別子"
  }
}
```

### 3.2 エラーコード定義

以下に主要なエラーコードとその詳細を定義します。

#### 3.2.1 認証・認可エラー (AUTH)

| エラーコード | HTTPステータス | メッセージ | 発生状況 |
|------------|--------------|---------|---------|
| ERR_AUTH_001 | 401 | ログインに失敗しました。ユーザー名またはパスワードが正しくありません。 | ログイン失敗時 |
| ERR_AUTH_002 | 401 | 認証トークンが無効または期限切れです。 | 無効なトークンでのアクセス時 |
| ERR_AUTH_003 | 403 | このリソースにアクセスする権限がありません。 | 権限のないリソースへのアクセス時 |
| ERR_AUTH_004 | 403 | アカウントが無効化されています。管理者にお問い合わせください。 | 無効化されたアカウントでのアクセス時 |
| ERR_AUTH_005 | 429 | ログイン試行回数が多すぎます。しばらく時間をおいて再試行してください。 | 連続ログイン失敗時 |

#### 3.2.2 入力検証エラー (VALID)

| エラーコード | HTTPステータス | メッセージ | 発生状況 |
|------------|--------------|---------|---------|
| ERR_VALID_001 | 422 | 必須フィールドが入力されていません。 | 必須フィールドが未入力の場合 |
| ERR_VALID_002 | 422 | 入力値が正しい形式ではありません。 | 形式不正（メールアドレスなど） |
| ERR_VALID_003 | 422 | URLが正しい形式ではありません。 | URLの形式不正 |
| ERR_VALID_004 | 422 | パスワードが要件を満たしていません。 | パスワード要件非準拠 |
| ERR_VALID_005 | 413 | ファイルサイズが大きすぎます。最大10MBまで。 | アップロードサイズ超過 |
| ERR_VALID_006 | 415 | サポートされていないファイル形式です。 | 非対応ファイル形式 |

#### 3.2.3 リソースエラー (RSRC)

| エラーコード | HTTPステータス | メッセージ | 発生状況 |
|------------|--------------|---------|---------|
| ERR_RSRC_001 | 404 | リクエストされたリソースが見つかりません。 | リソースが存在しない |
| ERR_RSRC_002 | 410 | このリソースはもう利用できません。 | 削除済みリソース |
| ERR_RSRC_003 | 409 | リソースが既に存在します。 | 重複作成 |
| ERR_RSRC_004 | 423 | リソースは現在ロックされています。 | 編集中のリソース |

#### 3.2.4 外部サービスエラー (EXT)

| エラーコード | HTTPステータス | メッセージ | 発生状況 |
|------------|--------------|---------|---------|
| ERR_EXT_001 | 502 | 外部サービスへの接続に失敗しました。 | 外部API接続失敗 |
| ERR_EXT_002 | 504 | 外部サービスからの応答がタイムアウトしました。 | 外部APIタイムアウト |
| ERR_EXT_003 | 502 | レシピ情報の取得に失敗しました。 | レシピURL解析失敗 |

#### 3.2.5 システムエラー (SYS)

| エラーコード | HTTPステータス | メッセージ | 発生状況 |
|------------|--------------|---------|---------|
| ERR_SYS_001 | 500 | 内部サーバーエラーが発生しました。 | 予期せぬサーバーエラー |
| ERR_SYS_002 | 503 | サービスは現在利用できません。メンテナンス中の可能性があります。 | サービス停止時 |
| ERR_SYS_003 | 500 | データベース操作に失敗しました。 | DB操作エラー |

### 3.3 バックエンドでの実装

#### 3.3.1 例外クラス階層

```python
# app/exceptions.py
class BaseException(Exception):
    """ベース例外クラス"""
    def __init__(self, 
                code: str, 
                message: str, 
                details: dict = None, 
                status_code: int = 500):
        self.code = code
        self.message = message
        self.details = details or {}
        self.status_code = status_code
        super().__init__(self.message)

class AuthException(BaseException):
    """認証・認可関連の例外"""
    def __init__(self, code: str, message: str, details: dict = None, status_code: int = 401):
        super().__init__(code, message, details, status_code)

class ValidationException(BaseException):
    """入力検証関連の例外"""
    def __init__(self, code: str, message: str, details: dict = None, status_code: int = 422):
        super().__init__(code, message, details, status_code)

class ResourceException(BaseException):
    """リソース関連の例外"""
    def __init__(self, code: str, message: str, details: dict = None, status_code: int = 404):
        super().__init__(code, message, details, status_code)

class ExternalServiceException(BaseException):
    """外部サービス関連の例外"""
    def __init__(self, code: str, message: str, details: dict = None, status_code: int = 502):
        super().__init__(code, message, details, status_code)

class SystemException(BaseException):
    """システム関連の例外"""
    def __init__(self, code: str, message: str, details: dict = None, status_code: int = 500):
        super().__init__(code, message, details, status_code)
```

#### 3.3.2 グローバル例外ハンドラー

```python
# app/core/errors.py
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError
import uuid
import logging
from datetime import datetime, timezone
from app.exceptions import BaseException, AuthException, ValidationException, ResourceException, ExternalServiceException, SystemException

logger = logging.getLogger("app")

def setup_exception_handlers(app: FastAPI) -> None:
    """アプリケーションに例外ハンドラを登録"""
    
    @app.exception_handler(BaseException)
    async def base_exception_handler(request: Request, exc: BaseException):
        """カスタム例外のハンドラ"""
        # リクエストIDの生成
        request_id = str(uuid.uuid4())
        
        # 詳細情報に追加
        details = exc.details.copy() if exc.details else {}
        details.update({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "request_id": request_id,
            "path": request.url.path
        })
        
        # エラーログ記録
        logger.error(
            f"Error: {exc.code} - {exc.message}", 
            extra={
                "request_id": request_id,
                "error_code": exc.code,
                "client_ip": request.client.host,
                "path": request.url.path,
                "method": request.method
            }
        )
        
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "status": "error",
                "code": exc.code,
                "message": exc.message,
                "details": details
            }
        )
    
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        """リクエスト検証エラーのハンドラ"""
        request_id = str(uuid.uuid4())
        
        # エラー内容から適切なメッセージ生成
        errors = exc.errors()
        error_messages = []
        error_fields = {}
        
        for error in errors:
            location = error.get("loc", [])
            field = location[-1] if len(location) > 0 else "unknown"
            error_type = error.get("type", "")
            msg = error.get("msg", "")
            
            error_fields[field] = msg
            error_messages.append(f"{field}: {msg}")
        
        message = "入力データの検証に失敗しました。"
        if error_messages:
            message = error_messages[0]
        
        # エラーログ記録
        logger.warning(
            f"Validation error: {message}",
            extra={
                "request_id": request_id,
                "error_code": "ERR_VALID_001",
                "validation_errors": errors,
                "client_ip": request.client.host,
                "path": request.url.path
            }
        )
        
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "status": "error",
                "code": "ERR_VALID_001",
                "message": message,
                "details": {
                    "fields": error_fields,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "request_id": request_id
                }
            }
        )
    
    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
        """データベースエラーのハンドラ"""
        request_id = str(uuid.uuid4())
        
        # エラー種別に応じたコード設定
        error_code = "ERR_SYS_003"
        error_message = "データベース操作に失敗しました。"
        
        # 詳細なエラーログ（開発環境/本番環境で出し分け）
        logger.error(
            f"Database error: {str(exc)}",
            extra={
                "request_id": request_id,
                "error_code": error_code,
                "exception_type": type(exc).__name__,
                "client_ip": request.client.host,
                "path": request.url.path
            },
            exc_info=True  # スタックトレース含む
        )
        
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "status": "error",
                "code": error_code,
                "message": error_message,
                "details": {
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "request_id": request_id
                }
            }
        )
    
    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        """一般的な例外のハンドラ"""
        request_id = str(uuid.uuid4())
        
        error_code = "ERR_SYS_001"
        error_message = "内部サーバーエラーが発生しました。"
        
        # 詳細なエラーログ
        logger.error(
            f"Unhandled exception: {str(exc)}",
            extra={
                "request_id": request_id,
                "error_code": error_code,
                "exception_type": type(exc).__name__,
                "client_ip": request.client.host,
                "path": request.url.path,
                "method": request.method
            },
            exc_info=True
        )
        
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "status": "error",
                "code": error_code,
                "message": error_message,
                "details": {
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "request_id": request_id
                }
            }
        )
```

#### 3.3.3 例外使用例

```python
# app/services/recipe_service.py
from app.exceptions import ValidationException, ResourceException, ExternalServiceException

async def get_recipe_by_url(url: str):
    """URLからレシピ情報を取得"""
    # URL形式チェック
    if not is_valid_url(url):
        raise ValidationException(
            code="ERR_VALID_003",
            message="URLが正しい形式ではありません。",
            details={"field": "recipe_url", "value": url}
        )
    
    # 対応サイトチェック
    if not is_supported_recipe_site(url):
        raise ValidationException(
            code="ERR_VALID_007",
            message="このレシピサイトは現在サポートされていません。",
            details={"supported_sites": ["cookpad.com", "recipe.rakuten.co.jp"]}
        )
    
    try:
        # 外部サイトからレシピ情報取得処理
        recipe_data = await fetch_recipe_data(url)
        
        if not recipe_data:
            raise ResourceException(
                code="ERR_RSRC_005",
                message="指定されたURLからレシピ情報を取得できませんでした。",
                details={"url": url}
            )
        
        return recipe_data
        
    except ConnectionError:
        raise ExternalServiceException(
            code="ERR_EXT_001",
            message="レシピサイトへの接続に失敗しました。しばらく経ってから再試行してください。",
            details={"url": url}
        )
    except TimeoutError:
        raise ExternalServiceException(
            code="ERR_EXT_002",
            message="レシピサイトからの応答がタイムアウトしました。しばらく経ってから再試行してください。",
            details={"url": url}
        )
    except Exception as e:
        raise ExternalServiceException(
            code="ERR_EXT_003",
            message="レシピ情報の取得中にエラーが発生しました。",
            details={"url": url, "error": str(e)}
        )
```

## 4. フロントエンドエラー処理

### 4.1 エラー状態管理

Zustandを使用したエラー状態管理ストアを実装します。

```typescript
// src/store/errorStore.ts
import create from 'zustand';

export interface ErrorState {
  hasError: boolean;
  errorCode: string | null;
  errorMessage: string | null;
  errorDetails: any | null;
  requestId: string | null;
  
  setError: (code: string, message: string, details?: any, requestId?: string) => void;
  clearError: () => void;
  
  // フィールドエラー管理
  fieldErrors: Record<string, string>;
  setFieldError: (field: string, message: string) => void;
  clearFieldError: (field: string) => void;
  clearAllFieldErrors: () => void;
  hasFieldErrors: () => boolean;
}

export const useErrorStore = create<ErrorState>((set, get) => ({
  hasError: false,
  errorCode: null,
  errorMessage: null,
  errorDetails: null,
  requestId: null,
  
  setError: (code, message, details = null, requestId = null) => set({
    hasError: true,
    errorCode: code,
    errorMessage: message,
    errorDetails: details,
    requestId
  }),
  
  clearError: () => set({
    hasError: false,
    errorCode: null,
    errorMessage: null,
    errorDetails: null,
    requestId: null
  }),
  
  // フィールドエラー管理
  fieldErrors: {},
  
  setFieldError: (field, message) => set(state => ({
    fieldErrors: { ...state.fieldErrors, [field]: message }
  })),
  
  clearFieldError: (field) => set(state => {
    const { [field]: _, ...rest } = state.fieldErrors;
    return { fieldErrors: rest };
  }),
  
  clearAllFieldErrors: () => set({ fieldErrors: {} }),
  
  hasFieldErrors: () => Object.keys(get().fieldErrors).length > 0
}));
```

### 4.2 APIクライアントエラーハンドリング

Axiosインターセプターを使用してAPIエラーを一元的に処理します。

```typescript
// src/services/api.ts
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useErrorStore } from '../store/errorStore';
import { useAuthStore } from '../store/authStore';

// APIクライアントの作成
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// レスポンスインターセプター
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const { setError, setFieldError, clearAllFieldErrors } = useErrorStore.getState();
    const { logout } = useAuthStore.getState();
    
    // エラーレスポンスがある場合
    if (error.response) {
      const { status, data } = error.response;
      
      // APIからのエラー情報
      if (data && typeof data === 'object') {
        const errorData = data as any;
        const errorCode = errorData.code || 'ERR_UNKNOWN';
        const errorMessage = errorData.message || '予期せぬエラーが発生しました。';
        const errorDetails = errorData.details || {};
        const requestId = errorDetails.request_id;
        
        // フィールドエラーの処理
        clearAllFieldErrors();
        if (errorDetails.fields) {
          Object.entries(errorDetails.fields).forEach(([field, message]) => {
            setFieldError(field, message as string);
          });
        }
        
        // グローバルエラーの設定
        setError(errorCode, errorMessage, errorDetails, requestId);
        
        // 認証エラーの特別処理
        if (status === 401 && errorCode === 'ERR_AUTH_002') {
          // トークン無効の場合はログアウト
          logout();
          // リダイレクト処理を追加可能
        }
      } else {
        // APIからのエラー情報がない場合はHTTPステータスに基づく汎用エラー
        const statusMessages: Record<number, string> = {
          400: '不正なリクエストです。',
          401: '認証に失敗しました。再ログインしてください。',
          403: 'このリソースにアクセスする権限がありません。',
          404: 'リソースが見つかりません。',
          409: 'リソースの競合が発生しました。',
          422: '入力データが不正です。',
          429: 'リクエスト回数が多すぎます。しばらく時間をおいてください。',
          500: 'サーバーエラーが発生しました。',
          502: '外部サービスとの通信に失敗しました。',
          503: 'サービスは現在利用できません。',
          504: '外部サービスからの応答がタイムアウトしました。'
        };
        
        const message = statusMessages[status] || '予期せぬエラーが発生しました。';
        setError(`ERR_HTTP_${status}`, message);
      }
    } else if (error.request) {
      // リクエストは送信されたがレスポンスがない場合（ネットワークエラー等）
      setError('ERR_NET_001', 'サーバーに接続できません。インターネット接続を確認してください。');
    } else {
      // リクエスト設定中のエラー
      setError('ERR_REQ_001', error.message || '予期せぬエラーが発生しました。');
    }
    
    // エラーをログに記録
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    return Promise.reject(error);
  }
);

// リクエストインターセプター
api.interceptors.request.use(
  (config) => {
    // 認証トークンの追加
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // エラー状態をクリア
    const { clearError, clearAllFieldErrors } = useErrorStore.getState();
    clearError();
    clearAllFieldErrors();
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
```

### 4.3 エラー表示コンポーネント

#### 4.3.1 グローバルエラーアラート

```tsx
// src/components/errors/ErrorAlert.tsx
import React, { useEffect } from 'react';
import { 
  Alert, 
  AlertIcon, 
  AlertTitle, 
  AlertDescription, 
  CloseButton,
  Box
} from '@chakra-ui/react';
import { useErrorStore } from '../../store/errorStore';

interface ErrorAlertProps {
  autoHideDuration?: number;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ 
  autoHideDuration = 0 // 0は自動非表示なし
}) => {
  const { hasError, errorCode, errorMessage, clearError } = useErrorStore();
  
  // 自動非表示
  useEffect(() => {
    if (hasError && autoHideDuration > 0) {
      const timer = setTimeout(() => {
        clearError();
      }, autoHideDuration);
      
      return () => clearTimeout(timer);
    }
  }, [hasError, autoHideDuration, clearError]);
  
  if (!hasError) {
    return null;
  }
  
  // エラータイプに応じたアラートのスタイル設定
  let status: 'error' | 'warning' | 'info' = 'error';
  if (errorCode?.startsWith('ERR_VALID_')) {
    status = 'warning';
  } else if (errorCode?.startsWith('ERR_NET_')) {
    status = 'warning';
  }
  
  return (
    <Alert 
      status={status} 
      variant="solid" 
      borderRadius="md" 
      mb={4}
    >
      <AlertIcon />
      <Box flex="1">
        <AlertTitle fontSize="lg">
          {errorCode ? `${errorCode}` : 'エラー'}
        </AlertTitle>
        <AlertDescription display="block">
          {errorMessage}
        </AlertDescription>
      </Box>
      <CloseButton 
        position="absolute" 
        right="8px" 
        top="8px" 
        onClick={clearError} 
      />
    </Alert>
  );
};

export default ErrorAlert;
```

#### 4.3.2 フォームフィールドエラー

```tsx
// src/components/forms/FormField.tsx
import React from 'react';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  InputProps,
  Box
} from '@chakra-ui/react';
import { useErrorStore } from '../../store/errorStore';

interface FormFieldProps extends InputProps {
  name: string;
  label: string;
  helperText?: string;
  isRequired?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  helperText,
  isRequired = false,
  ...inputProps
}) => {
  const { fieldErrors } = useErrorStore();
  const errorMessage = fieldErrors[name];
  const hasError = Boolean(errorMessage);
  
  return (
    <FormControl 
      id={name} 
      isRequired={isRequired} 
      isInvalid={hasError}
      mb={4}
    >
      <FormLabel>{label}</FormLabel>
      <Input 
        name={name}
        aria-describedby={
          hasError ? `${name}-error` : helperText ? `${name}-helper-text` : undefined
        }
        {...inputProps} 
      />
      {hasError ? (
        <FormErrorMessage id={`${name}-error`}>{errorMessage}</FormErrorMessage>
      ) : helperText ? (
        <FormHelperText id={`${name}-helper-text`}>{helperText}</FormHelperText>
      ) : null}
    </FormControl>
  );
};

export default FormField;
```

#### 4.3.3 エラーバウンダリ

```tsx
// src/components/errors/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Button,
  Code,
  Stack
} from '@chakra-ui/react';
import { useErrorStore } from '../../store/errorStore';

interface Props {
  children: ReactNode;
  fallbackComponent?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // エラーログ送信など
    console.error('Uncaught error:', error, errorInfo);
    
    // エラーストアに通知
    const { setError } = useErrorStore.getState();
    setError(
      'ERR_UI_001', 
      'UIコンポーネントでエラーが発生しました。', 
      { 
        componentStack: errorInfo.componentStack,
        message: error.message
      }
    );
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render()