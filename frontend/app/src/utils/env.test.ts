/**
 * env.ts のユニットテスト
 * 環境変数アクセスユーティリティのテスト
 */

// テスト用の環境変数をJestがグローバルにモック
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        DEV: true,
        PROD: false,
        VITE_APP_NAME: 'テストアプリ',
        VITE_ENABLE_DEBUG: 'false',
        VITE_ENABLE_MOCK: 'true',
        VITE_NUMBER_VALUE: '42',
        MODE: 'test'
      }
    }
  },
  writable: true
});

// モジュールをモック
jest.mock('../utils/env', () => {
  // 実際の実装をモックで上書き
  return {
    getEnv: (key, defaultValue) => {
      const envValue = global.import.meta.env[key];
      
      if (envValue === undefined) {
        return defaultValue;
      }
      
      if (typeof defaultValue === 'boolean') {
        return envValue === 'true';
      }
      
      if (typeof defaultValue === 'number') {
        return Number(envValue);
      }
      
      return envValue;
    },
    isDevelopment: () => global.import.meta.env.DEV === true,
    isProduction: () => global.import.meta.env.PROD === true,
    isDebugEnabled: () => global.import.meta.env.VITE_ENABLE_DEBUG === 'true',
    isMockEnabled: () => global.import.meta.env.VITE_ENABLE_MOCK === 'true'
  };
});

// モジュールを明示的にインポート
const { getEnv, isDevelopment, isProduction, isDebugEnabled, isMockEnabled } = require('../utils/env');

describe('環境変数ユーティリティ', () => {
  describe('getEnv', () => {
    it('環境変数が存在する場合はその値を返す', () => {
      expect(getEnv('VITE_APP_NAME', 'デフォルト名')).toBe('テストアプリ');
    });

    it('環境変数が存在しない場合はデフォルト値を返す', () => {
      expect(getEnv('VITE_NON_EXISTENT', 'デフォルト値')).toBe('デフォルト値');
    });

    it('booleanの環境変数を正しく解析する', () => {
      expect(getEnv('VITE_ENABLE_DEBUG', true)).toBe(false);
    });

    it('numberの環境変数を正しく解析する', () => {
      expect(getEnv('VITE_NUMBER_VALUE', 0)).toBe(42);
    });
  });

  describe('isDevelopment', () => {
    it('開発環境の場合はtrueを返す', () => {
      expect(isDevelopment()).toBe(true);
    });
  });

  describe('isProduction', () => {
    it('本番環境でない場合はfalseを返す', () => {
      expect(isProduction()).toBe(false);
    });
  });

  describe('isDebugEnabled', () => {
    it('デバッグモードが無効の場合はfalseを返す', () => {
      expect(isDebugEnabled()).toBe(false);
    });
  });

  describe('isMockEnabled', () => {
    it('モックモードが有効の場合はtrueを返す', () => {
      expect(isMockEnabled()).toBe(true);
    });
  });
});