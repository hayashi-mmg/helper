import type { Meta, StoryObj } from '@storybook/react';
import { Table } from './Table';
import { useState } from 'react';

const meta = {
  title: 'molecules/Table',
  component: Table,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

// サンプルデータ
const sampleData = [
  { id: 1, name: '山田太郎', email: 'yamada@example.com', role: '管理者', status: 'active' },
  { id: 2, name: '佐藤花子', email: 'sato@example.com', role: 'ユーザー', status: 'active' },
  { id: 3, name: '鈴木一郎', email: 'suzuki@example.com', role: 'ヘルパー', status: 'inactive' },
  { id: 4, name: '田中次郎', email: 'tanaka@example.com', role: 'ユーザー', status: 'active' },
  { id: 5, name: '高橋三郎', email: 'takahashi@example.com', role: 'ヘルパー', status: 'active' },
];

// 列定義
const columns = [
  {
    id: 'name',
    header: '名前',
    accessor: (item: typeof sampleData[0]) => item.name,
    sortable: true,
  },
  {
    id: 'email',
    header: 'メールアドレス',
    accessor: (item: typeof sampleData[0]) => item.email,
  },
  {
    id: 'role',
    header: '役割',
    accessor: (item: typeof sampleData[0]) => item.role,
    sortable: true,
  },
  {
    id: 'status',
    header: 'ステータス',
    accessor: (item: typeof sampleData[0]) => (
      <span style={{ 
        color: item.status === 'active' ? 'green' : 'red',
        fontWeight: 'bold'
      }}>
        {item.status === 'active' ? '有効' : '無効'}
      </span>
    ),
    align: 'center' as const,
  },
];

// 基本的なテーブル
export const Basic: Story = {
  args: {
    data: sampleData,
    columns,
  },
};

// 複数選択機能付きテーブル
export const WithMultiSelect: Story = {
  render: function Render(args) {
    const [selectedItems, setSelectedItems] = useState<typeof sampleData>([]);
    
    return (
      <div style={{ width: '800px' }}>
        <Table
          {...args}
          data={sampleData}
          columns={columns}
          selectionType="multiple"
          selectedItems={selectedItems}
          onSelectionChange={setSelectedItems}
        />
        <div style={{ marginTop: '20px' }}>
          <h3>選択されたアイテム:</h3>
          <pre>{JSON.stringify(selectedItems.map(item => item.name), null, 2)}</pre>
        </div>
      </div>
    );
  }
};

// ソート機能付きテーブル
export const WithSorting: Story = {
  render: function Render(args) {
    const [sortBy, setSortBy] = useState<string | undefined>(undefined);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
    
    const handleSortChange = (columnId: string, direction: 'asc' | 'desc' | null) => {
      setSortBy(direction === null ? undefined : columnId);
      setSortDirection(direction);
    };
    
    // 実際のソート処理（実装例）
    const sortedData = [...sampleData].sort((a, b) => {
      if (!sortBy || sortDirection === null) return 0;
      
      const factor = sortDirection === 'asc' ? 1 : -1;
      
      switch (sortBy) {
        case 'name':
          return factor * a.name.localeCompare(b.name);
        case 'role':
          return factor * a.role.localeCompare(b.role);
        default:
          return 0;
      }
    });
    
    return (
      <div style={{ width: '800px' }}>
        <Table
          {...args}
          data={sortedData}
          columns={columns}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
        />
        <div style={{ marginTop: '20px' }}>
          <h3>現在のソート:</h3>
          <p>列: {sortBy || 'なし'}</p>
          <p>方向: {sortDirection || 'なし'}</p>
        </div>
      </div>
    );
  }
};

// ページネーション付きテーブル
export const WithPagination: Story = {
  render: function Render(args) {
    // より多くのデータ
    const manyItems = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      name: `ユーザー${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: i % 3 === 0 ? '管理者' : i % 3 === 1 ? 'ユーザー' : 'ヘルパー',
      status: i % 4 === 0 ? 'inactive' : 'active',
    }));
    
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    
    const handlePageChange = (newPage: number, newPageSize: number) => {
      setPage(newPage);
      setPageSize(newPageSize);
    };
    
    // 表示データはページごとに取得
    const displayData = manyItems.slice(page * pageSize, (page + 1) * pageSize);
    
    return (
      <div style={{ width: '800px' }}>
        <Table
          {...args}
          data={displayData}
          columns={columns}
          page={page}
          pageSize={pageSize}
          totalCount={manyItems.length}
          onPageChange={handlePageChange}
        />
      </div>
    );
  }
};

// アクション付きテーブル
export const WithActions: Story = {
  render: function Render(args) {
    const [selectedItems, setSelectedItems] = useState<typeof sampleData>([]);
    const [log, setLog] = useState<string[]>([]);
    
    const handleAction = (actionId: string, items: typeof sampleData) => {
      setLog(prev => [...prev, `${actionId}: ${items.map(i => i.name).join(', ')}`]);
    };
    
    const actions = [
      {
        id: 'activate',
        label: '有効化',
        onClick: (items: typeof sampleData) => handleAction('有効化', items),
        isVisible: (items: typeof sampleData) => items.some(item => item.status === 'inactive'),
        isEnabled: (items: typeof sampleData) => items.some(item => item.status === 'inactive'),
      },
      {
        id: 'deactivate',
        label: '無効化',
        onClick: (items: typeof sampleData) => handleAction('無効化', items),
        isVisible: (items: typeof sampleData) => items.some(item => item.status === 'active'),
        isEnabled: (items: typeof sampleData) => items.some(item => item.status === 'active'),
      },
      {
        id: 'delete',
        label: '削除',
        variant: 'danger' as const,
        onClick: (items: typeof sampleData) => handleAction('削除', items),
        isEnabled: (items: typeof sampleData) => items.length > 0,
      },
    ];
    
    return (
      <div style={{ width: '800px' }}>
        <Table
          {...args}
          data={sampleData}
          columns={columns}
          selectionType="multiple"
          selectedItems={selectedItems}
          onSelectionChange={setSelectedItems}
          actions={actions}
        />
        <div style={{ marginTop: '20px' }}>
          <h3>アクション履歴:</h3>
          <ul>
            {log.map((entry, index) => (
              <li key={index}>{entry}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
};

// クリック可能な行
export const WithClickableRows: Story = {
  render: function Render(args) {
    const [clickedItem, setClickedItem] = useState<typeof sampleData[0] | null>(null);
    
    return (
      <div style={{ width: '800px' }}>
        <Table
          {...args}
          data={sampleData}
          columns={columns}
          onRowClick={setClickedItem}
        />
        <div style={{ marginTop: '20px' }}>
          <h3>クリックされた行:</h3>
          <pre>{clickedItem ? JSON.stringify(clickedItem, null, 2) : '未選択'}</pre>
        </div>
      </div>
    );
  }
};

// ローディング状態
export const Loading: Story = {
  args: {
    data: [],
    columns,
    loading: true,
  },
};

// 空データ
export const Empty: Story = {
  args: {
    data: [],
    columns,
    emptyMessage: 'データが見つかりません。新しいデータを追加してください。',
  },
};

// すべての機能を組み合わせた例
export const CompleteExample: Story = {
  render: function Render(args) {
    const [data, setData] = useState(sampleData);
    const [selectedItems, setSelectedItems] = useState<typeof sampleData>([]);
    const [sortBy, setSortBy] = useState<string | undefined>(undefined);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [loading, setLoading] = useState(false);
    
    // ソート処理
    const handleSort = (columnId: string, direction: 'asc' | 'desc' | null) => {
      setSortBy(direction === null ? undefined : columnId);
      setSortDirection(direction);
      // ソートするとページをリセット
      setPage(0);
    };
    
    // 選択処理
    const handleSelectionChange = (items: typeof sampleData) => {
      setSelectedItems(items);
    };
    
    // ページネーション処理
    const handlePageChange = (newPage: number, newPageSize: number) => {
      setPage(newPage);
      setPageSize(newPageSize);
    };
    
    // アクション
    const handleDelete = (items: typeof sampleData) => {
      setLoading(true);
      // 削除処理のシミュレーション
      setTimeout(() => {
        setData(prev => prev.filter(item => !items.includes(item)));
        setSelectedItems([]);
        setLoading(false);
      }, 1000);
    };
    
    // アクション定義
    const actions = [
      {
        id: 'delete',
        label: '選択したアイテムを削除',
        variant: 'danger' as const,
        onClick: handleDelete,
        isEnabled: (items: typeof sampleData) => items.length > 0,
      },
    ];
    
    // ソート済みデータ
    const sortedData = useMemo(() => {
      if (!sortBy || sortDirection === null) return [...data];
      
      return [...data].sort((a, b) => {
        const factor = sortDirection === 'asc' ? 1 : -1;
        
        switch (sortBy) {
          case 'name':
            return factor * a.name.localeCompare(b.name);
          case 'role':
            return factor * a.role.localeCompare(b.role);
          default:
            return 0;
        }
      });
    }, [data, sortBy, sortDirection]);
    
    // 現在のページのデータ
    const currentPageData = useMemo(() => {
      return sortedData.slice(page * pageSize, (page + 1) * pageSize);
    }, [sortedData, page, pageSize]);
    
    return (
      <div style={{ width: '800px' }}>
        <Table
          {...args}
          data={currentPageData}
          columns={columns}
          selectionType="multiple"
          selectedItems={selectedItems}
          onSelectionChange={handleSelectionChange}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSortChange={handleSort}
          page={page}
          pageSize={pageSize}
          totalCount={data.length}
          onPageChange={handlePageChange}
          loading={loading}
          actions={actions}
        />
      </div>
    );
  }
};
