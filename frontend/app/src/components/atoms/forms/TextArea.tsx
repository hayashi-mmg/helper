
import {
    FormControl,
    FormLabel,
    Textarea,
    FormErrorMessage,
    FormHelperText,
    TextareaProps,
} from '@chakra-ui/react';

export interface TextAreaProps extends Omit<TextareaProps, 'size'> {
    /**
     * テキストエリアのラベル
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
     * コンポーネントのサイズ
     * @default 'md'
     */
    size?: 'xs' | 'sm' | 'md' | 'lg';
    
    /**
     * 行数
     * @default 3
     */
    rows?: number;
}

/**
 * 複数行テキスト入力コンポーネント
 * 長文の入力に適しています
 */
export const TextArea: React.FC<TextAreaProps> = ({
    label,
    error,
    helperText,
    isRequired = false,
    size = 'md',
    rows = 3,
    id,
    placeholder,
    ...rest
}) => {
    // 一意のIDを生成（指定がない場合）
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
        <FormControl isInvalid={!!error} isRequired={isRequired} mb={4}>
            {label && (
                <FormLabel htmlFor={textareaId}>{label}</FormLabel>
            )}
            
            <Textarea
                id={textareaId}
                placeholder={placeholder}
                size={size}
                rows={rows}
                resize="vertical"
                {...rest}
            />
            
            {helperText && !error && (
                <FormHelperText>{helperText}</FormHelperText>
            )}
            
            {error && (
                <FormErrorMessage>{error}</FormErrorMessage>
            )}
        </FormControl>
    );
};

export default TextArea;