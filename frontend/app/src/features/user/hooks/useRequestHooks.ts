import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requestApi } from '../api';
import type { 
  Request, 
  CookingRequest, 
  ErrandRequest, 
  RequestFilter, 
  RequestListResponse, 
  Feedback,
  CreateCookingRequest,
  CreateErrandRequest,
  UpdateRequestRequest,
  RecipeDetails
} from '../types';
import type { ApiError } from '../../../services/api';

/**
 * リクエスト関連のクエリキー
 */
export const requestKeys = {
  all: ['requests'] as const,
  lists: () => [...requestKeys.all, 'list'] as const,
  list: (filters: RequestFilter = {}) => [...requestKeys.lists(), { ...filters }] as const,
  userRequests: (userId: string) => [...requestKeys.lists(), 'user', userId] as const,
  helperRequests: (helperId: string) => [...requestKeys.lists(), 'helper', helperId] as const,
  details: () => [...requestKeys.all, 'detail'] as const,
  detail: (id: string) => [...requestKeys.details(), id] as const,
  feedback: (requestId: string) => [...requestKeys.detail(requestId), 'feedback'] as const,
};

/**
 * リクエスト一覧を取得するフック
 * 
 * @param {RequestFilter} filter - フィルタリングパラメータ
 * @param {object} options - React Queryオプション
 * @returns RequestListResponseに関するクエリ結果
 */
export const useRequests = (
  filter?: RequestFilter,
  options?: any
) => {
  return useQuery<RequestListResponse, ApiError>({
    queryKey: requestKeys.list(filter),
    queryFn: () => requestApi.getRequests(filter),
    ...options,
  });
};

/**
 * 特定のリクエストを取得するフック
 * 
 * @param {string} id - リクエストID
 * @param {object} options - React Queryオプション
 * @returns Requestに関するクエリ結果
 */
export const useRequest = (
  id: string,
  options?: any
) => {
  return useQuery<Request, ApiError>({
    queryKey: requestKeys.detail(id),
    queryFn: () => requestApi.getRequestById(id),
    ...options,
  });
};

/**
 * ユーザーのリクエスト一覧を取得するフック
 * 
 * @param {string} userId - ユーザーID
 * @param {RequestFilter} filter - フィルタリングパラメータ
 * @param {object} options - React Queryオプション
 * @returns RequestListResponseに関するクエリ結果
 */
export const useUserRequests = (
  userId: string,
  filter?: RequestFilter,
  options?: any
) => {
  return useQuery<RequestListResponse, ApiError>({
    queryKey: [...requestKeys.userRequests(userId), { ...filter }],
    queryFn: () => requestApi.getUserRequests(userId, filter),
    ...options,
  });
};

/**
 * ヘルパーのリクエスト一覧を取得するフック
 * 
 * @param {string} helperId - ヘルパーID
 * @param {RequestFilter} filter - フィルタリングパラメータ
 * @param {object} options - React Queryオプション
 * @returns RequestListResponseに関するクエリ結果
 */
export const useHelperRequests = (
  helperId: string,
  filter?: RequestFilter,
  options?: any
) => {
  return useQuery<RequestListResponse, ApiError>({
    queryKey: [...requestKeys.helperRequests(helperId), { ...filter }],
    queryFn: () => requestApi.getHelperRequests(helperId, filter),
    ...options,
  });
};

/**
 * リクエストのフィードバックを取得するフック
 * 
 * @param {string} requestId - リクエストID
 * @param {object} options - React Queryオプション
 * @returns Feedbackに関するクエリ結果
 */
export const useRequestFeedback = (
  requestId: string,
  options?: any
) => {
  return useQuery<Feedback, ApiError>({
    queryKey: requestKeys.feedback(requestId),
    queryFn: () => requestApi.getFeedback(requestId),
    ...options,
  });
};

/**
 * 料理リクエストを作成するフック
 * 
 * @returns 料理リクエスト作成ミューテーション
 */
export const useCreateCookingRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation<CookingRequest, ApiError, CreateCookingRequest>({
    mutationFn: (requestData) => requestApi.createCookingRequest(requestData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
      queryClient.setQueryData(requestKeys.detail(data.id), data);
      
      if (data.userId) {
        queryClient.invalidateQueries({ queryKey: requestKeys.userRequests(data.userId) });
      }
    },
  });
};

