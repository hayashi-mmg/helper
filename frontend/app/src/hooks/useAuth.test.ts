import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import useAuth from './useAuth';

// ナビゲーションのモック
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedNavigate,
}));

// Axiosのモック
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>{children}</BrowserRouter>
);

describe('useAuth', () => {
    beforeEach(() => {
        // ストレージをクリア
        localStorage.clear();
        sessionStorage.clear();
        
        // モックをリセット
        jest.clearAllMocks();
        
        // axiosの初期状態を設定
        mockedAxios.defaults = { headers: { common: {} } } as any;
    });

    it('should return initial state', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });
        
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.user).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('should login successfully', async () => {
        const mockUser = { id: '1', username: 'testuser', email: 'test@example.com', role: 'user' };
        const mockToken = 'mock-token';
        
        mockedAxios.post.mockResolvedValueOnce({ data: { user: mockUser, token: mockToken } });
        
        const { result } = renderHook(() => useAuth(), { wrapper });
        
        await act(async () => {
            await result.current.login('test@example.com', 'password');
        });
        
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user).toEqual(mockUser);
        expect(mockedAxios.defaults.headers.common['Authorization']).toBe(`Bearer ${mockToken}`);
    });

    it('should handle login error', async () => {
        const errorMessage = 'Invalid credentials';
        mockedAxios.post.mockRejectedValueOnce(new Error(errorMessage));
        
        const { result } = renderHook(() => useAuth(), { wrapper });
        
        await act(async () => {
            await result.current.login('test@example.com', 'wrong-password');
        });
        
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.error).toBe(errorMessage);
        expect(result.current.user).toBeNull();
    });

    it('should logout successfully', async () => {
        // まず、ログイン状態にする
        const mockUser = { id: '1', username: 'testuser', email: 'test@example.com', role: 'user' };
        const mockToken = 'mock-token';
        
        mockedAxios.post.mockResolvedValueOnce({ data: { user: mockUser, token: mockToken } });
        
        const { result } = renderHook(() => useAuth(), { wrapper });
        
        await act(async () => {
            await result.current.login('test@example.com', 'password');
        });
        
        // ログアウト処理
        act(() => {
            result.current.logout();
        });
        
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.user).toBeNull();
        expect(mockedAxios.defaults.headers.common['Authorization']).toBeUndefined();
    });

    it('should register successfully', async () => {
        const mockUser = { id: '1', username: 'newuser', email: 'new@example.com', role: 'user' };
        const mockToken = 'new-mock-token';
        
        mockedAxios.post.mockResolvedValueOnce({ data: { user: mockUser, token: mockToken } });
        
        const { result } = renderHook(() => useAuth(), { wrapper });
        
        await act(async () => {
            await result.current.register('newuser', 'new@example.com', 'password');
        });
        
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user).toEqual(mockUser);
        expect(mockedAxios.defaults.headers.common['Authorization']).toBe(`Bearer ${mockToken}`);
    });

    it('should redirect when not authenticated', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper });
        
        act(() => {
            result.current.requireAuth();
        });
        
        expect(mockedNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });

    it('should not redirect when authenticated', async () => {
        // まず、ログイン状態にする
        const mockUser = { id: '1', username: 'testuser', email: 'test@example.com', role: 'user' };
        const mockToken = 'mock-token';
        
        mockedAxios.post.mockResolvedValueOnce({ data: { user: mockUser, token: mockToken } });
        
        const { result } = renderHook(() => useAuth(), { wrapper });
        
        await act(async () => {
            await result.current.login('test@example.com', 'password');
        });
        
        act(() => {
            result.current.requireAuth();
        });
        
        expect(mockedNavigate).not.toHaveBeenCalled();
    });

    it('should handle password reset', async () => {
        mockedAxios.post.mockResolvedValueOnce({});
        
        const { result } = renderHook(() => useAuth(), { wrapper });
        
        await act(async () => {
            await result.current.resetPassword('test@example.com');
        });
        
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('should clear error when requested', async () => {
        // エラー状態を作成
        const errorMessage = 'Some error';
        mockedAxios.post.mockRejectedValueOnce(new Error(errorMessage));
        
        const { result } = renderHook(() => useAuth(), { wrapper });
        
        await act(async () => {
            await result.current.login('test@example.com', 'wrong-password');
        });
        
        expect(result.current.error).toBe(errorMessage);
        
        // エラークリア
        act(() => {
            result.current.clearError();
        });
        
        expect(result.current.error).toBeNull();
    });
});
