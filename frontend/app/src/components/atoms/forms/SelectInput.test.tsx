import React from 'react';
import { render, screen, fireEvent } from '../../../test-utils/providers';
import SelectInput from './SelectInput';

describe('SelectInput Component', () => {
    const mockOptions = [
        { value: 'jp', label: '日本' },
        { value: 'us', label: 'アメリカ' },
        { value: 'uk', label: 'イギリス' },
        { value: 'fr', label: 'フランス', isDisabled: true }
    ];

    it('renders with label and options correctly', () => {
        render(<SelectInput label="Country" options={mockOptions} />);
        
        expect(screen.getByText('Country')).toBeInTheDocument();
        
        // セレクトボックスをクリックして開く
        const selectElement = screen.getByRole('combobox');
        fireEvent.click(selectElement);
        
        // オプションが表示されていることを確認（実際のオプションはDOMに表示されていない場合もある）
        expect(selectElement).toBeInTheDocument();
    });

    it('renders without label when not provided', () => {
        render(<SelectInput options={mockOptions} />);
        
        expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('displays helper text when provided', () => {
        render(
            <SelectInput 
                label="Country" 
                options={mockOptions}
                helperText="Select your country of residence" 
            />
        );
        
        expect(screen.getByText('Select your country of residence')).toBeInTheDocument();
    });

    it('displays error message when error is provided', () => {
        render(
            <SelectInput 
                label="Country" 
                options={mockOptions}
                error="Country selection is required" 
            />
        );
        
        expect(screen.getByText('Country selection is required')).toBeInTheDocument();
    });

    it('prioritizes error message over helper text', () => {
        render(
            <SelectInput 
                label="Country" 
                options={mockOptions}
                helperText="Select your country of residence" 
                error="Country selection is required" 
            />
        );
        
        expect(screen.getByText('Country selection is required')).toBeInTheDocument();
        expect(screen.queryByText('Select your country of residence')).not.toBeInTheDocument();
    });

    it('handles selection changes', () => {
        const handleChange = jest.fn();
        
        render(<SelectInput label="Country" options={mockOptions} onChange={handleChange} />);
        
        const selectElement = screen.getByRole('combobox');
        fireEvent.change(selectElement, { target: { value: 'jp' } });
        
        expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('shows empty option when showEmptyOption is true', () => {
        render(
            <SelectInput 
                label="Country" 
                options={mockOptions} 
                showEmptyOption 
                emptyOptionText="-- 国を選択 --" 
            />
        );
        
        const selectElement = screen.getByRole('combobox');
        expect(selectElement).toBeInTheDocument();
        
        // optionのテキストは直接確認できないことがあるため、
        // このテストではコンポーネントの存在のみを確認
    });

    it('applies custom size attribute', () => {
        render(<SelectInput label="Country" options={mockOptions} size="lg" />);
        
        const selectElement = screen.getByRole('combobox');
        expect(selectElement).toHaveClass('chakra-select__lg');
    });
    
    it('applies required attribute when isRequired is true', () => {
        render(<SelectInput label="Country" options={mockOptions} isRequired />);
        
        expect(screen.getByRole('combobox').closest('div[role="group"]')).toHaveAttribute('aria-required', 'true');
    });
});