
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Table } from './Table';

// テスト用のデータ
const mockData = [
  { id: 1, name: '山田太郎', email: 'yamada@example.com', role: '管理者' },
  { id: 2, name: '佐藤花子', email: 'sato@example.com', role: 'ユーザー' },
  { id: 3, name: '鈴木一郎', email: 'suzuki@example.com', role: 'ヘルパー' },
];

// テスト用の列定義
const mockColumns = [
  {
    id: 'name',
    header: '名前',
    accessor: (item: typeof mockData[0]) => item.name,
    sortable: true,
  },
  {
    id: 'email',
    header: 'メールアドレス',
    accessor: (item: typeof mockData[0]) => item.email,
  },
  {
    id: 'role',
    header: '役割',
    accessor: (item: typeof mockData[0]) => item.role,
    align: 'center' as const,
  },
];

describe('Table コンポーネント', () => {
  // レンダリングテスト
  test('基本的なテーブルをレンダリングする', () => {
    render(<Table data={mockData} columns={mockColumns} />);
    
    // ヘッダー行が表示されている
    expect(screen.getByText('名前')).toBeInTheDocument();
    expect(screen.getByText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByText('役割')).toBeInTheDocument();
    
    // データ行が表示されている
    expect(screen.getByText('山田太郎')).toBeInTheDocument();
    expect(screen.getByText('佐藤花子')).toBeInTheDocument();
    expect(screen.getByText('鈴木一郎')).toBeInTheDocument();
  });
  
  // 空データテスト
  test('データが空の場合にメッセージを表示する', () => {
    render(
      <Table
        data={[]} 
        columns={mockColumns}
        emptyMessage="データがありません"
      />
    );
    
    expect(screen.getByText('データがありません')).toBeInTheDocument();
  });
  
  // 複数選択テスト
  test('複数選択モードで行を選択できる', async () => {
    const mockSelectionChange = jest.fn();
    const user = userEvent.setup();
    
    render(
      <Table
        data={mockData}
        columns={mockColumns}
        selectionType="multiple"
        onSelectionChange={mockSelectionChange}
      />
    );
    
    // チェックボックスを取得
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(mockData.length + 1); // データ行 + ヘッダー行
    
    // 最初の行を選択
    await user.click(checkboxes[1]);
    expect(mockSelectionChange).toHaveBeenCalledWith([mockData[0]]);
    
    // 2行目も追加で選択（モック関数をリセット）
    mockSelectionChange.mockReset();
    await user.click(checkboxes[2]);
    expect(mockSelectionChange).toHaveBeenCalledWith([mockData[0], mockData[1]]);
  });
  
  // 全選択テスト
  test('全選択チェックボックスですべての行を選択できる', async () => {
    const mockSelectionChange = jest.fn();
    const user = userEvent.setup();
    
    render(
      <Table
        data={mockData}
        columns={mockColumns}
        selectionType="multiple"
        onSelectionChange={mockSelectionChange}
      />
    );
    
    // ヘッダーのチェックボックス（全選択）をクリック
    const headerCheckbox = screen.getAllByRole('checkbox')[0];
    await user.click(headerCheckbox);
    
    // すべてのデータが選択される
    expect(mockSelectionChange).toHaveBeenCalledWith(mockData);
  });
  
  // ソートテスト
  test('ソート可能な列ヘッダーをクリックするとソートが切り替わる', async () => {
    const mockSortChange = jest.fn();
    const user = userEvent.setup();
    
    render(
      <Table
        data={mockData}
        columns={mockColumns}
        onSortChange={mockSortChange}
      />
    );
    
    // 名前列（ソート可能な列）をクリック
    const nameHeader = screen.getByText('名前');
    await user.click(nameHeader);
    
    // ソートコールバックが呼ばれる（昇順）
    expect(mockSortChange).toHaveBeenCalledWith('name', 'asc');
    
    // もう一度クリックすると降順になる
    mockSortChange.mockReset();
    await user.click(nameHeader);
    expect(mockSortChange).toHaveBeenCalledWith('name', 'desc');
    
    // もう一度クリックするとソートがクリアされる
    mockSortChange.mockReset();
    await user.click(nameHeader);
    expect(mockSortChange).toHaveBeenCalledWith('name', null);
  });
  
  // 行クリックテスト
  test('行をクリックするとコールバックが呼ばれる', async () => {
    const mockRowClick = jest.fn();
    const user = userEvent.setup();
    
    render(
      <Table
        data={mockData}
        columns={mockColumns}
        onRowClick={mockRowClick}
      />
    );
    
    // 最初の行をクリック（名前のセルにフォーカスしてクリック）
    await user.click(screen.getByText('山田太郎'));
    
    // コールバックが対象データで呼ばれる
    expect(mockRowClick).toHaveBeenCalledWith(mockData[0]);
  });
  
  // アクションテスト
  test('アクションボタンをクリックするとコールバックが呼ばれる', async () => {
    const mockActionClick = jest.fn();
    const user = userEvent.setup();
    
    const mockActions = [
      {
        id: 'delete',
        label: '削除',
        onClick: mockActionClick,
      }
    ];
    
    render(
      <Table
        data={mockData}
        columns={mockColumns}
        actions={mockActions}
        selectionType="multiple"
        selectedItems={[mockData[0]]}
      />
    );
    
    // アクションボタンをクリック
    const deleteButton = screen.getByText('削除');
    await user.click(deleteButton);
    
    // コールバックが選択アイテムで呼ばれる
    expect(mockActionClick).toHaveBeenCalledWith([mockData[0]]);
  });
  
  // ページネーションテスト
  test('ページネーションコントロールでページを切り替えられる', async () => {
    const mockPageChange = jest.fn();
    const user = userEvent.setup();
    
    // 多くのデータを用意
    const manyItems = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `ユーザー${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: i % 2 === 0 ? 'ユーザー' : 'ヘルパー',
    }));
    
    render(
      <Table
        data={manyItems}
        columns={mockColumns}
        page={0}
        pageSize={10}
        totalCount={25}
        onPageChange={mockPageChange}
      />
    );
    
    // 「次へ」ボタンをクリック
    const nextButton = screen.getByText('次へ');
    await user.click(nextButton);
    
    // ページ変更コールバックが呼ばれる
    expect(mockPageChange).toHaveBeenCalledWith(1, 10);
  });
  
  // ローディング状態テスト
  test('ローディング中は適切なインジケータを表示する', () => {
    render(
      <Table
        data={mockData}
        columns={mockColumns}
        loading={true}
      />
    );
    
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });
});
