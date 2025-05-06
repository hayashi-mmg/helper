/**
 * Jest用の環境変数設定ファイル
 * テスト実行時に環境変数をモックするために使用します
 */

process.env.VITE_API_BASE_URL = 'http://localhost:8000/api/v1';

// import.meta.env のモックのためのグローバル変数
global.import = {
    meta: {
        env: {
            VITE_API_BASE_URL: process.env.VITE_API_BASE_URL,
            VITE_APP_NAME: 'テストアプリ',
            VITE_TEST_STRING: 'test',
            VITE_TEST_NUMBER: '123',
            VITE_TEST_BOOLEAN_TRUE: 'true',
            VITE_TEST_BOOLEAN_FALSE: 'false',
            VITE_ENABLE_DEBUG: 'true',
            VITE_ENABLE_MOCK: 'true',
            MODE: 'test',
            DEV: true,
            PROD: false,
            SSR: false
        }
    }
};

// テスト環境用のcrypto.randomUUIDをモック
if (!globalThis.crypto) {
  globalThis.crypto = {};
}

if (!globalThis.crypto.randomUUID) {
  globalThis.crypto.randomUUID = () => 'test-uuid';
}