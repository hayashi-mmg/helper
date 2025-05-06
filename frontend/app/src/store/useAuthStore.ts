/**
 * 認証に関する状態管理を行うZustandストア
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 認証ユーザー情報の型定義
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'helper' | 'user';
    // その他のユーザー情報
}

// 認証状態の型定義
interface AuthState {
    // 状態
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    error: string | null;
    
    // アクション
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    register: (email: string, password: string, name: string) => Promise<void>;
    refreshAuth: () => Promise<void>;
    clearError: () => void;
    setUser: (user: User) => void;
    setToken: (token: string, refreshToken: string) => void;
}

/**
 * 認証状態を管理するストア
 * 
 * ログイン、ログアウト、ユーザー登録、認証情報の更新などの機能を提供します。
 * トークンやユーザー情報はローカルストレージに保存され、ページ更新後も保持されます。
 */
export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            // 初期状態
            isAuthenticated: false,
            user: null,
            token: null,
            refreshToken: null,
            isLoading: false,
            error: null,
            
            // アクション
            /**
             * ログイン処理
             * @param email ユーザーメールアドレス
             * @param password パスワード
             */
            login: async (email: string, password: string) => {
                try {
                    set({ isLoading: true, error: null });
                    
                    // TODO: 実際のAPIリクエストを実装する
                    // 現在はモックデータで仮実装
                    await new Promise(resolve => setTimeout(resolve, 1000)); // API呼び出しの遅延をシミュレート
                    
                    // モック認証レスポンス
                    const mockUser: User = {
                        id: '1',
                        email,
                        name: 'テストユーザー',
                        role: 'user',
                    };
                    const mockToken = 'mock-jwt-token';
                    const mockRefreshToken = 'mock-refresh-token';
                    
                    // 認証成功時の状態更新
                    set({
                        isAuthenticated: true,
                        user: mockUser,
                        token: mockToken,
                        refreshToken: mockRefreshToken,
                        isLoading: false,
                    });
                } catch (error) {
                    // エラー処理
                    set({
                        isLoading: false,
                        error: error instanceof Error ? error.message : '認証に失敗しました',
                    });
                }
            },
            
            /**
             * ログアウト処理
             */
            logout: () => {
                // 認証状態をクリア
                set({
                    isAuthenticated: false,
                    user: null,
                    token: null,
                    refreshToken: null,
                });
            },
            
            /**
             * ユーザー登録処理
             * @param email メールアドレス
             * @param password パスワード
             * @param name ユーザー名
             */
            register: async (email: string, password: string, name: string) => {
                try {
                    set({ isLoading: true, error: null });
                    
                    // TODO: 実際のAPIリクエストを実装する
                    // 現在はモックデータで仮実装
                    await new Promise(resolve => setTimeout(resolve, 1000)); // API呼び出しの遅延をシミュレート
                    
                    // モック登録レスポンス
                    const mockUser: User = {
                        id: '2',
                        email,
                        name,
                        role: 'user',
                    };
                    const mockToken = 'mock-jwt-token-after-register';
                    const mockRefreshToken = 'mock-refresh-token-after-register';
                    
                    // 登録成功時の状態更新
                    set({
                        isAuthenticated: true,
                        user: mockUser,
                        token: mockToken,
                        refreshToken: mockRefreshToken,
                        isLoading: false,
                    });
                } catch (error) {
                    // エラー処理
                    set({
                        isLoading: false,
                        error: error instanceof Error ? error.message : 'ユーザー登録に失敗しました',
                    });
                }
            },
            
            /**
             * トークンリフレッシュ処理
             */
            refreshAuth: async () => {
                const refreshToken = get().refreshToken;
                
                if (!refreshToken) {
                    set({ error: 'リフレッシュトークンがありません' });
                    return;
                }
                
                try {
                    set({ isLoading: true, error: null });
                    
                    // TODO: 実際のトークンリフレッシュAPIリクエストを実装する
                    // 現在はモックデータで仮実装
                    await new Promise(resolve => setTimeout(resolve, 500)); // API呼び出しの遅延をシミュレート
                    
                    // モックトークンリフレッシュレスポンス
                    const mockToken = 'mock-new-jwt-token';
                    const mockNewRefreshToken = 'mock-new-refresh-token';
                    
                    // トークン更新
                    set({
                        token: mockToken,
                        refreshToken: mockNewRefreshToken,
                        isLoading: false,
                    });
                } catch (error) {
                    // エラー処理
                    set({
                        isLoading: false,
                        error: error instanceof Error ? error.message : 'トークン更新に失敗しました',
                        isAuthenticated: false, // 更新失敗時は認証状態をクリア
                        user: null,
                        token: null,
                        refreshToken: null,
                    });
                }
            },
            
            /**
             * エラーメッセージをクリア
             */
            clearError: () => {
                set({ error: null });
            },
            
            /**
             * ユーザー情報を設定
             * @param user ユーザー情報
             */
            setUser: (user: User) => {
                set({ user, isAuthenticated: true });
            },
            
            /**
             * 認証トークンを設定
             * @param token JWTトークン
             * @param refreshToken リフレッシュトークン
             */
            setToken: (token: string, refreshToken: string) => {
                set({ token, refreshToken });
            },
        }),
        {
            name: 'auth-storage', // localStorageに保存する際のキー名
            partialize: (state) => ({
                // 永続化する状態を選択（パスワードなど機密情報は除外）
                isAuthenticated: state.isAuthenticated,
                user: state.user,
                token: state.token,
                refreshToken: state.refreshToken,
            }),
        }
    )
);