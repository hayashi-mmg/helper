import axios, { AxiosError } from 'axios';

/**
 * APIエラーの種類を定義
 */
export enum ApiErrorType {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
  TIMEOUT = 'TIMEOUT',
}

/**
 * APIエラー情報の型定義
 */
export interface ApiErrorInfo {
  type: ApiErrorType;
  message: string;
  code?: number;
  details?: Record<string, string[]>;
}

/**
 * APIエラーを処理し、ユーザーフレンドリーなエラー情報を返す
 * @param error エラーオブジェクト
 * @returns APIエラー情報
 */
export function handleApiError(error: unknown): ApiErrorInfo {
  // デフォルトのエラー情報
  const defaultError: ApiErrorInfo = {
    type: ApiErrorType.UNKNOWN,
    message: '予期しないエラーが発生しました。後でもう一度お試しください',
  };

  // Axiosエラーの場合
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    // ネットワークエラー（サーバーに到達できない）
    if (!axiosError.response) {
      return {
        type: ApiErrorType.NETWORK,
        message: 'サーバーに接続できません。インターネット接続を確認してください',
      };
    }

    // タイムアウトエラー
    if (axiosError.code === 'ECONNABORTED' || axiosError.message.includes('timeout')) {
      return {
        type: ApiErrorType.TIMEOUT,
        message: 'サーバーからの応答がタイムアウトしました。後でもう一度お試しください',
      };
    }

    // レスポンスコードに基づくエラー分類
    const status = axiosError.response.status;
    const data = axiosError.response.data as any;
    
    switch (true) {
      // 認証エラー
      case status === 401:
        return {
          type: ApiErrorType.AUTH,
          message: 'メールアドレスまたはパスワードが正しくありません',
          code: status,
        };
      
      // アクセス権限エラー
      case status === 403:
        return {
          type: ApiErrorType.AUTH,
          message: 'このアクションを実行する権限がありません',
          code: status,
        };
      
      // バリデーションエラー
      case status === 422 || status === 400:
        let message = '入力内容に誤りがあります';
        const details: Record<string, string[]> = {};
        
        // FastAPIのバリデーションエラー形式
        if (data && data.detail && Array.isArray(data.detail)) {
          data.detail.forEach((item: any) => {
            const field = item.loc[item.loc.length - 1];
            if (!details[field]) {
              details[field] = [];
            }
            details[field].push(item.msg);
          });
          
          // 最初のエラーメッセージを表示
          if (data.detail.length > 0) {
            const firstError = data.detail[0];
            const field = firstError.loc[firstError.loc.length - 1];
            message = `${field}: ${firstError.msg}`;
          }
        } else if (data && data.detail && typeof data.detail === 'string') {
          message = data.detail;
        }
        
        return {
          type: ApiErrorType.VALIDATION,
          message,
          code: status,
          details,
        };
      
      // サーバーエラー
      case status >= 500:
        return {
          type: ApiErrorType.SERVER,
          message: 'サーバーエラーが発生しました。後でもう一度お試しください',
          code: status,
        };
      
      // その他のエラー
      default:
        return {
          type: ApiErrorType.UNKNOWN,
          message: data && data.detail ? data.detail : '予期しないエラーが発生しました',
          code: status,
        };
    }
  }
  
  // Errorオブジェクトの場合
  if (error instanceof Error) {
    return {
      type: ApiErrorType.UNKNOWN,
      message: error.message || defaultError.message,
    };
  }
  
  // それ以外の場合はデフォルトエラーを返す
  return defaultError;
}

/**
 * 認証関連のエラーメッセージを生成する
 * @param error エラーオブジェクト
 * @param context エラーコンテキスト（'login', 'register', 'reset'）
 * @returns ユーザーフレンドリーなエラーメッセージ
 */
export function getAuthErrorMessage(error: unknown, context: 'login' | 'register' | 'reset' = 'login'): string {
  const apiError = handleApiError(error);
  
  // コンテキスト別のカスタムメッセージ
  if (context === 'login') {
    if (apiError.type === ApiErrorType.AUTH) {
      return 'メールアドレスまたはパスワードが正しくありません';
    }
    if (apiError.type === ApiErrorType.VALIDATION) {
      return '入力内容に誤りがあります。メールアドレスとパスワードを確認してください';
    }
  } else if (context === 'register') {
    if (apiError.type === ApiErrorType.VALIDATION) {
      return apiError.message;
    }
    if (apiError.message.toLowerCase().includes('email') && apiError.message.toLowerCase().includes('exist')) {
      return 'このメールアドレスは既に登録されています';
    }
  } else if (context === 'reset') {
    if (apiError.type === ApiErrorType.VALIDATION) {
      return 'メールアドレスの形式が正しくありません';
    }
    if (apiError.type === ApiErrorType.AUTH) {
      return 'リセットトークンが無効または期限切れです';
    }
  }
  
  // デフォルトのエラーメッセージを返す
  return apiError.message;
}
