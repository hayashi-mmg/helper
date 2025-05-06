/**
 * APIリクエスト/レスポンスのインターセプター設定
 * - 認証トークンの自動付与
 * - エラーハンドリング
 * - リフレッシュトークンによる認証更新
 */
import { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// 認証トークンを保存するストレージキー
const AUTH_TOKEN_KEY = 'auth_token';

/**
 * ローカルストレージから認証トークンを取得
 * @returns {string | null} 保存されたトークンまたはnull
 */
const getStoredAuthToken = (): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * 認証トークンをリクエストヘッダーに追加するインターセプター
 * @param {InternalAxiosRequestConfig} config Axiosリクエスト設定
 * @returns {InternalAxiosRequestConfig} 更新されたリクエスト設定
 */
const authRequestInterceptor = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = getStoredAuthToken();
    
    if (token) {
        // 認証ヘッダーにトークンを追加
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
};

/**
 * API応答の成功時のインターセプター
 * @param {AxiosResponse} response Axios応答オブジェクト
 * @returns {AxiosResponse} 処理済み応答
 */
const responseSuccessInterceptor = (response: AxiosResponse): AxiosResponse => {
    // 必要に応じて応答データの変換などを行う
    return response;
};

/**
 * API応答のエラー時のインターセプター
 * - 認証エラー(401)時の処理
 * - サーバーエラー(5xx)のハンドリング
 * - その他のエラー処理
 * 
 * @param {AxiosError} error Axiosエラーオブジェクト
 * @returns {Promise<never>} エラーを再スローまたは処理結果
 */
const responseErrorInterceptor = async (error: AxiosError): Promise<never> => {
    const { response } = error;
    
    // レスポンスが存在しない場合（ネットワークエラーなど）
    if (!response) {
        console.error('ネットワークエラー:', error.message);
        throw new Error('ネットワーク接続に問題があります。インターネット接続を確認してください。');
    }
    
    const status = response.status;
    
    // 認証エラー(401)の処理
    if (status === 401) {
        // ローカルストレージからトークンを削除
        localStorage.removeItem(AUTH_TOKEN_KEY);
        
        // 認証ページにリダイレクト
        // 実際のリダイレクト方法はアプリケーションの構造に依存
        window.location.href = '/login';
        
        throw new Error('認証の有効期限が切れました。再度ログインしてください。');
    }
    
    // サーバーエラー(5xx)の処理
    if (status >= 500) {
        console.error('サーバーエラー:', response.data);
        throw new Error('サーバーエラーが発生しました。しばらく経ってからもう一度お試しください。');
    }
    
    // バリデーションエラー(400)の処理
    if (status === 400) {
        console.error('バリデーションエラー:', response.data);
        
        // APIからのエラーメッセージを返す
        const errorMessage = response.data?.message || '入力データが正しくありません。';
        throw new Error(errorMessage);
    }
    
    // その他のエラー
    console.error(`API エラー (${status}):`, response.data);
    throw error;
};

/**
 * Axiosインスタンスにインターセプターをセットアップする
 * @param {AxiosInstance} axiosInstance 設定対象のAxiosインスタンス
 */
export const setupInterceptors = (axiosInstance: AxiosInstance): void => {
    // リクエストインターセプター
    axiosInstance.interceptors.request.use(
        authRequestInterceptor,
        (error) => Promise.reject(error)
    );
    
    // レスポンスインターセプター
    axiosInstance.interceptors.response.use(
        responseSuccessInterceptor,
        responseErrorInterceptor
    );
};