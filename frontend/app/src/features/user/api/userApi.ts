import { apiClient } from '../../../services/api';
import { User, UserSettings, UserSummary, UserDetail, CreateUserRequest, UpdateUserRequest } from '../types';

/**
 * ユーザーAPI関連のエンドポイント定義
 */
const API_ENDPOINTS = {
  USERS: '/users',
  USER_BY_ID: (id: string) => `/users/${id}`,
  USER_SETTINGS: (id: string) => `/users/${id}/settings`,
  USER_SUMMARY: (id: string) => `/users/${id}/summary`,
  CURRENT_USER: '/users/me',
};

/**
 * ユーザーAPIサービス
 * ユーザーに関連するデータの取得・操作を行う
 */
export const userApi = {
  /**
   * ユーザー一覧を取得する
   * 
   * @param {Object} params - クエリパラメータ
   * @returns {Promise<User[]>} - ユーザー一覧
   */
  getUsers: async (params?: Record<string, any>): Promise<User[]> => {
    return apiClient.get<User[]>(API_ENDPOINTS.USERS, { params });
  },

  /**
   * 特定のユーザーを取得する
   * 
   * @param {string} id - ユーザーID
   * @returns {Promise<UserDetail>} - ユーザー詳細情報
   */
  getUserById: async (id: string): Promise<UserDetail> => {
    return apiClient.get<UserDetail>(API_ENDPOINTS.USER_BY_ID(id));
  },

  /**
   * 現在のログインユーザー情報を取得する
   * 
   * @returns {Promise<UserDetail>} - ユーザー詳細情報
   */
  getCurrentUser: async (): Promise<UserDetail> => {
    return apiClient.get<UserDetail>(API_ENDPOINTS.CURRENT_USER);
  },

  /**
   * ユーザーを登録する
   * 
   * @param {CreateUserRequest} userData - ユーザーデータ
   * @returns {Promise<User>} - 登録されたユーザー情報
   */
  createUser: async (userData: CreateUserRequest): Promise<User> => {
    return apiClient.post<User>(API_ENDPOINTS.USERS, userData);
  },

  /**
   * ユーザー情報を更新する
   * 
   * @param {string} id - ユーザーID
   * @param {UpdateUserRequest} userData - 更新するユーザーデータ
   * @returns {Promise<User>} - 更新されたユーザー情報
   */
  updateUser: async (id: string, userData: UpdateUserRequest): Promise<User> => {
    return apiClient.put<User>(API_ENDPOINTS.USER_BY_ID(id), userData);
  },

  /**
   * ユーザー情報を部分的に更新する
   * 
   * @param {string} id - ユーザーID
   * @param {UpdateUserRequest} userData - 更新するユーザーデータ
   * @returns {Promise<User>} - 更新されたユーザー情報
   */
  patchUser: async (id: string, userData: UpdateUserRequest): Promise<User> => {
    return apiClient.patch<User>(API_ENDPOINTS.USER_BY_ID(id), userData);
  },

  /**
   * ユーザーを削除する
   * 
   * @param {string} id - ユーザーID
   * @returns {Promise<void>}
   */
  deleteUser: async (id: string): Promise<void> => {
    return apiClient.delete<void>(API_ENDPOINTS.USER_BY_ID(id));
  },

  /**
   * ユーザー設定を取得する
   * 
   * @param {string} id - ユーザーID
   * @returns {Promise<UserSettings>} - ユーザー設定
   */
  getUserSettings: async (id: string): Promise<UserSettings> => {
    return apiClient.get<UserSettings>(API_ENDPOINTS.USER_SETTINGS(id));
  },

  /**
   * ユーザー設定を更新する
   * 
   * @param {string} id - ユーザーID
   * @param {Partial<UserSettings>} settings - 更新する設定
   * @returns {Promise<UserSettings>} - 更新された設定
   */
  updateUserSettings: async (id: string, settings: Partial<UserSettings>): Promise<UserSettings> => {
    return apiClient.put<UserSettings>(API_ENDPOINTS.USER_SETTINGS(id), settings);
  },

  /**
   * ユーザーのサマリー情報を取得する
   * 
   * @param {string} id - ユーザーID
   * @returns {Promise<UserSummary>} - ユーザーのサマリー情報
   */
  getUserSummary: async (id: string): Promise<UserSummary> => {
    return apiClient.get<UserSummary>(API_ENDPOINTS.USER_SUMMARY(id));
  },
};