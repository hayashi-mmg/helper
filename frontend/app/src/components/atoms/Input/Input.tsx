import {
    Input as ChakraInput,
    InputProps as ChakraInputProps,
    FormLabel,
    FormControl,
    FormErrorMessage,
    FormHelperText,
} from '@chakra-ui/react';
import { FC } from 'react';

/**
 * Inputコンポーネントのプロパティ
 * @interface InputProps
 * @extends {ChakraInputProps} - Chakra UIのInputコンポーネントのプロパティを継承
 */
export interface InputProps extends ChakraInputProps {
    /**
     * 入力フィールドのラベル
     */
    label?: string;
    
    /**
     * 入力フィールドのヘルプテキスト
     */
    helperText?: string;
    
    /**
     * エラーメッセージ（指定するとエラー状態になります）
     */
    errorMessage?: string;
    
    /**
     * フォームコントロールのID
     */
    id: string;
    
    /**
     * 必須入力かどうか
     * @default false
     */
    isRequired?: boolean;
    
    /**
     * 無効状態かどうか
     * @default false
     */
    isDisabled?: boolean;
}

/**
 * アプリケーション全体で使用される標準的な入力フィールドコンポーネント
 * Chakra UIのInputをラップし、ラベル、ヘルプテキスト、エラーメッセージなどを統合
 * 
 * @param {InputProps} props - 入力フィールドのプロパティ
 * @returns {JSX.Element} スタイル適用済みの入力フィールドコンポーネント
 */
const Input: FC<InputProps> = ({
    label,
    helperText,
    errorMessage,
    id,
    isRequired = false,
    isDisabled = false,
    ...props
}) => {
    const hasError = !!errorMessage;
    
    return (
        <FormControl 
            id={id} 
            isInvalid={hasError}
            isRequired={isRequired}
            isDisabled={isDisabled}
            mb={4}
        >
            {label && <FormLabel>{label}</FormLabel>}
            
            <ChakraInput
                id={id}
                {...props}
            />
            
            {helperText && !hasError && (
                <FormHelperText>{helperText}</FormHelperText>
            )}
            
            {hasError && (
                <FormErrorMessage>{errorMessage}</FormErrorMessage>
            )}
        </FormControl>
    );
};

export default Input;