// このファイルはJestがESM環境変数を処理するのに役立ちます
// プロジェクトのルートディレクトリに配置してください

// ViteのMSW関連の環境変数をモックします
globalThis.import = {
  meta: {
    env: {
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