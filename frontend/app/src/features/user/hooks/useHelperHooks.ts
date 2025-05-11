import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { helperApi } from '../api';
import { Helper, CreateHelperRequest, UpdateHelperRequest } from '../types';
import { ApiError } from '../../../services/api';

/**
 * ヘルパー関連のクエリキー
 */
export const helperKeys = {
  all: ['helpers'] as const,
  lists: () => [...helperKeys.all, 'list'] as const,
  list: (filters: any) => [...helperKeys.lists(), { ...filters }] as const,
  userHelpers: (userId: string) => [...helperKeys.lists(), 'user', userId] as const,
  favoriteHelpers: (userId: string) => [...helperKeys.lists(), 'favorite', userId] as const,
  details: () => [...helperKeys.all, 'detail'] as const,
  detail: (id: string) => [...helperKeys.details(), id] as const,
};

/**
 * ヘルパー一覧を取得するフック
 * 
 * @param {Record<string, any>} params - クエリパラメータ
 * @param {object} options - React Queryオプション
 * @returns Helper[]に関するクエリ結果
 */
export const useHelpers = (
  params?: Record<string, any>,
  options?: any
) => {
  return useQuery<Helper[], ApiError>({
    queryKey: helperKeys.list(params),
    queryFn: () => helperApi.getHelpers(params),
    ...options,
  });
};

/**
 * 特定のヘルパーを取得するフック
 * 
 * @param {string} id - ヘルパーID
 * @param {object} options - React Queryオプション
 * @returns Helperに関するクエリ結果
 */
export const useHelper = (
  id: string,
  options?: any
) => {
  return useQuery<Helper, ApiError>({
    queryKey: helperKeys.detail(id),
    queryFn: () => helperApi.getHelperById(id),
    ...options,
  });
};

/**
 * ユーザーの担当ヘルパー一覧を取得するフック
 * 
 * @param {string} userId - ユーザーID
 * @param {object} options - React Queryオプション
 * @returns Helper[]に関するクエリ結果
 */
export const useUserHelpers = (
  userId: string,
  options?: any
) => {
  return useQuery<Helper[], ApiError>({
    queryKey: helperKeys.userHelpers(userId),
    queryFn: () => helperApi.getUserHelpers(userId),
    ...options,
  });
};

/**
 * ユーザーのお気に入りヘルパー一覧を取得するフック
 * 
 * @param {string} userId - ユーザーID
 * @param {object} options - React Queryオプション
 * @returns Helper[]に関するクエリ結果
 */
export const useFavoriteHelpers = (
  userId: string,
  options?: any
) => {
  return useQuery<Helper[], ApiError>({
    queryKey: helperKeys.favoriteHelpers(userId),
    queryFn: () => helperApi.getFavoriteHelpers(userId),
    ...options,
  });
};

/**
 * ヘルパーを作成するフック
 * 
 * @returns ヘルパー作成ミューテーション
 */
export const useCreateHelper = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Helper, ApiError, CreateHelperRequest>({
    mutationFn: (helperData) => helperApi.createHelper(helperData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: helperKeys.lists() });
      queryClient.setQueryData(helperKeys.detail(data.id), data);
      
      if (data.userId) {
        queryClient.invalidateQueries({ queryKey: helperKeys.userHelpers(data.userId) });
      }
    },
  });
};

/**
 * ヘルパー情報を更新するフック
 * 
 * @returns ヘルパー更新ミューテーション
 */
export const useUpdateHelper = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Helper, ApiError, { id: string; data: UpdateHelperRequest }>({
    mutationFn: ({ id, data }) => helperApi.updateHelper(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: helperKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: helperKeys.lists() });
      
      if (data.userId) {
        queryClient.invalidateQueries({ queryKey: helperKeys.userHelpers(data.userId) });
        queryClient.invalidateQueries({ queryKey: helperKeys.favoriteHelpers(data.userId) });
      }
    },
  });
};

/**
 * ヘルパー情報を部分的に更新するフック
 * 
 * @returns ヘルパー部分更新ミューテーション
 */
export const usePatchHelper = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Helper, ApiError, { id: string; data: Partial<UpdateHelperRequest> }>({
    mutationFn: ({ id, data }) => helperApi.patchHelper(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: helperKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: helperKeys.lists() });
      
      if (data.userId) {
        queryClient.invalidateQueries({ queryKey: helperKeys.userHelpers(data.userId) });
        queryClient.invalidateQueries({ queryKey: helperKeys.favoriteHelpers(data.userId) });
      }
    },
  });
};

/**
 * ヘルパーを削除するフック
 * 
 * @returns ヘルパー削除ミューテーション
 */
export const useDeleteHelper = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, ApiError, { id: string; userId?: string }>({
    mutationFn: ({ id }) => helperApi.deleteHelper(id),
    onSuccess: (_, { id, userId }) => {
      queryClient.invalidateQueries({ queryKey: helperKeys.lists() });
      queryClient.removeQueries({ queryKey: helperKeys.detail(id) });
      
      if (userId) {
        queryClient.invalidateQueries({ queryKey: helperKeys.userHelpers(userId) });
        queryClient.invalidateQueries({ queryKey: helperKeys.favoriteHelpers(userId) });
      }
    },
  });
};

/**
 * お気に入りヘルパーを追加するフック
 * 
 * @returns お気に入りヘルパー追加ミューテーション
 */
export const useAddFavoriteHelper = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, ApiError, { userId: string; helperId: string }>({
    mutationFn: ({ userId, helperId }) => helperApi.addFavoriteHelper(userId, helperId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: helperKeys.favoriteHelpers(userId) });
    },
  });
};

/**
 * お気に入りヘルパーを削除するフック
 * 
 * @returns お気に入りヘルパー削除ミューテーション
 */
export const useRemoveFavoriteHelper = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, ApiError, { userId: string; helperId: string }>({
    mutationFn: ({ userId, helperId }) => helperApi.removeFavoriteHelper(userId, helperId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: helperKeys.favoriteHelpers(userId) });
    },
  });
};