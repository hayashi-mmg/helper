import { getEnv, isDevelopment, isProduction, isDebugEnabled, isMockEnabled } from './env';

// importするmoduleをモック
jest.mock('../utils/env', () => {
    const originalModule = jest.requireActual('../utils/env');
    
    return {
        __esModule: true,
        ...originalModule,
        // テスト用に環境変数関連の関数をオーバーライド
    };
});

describe('環境変数ユーティリティ', () => {
    // テスト前の環境変数を保存
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        // テスト用の環境変数をセット
        process.env = {
            ...originalEnv,
            VITE_TEST_STRING: 'test-value',
            VITE_TEST_NUMBER: '42',
            VITE_TEST_BOOLEAN_TRUE: 'true',
            VITE_TEST_BOOLEAN_FALSE: 'false',
            VITE_ENABLE_DEBUG: 'true',
            VITE_ENABLE_MOCK: 'true',
        };

        // import.meta.envをモックする
        Object.defineProperty(window, 'import', {
            value: {
                meta: {
                    env: {
                        VITE_TEST_STRING: 'test-value',
                        VITE_TEST_NUMBER: '42',
                        VITE_TEST_BOOLEAN_TRUE: 'true',
                        VITE_TEST_BOOLEAN_FALSE: 'false',
                        VITE_ENABLE_DEBUG: 'true',
                        VITE_ENABLE_MOCK: 'true',
                        DEV: true,
                        PROD: false
                    }
                }
            },
            writable: true
        });
    });

    afterEach(() => {
        // テスト後に環境変数を元に戻す
        process.env = originalEnv;
        jest.clearAllMocks();
    });

    describe('getEnv', () => {
        it('文字列の環境変数を正しく取得できる', () => {
            // モック関数から値を返すように設定
            jest.spyOn(Object.getPrototypeOf(import.meta.env), 'VITE_TEST_STRING', 'get')
                .mockReturnValue('test-value');

            const result = getEnv('VITE_TEST_STRING', 'default-value');
            expect(result).toBe('test-value');
        });

        it('数値の環境変数を正しく取得できる', () => {
            jest.spyOn(Object.getPrototypeOf(import.meta.env), 'VITE_TEST_NUMBER', 'get')
                .mockReturnValue('42');

            const result = getEnv('VITE_TEST_NUMBER', 0);
            expect(result).toBe(42);
            expect(typeof result).toBe('number');
        });

        it('真偽値(true)の環境変数を正しく取得できる', () => {
            jest.spyOn(Object.getPrototypeOf(import.meta.env), 'VITE_TEST_BOOLEAN_TRUE', 'get')
                .mockReturnValue('true');

            const result = getEnv('VITE_TEST_BOOLEAN_TRUE', false);
            expect(result).toBe(true);
            expect(typeof result).toBe('boolean');
        });

        it('真偽値(false)の環境変数を正しく取得できる', () => {
            jest.spyOn(Object.getPrototypeOf(import.meta.env), 'VITE_TEST_BOOLEAN_FALSE', 'get')
                .mockReturnValue('false');

            const result = getEnv('VITE_TEST_BOOLEAN_FALSE', true);
            expect(result).toBe(false);
            expect(typeof result).toBe('boolean');
        });

        it('存在しない環境変数はデフォルト値を返す', () => {
            jest.spyOn(Object.getPrototypeOf(import.meta.env), 'VITE_NON_EXISTENT', 'get')
                .mockReturnValue(undefined);

            const result = getEnv('VITE_NON_EXISTENT', 'default');
            expect(result).toBe('default');
        });
    });

    describe('環境判定関数', () => {
        it('isDevelopmentは開発環境かどうかを正しく判定する', () => {
            // DEVがtrueの場合
            jest.spyOn(Object.getPrototypeOf(import.meta.env), 'DEV', 'get')
                .mockReturnValue(true);

            expect(isDevelopment()).toBe(true);
            
            // DEVがfalseの場合
            jest.spyOn(Object.getPrototypeOf(import.meta.env), 'DEV', 'get')
                .mockReturnValue(false);
                
            expect(isDevelopment()).toBe(false);
        });

        it('isProductionは本番環境かどうかを正しく判定する', () => {
            // PRODがfalseの場合
            jest.spyOn(Object.getPrototypeOf(import.meta.env), 'PROD', 'get')
                .mockReturnValue(false);

            expect(isProduction()).toBe(false);
            
            // PRODがtrueの場合
            jest.spyOn(Object.getPrototypeOf(import.meta.env), 'PROD', 'get')
                .mockReturnValue(true);
                
            expect(isProduction()).toBe(true);
        });

        it('isDebugEnabledはデバッグモードかどうかを正しく判定する', () => {
            // VITE_ENABLE_DEBUGがtrueの場合
            jest.spyOn(Object.getPrototypeOf(import.meta.env), 'VITE_ENABLE_DEBUG', 'get')
                .mockReturnValue('true');

            expect(isDebugEnabled()).toBe(true);
            
            // VITE_ENABLE_DEBUGがfalseの場合
            jest.spyOn(Object.getPrototypeOf(import.meta.env), 'VITE_ENABLE_DEBUG', 'get')
                .mockReturnValue('false');
                
            expect(isDebugEnabled()).toBe(false);
        });

        it('isMockEnabledはモックモードかどうかを正しく判定する', () => {
            // VITE_ENABLE_MOCKがtrueの場合
            jest.spyOn(Object.getPrototypeOf(import.meta.env), 'VITE_ENABLE_MOCK', 'get')
                .mockReturnValue('true');

            expect(isMockEnabled()).toBe(true);
            
            // VITE_ENABLE_MOCKがfalseの場合
            jest.spyOn(Object.getPrototypeOf(import.meta.env), 'VITE_ENABLE_MOCK', 'get')
                .mockReturnValue('false');
                
            expect(isMockEnabled()).toBe(false);
        });
    });
});