import { apiClient } from '../../../services/api';
import { Helper, CreateHelperRequest, UpdateHelperRequest } from '../types';

/**
 * ヘルパーAPI関連のエンドポイント定義
 */
const API_ENDPOINTS = {
  HELPERS: '/helpers',
  HELPER_BY_ID: (id: string) => `/helpers/${id}`,
  USER_HELPERS: (userId: string) => `/users/${userId}/helpers`,
  FAVORITE_HELPERS: (userId: string) => `/users/${userId}/favorite-helpers`,
};

/**
 * ヘルパーAPIサービス
 * ヘルパーに関連するデータの取得・操作を行う
 */
export const helperApi = {
  /**
   * ヘルパー一覧を取得する
   * 
   * @param {Object} params - クエリパラメータ
   * @returns {Promise<Helper[]>} - ヘルパー一覧
   */
  getHelpers: async (params?: Record<string, any>): Promise<Helper[]> => {
    return apiClient.get<Helper[]>(API_ENDPOINTS.HELPERS, { params });
  },

  /**
   * 特定のヘルパーを取得する
   * 
   * @param {string} id - ヘルパーID
   * @returns {Promise<Helper>} - ヘルパー情報
   */
  getHelperById: async (id: string): Promise<Helper> => {
    return apiClient.get<Helper>(API_ENDPOINTS.HELPER_BY_ID(id));
  },

  /**
   * ユーザーに紐づくヘルパー一覧を取得する（担当ヘルパー）
   * 
   * @param {string} userId - ユーザーID
   * @returns {Promise<Helper[]>} - ヘルパー一覧
   */
  getUserHelpers: async (userId: string): Promise<Helper[]> => {
    return apiClient.get<Helper[]>(API_ENDPOINTS.USER_HELPERS(userId));
  },

  /**
   * お気に入りヘルパー一覧を取得する
   * 
   * @param {string} userId - ユーザーID
   * @returns {Promise<Helper[]>} - お気に入りヘルパー一覧
   */
  getFavoriteHelpers: async (userId: string): Promise<Helper[]> => {
    return apiClient.get<Helper[]>(API_ENDPOINTS.FAVORITE_HELPERS(userId));
  },

  /**
   * ヘルパーをお気に入りに追加する
   * 
   * @param {string} userId - ユーザーID
   * @param {string} helperId - ヘルパーID
   * @returns {Promise<void>}
   */
  addFavoriteHelper: async (userId: string, helperId: string): Promise<void> => {
    return apiClient.post<void>(API_ENDPOINTS.FAVORITE_HELPERS(userId), { helperId });
  },

  /**
   * ヘルパーをお気に入りから削除する
   * 
   * @param {string} userId - ユーザーID
   * @param {string} helperId - ヘルパーID
   * @returns {Promise<void>}
   */
  removeFavoriteHelper: async (userId: string, helperId: string): Promise<void> => {
    return apiClient.delete<void>(`${API_ENDPOINTS.FAVORITE_HELPERS(userId)}/${helperId}`);
  },

  /**
   * 新しいヘルパーを登録する
   * 
   * @param {CreateHelperRequest} helperData - ヘルパーデータ
   * @returns {Promise<Helper>} - 作成されたヘルパー情報
   */
  createHelper: async (helperData: CreateHelperRequest): Promise<Helper> => {
    return apiClient.post<Helper>(API_ENDPOINTS.HELPERS, helperData);
  },

  /**
   * ヘルパー情報を更新する
   * 
   * @param {string} id - ヘルパーID
   * @param {UpdateHelperRequest} helperData - 更新するヘルパーデータ
   * @returns {Promise<Helper>} - 更新されたヘルパー情報
   */
  updateHelper: async (id: string, helperData: UpdateHelperRequest): Promise<Helper> => {
    return apiClient.put<Helper>(API_ENDPOINTS.HELPER_BY_ID(id), helperData);
  },

  /**
   * ヘルパー情報を部分的に更新する
   * 
   * @param {string} id - ヘルパーID
   * @param {UpdateHelperRequest} helperData - 更新するヘルパーデータ
   * @returns {Promise<Helper>} - 更新されたヘルパー情報
   */
  patchHelper: async (id: string, helperData: UpdateHelperRequest): Promise<Helper> => {
    return apiClient.patch<Helper>(API_ENDPOINTS.HELPER_BY_ID(id), helperData);
  },

  /**
   * ヘルパーを削除する
   * 
   * @param {string} id - ヘルパーID
   * @returns {Promise<void>}
   */
  deleteHelper: async (id: string): Promise<void> => {
    return apiClient.delete<void>(API_ENDPOINTS.HELPER_BY_ID(id));
  },
};