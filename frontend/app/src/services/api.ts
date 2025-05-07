import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * APIのベースURLを設定
 * 環境変数から読み込むか、デフォルト値を使用
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * APIクライアントの設定オプション
 */
interface ApiClientOptions {
    baseUrl?: string;
    timeout?: number;
    headers?: Record<string, string>;
}

/**
 * API応答の共通フォーマット
 */
export interface ApiResponse<T> {
    data: T;
    status: number;
    message?: string;
}

/**
 * API関連のエラー情報
 */
export interface ApiError {
    status: number;
    message: string;
    errors?: Record<string, string[]>;
}

/**
 * APIリクエストとReact Queryを統合するためのクラス
 */
class ApiClient {
    private instance: AxiosInstance;
    private authToken?: string;

    /**
     * APIクライアントのコンストラクタ
     * 
     * @param {ApiClientOptions} options - クライアント設定オプション
     */
    constructor(options: ApiClientOptions = {}) {
        // axiosインスタンスの作成
        this.instance = axios.create({
            baseURL: options.baseUrl || API_BASE_URL,
            timeout: options.timeout || 10000, // デフォルトのタイムアウトは10秒
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...options.headers,
            },
        });

        // リクエストインターセプター
        this.instance.interceptors.request.use(
            (config) => {
                // 認証トークンが存在する場合、ヘッダーに追加
                if (this.authToken) {
                    config.headers.Authorization = `Bearer ${this.authToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // レスポンスインターセプター
        this.instance.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                // エラーハンドリングの共通処理
                const apiError: ApiError = {
                    status: error.response?.status || 500,
                    message: error.message || 'Unknown error occurred',
                };
                
                // レスポンスボディにエラー詳細がある場合は追加
                if (error.response?.data && typeof error.response.data === 'object') {
                    const errorData = error.response.data as Record<string, unknown>;
                    if (errorData.message && typeof errorData.message === 'string') {
                        apiError.message = errorData.message;
                    }
                    if (errorData.errors && typeof errorData.errors === 'object') {
                        apiError.errors = errorData.errors as Record<string, string[]>;
                    }
                }
                
                // 認証エラーの場合の処理
                if (apiError.status === 401 || apiError.status === 403) {
                    // 認証切れをグローバル状態で管理している場合、ここでストアを更新するなどの処理
                    console.warn('Authentication error:', apiError.message);
                }
                
                // サーバーエラーの場合
                if (apiError.status >= 500) {
                    console.error('Server error:', apiError.message);
                }
                
                return Promise.reject(apiError);
            }
        );
    }

    /**
     * 認証トークンを設定する
     * 
     * @param {string} token - 設定する認証トークン
     */
    setAuthToken(token: string): void {
        this.authToken = token;
    }

    /**
     * 認証トークンをクリアする
     */
    clearAuthToken(): void {
        this.authToken = undefined;
    }

    /**
     * GETリクエストを実行する
     * 
     * @template T - レスポンスデータの型
     * @param {string} url - リクエスト先のURL（相対パス）
     * @param {AxiosRequestConfig} [config] - axiosリクエスト設定
     * @returns {Promise<T>} - レスポンスデータ
     */
    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<ApiResponse<T>> = await this.instance.get(url, config);
        return response.data.data;
    }

    /**
     * POSTリクエストを実行する
     * 
     * @template T - レスポンスデータの型
     * @template D - リクエストデータの型
     * @param {string} url - リクエスト先のURL（相対パス）
     * @param {D} [data] - リクエストボディ
     * @param {AxiosRequestConfig} [config] - axiosリクエスト設定
     * @returns {Promise<T>} - レスポンスデータ
     */
    async post<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<ApiResponse<T>> = await this.instance.post(url, data, config);
        return response.data.data;
    }

    /**
     * PUTリクエストを実行する
     * 
     * @template T - レスポンスデータの型
     * @template D - リクエストデータの型
     * @param {string} url - リクエスト先のURL（相対パス）
     * @param {D} [data] - リクエストボディ
     * @param {AxiosRequestConfig} [config] - axiosリクエスト設定
     * @returns {Promise<T>} - レスポンスデータ
     */
    async put<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<ApiResponse<T>> = await this.instance.put(url, data, config);
        return response.data.data;
    }

    /**
     * PATCHリクエストを実行する
     * 
     * @template T - レスポンスデータの型
     * @template D - リクエストデータの型
     * @param {string} url - リクエスト先のURL（相対パス）
     * @param {D} [data] - リクエストボディ
     * @param {AxiosRequestConfig} [config] - axiosリクエスト設定
     * @returns {Promise<T>} - レスポンスデータ
     */
    async patch<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<ApiResponse<T>> = await this.instance.patch(url, data, config);
        return response.data.data;
    }

    /**
     * DELETEリクエストを実行する
     * 
     * @template T - レスポンスデータの型
     * @param {string} url - リクエスト先のURL（相対パス）
     * @param {AxiosRequestConfig} [config] - axiosリクエスト設定
     * @returns {Promise<T>} - レスポンスデータ
     */
    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<ApiResponse<T>> = await this.instance.delete(url, config);
        return response.data.data;
    }
}

// シングルトンインスタンスをエクスポート
export const apiClient = new ApiClient();