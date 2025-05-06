/**
 * 認証ストアのテスト
 */
import { act } from '@testing-library/react';
import { useAuthStore } from '../useAuthStore';

// localStorage モックの設定
const mockLocalStorage = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();

// グローバルオブジェクトのモック
Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
});

describe('useAuthStore', () => {
    // 各テスト後にストアをリセット
    afterEach(() => {
        localStorage.clear();
        act(() => {
            useAuthStore.setState({
                isAuthenticated: false,
                user: null,
                token: null,
                refreshToken: null,
                isLoading: false,
                error: null,
            });
        });
    });

    // 非同期メソッドのテストのためにタイマーをモック化
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('初期状態が正しく設定されていること', () => {
        const state = useAuthStore.getState();
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
        expect(state.token).toBeNull();
        expect(state.refreshToken).toBeNull();
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeNull();
    });

    it('ログイン処理が成功すると認証状態が更新されること', async () => {
        const loginPromise = act(async () => {
            await useAuthStore.getState().login('test@example.com', 'password');
        });

        // タイマーを進める（モックAPIリクエストの遅延をスキップ）
        act(() => {
            jest.advanceTimersByTime(1000);
        });

        await loginPromise;

        const state = useAuthStore.getState();
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).not.toBeNull();
        expect(state.user?.email).toBe('test@example.com');
        expect(state.token).toBe('mock-jwt-token');
        expect(state.refreshToken).toBe('mock-refresh-token');
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeNull();
    });

    it('ログアウト処理が認証状態をクリアすること', async () => {
        // まずログイン
        const loginPromise = act(async () => {
            await useAuthStore.getState().login('test@example.com', 'password');
        });

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        await loginPromise;

        // ログイン状態を確認
        expect(useAuthStore.getState().isAuthenticated).toBe(true);

        // ログアウト
        act(() => {
            useAuthStore.getState().logout();
        });

        // 状態がクリアされたことを確認
        const state = useAuthStore.getState();
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
        expect(state.token).toBeNull();
        expect(state.refreshToken).toBeNull();
    });

    it('ユーザー登録が成功すると認証状態が更新されること', async () => {
        const registerPromise = act(async () => {
            await useAuthStore.getState().register('new@example.com', 'password', '新規ユーザー');
        });

        // タイマーを進める
        act(() => {
            jest.advanceTimersByTime(1000);
        });

        await registerPromise;

        const state = useAuthStore.getState();
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).not.toBeNull();
        expect(state.user?.email).toBe('new@example.com');
        expect(state.user?.name).toBe('新規ユーザー');
        expect(state.token).toBe('mock-jwt-token-after-register');
        expect(state.refreshToken).toBe('mock-refresh-token-after-register');
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeNull();
    });

    it('トークンリフレッシュが成功するとトークンが更新されること', async () => {
        // まずログイン
        const loginPromise = act(async () => {
            await useAuthStore.getState().login('test@example.com', 'password');
        });

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        await loginPromise;

        // トークンリフレッシュ
        const refreshPromise = act(async () => {
            await useAuthStore.getState().refreshAuth();
        });

        // タイマーを進める
        act(() => {
            jest.advanceTimersByTime(500);
        });

        await refreshPromise;

        // 新しいトークンが設定されていることを確認
        const state = useAuthStore.getState();
        expect(state.token).toBe('mock-new-jwt-token');
        expect(state.refreshToken).toBe('mock-new-refresh-token');
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeNull();
    });

    it('リフレッシュトークンがない場合にエラーが設定されること', async () => {
        // トークンリフレッシュ（リフレッシュトークンなし）
        act(() => {
            useAuthStore.getState().refreshAuth();
        });

        // エラーが設定されていることを確認
        const state = useAuthStore.getState();
        expect(state.error).toBe('リフレッシュトークンがありません');
    });

    it('setUser関数が正しくユーザー情報を更新すること', () => {
        const testUser = {
            id: 'test-id',
            email: 'test@example.com',
            name: 'テストユーザー',
            role: 'user' as const,
        };

        act(() => {
            useAuthStore.getState().setUser(testUser);
        });

        const state = useAuthStore.getState();
        expect(state.user).toEqual(testUser);
        expect(state.isAuthenticated).toBe(true);
    });

    it('setToken関数が正しくトークン情報を更新すること', () => {
        act(() => {
            useAuthStore.getState().setToken('new-token', 'new-refresh-token');
        });

        const state = useAuthStore.getState();
        expect(state.token).toBe('new-token');
        expect(state.refreshToken).toBe('new-refresh-token');
    });

    it('clearError関数がエラー状態をクリアすること', () => {
        // エラー状態を設定
        act(() => {
            useAuthStore.setState({ error: 'テストエラー' });
        });

        expect(useAuthStore.getState().error).toBe('テストエラー');

        // エラークリア
        act(() => {
            useAuthStore.getState().clearError();
        });

        expect(useAuthStore.getState().error).toBeNull();
    });
});