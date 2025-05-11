import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';
import authService, { login, register, requestPasswordReset, confirmPasswordReset } from './authService';

// Axiosのモック化
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('authService', () => {
    // 各テストの前に実行
    beforeEach(() => {
        // モックをリセット
        vi.clearAllMocks();
        
        // Axiosのcreateメソッドのモック
        mockedAxios.create.mockReturnValue(mockedAxios as any);
    });

    // 各テストの後に実行
    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('login', () => {
        it('正しい引数でAPIを呼び出し、レスポンスを返す', async () => {
            // モックレスポンスの設定
            const mockResponse = {
                data: {
                    access_token: 'test-token',
                    token_type: 'bearer',
                    expires_in: 3600,
                    refresh_token: 'test-refresh-token',
                    user: {
                        id: 1,
                        username: 'testuser',
                        email: 'test@example.com',
                        role: 'user',
                        full_name: 'Test User',
                    },
                },
            };
            mockedAxios.post.mockResolvedValue(mockResponse);

            // 関数を実行
            const result = await login('test@example.com', 'password123');

            // 期待する結果の確認
            expect(mockedAxios.post).toHaveBeenCalledWith('/auth/login', {
                username: 'test@example.com',
                password: 'password123',
            });
            expect(result).toEqual(mockResponse.data);
        });

        it('APIエラー時に適切に例外が投げられる', async () => {
            // エラーのモック
            const errorMessage = 'Invalid credentials';
            mockedAxios.post.mockRejectedValue(new Error(errorMessage));

            // エラーがスローされることを確認
            await expect(login('test@example.com', 'wrong-password')).rejects.toThrow(errorMessage);
            expect(mockedAxios.post).toHaveBeenCalledWith('/auth/login', {
                username: 'test@example.com',
                password: 'wrong-password',
            });
        });
    });

    describe('register', () => {
        it('正しい引数でAPIを呼び出し、レスポンスを返す', async () => {
            // モックレスポンスの設定
            const mockResponse = {
                data: {
                    id: 1,
                    username: 'testuser',
                    email: 'test@example.com',
                    full_name: 'Test User',
                    role: 'user',
                    created_at: '2025-05-11T00:00:00',
                },
            };
            mockedAxios.post.mockResolvedValue(mockResponse);

            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                full_name: 'Test User',
            };

            // 関数を実行
            const result = await register(userData);

            // 期待する結果の確認
            expect(mockedAxios.post).toHaveBeenCalledWith('/auth/register', userData);
            expect(result).toEqual(mockResponse.data);
        });

        it('APIエラー時に適切に例外が投げられる', async () => {
            // エラーのモック
            const errorMessage = 'Email already registered';
            mockedAxios.post.mockRejectedValue(new Error(errorMessage));

            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                full_name: 'Test User',
            };

            // エラーがスローされることを確認
            await expect(register(userData)).rejects.toThrow(errorMessage);
            expect(mockedAxios.post).toHaveBeenCalledWith('/auth/register', userData);
        });
    });

    describe('requestPasswordReset', () => {
        it('正しい引数でAPIを呼び出し、レスポンスを返す', async () => {
            // モックレスポンスの設定
            const mockResponse = {
                data: {
                    message: 'パスワードリセットメールを送信しました',
                },
            };
            mockedAxios.post.mockResolvedValue(mockResponse);

            // 関数を実行
            const result = await requestPasswordReset('test@example.com');

            // 期待する結果の確認
            expect(mockedAxios.post).toHaveBeenCalledWith('/auth/password-reset', { email: 'test@example.com' });
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('confirmPasswordReset', () => {
        it('正しい引数でAPIを呼び出し、レスポンスを返す', async () => {
            // モックレスポンスの設定
            const mockResponse = {
                data: {
                    message: 'パスワードが正常にリセットされました',
                },
            };
            mockedAxios.post.mockResolvedValue(mockResponse);

            // 関数を実行
            const result = await confirmPasswordReset('test-token', 'new-password');

            // 期待する結果の確認
            expect(mockedAxios.post).toHaveBeenCalledWith('/auth/password-reset/confirm', {
                token: 'test-token',
                password: 'new-password',
            });
            expect(result).toEqual(mockResponse.data);
        });
    });
});
