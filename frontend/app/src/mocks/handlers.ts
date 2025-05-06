// APIリクエストのモックハンドラー
import { http, HttpResponse } from 'msw';
import { getEnv } from '../utils/env';

// APIのベースURL
const baseUrl = getEnv('VITE_API_BASE_URL', 'http://localhost:8000/api');

// モックハンドラーの定義
export const handlers = [
    // ヘルスチェックAPI
    http.get(`${baseUrl}/health`, () => {
        return HttpResponse.json(
            {
                status: 'ok',
                message: 'Server is running',
                timestamp: new Date().toISOString()
            },
            { status: 200 }
        );
    }),

    // ユーザー認証API (例)
    http.post(`${baseUrl}/auth/login`, async ({ request }) => {
        const body = await request.json();
        
        if (body.email === 'user@example.com' && body.password === 'password') {
            return HttpResponse.json(
                {
                    data: {
                        token: 'mock-jwt-token',
                        user: {
                            id: '1',
                            email: 'user@example.com',
                            name: 'テストユーザー'
                        }
                    },
                    status: 200,
                    message: 'ログインに成功しました'
                },
                { status: 200 }
            );
        }
        
        return HttpResponse.json(
            {
                status: 401,
                message: 'メールアドレスまたはパスワードが正しくありません'
            },
            { status: 401 }
        );
    }),

    // 404エラーのフォールバック
    http.all('*', ({ request }) => {
        console.error(`Unhandled request: ${request.method} ${request.url}`);
        return HttpResponse.json(
            {
                status: 404,
                message: 'Not Found'
            },
            { status: 404 }
        );
    })
];