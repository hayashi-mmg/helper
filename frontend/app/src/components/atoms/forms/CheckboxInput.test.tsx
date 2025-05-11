
import { render, screen, fireEvent } from '../../../test-utils/providers';
import CheckboxInput from './CheckboxInput';
import { Component } from 'react';

describe('CheckboxInput Component', () => {
    // 単一チェックボックスのテスト
    describe('Single Checkbox', () => {
        it('renders single checkbox with label correctly', () => {
            render(<CheckboxInput label="利用規約に同意する" />);
            
            expect(screen.getByText('利用規約に同意する')).toBeInTheDocument();
            expect(screen.getByRole('checkbox')).not.toBeChecked();
        });

        it('renders checked checkbox when isChecked is true', () => {
            render(<CheckboxInput label="利用規約に同意する" isChecked={true} />);
            
            expect(screen.getByRole('checkbox')).toBeChecked();
        });

        it('handles checkbox change for single checkbox', () => {
            const handleChange = jest.fn();
            
            render(<CheckboxInput label="利用規約に同意する" onChange={handleChange} />);
            
            const checkbox = screen.getByRole('checkbox');
            fireEvent.click(checkbox);
            
            expect(handleChange).toHaveBeenCalledWith(true);
        });

        it('displays helper text when provided for single checkbox', () => {
            render(
                <CheckboxInput 
                    label="利用規約に同意する" 
                    helperText="続行するには同意が必要です" 
                />
            );
            
            expect(screen.getByText('続行するには同意が必要です')).toBeInTheDocument();
        });

        it('displays error message when provided for single checkbox', () => {
            render(
                <CheckboxInput 
                    label="利用規約に同意する" 
                    error="同意が必要です" 
                />
            );
            
            expect(screen.getByText('同意が必要です')).toBeInTheDocument();
        });

        it('prioritizes error message over helper text for single checkbox', () => {
            render(
                <CheckboxInput 
                    label="利用規約に同意する" 
                    helperText="続行するには同意が必要です" 
                    error="同意が必要です" 
                />
            );
            
            expect(screen.getByText('同意が必要です')).toBeInTheDocument();
            expect(screen.queryByText('続行するには同意が必要です')).not.toBeInTheDocument();
        });
    });

    // 複数チェックボックスのテスト
    describe('Multiple Checkboxes', () => {
        const mockOptions = [
            { value: 'apple', label: 'りんご' },
            { value: 'banana', label: 'バナナ' },
            { value: 'orange', label: 'オレンジ' },
            { value: 'grape', label: 'ぶどう', isDisabled: true }
        ];

        it('renders multiple checkboxes correctly', () => {
            render(<CheckboxInput options={mockOptions} />);
            
            expect(screen.getByText('りんご')).toBeInTheDocument();
            expect(screen.getByText('バナナ')).toBeInTheDocument();
            expect(screen.getByText('オレンジ')).toBeInTheDocument();
            expect(screen.getByText('ぶどう')).toBeInTheDocument();
            expect(screen.getAllByRole('checkbox')).toHaveLength(4);
        });

        it('renders selected checkboxes when value is provided', () => {
            render(
                <CheckboxInput 
                    options={mockOptions} 
                    value={['apple', 'orange']} 
                />
            );
            
            const checkboxes = screen.getAllByRole('checkbox');
            expect(checkboxes[0]).toBeChecked(); // りんご
            expect(checkboxes[1]).not.toBeChecked(); // バナナ
            expect(checkboxes[2]).toBeChecked(); // オレンジ
            expect(checkboxes[3]).not.toBeChecked(); // ぶどう
        });

        it('handles checkbox change for multiple checkboxes', () => {
            const handleChange = jest.fn();
            
            render(
                <CheckboxInput 
                    options={mockOptions} 
                    value={['apple']} 
                    onChange={handleChange} 
                />
            );
            
            // バナナを選択
            fireEvent.click(screen.getByText('バナナ'));
            expect(handleChange).toHaveBeenCalledWith(['apple', 'banana']);
            
            // りんごの選択を解除（新しいレンダリング）
            handleChange.mockClear();
            render(
                <CheckboxInput 
                    options={mockOptions} 
                    value={['apple', 'banana']} 
                    onChange={handleChange} 
                />
            );
            fireEvent.click(screen.getByText('りんご'));
            expect(handleChange).toHaveBeenCalledWith(['banana']);
        });

        it('renders checkboxes horizontally when direction is horizontal', () => {
            render(
                <CheckboxInput 
                    options={mockOptions} 
                    direction="horizontal" 
                />
            );
            
            const stack = document.querySelector('.chakra-stack');
            expect(stack).toHaveStyle('flex-direction: row');
        });

        it('renders disabled checkbox correctly', () => {
            render(<CheckboxInput options={mockOptions} />);
            
            const checkboxes = screen.getAllByRole('checkbox');
            expect(checkboxes[3]).toBeDisabled(); // ぶどう
        });

        it('displays helper text and error for multiple checkboxes', () => {
            render(
                <CheckboxInput 
                    options={mockOptions} 
                    helperText="好きな果物を選んでください" 
                    error="少なくとも1つ選択してください" 
                />
            );
            
            expect(screen.getByText('少なくとも1つ選択してください')).toBeInTheDocument();
            expect(screen.queryByText('好きな果物を選んでください')).not.toBeInTheDocument();
        });
    });
});