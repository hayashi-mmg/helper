/**
 * エラー状態に関する状態管理を行うZustandストア
 */
import { create } from 'zustand';

// APIエラーの型定義
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, any>;
}

// エラー状態の型定義
interface ErrorState {
    // 状態
    hasError: boolean;
    errorCode: string | null;
    errorMessage: string | null;
    errorDetails: any | null;
    requestId: string | null;
    fieldErrors: Record<string, string>;
    
    // アクション
    setError: (code: string, message: string, details?: any, requestId?: string) => void;
    clearError: () => void;
    setFieldError: (field: string, message: string) => void;
    clearFieldError: (field: string) => void;
    clearAllFieldErrors: () => void;
    hasFieldErrors: () => boolean;
}

/**
 * エラー状態を管理するストア
 * 
 * グローバルエラーやフォームフィールドのエラーを管理します。
 * APIからのエラーレスポンスを処理し、UIで表示するための状態を提供します。
 */
export const useErrorStore = create<ErrorState>()((set, get) => ({
    // 初期状態
    hasError: false,
    errorCode: null,
    errorMessage: null,
    errorDetails: null,
    requestId: null,
    fieldErrors: {},
    
    // アクション
    /**
     * グローバルエラーを設定
     * @param code エラーコード
     * @param message エラーメッセージ
     * @param details エラー詳細（オプション）
     * @param requestId リクエストID（オプション）
     */
    setError: (code: string, message: string, details: any = null, requestId: string = null) => {
        set({
            hasError: true,
            errorCode: code,
            errorMessage: message,
            errorDetails: details,
            requestId
        });
    },
    
    /**
     * グローバルエラーをクリア
     */
    clearError: () => {
        set({
            hasError: false,
            errorCode: null,
            errorMessage: null,
            errorDetails: null,
            requestId: null
        });
    },
    
    /**
     * フィールドエラーを設定
     * @param field フィールド名
     * @param message エラーメッセージ
     */
    setFieldError: (field: string, message: string) => {
        set((state) => ({
            fieldErrors: {
                ...state.fieldErrors,
                [field]: message
            }
        }));
    },
    
    /**
     * 特定のフィールドのエラーをクリア
     * @param field フィールド名
     */
    clearFieldError: (field: string) => {
        set((state) => {
            const newFieldErrors = { ...state.fieldErrors };
            delete newFieldErrors[field];
            return { fieldErrors: newFieldErrors };
        });
    },
    
    /**
     * すべてのフィールドエラーをクリア
     */
    clearAllFieldErrors: () => {
        set({ fieldErrors: {} });
    },
    
    /**
     * フィールドエラーがあるかどうかを確認
     * @returns フィールドエラーが1つでもある場合はtrue、それ以外はfalse
     */
    hasFieldErrors: () => {
        return Object.keys(get().fieldErrors).length > 0;
    }
}));