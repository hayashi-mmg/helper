
import { render, screen, fireEvent } from '../../../test-utils/providers';
import SwitchInput from './SwitchInput';
import { Component } from 'react';

describe('SwitchInput Component', () => {
    it('renders with label correctly', () => {
        render(<SwitchInput label="通知を受け取る" />);
        
        expect(screen.getByText('通知を受け取る')).toBeInTheDocument();
        expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('renders checked switch when isChecked is true', () => {
        render(<SwitchInput label="通知を受け取る" isChecked={true} />);
        
        expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('handles switch change', () => {
        const handleChange = jest.fn();
        
        render(<SwitchInput label="通知を受け取る" onChange={handleChange} />);
        
        const switchElement = screen.getByRole('checkbox');
        fireEvent.click(switchElement);
        
        expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('displays helper text when provided', () => {
        render(
            <SwitchInput 
                label="通知を受け取る" 
                helperText="重要なお知らせがあった場合に通知されます" 
            />
        );
        
        expect(screen.getByText('重要なお知らせがあった場合に通知されます')).toBeInTheDocument();
    });

    it('displays error message when error is provided', () => {
        render(
            <SwitchInput 
                label="利用規約に同意する" 
                error="続行するには同意が必要です" 
            />
        );
        
        expect(screen.getByText('続行するには同意が必要です')).toBeInTheDocument();
    });

    it('prioritizes error message over helper text', () => {
        render(
            <SwitchInput 
                label="利用規約に同意する" 
                helperText="利用規約の詳細を確認してください" 
                error="続行するには同意が必要です" 
            />
        );
        
        expect(screen.getByText('続行するには同意が必要です')).toBeInTheDocument();
        expect(screen.queryByText('利用規約の詳細を確認してください')).not.toBeInTheDocument();
    });

    it('supports label at the end position', () => {
        render(<SwitchInput label="通知を受け取る" labelPosition="end" />);
        
        const label = screen.getByText('通知を受け取る');
        const flexContainer = label.closest('div');
        expect(flexContainer).toHaveStyle('flex-direction: row-reverse');
    });

    it('applies different sizes when specified', () => {
        const { rerender } = render(<SwitchInput label="通知を受け取る" size="sm" />);
        
        // 小さいサイズのスイッチが描画されていることを確認
        let switchElement = screen.getByRole('checkbox');
        expect(switchElement.parentElement).toHaveClass('chakra-switch--sm');
        
        // 大きいサイズに変更
        rerender(<SwitchInput label="通知を受け取る" size="lg" />);
        
        // 大きいサイズのスイッチが描画されていることを確認
        switchElement = screen.getByRole('checkbox');
        expect(switchElement.parentElement).toHaveClass('chakra-switch--lg');
    });

    it('applies required attribute when isRequired is true', () => {
        render(<SwitchInput label="通知を受け取る" isRequired />);
        
        expect(screen.getByRole('checkbox').closest('div[role="group"]')).toHaveAttribute('aria-required', 'true');
    });

    it('renders without label when not provided', () => {
        render(<SwitchInput />);
        
        expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });
});