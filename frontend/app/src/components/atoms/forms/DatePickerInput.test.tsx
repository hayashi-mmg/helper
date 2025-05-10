import React from 'react';
import { render, screen, fireEvent } from '../../../test-utils/providers';
import DatePickerInput from './DatePickerInput';

// react-datepickerモジュールをモック
jest.mock('react-datepicker', () => {
    const MockDatePicker = ({ customInput, onChange, selected, dateFormat, placeholderText, disabled }) => {
        const handleChange = (e) => {
            // 日付文字列を解析して日付オブジェクトに変換（簡易版）
            const dateParts = e.target.value.split('/');
            if (dateParts.length === 3) {
                const year = parseInt(dateParts[0], 10);
                const month = parseInt(dateParts[1], 10) - 1; // 月は0から始まる
                const day = parseInt(dateParts[2], 10);
                onChange(new Date(year, month, day));
            } else {
                onChange(null);
            }
        };
        
        // 選択された日付をフォーマット
        const formattedValue = selected 
            ? `${selected.getFullYear()}/${(selected.getMonth() + 1).toString().padStart(2, '0')}/${selected.getDate().toString().padStart(2, '0')}` 
            : '';
        
        // カスタムインプットにプロパティを渡してクローン
        return React.cloneElement(customInput, { 
            value: formattedValue,
            onChange: handleChange,
            onClick: () => {},
            placeholder: placeholderText,
            disabled
        });
    };
    
    return MockDatePicker;
});

describe('DatePickerInput Component', () => {
    it('renders with label correctly', () => {
        render(<DatePickerInput label="生年月日" />);
        
        expect(screen.getByText('生年月日')).toBeInTheDocument();
        expect(screen.getByTestId(/datepicker-.*-input/)).toBeInTheDocument();
    });

    it('renders with placeholder correctly', () => {
        render(<DatePickerInput label="生年月日" placeholder="日付を選択" />);
        
        const input = screen.getByTestId(/datepicker-.*-input/);
        expect(input).toHaveAttribute('placeholder', '日付を選択');
    });

    it('renders with value correctly', () => {
        const testDate = new Date(2022, 0, 15); // 2022/01/15
        render(<DatePickerInput label="生年月日" value={testDate} />);
        
        const input = screen.getByTestId(/datepicker-.*-input/);
        expect(input).toHaveValue('2022/01/15');
    });

    it('handles date change', () => {
        const handleChange = jest.fn();
        render(<DatePickerInput label="生年月日" onChange={handleChange} />);
        
        const input = screen.getByTestId(/datepicker-.*-input/);
        fireEvent.change(input, { target: { value: '2023/05/20' } });
        
        // 引数は日付オブジェクトであることを確認（日付のみチェック）
        expect(handleChange).toHaveBeenCalledTimes(1);
        const calledDate = handleChange.mock.calls[0][0];
        expect(calledDate).toBeInstanceOf(Date);
        expect(calledDate.getFullYear()).toBe(2023);
        expect(calledDate.getMonth()).toBe(4); // 5月は4
        expect(calledDate.getDate()).toBe(20);
    });

    it('displays helper text when provided', () => {
        render(
            <DatePickerInput 
                label="生年月日" 
                helperText="YYYY/MM/DD形式で入力してください" 
            />
        );
        
        expect(screen.getByText('YYYY/MM/DD形式で入力してください')).toBeInTheDocument();
    });

    it('displays error message when error is provided', () => {
        render(
            <DatePickerInput 
                label="生年月日" 
                error="生年月日は必須項目です" 
            />
        );
        
        expect(screen.getByText('生年月日は必須項目です')).toBeInTheDocument();
    });

    it('prioritizes error message over helper text', () => {
        render(
            <DatePickerInput 
                label="生年月日" 
                helperText="YYYY/MM/DD形式で入力してください" 
                error="生年月日は必須項目です" 
            />
        );
        
        expect(screen.getByText('生年月日は必須項目です')).toBeInTheDocument();
        expect(screen.queryByText('YYYY/MM/DD形式で入力してください')).not.toBeInTheDocument();
    });

    it('disables the input when isDisabled is true', () => {
        render(<DatePickerInput label="生年月日" isDisabled />);
        
        const input = screen.getByTestId(/datepicker-.*-input/);
        expect(input).toBeDisabled();
    });

    it('applies required attribute when isRequired is true', () => {
        render(<DatePickerInput label="生年月日" isRequired />);
        
        expect(screen.getByTestId(/datepicker-.*-input/).closest('div[role="group"]')).toHaveAttribute('aria-required', 'true');
    });

    it('applies different sizes when specified', () => {
        const { rerender } = render(<DatePickerInput label="生年月日" size="sm" />);
        
        // 小さいサイズの入力欄が描画されていることを確認
        let input = screen.getByTestId(/datepicker-.*-input/);
        expect(input).toHaveClass('chakra-input--sm');
        
        // 大きいサイズに変更
        rerender(<DatePickerInput label="生年月日" size="lg" />);
        
        // 大きいサイズの入力欄が描画されていることを確認
        input = screen.getByTestId(/datepicker-.*-input/);
        expect(input).toHaveClass('chakra-input--lg');
    });
});