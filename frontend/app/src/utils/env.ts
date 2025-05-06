/**
 * 環境変数を安全に取得するためのユーティリティ関数
 * 環境変数が存在しない場合はデフォルト値を返す
 * 
 * @param key - 取得する環境変数のキー
 * @param defaultValue - 環境変数が未定義の場合のデフォルト値
 * @returns 環境変数の値またはデフォルト値
 */
export const getEnv = <T>(key: keyof ImportMetaEnv, defaultValue: T): T => {
    const value = import.meta.env[key];
    
    if (value === undefined) {
        return defaultValue;
    }
    
    // 型に応じた変換処理
    if (typeof defaultValue === 'boolean') {
        return (value === 'true') as unknown as T;
    }
    
    if (typeof defaultValue === 'number') {
        return Number(value) as unknown as T;
    }
    
    return value as unknown as T;
};

/**
 * アプリケーションが開発モードかどうかを判定
 * @returns 開発モードの場合はtrue、それ以外はfalse
 */
export const isDevelopment = (): boolean => {
    return import.meta.env.DEV;
};

/**
 * アプリケーションが本番モードかどうかを判定
 * @returns 本番モードの場合はtrue、それ以外はfalse
 */
export const isProduction = (): boolean => {
    return import.meta.env.PROD;
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