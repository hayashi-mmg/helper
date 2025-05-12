/**
 * 認証サービスのモック
 */
import { User } from '../../types/user';

// モックユーザーデータ
const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'testuser@example.com',
    role: 'user',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

// モックトークン
const mockTokens = {
    access_token: 'mock_access_token',
    refresh_token: 'mock_refresh_token',
    token_type: 'bearer',
};

// インメモリストレージ
let currentUser: User | null = null;
let isAuthenticated = false;

export const authService = {
    /**
     * ログイン処理のモック
     */
    login: async (username: string, password: string) => {
        // 簡易的な認証チェック
        if (username === 'testuser' && password === 'password') {
            currentUser = mockUser;
            isAuthenticated = true;
            return {
                user: mockUser,
                ...mockTokens,
            };
        }
        throw new Error('Invalid credentials');
    },

    /**
     * ログアウト処理のモック
     */
    logout: async () => {
        currentUser = null;
        isAuthenticated = false;
    },

    /**
     * ユーザー登録処理のモック
     */
    register: async (userData: {
        username: string;
        email: string;
        password: string;
    }) => {
        // ユーザー名とメールアドレスの重複チェックをシミュレート
        if (userData.username === mockUser.username) {
            throw new Error('Username already exists');
        }
        if (userData.email === mockUser.email) {
            throw new Error('Email already exists');
        }

        // 新規ユーザー作成
        const newUser: User = {
            ...mockUser,
            username: userData.username,
            email: userData.email,
        };

        currentUser = newUser;
        isAuthenticated = true;

        return {
            user: newUser,
            ...mockTokens,
        };
    },

    /**
     * パスワードリセットリクエストのモック
     */
    requestPasswordReset: async (email: string) => {
        if (email === mockUser.email) {
            return { message: 'パスワードリセット手順をメールで送信しました' };
        }
        throw new Error('User not found');
    },

    /**
     * パスワードリセット確認のモック
     */
    confirmPasswordReset: async (token: string, newPassword: string) => {
        if (token === 'valid_token') {
            return { message: 'パスワードが正常にリセットされました' };
        }
        throw new Error('Invalid or expired token');
    },

    /**
     * 現在のユーザー情報を取得
     */
    getCurrentUser: () => currentUser,

    /**
     * 認証状態を取得
     */
    isAuthenticated: () => isAuthenticated,

    /**
     * トークンリフレッシュのモック
     */
    refreshToken: async () => {
        if (isAuthenticated && currentUser) {
            return mockTokens;
        }
        throw new Error('Invalid refresh token');
    },
};

export default authService;
