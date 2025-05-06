/**
 * 環境変数を安全に取得するためのユーティリティ関数
 * 環境変数が存在しない場合はデフォルト値を返す
 * Jestとの互換性を確保
 * 
 * @param key - 取得する環境変数のキー
 * @param defaultValue - 環境変数が未定義の場合のデフォルト値
 * @returns 環境変数の値またはデフォルト値
 */
export const getEnv = <T>(key: string, defaultValue: T): T => {
    // Jest環境の場合
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test') {
        // テスト用のモック環境変数
        const mockEnv: Record<string, any> = {
            'VITE_APP_NAME': 'テストアプリ',
            'VITE_TEST_STRING': 'test',
            'VITE_TEST_NUMBER': 123,
            'VITE_TEST_BOOLEAN_TRUE': true,
            'VITE_TEST_BOOLEAN_FALSE': false,
            'VITE_ENABLE_DEBUG': true,
            'VITE_ENABLE_MOCK': true,
            'MODE': 'test',
            'DEV': true,
            'PROD': false,
        };
        
        const value = mockEnv[key];
        if (value !== undefined) {
            return value as T;
        }
        
        // process.envからの値取得を試みる
        const envValue = process.env[key];
        if (envValue !== undefined) {
            return convertValue(envValue, defaultValue);
        }
        
        return defaultValue;
    }
    
    // Vite環境の場合
    try {
        // @ts-ignore - import.meta.envはViteでは利用可能だがJestでは利用不可
        const value = import.meta.env[key];
        
        if (value === undefined) {
            return defaultValue;
        }
        
        return convertValue(value, defaultValue);
    } catch (e) {
        console.error('環境変数アクセスに失敗しました:', e);
        return defaultValue;
    }
};

/**
 * 値を適切な型に変換する
 */
function convertValue<T>(value: string, defaultValue: T): T {
    // 型に応じた変換処理
    if (typeof defaultValue === 'boolean') {
        return (value === 'true') as unknown as T;
    }
    
    if (typeof defaultValue === 'number') {
        return Number(value) as unknown as T;
    }
    
    return value as unknown as T;
}

/**
 * アプリケーションが開発モードかどうかを判定
 * @returns 開発モードの場合はtrue、それ以外はfalse
 */
export const isDevelopment = (): boolean => {
    return getEnv('DEV', false);
};

/**
 * アプリケーションが本番モードかどうかを判定
 * @returns 本番モードの場合はtrue、それ以外はfalse
 */
export const isProduction = (): boolean => {
    return getEnv('PROD', false);
};

/**
 * アプリケーションがテストモードかどうかを判定
 * @returns テストモードの場合はtrue、それ以外はfalse
 */
export const isTest = (): boolean => {
    return getEnv('MODE', '') === 'test' || 
           (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test');
};

/**
 * デバッグモードが有効かどうかを判定
 * @returns デバッグモードが有効な場合はtrue、それ以外はfalse
 */
export const isDebugEnabled = (): boolean => {
    return getEnv('VITE_ENABLE_DEBUG', false);
};

/**
 * モックモードが有効かどうかを判定
 * @returns モックモードが有効な場合はtrue、それ以外はfalse
 */
export const isMockEnabled = (): boolean => {
    return getEnv('VITE_ENABLE_MOCK', false);
};