/**
 * お願いごとリクエストを作成するフック
 * 
 * @returns お願いごとリクエスト作成ミューテーション
 */
export const useCreateErrandRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation<ErrandRequest, ApiError, CreateErrandRequest>({
    mutationFn: (requestData) => requestApi.createErrandRequest(requestData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
      queryClient.setQueryData(requestKeys.detail(data.id), data);
      
      if (data.userId) {
        queryClient.invalidateQueries({ queryKey: requestKeys.userRequests(data.userId) });
      }
    },
  });
};

/**
 * その他のリクエストを作成するフック
 * 
 * @returns その他のリクエスト作成ミューテーション
 */
export const useCreateOtherRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Request, ApiError, Partial<Request>>({
    mutationFn: (requestData) => requestApi.createOtherRequest(requestData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
      queryClient.setQueryData(requestKeys.detail(data.id), data);
      
      if (data.userId) {
        queryClient.invalidateQueries({ queryKey: requestKeys.userRequests(data.userId) });
      }
    },
  });
};

/**
 * リクエストを更新するフック
 * 
 * @returns リクエスト更新ミューテーション
 */
export const useUpdateRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Request, ApiError, { id: string; data: UpdateRequestRequest }>({
    mutationFn: ({ id, data }) => requestApi.updateRequest(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
      
      if (data.userId) {
        queryClient.invalidateQueries({ queryKey: requestKeys.userRequests(data.userId) });
      }
      
      if (data.assignedHelperId) {
        queryClient.invalidateQueries({ queryKey: requestKeys.helperRequests(data.assignedHelperId) });
      }
    },
  });
};

/**
 * リクエストを部分的に更新するフック
 * 
 * @returns リクエスト部分更新ミューテーション
 */
export const usePatchRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Request, ApiError, { id: string; data: Partial<UpdateRequestRequest> }>({
    mutationFn: ({ id, data }) => requestApi.patchRequest(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
      
      if (data.userId) {
        queryClient.invalidateQueries({ queryKey: requestKeys.userRequests(data.userId) });
      }
      
      if (data.assignedHelperId) {
        queryClient.invalidateQueries({ queryKey: requestKeys.helperRequests(data.assignedHelperId) });
      }
    },
  });
};

/**
 * リクエストを削除するフック
 * 
 * @returns リクエスト削除ミューテーション
 */
export const useDeleteRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, ApiError, { id: string; userId?: string; helperId?: string }>({
    mutationFn: ({ id }) => requestApi.deleteRequest(id),
    onSuccess: (_, { id, userId, helperId }) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
      queryClient.removeQueries({ queryKey: requestKeys.detail(id) });
      
      if (userId) {
        queryClient.invalidateQueries({ queryKey: requestKeys.userRequests(userId) });
      }
      
      if (helperId) {
        queryClient.invalidateQueries({ queryKey: requestKeys.helperRequests(helperId) });
      }
    },
  });
};

/**
 * リクエストのステータスを更新するフック
 * 
 * @returns リクエストステータス更新ミューテーション
 */
export const useUpdateRequestStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Request, ApiError, { id: string; status: string }>({
    mutationFn: ({ id, status }) => requestApi.updateRequestStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
      
      if (data.userId) {
        queryClient.invalidateQueries({ queryKey: requestKeys.userRequests(data.userId) });
      }
      
      if (data.assignedHelperId) {
        queryClient.invalidateQueries({ queryKey: requestKeys.helperRequests(data.assignedHelperId) });
      }
    },
  });
};

/**
 * レシピURLを解析するフック
 * 
 * @returns レシピURL解析ミューテーション
 */
export const useParseRecipeUrl = () => {
  return useMutation<RecipeDetails, ApiError, string>({
    mutationFn: (url) => requestApi.parseRecipeUrl(url),
  });
};

/**
 * フィードバックを送信するフック
 * 
 * @returns フィードバック送信ミューテーション
 */
export const useSubmitFeedback = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Feedback, ApiError, { requestId: string; feedback: Partial<Feedback> }>({
    mutationFn: ({ requestId, feedback }) => requestApi.submitFeedback(requestId, feedback),
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.feedback(requestId) });
    },
  });
};