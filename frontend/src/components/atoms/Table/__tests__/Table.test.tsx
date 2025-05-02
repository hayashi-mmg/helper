import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Table, TableProps, Column } from '../Table';

type User = { id: number; name: string; email: string; role: string };

const columns: Column<User>[] = [
    { id: 'name', header: '名前', accessor: (u) => u.name, sortable: true },
    { id: 'email', header: 'メール', accessor: (u) => u.email },
    { id: 'role', header: '役割', accessor: (u) => u.role }
];

const data: User[] = [
    { id: 1, name: '山田太郎', email: 'taro@example.com', role: '管理者' },
    { id: 2, name: '鈴木花子', email: 'hanako@example.com', role: '一般' }
];

describe('Table', () => {
    const baseProps: TableProps<User> = {
        data,
        columns,
    };

    it('データと列定義を正しくレンダリングする', () => {
        render(<Table {...baseProps} />);
        expect(screen.getByText('山田太郎')).toBeInTheDocument();
        expect(screen.getByText('メール')).toBeInTheDocument();
    });

    it('列ヘッダーをクリックするとソートが切り替わる', () => {
        const handleSort = jest.fn();
        render(<Table {...baseProps} onSortChange={handleSort} />);
        const header = screen.getByText('名前');
        fireEvent.click(header);
        expect(handleSort).toHaveBeenCalled();
    });

    it('単一選択モードで行を選択できる', () => {
        const handleSelection = jest.fn();
        render(<Table {...baseProps} selectionType="single" onSelectionChange={handleSelection} />);
        const checkboxes = screen.getAllByRole('checkbox');
        fireEvent.click(checkboxes[0]);
        expect(handleSelection).toHaveBeenCalled();
    });

    it('複数選択モードで複数の行を選択できる', () => {
        const handleSelection = jest.fn();
        render(<Table {...baseProps} selectionType="multiple" onSelectionChange={handleSelection} />);
        const checkboxes = screen.getAllByRole('checkbox');
        fireEvent.click(checkboxes[1]);
        fireEvent.click(checkboxes[2]);
        expect(handleSelection).toHaveBeenCalledTimes(2);
    });

    it('全選択チェックボックスですべての行を選択できる', () => {
        const handleSelection = jest.fn();
        render(<Table {...baseProps} selectionType="multiple" onSelectionChange={handleSelection} />);
        const selectAll = screen.getAllByRole('checkbox')[0];
        fireEvent.click(selectAll);
        expect(handleSelection).toHaveBeenCalled();
    });

    it('ページを切り替えることができる', () => {
        const handlePage = jest.fn();
        render(<Table {...baseProps} page={0} pageSize={1} totalCount={2} onPageChange={handlePage} />);
        // ページネーションUIの実装に応じてテストを追加
    });

    it('ローディング中は適切なインジケータを表示する', () => {
        render(<Table {...baseProps} loading />);
        expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    });

    it('データが空の場合は空メッセージを表示する', () => {
        render(<Table {...baseProps} data={[]} />);
        expect(screen.getByText('表示するデータがありません')).toBeInTheDocument();
    });

    it('アクションボタンをクリックするとコールバックが呼ばれる', () => {
        const handleAction = jest.fn();
        render(
            <Table
                {...baseProps}
                actions={[{ id: 'test', label: 'アクション', onClick: handleAction }]}
                selectedItems={data}
            />
        );
        const btn = screen.getByText('アクション');
        fireEvent.click(btn);
        expect(handleAction).toHaveBeenCalled();
    });

    it('行をクリックするとコールバックが呼ばれる', () => {
        const handleRowClick = jest.fn();
        render(<Table {...baseProps} onRowClick={handleRowClick} />);
        const row = screen.getByText('山田太郎').closest('tr');
        if (row) fireEvent.click(row);
        expect(handleRowClick).toHaveBeenCalled();
    });
});
