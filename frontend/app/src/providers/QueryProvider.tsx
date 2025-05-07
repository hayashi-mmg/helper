/**
 * React Queryプロバイダーコンポーネント
 * アプリケーション全体にReact Query機能を提供します
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

/**
 * React Queryのキャッシュ設定オプション
 */
const defaultQueryClientOptions = {
    queries: {
        // デフォルトでデータをキャッシュする時間（ミリ秒）
        staleTime: 5 * 60 * 1000, // 5分
        // キャッシュにあるデータが古くなった後も、再フェッチが失敗した場合に使用する時間
        gcTime: 10 * 60 * 1000, // 10分
        // 自動的に再フェッチを行うタイミングの設定
        refetchOnWindowFocus: import.meta.env.PROD, // 本番環境でのみウィンドウフォーカス時に再フェッチ
        refetchOnReconnect: true, // ネットワーク再接続時に再フェッチ
        retry: 1, // エラー時に1回だけリトライ
        // エラーハンドリングを行う
        useErrorBoundary: (error: unknown) => {
            const err = error as { status?: number };
            // 認証エラーとサーバーエラーはエラーバウンダリに投げる
            return err?.status === 401 || err?.status === 403 || err?.status >= 500;
        },
    },
    mutations: {
        // ミューテーション（データ更新）のリトライ設定
        retry: 0, // ミューテーションエラー時はリトライしない
    },
};

interface QueryProviderProps {
    children: ReactNode;
    /**
     * テスト用にカスタムQueryClientを渡せるようにする
     */
    client?: QueryClient;
}

/**
 * React Queryプロバイダーコンポーネント
 * アプリケーション全体でReact Queryを使用できるようにする
 * 
 * @param {ReactNode} children - 子コンポーネント
 * @param {QueryClient} [client] - テスト用にカスタムQueryClientを渡すためのオプションパラメータ
 * @returns {JSX.Element} QueryClientProviderでラップされたコンポーネント
 */
export function QueryProvider({ children, client }: QueryProviderProps): JSX.Element {
    // コンポーネントがレンダリングされるたびにQueryClientが再作成されないように
    // useStateを使用してインスタンスを保持
    const [queryClient] = useState(() => 
        client ?? new QueryClient({ defaultOptions: defaultQueryClientOptions })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}

export default QueryProvider;