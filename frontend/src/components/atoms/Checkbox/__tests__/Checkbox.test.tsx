import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Checkbox, CheckboxProps } from '../Checkbox';

/**
 * Checkboxコンポーネントのユニットテスト
 */
describe('Checkbox', () => {
    const baseProps: CheckboxProps = {
        id: 'test-checkbox',
        name: 'test',
        label: 'テストラベル',
        checked: false,
        onChange: jest.fn(),
    };

    it('正しくレンダリングされること', () => {
        render(<Checkbox {...baseProps} />);
        expect(screen.getByLabelText('テストラベル')).toBeInTheDocument();
        expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('クリック時にonChangeが呼び出されること', () => {
        const handleChange = jest.fn();
        render(<Checkbox {...baseProps} onChange={handleChange} />);
        fireEvent.click(screen.getByRole('checkbox'));
        expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('無効状態のとき、クリックしてもonChangeが呼び出されないこと', () => {
        const handleChange = jest.fn();
        render(<Checkbox {...baseProps} disabled onChange={handleChange} />);
        fireEvent.click(screen.getByRole('checkbox'));
        expect(handleChange).not.toHaveBeenCalled();
        expect(screen.getByRole('checkbox')).toBeDisabled();
    });

    it('中間状態が正しく表示されること', () => {
        render(<Checkbox {...baseProps} indeterminate />);
        const input = screen.getByRole('checkbox') as HTMLInputElement;
        expect(input.indeterminate).toBe(true);
        // aria-checked="mixed"
        expect(input).toHaveAttribute('aria-checked', 'mixed');
    });

    it('インデントが正しく適用されること', () => {
        render(<Checkbox {...baseProps} indentLevel={2} />);
        const container = screen.getByLabelText('テストラベル').closest('div');
        expect(container).toHaveStyle('margin-left: 3rem');
    });

    it('エラー状態が正しく表示されること', () => {
        render(<Checkbox {...baseProps} error />);
        const container = screen.getByLabelText('テストラベル').closest('div');
        expect(container).toHaveClass('checkbox-container--error');
    });
});
