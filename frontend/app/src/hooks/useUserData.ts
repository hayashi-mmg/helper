import { useApiQuery } from './useApiQuery';
import { apiClient } from '../services/api';

/**
 * ユーザーの情報を表す型定義
 */
export interface User {
    id: string;
    username: string;
    email: string;
    name: string;
    role: string;
    created_at: string;
    updated_at: string;
}

/**
 * ユーザー情報を取得するためのクエリキー
 */
export const userKeys = {
    all: ['users'] as const,
    lists: () => [...userKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...userKeys.lists(), { filters }] as const,
    details: () => [...userKeys.all, 'detail'] as const,
    detail: (id: string) => [...userKeys.details(), id] as const,
    current: () => [...userKeys.all, 'current'] as const,
};

/**
 * 現在のログインユーザーの情報を取得するカスタムフック
 * 
 * @param {Object} [options] - クエリオプション
 * @param {boolean} [options.enabled=true] - クエリの有効/無効を制御
 * @returns 現在のユーザー情報とクエリのステータス
 */
export function useCurrentUser(options = { enabled: true }) {
    return useApiQuery<User, Error>(
        userKeys.current(),
        () => apiClient.get<User>('/users/me'),
        {
            enabled: options.enabled,
            staleTime: 5 * 60 * 1000, // 5分間はキャッシュを使用
            // エラー発生時は自動リトライしない
            retry: false,
            // エラーバウンダリにエラーを投げる
            useErrorBoundary: (error: unknown) => {
                const err = error as { status?: number };
                // 認証エラー（401, 403）の場合はエラーバウンダリにエラーを投げる
                return err?.status === 401 || err?.status === 403;
            },
        }
    );
}

/**
 * 指定されたIDのユーザー情報を取得するカスタムフック
 * 
 * @param {string} userId - 取得するユーザーのID
 * @param {Object} [options] - クエリオプション
 * @param {boolean} [options.enabled=true] - クエリの有効/無効を制御
 * @returns 指定されたユーザー情報とクエリのステータス
 */
export function useUserById(userId: string, options = { enabled: true }) {
    return useApiQuery<User, Error>(
        userKeys.detail(userId),
        () => apiClient.get<User>(`/users/${userId}`),
        {
            enabled: options.enabled && Boolean(userId),
            staleTime: 5 * 60 * 1000, // 5分間はキャッシュを使用
        }
    );
}

/**
 * ユーザー一覧を取得するカスタムフック
 * 
 * @param {Object} [filters={}] - 検索フィルター
 * @param {Object} [options] - クエリオプション
 * @param {boolean} [options.enabled=true] - クエリの有効/無効を制御
 * @returns ユーザー一覧とクエリのステータス
 */
export function useUserList(filters = {}, options = { enabled: true }) {
    return useApiQuery<User[], Error>(
        userKeys.list(filters),
        () => apiClient.get<User[]>('/users', { params: filters }),
        {
            enabled: options.enabled,
            staleTime: 2 * 60 * 1000, // 2分間はキャッシュを使用
            keepPreviousData: true, // ページ変更時に前のデータを表示したまま新しいデータを読み込む
        }
    );
}