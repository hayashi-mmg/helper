import { forwardRef, useState } from 'react';
import {
    FormControl,
    FormLabel,
    FormErrorMessage,
    FormHelperText,
    Input,
    InputGroup,
    InputRightElement,
    Box,
} from '@chakra-ui/react';
import { CalendarIcon } from '@chakra-ui/icons';
import DatePicker, { ReactDatePickerProps, registerLocale } from 'react-datepicker';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useState, forwardRef } from 'react';

// 日本語ローカライズを登録
registerLocale('ja', ja);

// DatePickerのスタイルをインポート
import 'react-datepicker/dist/react-datepicker.css';

export interface DatePickerInputProps extends Omit<ReactDatePickerProps, 'onChange'> {
    /**
     * 入力フィールドのラベル
     */
    label?: string;
    
    /**
     * 選択された日付
     */
    value?: Date | null;
    
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
     * 入力フィールドのプレースホルダー
     * @default 'YYYY/MM/DD'
     */
    placeholder?: string;
    
    /**
     * フォーマット文字列（date-fnsのフォーマット）
     * @default 'yyyy/MM/dd'
     */
    dateFormat?: string;
    
    /**
     * 読み取り専用かどうか
     * @default false
     */
    isReadOnly?: boolean;
    
    /**
     * 無効化されているかどうか
     * @default false
     */
    isDisabled?: boolean;
    
    /**
     * コンポーネントのサイズ
     * @default 'md'
     */
    size?: 'xs' | 'sm' | 'md' | 'lg';
    
    /**
     * 日付が変更されたときのコールバック
     */
    onChange?: (date: Date | null) => void;
    
    /**
     * コンポーネントのID
     */
    id?: string;
}

/**
 * 日付選択コンポーネント
 * カレンダーから日付を選択するための入力コンポーネント
 */
export const DatePickerInput: React.FC<DatePickerInputProps> = ({
    label,
    value,
    error,
    helperText,
    isRequired = false,
    placeholder = 'YYYY/MM/DD',
    dateFormat = 'yyyy/MM/dd',
    isReadOnly = false,
    isDisabled = false,
    size = 'md',
    onChange,
    id,
    ...rest
}) => {
    // 一意のIDを生成（指定がない場合）
    const datepickerId = id || `datepicker-${Math.random().toString(36).substr(2, 9)}`;
    
    // 日付変更ハンドラー
    const handleDateChange = (date: Date | null) => {
        if (onChange) {
            onChange(date);
        }
    };
    
    // カスタムインプットコンポーネント
    // DatePickerのInput部分をChakra UIのInputに置き換える
    const CustomInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
        ({ value, onClick, onChange, onBlur, placeholder }, ref) => (
            <InputGroup>
                <Input
                    ref={ref}
                    value={value}
                    onClick={onClick}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    isReadOnly={isReadOnly}
                    isDisabled={isDisabled}
                    size={size}
                    autoComplete="off"
                    aria-label={label || '日付を選択'}
                    data-testid={`${datepickerId}-input`}
                />
                <InputRightElement>
                    <CalendarIcon color="gray.500" cursor="pointer" onClick={onClick} />
                </InputRightElement>
            </InputGroup>
        )
    );
    
    // コンポーネント名を設定
    CustomInput.displayName = 'DatePickerCustomInput';
    
    return (
        <FormControl isInvalid={!!error} isRequired={isRequired} mb={4}>
            {label && (
                <FormLabel htmlFor={datepickerId}>{label}</FormLabel>
            )}
            
            <Box className="chakra-datepicker-wrapper">
                <DatePicker
                    id={datepickerId}
                    selected={value}
                    onChange={handleDateChange}
                    dateFormat={dateFormat}
                    placeholderText={placeholder}
                    customInput={<CustomInput />}
                    locale="ja"
                    isClearable
                    disabled={isDisabled}
                    {...rest}
                />
            </Box>
            
            {helperText && !error && (
                <FormHelperText mt={2}>{helperText}</FormHelperText>
            )}
            
            {error && (
                <FormErrorMessage>{error}</FormErrorMessage>
            )}
        </FormControl>
    );
};

export default DatePickerInput;