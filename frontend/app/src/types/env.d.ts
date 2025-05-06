/// <reference types="vite/client" />

interface ImportMetaEnv {
    /**
     * アプリケーション名
     */
    readonly VITE_APP_NAME: string;
    
    /**
     * API基本URL
     */
    readonly VITE_API_BASE_URL: string;
    
    /**
     * APIタイムアウト値（ミリ秒）
     */
    readonly VITE_API_TIMEOUT: number;
    
    /**
     * モックデータ使用フラグ
     */
    readonly VITE_ENABLE_MOCK: boolean;
    
    /**
     * デバッグモードフラグ
     */
    readonly VITE_ENABLE_DEBUG: boolean;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}