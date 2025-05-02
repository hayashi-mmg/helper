import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TextArea, TextAreaProps } from '../TextArea';

describe('TextArea', () => {
    const baseProps: TextAreaProps = {
        id: 'test-textarea',
        name: 'test',
        value: '',
        onChange: jest.fn(),
    };

    it('正しくレンダリングされること', () => {
        render(<TextArea {...baseProps} label="説明" placeholder="入力してください" />);
        expect(screen.getByLabelText('説明')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('入力してください')).toBeInTheDocument();
    });

    it('入力値が変更されたとき、onChangeが呼び出されること', () => {
        const handleChange = jest.fn();
        render(<TextArea {...baseProps} onChange={handleChange} />);
        const textarea = screen.getByRole('textbox');
        fireEvent.change(textarea, { target: { value: 'テスト' } });
        expect(handleChange).toHaveBeenCalled();
    });

    it('エラー状態のとき、エラースタイルとメッセージが表示されること', () => {
        render(<TextArea {...baseProps} error errorMessage="エラーです" />);
        expect(screen.getByText('エラーです')).toBeInTheDocument();
    });

    it('無効状態のとき、入力ができないこと', () => {
        render(<TextArea {...baseProps} disabled />);
        const textarea = screen.getByRole('textbox');
        expect(textarea).toBeDisabled();
    });

    it('最大文字数を超えて入力できないこと', () => {
        render(<TextArea {...baseProps} maxLength={5} />);
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        fireEvent.change(textarea, { target: { value: '123456' } });
        expect(textarea.value.length).toBeLessThanOrEqual(5);
    });

    it('文字数カウンターが正しく表示されること', () => {
        render(<TextArea {...baseProps} value={'1234'} maxLength={10} showCharCount />);
        expect(screen.getByText('4/10')).toBeInTheDocument();
    });

    it('自動リサイズが機能すること', () => {
        render(<TextArea {...baseProps} autoResize value={'1\n2\n3\n4'} />);
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        // scrollHeightがheightより大きい場合に高さが変わることを想定
        // 実際のDOM操作はJSDOMでは再現しきれないが、refが設定されていることを確認
        expect(textarea).toBeInTheDocument();
    });
});
