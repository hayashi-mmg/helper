
import {
    FormControl,
    FormLabel,
    Input,
    FormErrorMessage,
    FormHelperText,
    InputProps,
    InputGroup,
    InputLeftElement,
    InputRightElement,
} from '@chakra-ui/react';

export interface TextInputProps extends Omit<InputProps, 'size'> {
    /**
     * 入力フィールドのラベル
     */
    label?: string;
    
    /**
     * エラーメッセージ
     */
    error?: string;
    
    /**
     * ヘルプテキスト
     */
    helperText?: string;
    
    /**
     * 必須フィールドかどうか
     * @default false
     */
    isRequired?: boolean;
    
    /**
     * 入力フィールドの左側に表示する要素
     */
    leftElement?: React.ReactNode;
    
    /**
     * 入力フィールドの右側に表示する要素
     */
    rightElement?: React.ReactNode;
    
    /**
     * コンポーネントのサイズ
     * @default 'md'
     */
    size?: 'xs' | 'sm' | 'md' | 'lg';
}

/**
 * テキスト入力フィールドコンポーネント
 * 基本的なテキスト入力に使用します
 */
export const TextInput: React.FC<TextInputProps> = ({
    label,
    error,
    helperText,
    isRequired = false,
    leftElement,
    rightElement,
    size = 'md',
    id,
    placeholder,
    ...rest
}) => {
    // 一意のIDを生成（指定がない場合）
    const inputId = id || `text-input-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
        <FormControl isInvalid={!!error} isRequired={isRequired} mb={4}>
            {label && (
                <FormLabel htmlFor={inputId}>{label}</FormLabel>
            )}
            
            <InputGroup size={size}>
                {leftElement && (
                    <InputLeftElement pointerEvents="none">
                        {leftElement}
                    </InputLeftElement>
                )}
                
                <Input
                    id={inputId}
                    placeholder={placeholder}
                    size={size}
                    {...rest}
                />
                
                {rightElement && (
                    <InputRightElement>
                        {rightElement}
                    </InputRightElement>
                )}
            </InputGroup>
            
            {helperText && !error && (
                <FormHelperText>{helperText}</FormHelperText>
            )}
            
            {error && (
                <FormErrorMessage>{error}</FormErrorMessage>
            )}
        </FormControl>
    );
};

export default TextInput;