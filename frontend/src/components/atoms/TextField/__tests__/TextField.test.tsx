import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TextField, TextFieldProps } from '../TextField';

describe('TextField', () => {
    const baseProps: TextFieldProps = {
        id: 'test-textfield',
        name: 'test',
        value: '',
        onChange: jest.fn(),
    };

    it('正しくレンダリングされること', () => {
        render(<TextField {...baseProps} label="名前" placeholder="入力してください" />);
        expect(screen.getByLabelText('名前')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('入力してください')).toBeInTheDocument();
    });

    it('入力値が変更されたとき、onChangeが呼び出されること', () => {
        const handleChange = jest.fn();
        render(<TextField {...baseProps} onChange={handleChange} />);
        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'テスト' } });
        expect(handleChange).toHaveBeenCalled();
    });

    it('エラー状態のとき、エラースタイルとメッセージが表示されること', () => {
        render(<TextField {...baseProps} error errorMessage="エラーです" />);
        expect(screen.getByText('エラーです')).toBeInTheDocument();
    });

    it('無効状態のとき、入力ができないこと', () => {
        render(<TextField {...baseProps} disabled />);
        const input = screen.getByRole('textbox');
        expect(input).toBeDisabled();
    });

    it('アイコンが正しく表示されること', () => {
        render(<TextField {...baseProps} startIcon={<span data-testid="start-icon">S</span>} endIcon={<span data-testid="end-icon">E</span>} />);
        expect(screen.getByTestId('start-icon')).toBeInTheDocument();
        expect(screen.getByTestId('end-icon')).toBeInTheDocument();
    });
});
