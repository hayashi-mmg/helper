
import {
    FormControl,
    FormLabel,
    Radio,
    RadioGroup,
    FormErrorMessage,
    FormHelperText,
    Stack,
    RadioProps,
} from '@chakra-ui/react';

export interface RadioOption {
    /**
     * オプションの値
     */
    value: string;
    
    /**
     * オプションの表示ラベル
     */
    label: string;
    
    /**
     * オプションが無効かどうか
     * @default false
     */
    isDisabled?: boolean;
}

export interface RadioGroupInputProps {
    /**
     * ラジオグループのラベル
     */
    label?: string;
    
    /**
     * 選択肢のオプション配列
     */
    options: RadioOption[];
    
    /**
     * 選択されている値
     */
    value?: string;
    
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
     * ラジオボタンの配置方向
     * @default 'vertical'
     */
    direction?: 'horizontal' | 'vertical';
    
    /**
     * コンポーネントのサイズ
     * @default 'md'
     */
    size?: 'sm' | 'md' | 'lg';
    
    /**
     * 値が変更されたときのコールバック
     */
    onChange?: (value: string) => void;
    
    /**
     * ラジオボタンのprops
     */
    radioProps?: RadioProps;
    
    /**
     * コンポーネントのID
     */
    id?: string;
    
    /**
     * その他のProps
     */
    [x: string]: any;
}

/**
 * ラジオボタングループコンポーネント
 * 複数の選択肢から1つだけ選択するための入力コンポーネント
 */
export const RadioGroupInput: React.FC<RadioGroupInputProps> = ({
    label,
    options,
    value,
    error,
    helperText,
    isRequired = false,
    direction = 'vertical',
    size = 'md',
    onChange,
    radioProps,
    id,
    ...rest
}) => {
    // 一意のIDを生成（指定がない場合）
    const radioGroupId = id || `radio-group-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
        <FormControl isInvalid={!!error} isRequired={isRequired} mb={4} {...rest}>
            {label && (
                <FormLabel htmlFor={radioGroupId}>{label}</FormLabel>
            )}
            
            <RadioGroup
                id={radioGroupId}
                value={value}
                onChange={onChange}
            >
                <Stack direction={direction === 'horizontal' ? 'row' : 'column'} spacing={4}>
                    {options.map((option) => (
                        <Radio
                            key={`${radioGroupId}-${option.value}`}
                            value={option.value}
                            isDisabled={option.isDisabled}
                            size={size}
                            {...radioProps}
                        >
                            {option.label}
                        </Radio>
                    ))}
                </Stack>
            </RadioGroup>
            
            {helperText && !error && (
                <FormHelperText mt={2}>{helperText}</FormHelperText>
            )}
            
            {error && (
                <FormErrorMessage>{error}</FormErrorMessage>
            )}
        </FormControl>
    );
};

export default RadioGroupInput;