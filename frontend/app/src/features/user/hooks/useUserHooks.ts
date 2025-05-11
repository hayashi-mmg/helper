import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api';
import { User, UserSettings, UserSummary, UserDetail, CreateUserRequest, UpdateUserRequest } from '../types';
import { ApiError } from '../../../services/api';

/**
 * ユーザー関連のクエリキー
 */
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: any) => [...userKeys.lists(), { ...filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  settings: (id: string) => [...userKeys.detail(id), 'settings'] as const,
  summary: (id: string) => [...userKeys.detail(id), 'summary'] as const,
  current: () => [...userKeys.all, 'current'] as const,
};

/**
 * ユーザー一覧を取得するフック
 * 
 * @param {Record<string, any>} params - クエリパラメータ
 * @param {object} options - React Queryオプション
 * @returns User[]に関するクエリ結果
 */
export const useUsers = (
  params?: Record<string, any>,
  options?: any
) => {
  return useQuery<User[], ApiError>({
    queryKey: userKeys.list(params),
    queryFn: () => userApi.getUsers(params),
    ...options,
  });
};

/**
 * 特定のユーザーを取得するフック
 * 
 * @param {string} id - ユーザーID
 * @param {object} options - React Queryオプション
 * @returns UserDetailに関するクエリ結果
 */
export const useUser = (
  id: string,
  options?: any
) => {
  return useQuery<UserDetail, ApiError>({
    queryKey: userKeys.detail(id),
    queryFn: () => userApi.getUserById(id),
    ...options,
  });
};

/**
 * 現在のログインユーザー情報を取得するフック
 * 
 * @param {object} options - React Queryオプション
 * @returns UserDetailに関するクエリ結果
 */
export const useCurrentUser = (
  options?: any
) => {
  return useQuery<UserDetail, ApiError>({
    queryKey: userKeys.current(),
    queryFn: () => userApi.getCurrentUser(),
    ...options,
  });
};

/**
 * ユーザー設定を取得するフック
 * 
 * @param {string} id - ユーザーID
 * @param {object} options - React Queryオプション
 * @returns UserSettingsに関するクエリ結果
 */
export const useUserSettings = (
  id: string,
  options?: any
) => {
  return useQuery<UserSettings, ApiError>({
    queryKey: userKeys.settings(id),
    queryFn: () => userApi.getUserSettings(id),
    ...options,
  });
};

/**
 * ユーザーサマリー情報を取得するフック
 * 
 * @param {string} id - ユーザーID
 * @param {object} options - React Queryオプション
 * @returns UserSummaryに関するクエリ結果
 */
export const useUserSummary = (
  id: string,
  options?: any
) => {
  return useQuery<UserSummary, ApiError>({
    queryKey: userKeys.summary(id),
    queryFn: () => userApi.getUserSummary(id),
    ...options,
  });
};

/**
 * ユーザーを作成するフック
 * 
 * @returns ユーザー作成ミューテーション
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation<User, ApiError, CreateUserRequest>({
    mutationFn: (userData) => userApi.createUser(userData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.setQueryData(userKeys.detail(data.id), data);
    },
  });
};

/**
 * ユーザー情報を更新するフック
 * 
 * @returns ユーザー更新ミューテーション
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation<User, ApiError, { id: string; data: UpdateUserRequest }>({
    mutationFn: ({ id, data }) => userApi.updateUser(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

/**
 * ユーザー情報を部分的に更新するフック
 * 
 * @returns ユーザー部分更新ミューテーション
 */
export const usePatchUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation<User, ApiError, { id: string; data: Partial<UpdateUserRequest> }>({
    mutationFn: ({ id, data }) => userApi.patchUser(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

/**
 * ユーザーを削除するフック
 * 
 * @returns ユーザー削除ミューテーション
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, ApiError, string>({
    mutationFn: (id) => userApi.deleteUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.removeQueries({ queryKey: userKeys.detail(id) });
    },
  });
};

/**
 * ユーザー設定を更新するフック
 * 
 * @returns ユーザー設定更新ミューテーション
 */
export const useUpdateUserSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation<UserSettings, ApiError, { id: string; settings: Partial<UserSettings> }>({
    mutationFn: ({ id, settings }) => userApi.updateUserSettings(id, settings),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.settings(id) });
    },
  });
};