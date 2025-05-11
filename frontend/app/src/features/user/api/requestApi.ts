import { apiClient } from '../../../services/api';
import { 
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

/**
 * リクエストAPI関連のエンドポイント定義
 */
const API_ENDPOINTS = {
  REQUESTS: '/requests',
  REQUEST_BY_ID: (id: string) => `/requests/${id}`,
  USER_REQUESTS: (userId: string) => `/users/${userId}/requests`,
  HELPER_REQUESTS: (helperId: string) => `/helpers/${helperId}/requests`,
  REQUEST_FEEDBACK: (requestId: string) => `/requests/${requestId}/feedback`,
  PARSE_RECIPE: '/requests/parse-recipe',
};

/**
 * リクエストAPIサービス
 * リクエストに関連するデータの取得・操作を行う
 */
export const requestApi = {
  /**
   * リクエスト一覧を取得する
   * 
   * @param {RequestFilter} filter - フィルタリングパラメータ
   * @returns {Promise<RequestListResponse>} - リクエスト一覧とページネーション情報
   */
  getRequests: async (filter?: RequestFilter): Promise<RequestListResponse> => {
    return apiClient.get<RequestListResponse>(API_ENDPOINTS.REQUESTS, { params: filter });
  },

  /**
   * 特定のリクエストを取得する
   * 
   * @param {string} id - リクエストID
   * @returns {Promise<Request>} - リクエスト情報
   */
  getRequestById: async (id: string): Promise<Request> => {
    return apiClient.get<Request>(API_ENDPOINTS.REQUEST_BY_ID(id));
  },

  /**
   * ユーザーのリクエスト一覧を取得する
   * 
   * @param {string} userId - ユーザーID
   * @param {RequestFilter} filter - フィルタリングパラメータ
   * @returns {Promise<RequestListResponse>} - リクエスト一覧とページネーション情報
   */
  getUserRequests: async (userId: string, filter?: RequestFilter): Promise<RequestListResponse> => {
    return apiClient.get<RequestListResponse>(API_ENDPOINTS.USER_REQUESTS(userId), { params: filter });
  },

  /**
   * ヘルパーに割り当てられたリクエスト一覧を取得する
   * 
   * @param {string} helperId - ヘルパーID
   * @param {RequestFilter} filter - フィルタリングパラメータ
   * @returns {Promise<RequestListResponse>} - リクエスト一覧とページネーション情報
   */
  getHelperRequests: async (helperId: string, filter?: RequestFilter): Promise<RequestListResponse> => {
    return apiClient.get<RequestListResponse>(API_ENDPOINTS.HELPER_REQUESTS(helperId), { params: filter });
  },

  /**
   * 料理リクエストを作成する
   * 
   * @param {CreateCookingRequest} requestData - リクエストデータ
   * @returns {Promise<CookingRequest>} - 作成されたリクエスト情報
   */
  createCookingRequest: async (requestData: CreateCookingRequest): Promise<CookingRequest> => {
    return apiClient.post<CookingRequest>(API_ENDPOINTS.REQUESTS, {
      ...requestData,
      type: 'cooking',
    });
  },

  /**
   * お願いごとリクエストを作成する
   * 
   * @param {CreateErrandRequest} requestData - リクエストデータ
   * @returns {Promise<ErrandRequest>} - 作成されたリクエスト情報
   */
  createErrandRequest: async (requestData: CreateErrandRequest): Promise<ErrandRequest> => {
    return apiClient.post<ErrandRequest>(API_ENDPOINTS.REQUESTS, {
      ...requestData,
      type: 'errand',
    });
  },

  /**
   * その他のリクエストを作成する
   * 
   * @param {Partial<Request>} requestData - リクエストデータ
   * @returns {Promise<Request>} - 作成されたリクエスト情報
   */
  createOtherRequest: async (requestData: Partial<Request>): Promise<Request> => {
    return apiClient.post<Request>(API_ENDPOINTS.REQUESTS, {
      ...requestData,
      type: 'other',
    });
  },

  /**
   * リクエストを更新する
   * 
   * @param {string} id - リクエストID
   * @param {UpdateRequestRequest} requestData - 更新するリクエストデータ
   * @returns {Promise<Request>} - 更新されたリクエスト情報
   */
  updateRequest: async (id: string, requestData: UpdateRequestRequest): Promise<Request> => {
    return apiClient.put<Request>(API_ENDPOINTS.REQUEST_BY_ID(id), requestData);
  },

  /**
   * リクエストを部分的に更新する
   * 
   * @param {string} id - リクエストID
   * @param {UpdateRequestRequest} requestData - 更新するリクエストデータ
   * @returns {Promise<Request>} - 更新されたリクエスト情報
   */
  patchRequest: async (id: string, requestData: UpdateRequestRequest): Promise<Request> => {
    return apiClient.patch<Request>(API_ENDPOINTS.REQUEST_BY_ID(id), requestData);
  },

  /**
   * リクエストを削除する
   * 
   * @param {string} id - リクエストID
   * @returns {Promise<void>}
   */
  deleteRequest: async (id: string): Promise<void> => {
    return apiClient.delete<void>(API_ENDPOINTS.REQUEST_BY_ID(id));
  },

  /**
   * リクエストのステータスを更新する
   * 
   * @param {string} id - リクエストID
   * @param {string} status - 新しいステータス
   * @returns {Promise<Request>} - 更新されたリクエスト情報
   */
  updateRequestStatus: async (id: string, status: string): Promise<Request> => {
    return apiClient.patch<Request>(API_ENDPOINTS.REQUEST_BY_ID(id), { status });
  },

  /**
   * レシピURLからレシピ情報を解析する
   * 
   * @param {string} url - レシピURL
   * @returns {Promise<RecipeDetails>} - 解析されたレシピ情報
   */
  parseRecipeUrl: async (url: string): Promise<RecipeDetails> => {
    return apiClient.post<RecipeDetails>(API_ENDPOINTS.PARSE_RECIPE, { url });
  },

  /**
   * フィードバックを送信する
   * 
   * @param {string} requestId - リクエストID
   * @param {Partial<Feedback>} feedback - フィードバックデータ
   * @returns {Promise<Feedback>} - 送信されたフィードバック情報
   */
  submitFeedback: async (requestId: string, feedback: Partial<Feedback>): Promise<Feedback> => {
    return apiClient.post<Feedback>(API_ENDPOINTS.REQUEST_FEEDBACK(requestId), feedback);
  },

  /**
   * フィードバックを取得する
   * 
   * @param {string} requestId - リクエストID
   * @returns {Promise<Feedback>} - フィードバック情報
   */
  getFeedback: async (requestId: string): Promise<Feedback> => {
    return apiClient.get<Feedback>(API_ENDPOINTS.REQUEST_FEEDBACK(requestId));
  },
};