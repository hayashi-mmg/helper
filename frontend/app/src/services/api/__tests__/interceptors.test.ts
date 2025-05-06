/**
 * APIインターセプターのテスト
 */
import { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { setupInterceptors } from '../interceptors';

// 認証トークンのローカルストレージキー
const AUTH_TOKEN_KEY = 'auth_token';

// axiosのモックインスタンス作成関数
const createMockAxiosInstance = (): jest.Mocked<AxiosInstance> => {
    const mockRequestUse = jest.fn();
    const mockResponseUse = jest.fn();

    return {
        interceptors: {
            request: { use: mockRequestUse },
            response: { use: mockResponseUse },
        },
    } as any;
};

// ローカルストレージのモック
const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, value: string) => {
            store[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
            delete store[key];
        }),
        clear: jest.fn(() => {
            store = {};
        }),
    };
})();

// windowオブジェクトのモック
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'location', {
    value: { href: '' },
    writable: true,
});

describe('interceptors', () => {
    let mockAxios: jest.Mocked<AxiosInstance>;
    let requestInterceptor: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig;
    let responseSuccessInterceptor: (response: AxiosResponse) => AxiosResponse;
    let responseErrorInterceptor: (error: AxiosError) => Promise<never>;

    beforeEach(() => {
        // モックのリセット
        jest.clearAllMocks();
        localStorageMock.clear();
        window.location.href = '';

        // モックAxiosインスタンスの作成
        mockAxios = createMockAxiosInstance();
        
        // インターセプターの設定
        setupInterceptors(mockAxios);
        
        // リクエスト/レスポンスハンドラーの取得
        requestInterceptor = mockAxios.interceptors.request.use.mock.calls[0][0];
        responseSuccessInterceptor = mockAxios.interceptors.response.use.mock.calls[0][0];
        responseErrorInterceptor = mockAxios.interceptors.response.use.mock.calls[0][1];
    });

    describe('リクエストインターセプター', () => {
        it('認証トークンが存在しない場合は変更なし', () => {
            const config = { headers: {} } as InternalAxiosRequestConfig;
            const result = requestInterceptor(config);
            expect(result.headers?.Authorization).toBeUndefined();
        });

        it('認証トークンが存在する場合はAuthorizationヘッダーを追加', () => {
            localStorageMock.setItem(AUTH_TOKEN_KEY, 'test-token');
            
            const config = { headers: {} } as InternalAxiosRequestConfig;
            const result = requestInterceptor(config);
            
            expect(result.headers?.Authorization).toBe('Bearer test-token');
        });

        it('既存のヘッダーを保持する', () => {
            localStorageMock.setItem(AUTH_TOKEN_KEY, 'test-token');
            
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Custom-Header': 'custom-value',
                },
            } as InternalAxiosRequestConfig;
            
            const result = requestInterceptor(config);
            
            expect(result.headers?.Authorization).toBe('Bearer test-token');
            expect(result.headers?.['Content-Type']).toBe('application/json');
            expect(result.headers?.['X-Custom-Header']).toBe('custom-value');
        });
    });

    describe('レスポンス成功インターセプター', () => {
        it('レスポンスをそのまま返す', () => {
            const mockResponse = { data: { test: 'data' } } as AxiosResponse;
            const result = responseSuccessInterceptor(mockResponse);
            expect(result).toBe(mockResponse);
        });
    });

    describe('レスポンスエラーインターセプター', () => {
        it('ネットワークエラーの処理', async () => {
            const mockError = {
                message: 'Network Error',
                response: undefined,
            } as AxiosError;

            await expect(responseErrorInterceptor(mockError)).rejects.toThrow(
                'ネットワーク接続に問題があります。インターネット接続を確認してください。'
            );
            
            expect(console.error).toHaveBeenCalledWith(
                'ネットワークエラー:',
                'Network Error'
            );
        });

        it('認証エラー(401)の処理', async () => {
            // ローカルストレージにトークンを設定
            localStorageMock.setItem(AUTH_TOKEN_KEY, 'test-token');
            
            const mockError = {
                response: {
                    status: 401,
                    data: { message: 'Unauthorized' },
                },
            } as unknown as AxiosError;

            await expect(responseErrorInterceptor(mockError)).rejects.toThrow(
                '認証の有効期限が切れました。再度ログインしてください。'
            );
            
            // ローカルストレージからトークンが削除されることを確認
            expect(localStorageMock.removeItem).toHaveBeenCalledWith(AUTH_TOKEN_KEY);
            
            // ログインページへのリダイレクトを確認
            expect(window.location.href).toBe('/login');
        });

        it('サーバーエラー(5xx)の処理', async () => {
            const mockError = {
                response: {
                    status: 500,
                    data: { message: 'Internal Server Error' },
                },
            } as unknown as AxiosError;

            await expect(responseErrorInterceptor(mockError)).rejects.toThrow(
                'サーバーエラーが発生しました。しばらく経ってからもう一度お試しください。'
            );
            
            expect(console.error).toHaveBeenCalledWith(
                'サーバーエラー:',
                { message: 'Internal Server Error' }
            );
        });

        it('バリデーションエラー(400)の処理', async () => {
            const mockError = {
                response: {
                    status: 400,
                    data: { message: 'Validation failed' },
                },
            } as unknown as AxiosError;

            await expect(responseErrorInterceptor(mockError)).rejects.toThrow(
                'Validation failed'
            );
            
            expect(console.error).toHaveBeenCalledWith(
                'バリデーションエラー:',
                { message: 'Validation failed' }
            );
        });

        it('その他のエラーの処理', async () => {
            const mockError = {
                response: {
                    status: 403,
                    data: { message: 'Forbidden' },
                },
            } as unknown as AxiosError;

            await expect(responseErrorInterceptor(mockError)).rejects.toBe(mockError);
            
            expect(console.error).toHaveBeenCalledWith(
                'API エラー (403):',
                { message: 'Forbidden' }
            );
        });
    });
});

// console.errorのモック
beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
    (console.error as jest.Mock).mockRestore();
});