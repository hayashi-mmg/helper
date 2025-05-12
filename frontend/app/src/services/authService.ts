import axios from 'axios';

// APIのベースURL（環境変数から取得、なければデフォルト値）
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5173/api/v1';

// APIクライアントの作成
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// インターセプターの設定（トークンの自動付与）
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// レスポンスの型定義
export interface AuthResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    user: {
        id: number;
        username: string;
        email: string;
        role: string;
        full_name: string;
    };
}

export interface RegisterResponse {
    id: number;
    username: string;
    email: string;
    full_name: string;
    role: string;
    created_at: string;
}

/**
 * ログイン処理
 * @param username ユーザー名またはメールアドレス
 * @param password パスワード
 */
export const login = async (username: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', { 
        username, 
        password 
    });
    return response.data;
};

/**
 * 新規ユーザー登録
 * @param userData 登録するユーザー情報
 */
export const register = async (userData: {
    username: string;
    email: string;
    password: string;
    full_name: string;
    address?: string;
    phone?: string;
    language?: string;
}): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/auth/register', userData);
    return response.data;
};

/**
 * パスワードリセット要求
 * @param email メールアドレス
 */
export const requestPasswordReset = async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/password-reset', { email });
    return response.data;
};

/**
 * パスワードリセット確認
 * @param token リセットトークン
 * @param password 新しいパスワード
 */
export const confirmPasswordReset = async (token: string, password: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/password-reset/confirm', {
        token,
        password,
    });
    return response.data;
};

/**
 * トークンリフレッシュ
 * @param refreshToken リフレッシュトークン
 */
export const refreshToken = async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', { refresh_token: refreshToken });
    return response.data;
};

// エクスポート
const authService = {
    login,
    register,
    requestPasswordReset,
    confirmPasswordReset,
    refreshToken,
};

export default authService;
