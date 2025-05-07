import { renderHook, waitFor } from '@testing-library/react';
import { useApiQuery, useApiMutation, useCacheOperations } from './useApiQuery';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// テスト用のラッパーコンポーネント
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });
    
    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe('useApiQuery', () => {
    it('正しくデータを取得すること', async () => {
        // モックデータを設定
        const mockData = { id: '1', name: 'テスト' };
        const mockFn = jest.fn().mockResolvedValue(mockData);
        const queryKey = ['test'];
        
        // フックをレンダリング
        const { result } = renderHook(
            () => useApiQuery(queryKey, mockFn),
            { wrapper: createWrapper() }
        );
        
        // 初期状態ではロード中であることを確認
        expect(result.current.isLoading).toBe(true);
        
        // データが取得されるまで待機
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        
        // クエリ関数が呼び出されたことを確認
        expect(mockFn).toHaveBeenCalledTimes(1);
        
        // 取得したデータが正しいことを確認
        expect(result.current.data).toEqual(mockData);
    });
    
    it('エラー時に適切に処理すること', async () => {
        // エラーを投げるモック関数
        const mockError = new Error('テストエラー');
        const mockFn = jest.fn().mockRejectedValue(mockError);
        const queryKey = ['test-error'];
        
        // フックをレンダリング
        const { result } = renderHook(
            () => useApiQuery(queryKey, mockFn),
            { wrapper: createWrapper() }
        );
        
        // エラー状態になるまで待機
        await waitFor(() => expect(result.current.isError).toBe(true));
        
        // エラーが正しく設定されていることを確認
        expect(result.current.error).toBe(mockError);
    });
});

describe('useApiMutation', () => {
    it('正しくミューテーションを実行すること', async () => {
        // モックデータを設定
        const mockResult = { id: '1', name: '更新後' };
        const mockFn = jest.fn().mockResolvedValue(mockResult);
        const mockData = { name: '更新後' };
        
        // フックをレンダリング
        const { result } = renderHook(
            () => useApiMutation(mockFn),
            { wrapper: createWrapper() }
        );
        
        // ミューテーションを実行
        result.current.mutate(mockData);
        
        // 正常に完了するまで待機
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        
        // 関数が正しく呼び出されたことを確認
        expect(mockFn).toHaveBeenCalledWith(mockData);
        
        // 結果が正しいことを確認
        expect(result.current.data).toEqual(mockResult);
    });
});

describe('useCacheOperations', () => {
    it('キャッシュ操作が正しく動作すること', async () => {
        // モックデータとクエリキー
        const mockData = { id: '1', name: 'テスト' };
        const queryKey = ['test-cache'];
        const updatedData = { id: '1', name: '更新済み' };

        // テスト用のラッパーとクエリクライアント
        const queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        });

        // 先にデータをキャッシュに設定
        queryClient.setQueryData(queryKey, mockData);
        
        const wrapper = ({ children }: { children: ReactNode }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        );
        
        // キャッシュ操作フックをレンダリング
        const { result } = renderHook(() => useCacheOperations(), { wrapper });
        
        // キャッシュを更新
        result.current.updateCache(queryKey, updatedData);
        
        // 更新されたキャッシュデータを確認
        const cachedData = queryClient.getQueryData(queryKey);
        expect(cachedData).toEqual(updatedData);
        
        // キャッシュを無効化
        result.current.invalidateCache(queryKey);
        
        // キャッシュを完全にクリア
        result.current.clearCache();
        
        // キャッシュがクリアされたことを確認
        expect(queryClient.getQueryData(queryKey)).toBeUndefined();
    });
});