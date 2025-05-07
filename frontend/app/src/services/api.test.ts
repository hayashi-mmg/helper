import axios from 'axios';
import { apiClient, ApiError } from './api';

// axiosをモック化
jest.mock('axios', () => {
    return {
        create: jest.fn(() => ({
            interceptors: {
                request: { use: jest.fn() },
                response: { use: jest.fn() },
            },
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            patch: jest.fn(),
            delete: jest.fn(),
        })),
    };
});

describe('APIクライアント', () => {
    // 各テスト前にモックをリセット
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('GETリクエストが正しく処理されること', async () => {
        // モックの戻り値を設定
        const mockResponse = {
            data: {
                data: { id: '1', name: 'テストユーザー' },
                status: 200,
                message: 'Success',
            },
        };
        
        const mockAxiosCreate = axios.create as jest.Mock;
        const mockGet = mockAxiosCreate().get as jest.Mock;
        mockGet.mockResolvedValueOnce(mockResponse);
        
        // APIクライアントを使用してGETリクエストを送信
        const result = await apiClient.get('/users/1');
        
        // 正しいURLでリクエストが送られたことを確認
        expect(mockGet).toHaveBeenCalledWith('/users/1', undefined);
        
        // レスポンスデータが正しく解析されていることを確認
        expect(result).toEqual({ id: '1', name: 'テストユーザー' });
    });
    
    it('POSTリクエストが正しく処理されること', async () => {
        // モックの戻り値を設定
        const mockResponse = {
            data: {
                data: { id: '2', name: '新規ユーザー' },
                status: 201,
                message: 'Created',
            },
        };
        
        const mockAxiosCreate = axios.create as jest.Mock;
        const mockPost = mockAxiosCreate().post as jest.Mock;
        mockPost.mockResolvedValueOnce(mockResponse);
        
        const postData = { name: '新規ユーザー' };
        
        // APIクライアントを使用してPOSTリクエストを送信
        const result = await apiClient.post('/users', postData);
        
        // 正しいURLと本文でリクエストが送られたことを確認
        expect(mockPost).toHaveBeenCalledWith('/users', postData, undefined);
        
        // レスポンスデータが正しく解析されていることを確認
        expect(result).toEqual({ id: '2', name: '新規ユーザー' });
    });
    
    it('認証トークンが設定できること', async () => {
        // モックの戻り値を設定
        const mockResponse = {
            data: {
                data: { id: '1', name: 'テストユーザー' },
                status: 200,
            },
        };
        
        const mockAxiosCreate = axios.create as jest.Mock;
        const mockGet = mockAxiosCreate().get as jest.Mock;
        mockGet.mockResolvedValueOnce(mockResponse);
        
        // インターセプターの動作を確認するため、リクエスト前にトークンを設定
        const testToken = 'test-auth-token';
        apiClient.setAuthToken(testToken);
        
        // APIクライアントでリクエストを実行
        await apiClient.get('/users/1');
        
        // インターセプターがトークンをヘッダーに追加していることを確認
        const requestInterceptor = mockAxiosCreate().interceptors.request.use.mock.calls[0][0];
        const config = { headers: {} };
        const modifiedConfig = requestInterceptor(config);
        
        expect(modifiedConfig.headers.Authorization).toBe(`Bearer ${testToken}`);
        
        // トークンをクリアする
        apiClient.clearAuthToken();
        
        // トークンがクリアされていることを確認
        const configAfterClear = { headers: {} };
        const modifiedConfigAfterClear = requestInterceptor(configAfterClear);
        
        expect(modifiedConfigAfterClear.headers.Authorization).toBeUndefined();
    });
});