import React from 'react';
import {
    FormControl,
    Checkbox,
    FormErrorMessage,
    FormHelperText,
    CheckboxProps as ChakraCheckboxProps,
    Stack,
} from '@chakra-ui/react';

export interface CheckboxOption {
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
     * @default false
     */
    isDisabled?: boolean;
}

export interface CheckboxInputProps extends Omit<ChakraCheckboxProps, 'value'> {
    /**
     * チェックボックスのラベル（単一チェックボックスの場合）
     */
    label?: string;
    
    /**
     * チェックボックスが選択されているかどうか（単一チェックボックスの場合）
     */
    isChecked?: boolean;
    
    /**
     * 複数のチェックボックスを表示する場合のオプション
     */
    options?: CheckboxOption[];
    
    /**
     * 複数選択の場合の選択された値の配列
     */
    value?: Array<string | number>;
    
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
     * チェックボックス間の方向
     * @default 'vertical'
     */
    direction?: 'horizontal' | 'vertical';
    
    /**
     * 値が変更されたときのコールバック
     * 単一チェックボックスの場合はbooleanを、複数のチェックボックスの場合は選択された値の配列を返します
     */
    onChange?: (value: boolean | Array<string | number>) => void;
}

/**
 * チェックボックス入力コンポーネント
 * 単一または複数のチェックボックスを表示します
 */
export const CheckboxInput: React.FC<CheckboxInputProps> = ({
    label,
    options,
    value = [],
    error,
    helperText,
    isRequired = false,
    isChecked,
    direction = 'vertical',
    onChange,
    id,
    ...rest
}) => {
    // 一意のIDを生成（指定がない場合）
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    
    // 単一のチェックボックスか複数のチェックボックスかを判定
    const isSingle = !options || options.length === 0;
    
    // 単一チェックボックスの変更ハンドラー
    const handleSingleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
            onChange(e.target.checked);
        }
    };
    
    // 複数チェックボックスの変更ハンドラー
    const handleMultiChange = (optionValue: string | number) => (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
            if (e.target.checked) {
                // 選択された値を追加
                onChange([...value, optionValue]);
            } else {
                // 選択解除された値を除外
                onChange(value.filter(v => v !== optionValue));
            }
        }
    };
    
    return (
        <FormControl isInvalid={!!error} isRequired={isRequired} mb={4}>
            {isSingle ? (
                // 単一のチェックボックス
                <Checkbox
                    id={checkboxId}
                    isChecked={isChecked}
                    onChange={handleSingleChange}
                    {...rest}
                >
                    {label}
                </Checkbox>
            ) : (
                // 複数のチェックボックス
                <Stack spacing={2} direction={direction === 'horizontal' ? 'row' : 'column'}>
                    {options?.map((option) => (
                        <Checkbox
                            key={`${checkboxId}-${option.value}`}
                            value={option.value.toString()}
                            isChecked={value.includes(option.value)}
                            isDisabled={option.isDisabled}
                            onChange={handleMultiChange(option.value)}
                            {...rest}
                        >
                            {option.label}
                        </Checkbox>
                    ))}
                </Stack>
            )}
            
            {helperText && !error && (
                <FormHelperText mt={2}>{helperText}</FormHelperText>
            )}
            
            {error && (
                <FormErrorMessage>{error}</FormErrorMessage>
            )}
        </FormControl>
    );
};

export default CheckboxInput;