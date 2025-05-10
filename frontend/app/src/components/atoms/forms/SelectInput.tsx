import React from 'react';
import {
    FormControl,
    FormLabel,
    Select,
    FormErrorMessage,
    FormHelperText,
    SelectProps,
} from '@chakra-ui/react';

export interface SelectOption {
    /**
     * オプションの値
     */
    value: string | number;
    
    /**
     * オプションの表示ラベル
     */
    label: string;
    
    /**
     * オプションが無効かどうか
     */
    isDisabled?: boolean;
}

export interface SelectInputProps extends Omit<SelectProps, 'size' | 'children'> {
    /**
     * セレクトボックスのラベル
     */
    label?: string;
    
    /**
     * 選択オプションの配列
     */
    options: SelectOption[];
    
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
     * 空オプションを表示するかどうか
     * @default false
     */
    showEmptyOption?: boolean;
    
    /**
     * 空オプションのテキスト
     * @default '選択してください'
     */
    emptyOptionText?: string;
    
    /**
     * コンポーネントのサイズ
     * @default 'md'
     */
    size?: 'xs' | 'sm' | 'md' | 'lg';
}

/**
 * セレクトボックスコンポーネント
 * ドロップダウンリストから選択するための入力コンポーネントです
 */
export const SelectInput: React.FC<SelectInputProps> = ({
    label,
    options,
    error,
    helperText,
    isRequired = false,
    showEmptyOption = false,
    emptyOptionText = '選択してください',
    size = 'md',
    id,
    placeholder,
    ...rest
}) => {
    // 一意のIDを生成（指定がない場合）
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
        <FormControl isInvalid={!!error} isRequired={isRequired} mb={4}>
            {label && (
                <FormLabel htmlFor={selectId}>{label}</FormLabel>
            )}
            
            <Select
                id={selectId}
                placeholder={placeholder}
                size={size}
                {...rest}
            >
                {showEmptyOption && (
                    <option value="">{emptyOptionText}</option>
                )}
                
                {options.map((option) => (
                    <option 
                        key={`${selectId}-option-${option.value}`}
                        value={option.value.toString()} 
                        disabled={option.isDisabled}
                    >
                        {option.label}
                    </option>
                ))}
            </Select>
            
            {helperText && !error && (
                <FormHelperText>{helperText}</FormHelperText>
            )}
            
            {error && (
                <FormErrorMessage>{error}</FormErrorMessage>
            )}
        </FormControl>
    );
};

export default SelectInput;