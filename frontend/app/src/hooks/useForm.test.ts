import { renderHook, act, waitFor } from '@testing-library/react';
import { z } from 'zod';
import useForm from './useForm';

describe('useForm', () => {
    // 簡単なテスト用スキーマ
    const testSchema = z.object({
        name: z.string().min(1, '名前は必須です'),
        email: z.string().email('有効なメールアドレスを入力してください'),
        age: z.number().min(18, '18歳以上である必要があります'),
    });

    type TestFormValues = {
        name: string;
        email: string;
        age: number;
    };

    it('should initialize form with default values', () => {
        const defaultValues = {
            name: '',
            email: '',
            age: 0,
        };

        const { result } = renderHook(() => 
            useForm<TestFormValues>(testSchema, { defaultValues })
        );

        expect(result.current.getValues()).toEqual(defaultValues);
    });

    it('should validate form values using zod schema', async () => {
        const { result } = renderHook(() => useForm<TestFormValues>(testSchema));

        // 空のフォーム値を設定
        act(() => {
            result.current.setValue('name', '');
            result.current.setValue('email', 'invalid-email');
            result.current.setValue('age', 16);
        });

        // バリデーションをトリガー
        let isValid;
        await act(async () => {
            isValid = await result.current.trigger();
        });

        expect(isValid).toBe(false);
        expect(result.current.formState.errors.name?.message).toBe('名前は必須です');
        expect(result.current.formState.errors.email?.message).toBe('有効なメールアドレスを入力してください');
        expect(result.current.formState.errors.age?.message).toBe('18歳以上である必要があります');
    });

    it('should handle successful form submission', async () => {
        const mockSuccessResponse = { id: '123', success: true };
        const mockSubmitFn = jest.fn().mockResolvedValue(mockSuccessResponse);

        const { result } = renderHook(() => useForm<TestFormValues>(testSchema));

        // 有効なフォーム値を設定
        act(() => {
            result.current.setValue('name', 'テスト太郎');
            result.current.setValue('email', 'test@example.com');
            result.current.setValue('age', 25);
        });

        // フォーム送信
        await act(async () => {
            const submitHandler = result.current.handleSubmitWithData(mockSubmitFn);
            await submitHandler();
        });

        expect(mockSubmitFn).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'テスト太郎',
                email: 'test@example.com',
                age: 25
            })
        );

        expect(result.current.isSubmitSuccessful).toBe(true);
        expect(result.current.submitError).toBeNull();
        expect(result.current.submitData).toEqual(mockSuccessResponse);
    });

    it('should handle form submission error', async () => {
        const testError = new Error('送信エラー');
        const mockErrorFn = jest.fn().mockRejectedValue(testError);

        const { result } = renderHook(() => useForm<TestFormValues>(testSchema));

        // 有効なフォーム値を設定
        act(() => {
            result.current.setValue('name', 'テスト太郎');
            result.current.setValue('email', 'test@example.com');
            result.current.setValue('age', 25);
        });

        // フォーム送信
        await act(async () => {
            const submitHandler = result.current.handleSubmitWithData(mockErrorFn);
            await submitHandler().catch(() => {/* エラーを無視 */});
        });

        expect(mockErrorFn).toHaveBeenCalled();
        expect(result.current.isSubmitSuccessful).toBe(false);
        expect(result.current.submitError).toBe(testError);
        expect(result.current.submitData).toBeNull();
    });

    it('should reset form and submit state', async () => {
        const defaultValues = {
            name: '',
            email: '',
            age: 0,
        };

        const { result } = renderHook(() => 
            useForm<TestFormValues>(testSchema, { defaultValues })
        );

        // フォーム値を変更
        act(() => {
            result.current.setValue('name', 'テスト太郎');
            result.current.setValue('email', 'test@example.com');
            result.current.setValue('age', 25);
        });

        expect(result.current.getValues()).not.toEqual(defaultValues);

        // リセット
        act(() => {
            result.current.reset();
        });

        expect(result.current.getValues()).toEqual(defaultValues);
    });

    it('should only reset submit state when resetSubmitState is called', async () => {
        const mockSuccessResponse = { id: '123', success: true };
        const mockSubmitFn = jest.fn().mockResolvedValue(mockSuccessResponse);

        const { result } = renderHook(() => useForm<TestFormValues>(testSchema));

        // 有効なフォーム値を設定して送信
        act(() => {
            result.current.setValue('name', 'テスト太郎');
            result.current.setValue('email', 'test@example.com');
            result.current.setValue('age', 25);
        });

        await act(async () => {
            const submitHandler = result.current.handleSubmitWithData(mockSubmitFn);
            await submitHandler();
        });

        expect(result.current.isSubmitSuccessful).toBe(true);
        expect(result.current.submitData).toEqual(mockSuccessResponse);

        const formValuesBeforeReset = result.current.getValues();

        // 送信状態のみリセット
        act(() => {
            result.current.resetSubmitState();
        });

        // フォーム値は変わらない
        expect(result.current.getValues()).toEqual(formValuesBeforeReset);
        // 送信状態はリセットされている
        expect(result.current.isSubmitSuccessful).toBe(false);
        expect(result.current.submitData).toBeNull();
    });
});
