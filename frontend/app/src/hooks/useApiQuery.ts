import {
    useMutation,
    useQuery,
    useQueryClient,
    UseQueryOptions,
    UseMutationOptions,
    QueryKey,
    QueryFunction,
    MutationFunction,
} from '@tanstack/react-query';

/**
 * 基本的なAPIクエリフックを強化した型安全なカスタムフック
 * 
 * @template TData データの型
 * @template TError エラーの型
 * @template TQueryKey クエリキーの型
 * @template TQueryFnData クエリ関数が返すデータの型（TDataと異なる場合）
 * 
 * @param {TQueryKey} queryKey - クエリを識別するためのキー
 * @param {QueryFunction<TQueryFnData, TQueryKey>} queryFn - データを取得する関数
 * @param {Omit<UseQueryOptions<TData, TError, TData, TQueryKey>, 'queryKey' | 'queryFn'>} [options] - 追加のオプション
 * @returns React QueryのuseQueryフックの結果
 */
export function useApiQuery<
    TData = unknown,
    TError = unknown,
    TQueryKey extends QueryKey = QueryKey,
    TQueryFnData = TData
>(
    queryKey: TQueryKey,
    queryFn: QueryFunction<TQueryFnData, TQueryKey>,
    options?: Omit<UseQueryOptions<TData, TError, TData, TQueryKey>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey,
        queryFn,
        ...options,
    });
}

/**
 * データ更新用のAPIミューテーションフックを強化した型安全なカスタムフック
 * 
 * @template TData 成功時のレスポンスデータの型
 * @template TError エラーの型
 * @template TVariables リクエスト変数の型
 * @template TContext ロールバック用のコンテキスト型
 * 
 * @param {MutationFunction<TData, TVariables>} mutationFn - データを更新する関数
 * @param {UseMutationOptions<TData, TError, TVariables, TContext>} [options] - 追加のオプション
 * @returns React QueryのuseMutationフックの結果
 */
export function useApiMutation<
    TData = unknown,
    TError = unknown,
    TVariables = void,
    TContext = unknown
>(
    mutationFn: MutationFunction<TData, TVariables>,
    options?: UseMutationOptions<TData, TError, TVariables, TContext>
) {
    return useMutation({
        mutationFn,
        ...options,
    });
}

/**
 * キャッシュ操作のためのユーティリティフック
 * @returns キャッシュを操作するための関数オブジェクト
 */
export function useCacheOperations() {
    const queryClient = useQueryClient();
    
    return {
        /**
         * 指定されたキーに関連するキャッシュデータを更新する
         * 
         * @param {QueryKey} queryKey - 更新対象のクエリのキー
         * @param {unknown} updatedData - 更新するデータまたは更新関数
         */
        updateCache: <T>(queryKey: QueryKey, updatedData: T | ((oldData: T | undefined) => T)) => {
            queryClient.setQueryData(queryKey, updatedData);
        },
        
        /**
         * 指定されたキーに関連するキャッシュデータを無効化し、必要に応じて再フェッチする
         * 
         * @param {QueryKey} queryKey - 無効化するクエリのキー
         */
        invalidateCache: (queryKey: QueryKey) => {
            queryClient.invalidateQueries({ queryKey });
        },
        
        /**
         * キャッシュ全体をクリアする
         */
        clearCache: () => {
            queryClient.clear();
        },
        
        /**
         * クエリクライアントインスタンスを直接取得する
         */
        queryClient,
    };
}