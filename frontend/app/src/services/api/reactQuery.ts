/**
 * React Query設定
 * グローバルなReact Query設定とカスタムクライアントを提供します
 */
import { QueryClient, DefaultOptions } from '@tanstack/react-query';

/**
 * React Queryのデフォルト設定
 */
const defaultQueryOptions: DefaultOptions = {
    queries: {
        // デフォルトでは自動更新を有効化
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        // リトライ設定
        retry: 1, // 1回までリトライ
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 指数バックオフ（最大30秒）
        // キャッシュ設定
        staleTime: 5 * 60 * 1000, // 5分間はデータが新鮮と見なす
        cacheTime: 10 * 60 * 1000, // 10分間キャッシュを保持
        // エラーハンドリング
        useErrorBoundary: false, // エラーバウンダリを使用しない (コンポーネントレベルで制御)
    },
    mutations: {
        // ミューテーションのリトライ設定
        retry: 0, // ミューテーションはリトライしない
        // エラーハンドリング
        useErrorBoundary: false, // エラーバウンダリを使用しない
    },
};

/**
 * グローバルQueryClientインスタンスを作成
 */
export const queryClient = new QueryClient({
    defaultOptions: defaultQueryOptions,
});

/**
 * React Queryのキャッシュキー型
 * アプリケーション内でのキャッシュキーの一貫性を確保するためのもの
 */
export enum QueryKeys {
    USER = 'user',
    AUTH = 'auth',
    HELPERS = 'helpers',
    REQUESTS = 'requests',
    COOKING_REQUESTS = 'cooking-requests',
    TASK_REQUESTS = 'task-requests',
    FEEDBACK = 'feedback',
}

/**
 * React Queryキャッシュの無効化関数
 * 特定のキャッシュまたはすべてのキャッシュを無効化します
 * 
 * @param {QueryKeys} [queryKey] 無効化するキャッシュキー（省略時は全キャッシュ）
 */
export const invalidateQueries = (queryKey?: QueryKeys): Promise<void> => {
    if (queryKey) {
        return queryClient.invalidateQueries({ queryKey: [queryKey] });
    }
    return queryClient.invalidateQueries();
};

/**
 * React Queryのグローバル設定をカスタマイズするカスタムフック用の設定
 * 必要に応じて拡張可能
 */
export const querySettings = {
    // 高頻度更新が必要なデータ用の設定
    realtime: {
        refetchInterval: 5000, // 5秒ごとに更新
        staleTime: 0, // 即時stale
    },
    // ページング用の設定
    pagination: {
        keepPreviousData: true, // ページ切り替え時に前のデータを表示
        staleTime: 1 * 60 * 1000, // 1分間はデータが新鮮と見なす
    },
    // 更新頻度の低いマスターデータ用の設定
    static: {
        staleTime: 24 * 60 * 60 * 1000, // 24時間はデータが新鮮と見なす
    },
};