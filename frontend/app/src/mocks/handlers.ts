// APIリクエストのモックハンドラー
import { http, HttpResponse, delay } from 'msw';
import { getEnv } from '../utils/env';

// APIのベースURL
const baseUrl = getEnv('VITE_API_BASE_URL', 'http://localhost:5173/api/v1');

// レスポンス用の共通ヘッダー
const commonHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'http://localhost:5173',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true'
};

// モックハンドラーの定義
export const handlers = [
    // ヘルスチェックAPI
    http.get(`${baseUrl}/health`, async () => {
        await delay(100);
        return HttpResponse.json(
            {
                status: 'ok',
                message: 'Server is running',
                timestamp: new Date().toISOString()
            },
            { headers: commonHeaders }
        );
    }),

    // ユーザー認証API
    http.post(`${baseUrl}/auth/login`, async ({ request }) => {
        try {
            const body = await request.json() as { email?: string; password?: string };
            
            await delay(500);

            if (body?.email && body?.password) {
                const defaultTestUser = {
                    id: '1',
                    email: 'hayashi@animo-web.jp',
                    name: '林'
                };

                return HttpResponse.json(
                    {
                        data: {
                            token: 'mock-jwt-token',
                            user: defaultTestUser
                        },
                        status: 200,
                        message: 'ログインに成功しました'
                    },
                    { 
                        headers: commonHeaders
                    }
                );
            }
            
            return HttpResponse.json(
                {
                    status: 401,
                    message: 'メールアドレスまたはパスワードが正しくありません'
                },
                { 
                    status: 401,
                    headers: {
                        ...commonHeaders,
                        'WWW-Authenticate': 'Bearer'
                    }
                }
            );
        } catch (error) {
            return HttpResponse.json(
                {
                    status: 400,
                    message: '不正なリクエスト形式です'
                },
                {
                    status: 400,
                    headers: commonHeaders
                }
            );
        }
    }),

    // CORSプリフライトリクエストのハンドリング
    http.options(`${baseUrl}/*`, async () => {
        await delay(50);
        return new HttpResponse(null, {
            status: 204,
            headers: commonHeaders
        });
    }),

    // APIのみの404エラーのフォールバック
    http.all(`${baseUrl}/*`, async ({ request }) => {
        console.warn(`API request not mocked: ${request.method} ${request.url}`);
        await delay(100);
        return HttpResponse.json(
            {
                status: 404,
                message: 'Not Found'
            },
            { 
                status: 404,
                headers: commonHeaders
            }
        );
    })
];