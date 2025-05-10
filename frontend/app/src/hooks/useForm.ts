import { useForm as useReactHookForm, UseFormProps, UseFormReturn, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z, ZodType } from 'zod';
import { useState, useCallback } from 'react';

/**
 * フォーム送信の結果の型定義
 */
interface SubmitResult<T> {
    data: T | null;
    error: Error | null;
    isSuccess: boolean;
}

/**
 * 拡張したuseForm関数の戻り値の型定義
 */
interface UseFormExtendedReturn<TFieldValues extends FieldValues, TContext> 
    extends UseFormReturn<TFieldValues, TContext> {
    isSubmitting: boolean;
    isSubmitSuccessful: boolean;
    submitError: Error | null;
    submitData: any | null;
    handleSubmitWithData: <R>(
        onValid: (data: TFieldValues) => Promise<R>, 
        onInvalid?: (errors: unknown) => void
    ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
    reset: () => void;
    resetSubmitState: () => void;
}

/**
 * react-hook-formを拡張した独自のフォームフックを提供する
 * 
 * @param schema Zodバリデーションスキーマ
 * @param options react-hook-formのオプション
 * @returns 拡張されたフォーム操作オブジェクト
 */
function useForm<TFieldValues extends FieldValues = FieldValues, TContext = any>(
    schema?: ZodType<any>,
    options?: UseFormProps<TFieldValues, TContext>
): UseFormExtendedReturn<TFieldValues, TContext> {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isSubmitSuccessful, setIsSubmitSuccessful] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<Error | null>(null);
    const [submitData, setSubmitData] = useState<any | null>(null);

    // スキーマがある場合は検証を設定する
    const formOptions = schema
        ? { ...options, resolver: zodResolver(schema) }
        : options;

    // react-hook-formをラップする
    const methods = useReactHookForm<TFieldValues, TContext>(formOptions as UseFormProps<TFieldValues, TContext>);

    /**
     * 送信処理をラップし、状態を管理する
     * 
     * @param onValid フォームが有効な場合の処理
     * @param onInvalid フォームが無効な場合の処理
     * @returns イベントハンドラ関数
     */
    const handleSubmitWithData = useCallback(<R>(
        onValid: (data: TFieldValues) => Promise<R>,
        onInvalid?: (errors: unknown) => void
    ) => {
        return methods.handleSubmit(async (data) => {
            setIsSubmitting(true);
            setSubmitError(null);
            setSubmitData(null);

            try {
                const result = await onValid(data);
                setSubmitData(result);
                setIsSubmitSuccessful(true);
                return result;
            } catch (error) {
                setSubmitError(error instanceof Error ? error : new Error('Submit failed'));
                setIsSubmitSuccessful(false);
                throw error;
            } finally {
                setIsSubmitting(false);
            }
        }, (errors) => {
            if (onInvalid) onInvalid(errors);
        });
    }, [methods]);

    /**
     * フォームとサブミット状態をリセット
     */
    const reset = useCallback(() => {
        methods.reset();
        setIsSubmitting(false);
        setIsSubmitSuccessful(false);
        setSubmitError(null);
        setSubmitData(null);
    }, [methods]);

    /**
     * サブミット状態のみリセット
     */
    const resetSubmitState = useCallback(() => {
        setIsSubmitting(false);
        setIsSubmitSuccessful(false);
        setSubmitError(null);
        setSubmitData(null);
    }, []);

    return {
        ...methods,
        isSubmitting,
        isSubmitSuccessful,
        submitError,
        submitData,
        handleSubmitWithData,
        reset,
        resetSubmitState,
    };
}

export default useForm;
export type { UseFormExtendedReturn, SubmitResult };
