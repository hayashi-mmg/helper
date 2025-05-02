import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Select, SelectProps } from '../Select';

const options = [
    { label: '日本', value: 'jp' },
    { label: 'アメリカ', value: 'us' },
    { label: '中国', value: 'cn', disabled: true },
    { label: 'その他', value: 'other' }
];

const groupOptions = [
    {
        label: '果物',
        options: [
            { label: 'りんご', value: 'apple' },
            { label: 'バナナ', value: 'banana' }
        ]
    },
    {
        label: '野菜',
        options: [
            { label: 'にんじん', value: 'carrot' },
            { label: 'トマト', value: 'tomato' }
        ]
    }
];

describe('Select', () => {
    const baseProps: SelectProps = {
        id: 'test-select',
        name: 'test',
        options,
        value: '',
        onChange: jest.fn(),
    };

    it('正しくレンダリングされること', () => {
        render(<Select {...baseProps} label="国" placeholder="国を選択してください" />);
        expect(screen.getByLabelText('国')).toBeInTheDocument();
        expect(screen.getByText('国を選択してください')).toBeInTheDocument();
    });

    it('クリック時にドロップダウンが開くこと', () => {
        render(<Select {...baseProps} />);
        fireEvent.click(screen.getByRole('combobox'));
        expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('オプション選択時にonChangeが呼び出されること', () => {
        const handleChange = jest.fn();
        render(<Select {...baseProps} onChange={handleChange} />);
        fireEvent.click(screen.getByRole('combobox'));
        const option = screen.getByText('日本');
        fireEvent.click(option);
        expect(handleChange).toHaveBeenCalledWith('jp');
    });

    it('複数選択モードで正しく動作すること', () => {
        const handleMultiChange = jest.fn();
        render(
            <Select
                {...baseProps}
                multiple
                values={['us']}
                onMultiChange={handleMultiChange}
            />
        );
        fireEvent.click(screen.getByRole('combobox'));
        const option = screen.getByText('日本');
        fireEvent.click(option);
        expect(handleMultiChange).toHaveBeenCalledWith(['us', 'jp']);
    });

    it('グループ化されたオプションが正しく表示されること', () => {
        render(<Select {...baseProps} options={groupOptions} />);
        fireEvent.click(screen.getByRole('combobox'));
        expect(screen.getByText('果物')).toBeInTheDocument();
        expect(screen.getByText('りんご')).toBeInTheDocument();
    });

    it('無効状態のとき、クリックしてもドロップダウンが開かないこと', () => {
        render(<Select {...baseProps} disabled />);
        fireEvent.click(screen.getByRole('combobox'));
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('エラー状態が正しく表示されること', () => {
        render(<Select {...baseProps} error errorMessage="エラーです" />);
        expect(screen.getByText('エラーです')).toBeInTheDocument();
    });

    it('キーボード操作で適切に動作すること', () => {
        render(<Select {...baseProps} />);
        const combobox = screen.getByRole('combobox');
        combobox.focus();
        fireEvent.keyDown(combobox, { key: 'Enter' });
        expect(screen.getByRole('listbox')).toBeInTheDocument();
        fireEvent.keyDown(combobox, { key: 'Escape' });
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
});
