/**
 * エラー状態管理ストアのテスト
 */
import { act } from '@testing-library/react';
import { useErrorStore } from '../useErrorStore';

describe('useErrorStore', () => {
    // 各テスト後にストアをリセット
    afterEach(() => {
        act(() => {
            useErrorStore.setState({
                hasError: false,
                errorCode: null,
                errorMessage: null,
                errorDetails: null,
                requestId: null,
                fieldErrors: {},
            });
        });
    });

    it('初期状態が正しく設定されていること', () => {
        const state = useErrorStore.getState();
        expect(state.hasError).toBe(false);
        expect(state.errorCode).toBeNull();
        expect(state.errorMessage).toBeNull();
        expect(state.errorDetails).toBeNull();
        expect(state.requestId).toBeNull();
        expect(state.fieldErrors).toEqual({});
    });

    it('setError関数がグローバルエラーを設定すること', () => {
        act(() => {
            useErrorStore.getState().setError('E001', 'テストエラー', { detail: '詳細情報' }, 'req-123');
        });

        const state = useErrorStore.getState();
        expect(state.hasError).toBe(true);
        expect(state.errorCode).toBe('E001');
        expect(state.errorMessage).toBe('テストエラー');
        expect(state.errorDetails).toEqual({ detail: '詳細情報' });
        expect(state.requestId).toBe('req-123');
    });

    it('clearError関数がグローバルエラーをクリアすること', () => {
        // エラー状態を設定
        act(() => {
            useErrorStore.getState().setError('E001', 'テストエラー');
        });
        
        expect(useErrorStore.getState().hasError).toBe(true);
        
        // エラークリア
        act(() => {
            useErrorStore.getState().clearError();
        });
        
        const state = useErrorStore.getState();
        expect(state.hasError).toBe(false);
        expect(state.errorCode).toBeNull();
        expect(state.errorMessage).toBeNull();
        expect(state.errorDetails).toBeNull();
        expect(state.requestId).toBeNull();
    });

    it('setFieldError関数が特定のフィールドにエラーを設定すること', () => {
        act(() => {
            useErrorStore.getState().setFieldError('email', 'メールアドレスは必須です');
        });

        const state = useErrorStore.getState();
        expect(state.fieldErrors.email).toBe('メールアドレスは必須です');
    });

    it('clearFieldError関数が特定のフィールドのエラーをクリアすること', () => {
        // フィールドエラーを設定
        act(() => {
            const store = useErrorStore.getState();
            store.setFieldError('email', 'メールアドレスは必須です');
            store.setFieldError('password', 'パスワードは8文字以上必要です');
        });
        
        // emailフィールドのエラーをクリア
        act(() => {
            useErrorStore.getState().clearFieldError('email');
        });
        
        const state = useErrorStore.getState();
        expect(state.fieldErrors.email).toBeUndefined();
        expect(state.fieldErrors.password).toBe('パスワードは8文字以上必要です');
    });

    it('clearAllFieldErrors関数がすべてのフィールドエラーをクリアすること', () => {
        // 複数のフィールドエラーを設定
        act(() => {
            const store = useErrorStore.getState();
            store.setFieldError('email', 'メールアドレスは必須です');
            store.setFieldError('password', 'パスワードは8文字以上必要です');
            store.setFieldError('name', '名前は必須です');
        });
        
        // すべてのフィールドエラーをクリア
        act(() => {
            useErrorStore.getState().clearAllFieldErrors();
        });
        
        expect(useErrorStore.getState().fieldErrors).toEqual({});
    });

    it('hasFieldErrors関数がフィールドエラーの有無を正しく判定すること', () => {
        // 初期状態ではエラーなし
        expect(useErrorStore.getState().hasFieldErrors()).toBe(false);
        
        // フィールドエラーを追加
        act(() => {
            useErrorStore.getState().setFieldError('email', 'メールアドレスは必須です');
        });
        
        expect(useErrorStore.getState().hasFieldErrors()).toBe(true);
        
        // フィールドエラーをクリア
        act(() => {
            useErrorStore.getState().clearAllFieldErrors();
        });
        
        expect(useErrorStore.getState().hasFieldErrors()).toBe(false);
    });
});