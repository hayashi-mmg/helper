/**
 * APIクライアント設定
 * ベースURLと共通ヘッダーを設定し、一元化されたAPIクライアントを提供します
 */
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { setupInterceptors } from './interceptors';

// 環境変数からAPIのベースURLを取得、未定義の場合はデフォルト値を使用
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Axiosの共通設定を行うための設定オブジェクト
 */
const defaultConfig: AxiosRequestConfig = {
    baseURL: API_BASE_URL,
    timeout: 30000, // 30秒でタイムアウト
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
};

/**
 * 共通のAPIクライアントインスタンスを作成
 * @returns {AxiosInstance} 設定済みのAxiosインスタンス
 */
export const createApiClient = (): AxiosInstance => {
    const apiClient = axios.create(defaultConfig);
    
    // インターセプターの設定
    setupInterceptors(apiClient);
    
    return apiClient;
};

// APIクライアントのシングルトンインスタンス
const apiClient = createApiClient();

export default apiClient;

/**
 * カスタム設定でAPIクライアントを作成する関数
 * 特殊なエンドポイント用に異なる設定が必要な場合に使用
 * 
 * @param {AxiosRequestConfig} config カスタムAxios設定
 * @returns {AxiosInstance} カスタム設定されたAxiosインスタンス
 */
export const createCustomApiClient = (config: AxiosRequestConfig): AxiosInstance => {
    const customConfig = {
        ...defaultConfig,
        ...config,
        headers: {
            ...defaultConfig.headers,
            ...config.headers,
        },
    };
    
    const customApiClient = axios.create(customConfig);
    setupInterceptors(customApiClient);
    
    return customApiClient;
};