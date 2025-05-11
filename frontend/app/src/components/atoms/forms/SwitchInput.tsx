
import {
    FormControl,
    FormLabel,
    Switch,
    FormErrorMessage,
    FormHelperText,
    Flex,
    SwitchProps,
} from '@chakra-ui/react';

export interface SwitchInputProps extends Omit<SwitchProps, 'size'> {
    /**
     * スイッチのラベル
     */
    label?: string;
    
    /**
     * スイッチがオンになっているかどうか
     * @default false
     */
    isChecked?: boolean;
    
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
    size?: 'sm' | 'md' | 'lg';
    
    /**
     * ラベルの位置
     * @default 'start'
     */
    labelPosition?: 'start' | 'end';
    
    /**
     * 値が変更されたときのコールバック
     */
    onChange?: (isChecked: boolean) => void;
    
    /**
     * コンポーネントのID
     */
    id?: string;
}

/**
 * トグルスイッチコンポーネント
 * オン/オフの状態を切り替えるための直感的なUIコントロール
 */
export const SwitchInput: React.FC<SwitchInputProps> = ({
    label,
    isChecked = false,
    error,
    helperText,
    isRequired = false,
    size = 'md',
    labelPosition = 'start',
    onChange,
    id,
    ...rest
}) => {
    // 一意のIDを生成（指定がない場合）
    const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;
    
    // チェック状態変更ハンドラー
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
            onChange(e.target.checked);
        }
    };
    
    return (
        <FormControl 
            isInvalid={!!error} 
            isRequired={isRequired} 
            mb={4}
        >
            <Flex 
                alignItems="center" 
                justifyContent="space-between" 
                flexDirection={labelPosition === 'start' ? 'row' : 'row-reverse'}
                width="fit-content"
            >
                {label && (
                    <FormLabel 
                        htmlFor={switchId} 
                        mb={0}
                        mr={labelPosition === 'start' ? 3 : 0}
                        ml={labelPosition === 'end' ? 3 : 0}
                        cursor="pointer"
                    >
                        {label}
                    </FormLabel>
                )}
                
                <Switch
                    id={switchId}
                    isChecked={isChecked}
                    onChange={handleChange}
                    size={size}
                    {...rest}
                />
            </Flex>
            
            {helperText && !error && (
                <FormHelperText mt={2}>{helperText}</FormHelperText>
            )}
            
            {error && (
                <FormErrorMessage>{error}</FormErrorMessage>
            )}
        </FormControl>
    );
};

export default SwitchInput;