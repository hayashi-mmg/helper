
import { render, screen, fireEvent } from '../../../test-utils/providers';
import RadioGroupInput from './RadioGroupInput';
import { Component } from 'react';

describe('RadioGroupInput Component', () => {
    const mockOptions = [
        { value: 'male', label: '男性' },
        { value: 'female', label: '女性' },
        { value: 'other', label: 'その他' },
        { value: 'prefer-not-to-say', label: '回答しない', isDisabled: true }
    ];

    it('renders with label correctly', () => {
        render(<RadioGroupInput label="性別" options={mockOptions} />);
        
        expect(screen.getByText('性別')).toBeInTheDocument();
        expect(screen.getByText('男性')).toBeInTheDocument();
        expect(screen.getByText('女性')).toBeInTheDocument();
        expect(screen.getByText('その他')).toBeInTheDocument();
        expect(screen.getByText('回答しない')).toBeInTheDocument();
    });

    it('renders without label when not provided', () => {
        render(<RadioGroupInput options={mockOptions} />);
        
        expect(screen.queryByText('性別')).not.toBeInTheDocument();
        expect(screen.getByText('男性')).toBeInTheDocument();
    });

    it('selects the correct option when value is provided', () => {
        render(<RadioGroupInput options={mockOptions} value="female" />);
        
        const femaleRadio = screen.getByLabelText('女性');
        expect(femaleRadio).toBeChecked();
        
        const maleRadio = screen.getByLabelText('男性');
        expect(maleRadio).not.toBeChecked();
    });

    it('calls onChange when an option is selected', () => {
        const handleChange = jest.fn();
        
        render(<RadioGroupInput options={mockOptions} onChange={handleChange} />);
        
        fireEvent.click(screen.getByText('女性'));
        
        expect(handleChange).toHaveBeenCalledWith('female');
    });

    it('displays helper text when provided', () => {
        render(
            <RadioGroupInput 
                label="性別" 
                options={mockOptions}
                helperText="統計目的のみに使用されます" 
            />
        );
        
        expect(screen.getByText('統計目的のみに使用されます')).toBeInTheDocument();
    });

    it('displays error message when error is provided', () => {
        render(
            <RadioGroupInput 
                label="性別" 
                options={mockOptions}
                error="性別の選択は必須です" 
            />
        );
        
        expect(screen.getByText('性別の選択は必須です')).toBeInTheDocument();
    });

    it('prioritizes error message over helper text', () => {
        render(
            <RadioGroupInput 
                label="性別" 
                options={mockOptions}
                helperText="統計目的のみに使用されます" 
                error="性別の選択は必須です" 
            />
        );
        
        expect(screen.getByText('性別の選択は必須です')).toBeInTheDocument();
        expect(screen.queryByText('統計目的のみに使用されます')).not.toBeInTheDocument();
    });

    it('renders radio buttons horizontally when direction is horizontal', () => {
        render(
            <RadioGroupInput 
                options={mockOptions} 
                direction="horizontal" 
            />
        );
        
        const stack = document.querySelector('.chakra-stack');
        expect(stack).toHaveStyle('flex-direction: row');
    });

    it('renders radio buttons vertically by default', () => {
        render(<RadioGroupInput options={mockOptions} />);
        
        const stack = document.querySelector('.chakra-stack');
        expect(stack).toHaveStyle('flex-direction: column');
    });

    it('applies different sizes when specified', () => {
        const { rerender } = render(
            <RadioGroupInput 
                options={mockOptions.slice(0, 2)}  // 最初の2つだけを使用
                size="sm" 
            />
        );
        
        // 小さいサイズのラジオボタンが描画されていることを確認
        let radios = screen.getAllByRole('radio');
        radios.forEach(radio => {
            expect(radio.parentElement).toHaveClass('chakra-radio--sm');
        });
        
        // 大きいサイズに変更
        rerender(
            <RadioGroupInput 
                options={mockOptions.slice(0, 2)}
                size="lg" 
            />
        );
        
        // 大きいサイズのラジオボタンが描画されていることを確認
        radios = screen.getAllByRole('radio');
        radios.forEach(radio => {
            expect(radio.parentElement).toHaveClass('chakra-radio--lg');
        });
    });

    it('disables specified options', () => {
        render(<RadioGroupInput options={mockOptions} />);
        
        // 「回答しない」オプションは無効化されているはず
        const disabledRadio = screen.getByLabelText('回答しない');
        expect(disabledRadio).toBeDisabled();
        
        // 他のオプションは有効なはず
        const enabledRadio = screen.getByLabelText('男性');
        expect(enabledRadio).not.toBeDisabled();
    });
});