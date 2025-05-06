/**
 * APIクライアント設定のテスト
 */
import axios from 'axios';
import { createApiClient, createCustomApiClient } from '../apiClient';
import { setupInterceptors } from '../interceptors';

// モックの設定
jest.mock('../interceptors', () => ({
    setupInterceptors: jest.fn(),
}));

// axios.createのモック
jest.mock('axios', () => ({
    create: jest.fn().mockReturnValue({
        interceptors: {
            request: { use: jest.fn() },
            response: { use: jest.fn() },
        },
    }),
}));

describe('apiClient', () => {
    beforeEach(() => {
        // テスト前にモックをリセット
        jest.clearAllMocks();
        
        // 元の環境変数を保存
        process.env = Object.assign({}, process.env);
        
        // vitest環境のimport.meta.envをモック
        if (import.meta) {
            (import.meta as any).env = {
                VITE_API_BASE_URL: undefined,
            };
        }
    });
    
    describe('createApiClient', () => {
        it('デフォルト設定でAPIクライアントを作成する', () => {
            const apiClient = createApiClient();
            
            // axios.createが正しい設定で呼び出されることを検証
            expect(axios.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    baseURL: 'http://localhost:8000/api/v1',
                    timeout: 30000,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                })
            );
            
            // インターセプターが設定されていることを検証
            expect(setupInterceptors).toHaveBeenCalledWith(apiClient);
        });
        
        it('環境変数のベースURLを使用する', () => {
            // 環境変数を設定
            if (import.meta) {
                (import.meta as any).env.VITE_API_BASE_URL = 'https://api.example.com';
            }
            
            createApiClient();
            
            // 環境変数のURLが使用されることを検証
            expect(axios.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    baseURL: 'https://api.example.com',
                })
            );
        });
    });
    
    describe('createCustomApiClient', () => {
        it('カスタム設定でAPIクライアントを作成する', () => {
            const customConfig = {
                baseURL: 'https://custom-api.example.com',
                timeout: 5000,
                headers: {
                    'Authorization': 'Bearer test-token',
                    'X-Custom-Header': 'custom-value',
                },
            };
            
            const apiClient = createCustomApiClient(customConfig);
            
            // カスタム設定とデフォルト設定がマージされていることを検証
            expect(axios.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    baseURL: 'https://custom-api.example.com',
                    timeout: 5000,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': 'Bearer test-token',
                        'X-Custom-Header': 'custom-value',
                    },
                })
            );
            
            // インターセプターが設定されていることを検証
            expect(setupInterceptors).toHaveBeenCalledWith(apiClient);
        });
    });
});