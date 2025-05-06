/**
 * React Query設定のテスト
 */
import { QueryClient, DefaultOptions } from '@tanstack/react-query';
import { queryClient, invalidateQueries, QueryKeys, querySettings } from '../reactQuery';

// QueryClientのモック
jest.mock('@tanstack/react-query', () => {
    return {
        QueryClient: jest.fn().mockImplementation(() => ({
            invalidateQueries: jest.fn().mockResolvedValue(undefined),
        })),
    };
});

describe('reactQuery', () => {
    describe('queryClient', () => {
        it('QueryClientが正しく設定されている', () => {
            // QueryClientコンストラクタが呼ばれたことを確認
            expect(QueryClient).toHaveBeenCalled();
            
            // 設定オブジェクトの基本構造を確認
            const constructorArg = (QueryClient as jest.Mock).mock.calls[0][0];
            
            expect(constructorArg).toHaveProperty('defaultOptions');
            expect(constructorArg.defaultOptions).toHaveProperty('queries');
            expect(constructorArg.defaultOptions).toHaveProperty('mutations');
            
            // デフォルトのクエリ設定の主要な項目をチェック
            const queryOptions = constructorArg.defaultOptions.queries;
            expect(queryOptions).toHaveProperty('refetchOnWindowFocus', true);
            expect(queryOptions).toHaveProperty('refetchOnMount', true);
            expect(queryOptions).toHaveProperty('retry', 1);
            expect(queryOptions).toHaveProperty('staleTime');
            expect(queryOptions).toHaveProperty('cacheTime');
            expect(queryOptions).toHaveProperty('useErrorBoundary', false);
            
            // デフォルトのミューテーション設定の主要な項目をチェック
            const mutationOptions = constructorArg.defaultOptions.mutations;
            expect(mutationOptions).toHaveProperty('retry', 0);
            expect(mutationOptions).toHaveProperty('useErrorBoundary', false);
        });
    });

    describe('invalidateQueries', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
        
        it('特定のキャッシュキーを無効化する', async () => {
            await invalidateQueries(QueryKeys.USER);
            
            // 指定されたキーでinvalidateQueriesが呼ばれることを確認
            expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
                queryKey: [QueryKeys.USER],
            });
        });
        
        it('キーを指定しない場合はすべてのキャッシュを無効化する', async () => {
            await invalidateQueries();
            
            // 引数なしでinvalidateQueriesが呼ばれることを確認
            expect(queryClient.invalidateQueries).toHaveBeenCalledWith();
        });
    });

    describe('QueryKeys', () => {
        it('必要なキャッシュキーが定義されている', () => {
            // 主要なキャッシュキーが定義されていることを確認
            expect(QueryKeys).toHaveProperty('USER');
            expect(QueryKeys).toHaveProperty('AUTH');
            expect(QueryKeys).toHaveProperty('HELPERS');
            expect(QueryKeys).toHaveProperty('REQUESTS');
        });
    });

    describe('querySettings', () => {
        it('異なるタイプのクエリ設定を提供する', () => {
            // リアルタイム更新設定をチェック
            expect(querySettings).toHaveProperty('realtime');
            expect(querySettings.realtime).toHaveProperty('refetchInterval');
            expect(querySettings.realtime).toHaveProperty('staleTime');
            
            // ページング設定をチェック
            expect(querySettings).toHaveProperty('pagination');
            expect(querySettings.pagination).toHaveProperty('keepPreviousData');
            expect(querySettings.pagination).toHaveProperty('staleTime');
            
            // 静的データ設定をチェック
            expect(querySettings).toHaveProperty('static');
            expect(querySettings.static).toHaveProperty('staleTime');
            
            // 設定値の検証
            expect(querySettings.realtime.refetchInterval).toBe(5000);
            expect(querySettings.realtime.staleTime).toBe(0);
            expect(querySettings.pagination.keepPreviousData).toBe(true);
            expect(querySettings.static.staleTime).toBe(24 * 60 * 60 * 1000);
        });
    });
});