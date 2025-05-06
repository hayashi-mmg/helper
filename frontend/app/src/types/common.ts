/**
 * 共通型定義
 */

/**
 * API レスポンスの基本型
 */
export type ApiResponse<T> = {
    data: T;
    status: number;
    message: string;
};

/**
 * ページネーション情報
 */
export type Pagination = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

/**
 * ページネーション付きのレスポンス
 */
export type PaginatedResponse<T> = ApiResponse<{
    items: T[];
    pagination: Pagination;
}>;

/**
 * APIエラーレスポンス
 */
export type ApiError = {
    status: number;
    message: string;
    errors?: Record<string, string[]>;
};

/**
 * アプリケーション全体で使用するステータス
 */
export type Status = 'idle' | 'loading' | 'success' | 'error';

/**
 * 非同期処理の状態を表す型
 */
export type AsyncState<T> = {
    data: T | null;
    status: Status;
    error: ApiError | null;
};