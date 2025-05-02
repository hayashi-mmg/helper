import axios, { AxiosError, AxiosRequestConfig } from 'axios';

// APIのベースURL
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Axiosインスタンスの作成
const axiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター
axiosInstance.interceptors.request.use(
  (config) => {
    // トークンがあればヘッダーに追加
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// レスポンスインターセプター
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // トークン期限切れなどの認証エラー処理
    if (error.response?.status === 401) {
      // トークンを削除してログイン画面にリダイレクト
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    
    // エラーをそのまま返して、各コンポーネントでハンドリングできるようにする
    return Promise.reject(error);
  }
);

// API関数のタイプ定義
export type ApiFunction = <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;
export type ApiDataFunction = <T>(url: string, data: any, config?: AxiosRequestConfig) => Promise<T>;

// 各種APIメソッド
export const api = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.get<T>(url, config);
    return response.data;
  },
  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.post<T>(url, data, config);
    return response.data;
  },
  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.put<T>(url, data, config);
    return response.data;
  },
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.delete<T>(url, config);
    return response.data;
  },
  patch: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.patch<T>(url, data, config);
    return response.data;
  },
};

export default axiosInstance;