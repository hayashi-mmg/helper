import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '../lib/axios';
import { getEnv } from '../utils/env';

/**
 * 認証情報の型定義
 */
interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
}

/**
 * ユーザー情報の型定義
 */
interface User {
    id: string;
    username: string;
    email: string;
    role: string;
}

/**
 * 認証操作の型定義
 */
interface AuthActions {
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    register: (username: string, email: string, password: string) => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updateUser: (userData: Partial<User>) => Promise<void>;
    clearError: () => void;
}

/**
 * 認証ストアの型定義
 */
type AuthStore = AuthState & AuthActions;

/**
 * 認証情報を管理するZustandストア
 */
export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            isAuthenticated: false,
            user: null,
            token: null,
            loading: false,
            error: null,

            /**
             * ログイン処理
             * @param email ユーザーのメールアドレス
             * @param password ユーザーのパスワード
             */
            login: async (email: string, password: string) => {
                set({ loading: true, error: null });
                try {
                    const response = await apiClient.post('/auth/login', { email, password });
                    const { data } = response.data;
                    const { token, user } = data;

                    // トークンを設定
                    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    set({
                        isAuthenticated: true,
                        user,
                        token,
                        loading: false,
                    });
                } catch (error) {
                    console.error('Login error:', error);
                    set({
                        loading: false,
                        error: error instanceof Error ? error.message : '認証エラーが発生しました',
                        isAuthenticated: false,
                    });
                    throw error;
                }
            },

            /**
             * ログアウト処理
             */
            logout: () => {
                // ヘッダーからトークンを削除
                delete apiClient.defaults.headers.common['Authorization'];

                set({
                    isAuthenticated: false,
                    user: null,
                    token: null,
                    loading: false,
                });
            },

            /**
             * ユーザー登録処理
             * @param username ユーザー名
             * @param email メールアドレス
             * @param password パスワード
             */
            register: async (username: string, email: string, password: string) => {
                set({ loading: true, error: null });
                try {
                    const response = await apiClient.post('/auth/register', {
                        username,
                        email,
                        password,
                    });
                    const { user, token } = response.data;

                    // トークンを設定
                    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    set({
                        isAuthenticated: true,
                        user,
                        token,
                        loading: false,
                    });
                } catch (error) {
                    set({
                        loading: false,
                        error: error instanceof Error ? error.message : 'ユーザー登録エラーが発生しました',
                    });
                }
            },

            /**
             * パスワードリセット処理
             * @param email ユーザーのメールアドレス
             */
            resetPassword: async (email: string) => {
                set({ loading: true, error: null });
                try {
                    await apiClient.post('/auth/reset-password', { email });
                    set({ loading: false });
                } catch (error) {
                    set({
                        loading: false,
                        error: error instanceof Error ? error.message : 'パスワードリセットエラーが発生しました',
                    });
                }
            },

            /**
             * ユーザー情報更新
             * @param userData 更新するユーザー情報
             */
            updateUser: async (userData: Partial<User>) => {
                const { user } = get();
                if (!user) return;

                set({ loading: true, error: null });
                try {
                    const response = await apiClient.put(`/users/${user.id}`, userData);
                    set({
                        user: { ...user, ...response.data },
                        loading: false,
                    });
                } catch (error) {
                    set({
                        loading: false,
                        error: error instanceof Error ? error.message : 'ユーザー情報更新エラーが発生しました',
                    });
                }
            },

            /**
             * エラーをクリア
             */
            clearError: () => {
                set({ error: null });
            },
        }),
        {
            name: 'auth-storage', // ローカルストレージのキー名
            partialize: (state) => ({
                isAuthenticated: state.isAuthenticated,
                user: state.user,
                token: state.token,
            }),
        }
    )
);

/**
 * 認証機能を提供するカスタムフック
 * @returns 認証に関する状態と操作メソッド
 */
const useAuth = () => {
    const navigate = useNavigate();
    const {
        isAuthenticated,
        user,
        token,
        loading,
        error,
        login,
        logout,
        register,
        resetPassword,
        updateUser,
        clearError,
    } = useAuthStore();

    /**
     * 認証が必要なページのリダイレクト処理
     * @param targetPath リダイレクト先パス
     */
    const requireAuth = useCallback((targetPath: string = '/login') => {
        if (!isAuthenticated && !loading) {
            navigate(targetPath, { replace: true });
        }
    }, [isAuthenticated, loading, navigate]);

    // トークンがある場合はAxiosのヘッダーに設定
    useEffect(() => {
        if (token) {
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }, [token]);

    return {
        isAuthenticated,
        user,
        loading,
        error,
        login,
        logout,
        register,
        resetPassword,
        updateUser,
        clearError,
        requireAuth,
    };
};

export default useAuth;
