import { useCallback, useState } from 'react';
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

/**
 * API処理状態の型定義
 */
interface APIState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    status: number | null;
}

/**
 * API応答の型定義
 */
interface APIResponse<T> {
    data: T | null;
    error: Error | null;
    status: number | null;
    isSuccess: boolean;
    isError: boolean;
}

/**
 * API処理オプションの型定義
 */
interface APIOptions {
    /** 自動的にエラーを処理するかどうか */
    handleError?: boolean;
    /** キャッシュキー（キャッシュが有効な場合） */
    cacheKey?: string;
    /** キャッシュの有効期間（ミリ秒） */
    cacheTTL?: number;
    /** リトライ回数 */
    retries?: number;
    /** リトライ間隔（ミリ秒） */
    retryDelay?: number;
    /** レスポンスの変換関数 */
    transform?: <R, T>(data: R) => T;
}

// APIレスポンスキャッシュ
const apiCache: Record<string, { data: any; timestamp: number }> = {};

/**
 * API通信のための汎用フック
 * @returns API関連の状態と操作メソッド
 */
const useAPI = () => {
    const [state, setState] = useState<APIState<any>>({
        data: null,
        loading: false,
        error: null,
        status: null,
    });

    /**
     * GETリクエストを実行する
     * 
     * @param url エンドポイントURL
     * @param config Axiosのリクエスト設定
     * @param options 追加オプション
     * @returns APIレスポンス
     */
    const get = useCallback(async <T>(
        url: string,
        config: AxiosRequestConfig = {},
        options: APIOptions = {}
    ): Promise<APIResponse<T>> => {
        const { 
            handleError = true, 
            cacheKey, 
            cacheTTL = 5 * 60 * 1000, 
            retries = 0,
            retryDelay = 1000,
            transform 
        } = options;

        // キャッシュされたデータがあり、有効期限内の場合はキャッシュから返す
        if (cacheKey && apiCache[cacheKey]) {
            const cachedData = apiCache[cacheKey];
            const now = Date.now();
            if (now - cachedData.timestamp < cacheTTL) {
                return {
                    data: transform ? transform(cachedData.data) : cachedData.data,
                    error: null,
                    status: 200,
                    isSuccess: true,
                    isError: false,
                };
            }
        }

        setState((prev) => ({ ...prev, loading: true, error: null }));

        let attempt = 0;
        let lastError: AxiosError | null = null;

        while (attempt <= retries) {
            try {
                const response = await axios.get<T>(url, config);
                
                // レスポンスデータを変換する（必要な場合）
                const transformedData = transform ? transform(response.data) : response.data;
                
                // 成功レスポンスをキャッシュに保存（キャッシュキーがある場合）
                if (cacheKey) {
                    apiCache[cacheKey] = {
                        data: response.data,
                        timestamp: Date.now(),
                    };
                }
                
                setState({
                    data: transformedData,
                    loading: false,
                    error: null,
                    status: response.status,
                });
                
                return {
                    data: transformedData,
                    error: null,
                    status: response.status,
                    isSuccess: true,
                    isError: false,
                };
            } catch (err) {
                lastError = err as AxiosError;
                
                // リトライ回数に達していない場合は待機してリトライ
                if (attempt < retries) {
                    await new Promise((resolve) => setTimeout(resolve, retryDelay));
                    attempt++;
                } else {
                    break;
                }
            }
        }
        
        // すべてのリトライが失敗した場合
        const error = new Error(
            lastError?.message || 
            'APIリクエストに失敗しました'
        );
        
        if (handleError) {
            setState({
                data: null,
                loading: false,
                error,
                status: lastError?.response?.status || null,
            });
        }
        
        return {
            data: null,
            error,
            status: lastError?.response?.status || null,
            isSuccess: false,
            isError: true,
        };
    }, []);

    /**
     * POSTリクエストを実行する
     * 
     * @param url エンドポイントURL
     * @param data 送信データ
     * @param config Axiosのリクエスト設定
     * @param options 追加オプション
     * @returns APIレスポンス
     */
    const post = useCallback(async <T, D = any>(
        url: string,
        data?: D,
        config: AxiosRequestConfig = {},
        options: APIOptions = {}
    ): Promise<APIResponse<T>> => {
        const { 
            handleError = true, 
            retries = 0,
            retryDelay = 1000,
            transform 
        } = options;

        setState((prev) => ({ ...prev, loading: true, error: null }));

        let attempt = 0;
        let lastError: AxiosError | null = null;

        while (attempt <= retries) {
            try {
                const response = await axios.post<T>(url, data, config);
                
                // レスポンスデータを変換する（必要な場合）
                const transformedData = transform ? transform(response.data) : response.data;
                
                setState({
                    data: transformedData,
                    loading: false,
                    error: null,
                    status: response.status,
                });
                
                return {
                    data: transformedData,
                    error: null,
                    status: response.status,
                    isSuccess: true,
                    isError: false,
                };
            } catch (err) {
                lastError = err as AxiosError;
                
                // リトライ回数に達していない場合は待機してリトライ
                if (attempt < retries) {
                    await new Promise((resolve) => setTimeout(resolve, retryDelay));
                    attempt++;
                } else {
                    break;
                }
            }
        }
        
        // すべてのリトライが失敗した場合
        const error = new Error(
            lastError?.message || 
            'APIリクエストに失敗しました'
        );
        
        if (handleError) {
            setState({
                data: null,
                loading: false,
                error,
                status: lastError?.response?.status || null,
            });
        }
        
        return {
            data: null,
            error,
            status: lastError?.response?.status || null,
            isSuccess: false,
            isError: true,
        };
    }, []);

    /**
     * PUTリクエストを実行する
     * 
     * @param url エンドポイントURL
     * @param data 送信データ
     * @param config Axiosのリクエスト設定
     * @param options 追加オプション
     * @returns APIレスポンス
     */
    const put = useCallback(async <T, D = any>(
        url: string,
        data?: D,
        config: AxiosRequestConfig = {},
        options: APIOptions = {}
    ): Promise<APIResponse<T>> => {
        const { 
            handleError = true, 
            retries = 0,
            retryDelay = 1000,
            transform 
        } = options;

        setState((prev) => ({ ...prev, loading: true, error: null }));

        let attempt = 0;
        let lastError: AxiosError | null = null;

        while (attempt <= retries) {
            try {
                const response = await axios.put<T>(url, data, config);
                
                // レスポンスデータを変換する（必要な場合）
                const transformedData = transform ? transform(response.data) : response.data;
                
                setState({
                    data: transformedData,
                    loading: false,
                    error: null,
                    status: response.status,
                });
                
                return {
                    data: transformedData,
                    error: null,
                    status: response.status,
                    isSuccess: true,
                    isError: false,
                };
            } catch (err) {
                lastError = err as AxiosError;
                
                // リトライ回数に達していない場合は待機してリトライ
                if (attempt < retries) {
                    await new Promise((resolve) => setTimeout(resolve, retryDelay));
                    attempt++;
                } else {
                    break;
                }
            }
        }
        
        // すべてのリトライが失敗した場合
        const error = new Error(
            lastError?.message || 
            'APIリクエストに失敗しました'
        );
        
        if (handleError) {
            setState({
                data: null,
                loading: false,
                error,
                status: lastError?.response?.status || null,
            });
        }
        
        return {
            data: null,
            error,
            status: lastError?.response?.status || null,
            isSuccess: false,
            isError: true,
        };
    }, []);

    /**
     * DELETEリクエストを実行する
     * 
     * @param url エンドポイントURL
     * @param config Axiosのリクエスト設定
     * @param options 追加オプション
     * @returns APIレスポンス
     */
    const del = useCallback(async <T>(
        url: string,
        config: AxiosRequestConfig = {},
        options: APIOptions = {}
    ): Promise<APIResponse<T>> => {
        const { 
            handleError = true, 
            retries = 0,
            retryDelay = 1000,
            transform 
        } = options;

        setState((prev) => ({ ...prev, loading: true, error: null }));

        let attempt = 0;
        let lastError: AxiosError | null = null;

        while (attempt <= retries) {
            try {
                const response = await axios.delete<T>(url, config);
                
                // レスポンスデータを変換する（必要な場合）
                const transformedData = transform ? transform(response.data) : response.data;
                
                setState({
                    data: transformedData,
                    loading: false,
                    error: null,
                    status: response.status,
                });
                
                return {
                    data: transformedData,
                    error: null,
                    status: response.status,
                    isSuccess: true,
                    isError: false,
                };
            } catch (err) {
                lastError = err as AxiosError;
                
                // リトライ回数に達していない場合は待機してリトライ
                if (attempt < retries) {
                    await new Promise((resolve) => setTimeout(resolve, retryDelay));
                    attempt++;
                } else {
                    break;
                }
            }
        }
        
        // すべてのリトライが失敗した場合
        const error = new Error(
            lastError?.message || 
            'APIリクエストに失敗しました'
        );
        
        if (handleError) {
            setState({
                data: null,
                loading: false,
                error,
                status: lastError?.response?.status || null,
            });
        }
        
        return {
            data: null,
            error,
            status: lastError?.response?.status || null,
            isSuccess: false,
            isError: true,
        };
    }, []);

    /**
     * キャッシュをクリアする
     * 
     * @param key 特定のキャッシュキー（省略時はすべてクリア）
     */
    const clearCache = useCallback((key?: string) => {
        if (key) {
            delete apiCache[key];
        } else {
            // すべてのキャッシュをクリア
            Object.keys(apiCache).forEach((k) => {
                delete apiCache[k];
            });
        }
    }, []);

    return {
        ...state,
        get,
        post,
        put,
        delete: del,
        clearCache,
    };
};

export default useAPI;
export type { APIResponse, APIOptions };
