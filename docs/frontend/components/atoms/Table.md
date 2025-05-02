# テーブルコンポーネント設計仕様書

## コンポーネント基本情報

- **コンポーネント名**: Table
- **タイプ**: molecule
- **対応するタスク**: タスク016
- **依存するコンポーネント**: 
  - Typography (atom)
  - Button (atom)
  - Checkbox (atom)

## 機能概要

Tableコンポーネントは、データを行と列の形式で表示するためのコンポーネントです。ユーザーがデータを一覧表示し、ソート、フィルタリング、ページネーションなどの操作を行うことができます。ヘルパー支援システムにおいて、ユーザーの要望リスト、料理リスト、タスク一覧などを表示するために使用されます。

## 要件

- データの行と列形式での表示
- 列ヘッダーのカスタマイズ（ソート機能付き）
- 行の選択機能（単一選択・複数選択）
- ページネーション機能
- レスポンシブ対応（モバイル表示時はカード形式に変換）
- カスタムアクションボタンの設定
- 空データ時の表示メッセージのカスタマイズ
- ローディング状態の表示
- 行のカスタムスタイリング

## Props定義

```typescript
export interface Column<T> {
  /**
   * 列の識別子
   */
  id: string;
  
  /**
   * 列ヘッダーに表示するテキスト
   */
  header: string;
  
  /**
   * データオブジェクトから値を取得する関数
   * @param item データアイテム
   * @return 表示する値
   */
  accessor: (item: T) => React.ReactNode;
  
  /**
   * ソート可能かどうか
   * @default false
   */
  sortable?: boolean;
  
  /**
   * 列の幅（px, %, fr）
   * @default 'auto'
   */
  width?: string;
  
  /**
   * セルの水平方向の配置
   * @default 'left'
   */
  align?: 'left' | 'center' | 'right';
  
  /**
   * 表示/非表示の状態
   * @default true
   */
  visible?: boolean;
}

export interface TableAction<T> {
  /**
   * アクションの識別子
   */
  id: string;
  
  /**
   * アクションボタンのラベル
   */
  label: string;
  
  /**
   * アクションのハンドラ関数
   * @param selectedItems 選択されたアイテム
   */
  onClick: (selectedItems: T[]) => void;
  
  /**
   * ボタンの種類
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  
  /**
   * アクションを表示する条件
   * @param selectedItems 選択されたアイテム
   * @return 表示するかどうか
   * @default () => true
   */
  isVisible?: (selectedItems: T[]) => boolean;
  
  /**
   * アクションを有効にする条件
   * @param selectedItems 選択されたアイテム
   * @return 有効にするかどうか
   * @default () => true
   */
  isEnabled?: (selectedItems: T[]) => boolean;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface TableProps<T> {
  /**
   * 表示するデータの配列
   */
  data: T[];
  
  /**
   * 列の定義
   */
  columns: Column<T>[];
  
  /**
   * 選択機能の種類
   * @default 'none'
   */
  selectionType?: 'none' | 'single' | 'multiple';
  
  /**
   * 選択されたアイテムの配列
   */
  selectedItems?: T[];
  
  /**
   * 選択変更時のコールバック
   * @param selectedItems 選択されたアイテム
   */
  onSelectionChange?: (selectedItems: T[]) => void;
  
  /**
   * ソート対象の列ID
   */
  sortBy?: string;
  
  /**
   * ソート方向
   */
  sortDirection?: SortDirection;
  
  /**
   * ソート変更時のコールバック
   * @param columnId ソート対象の列ID
   * @param direction ソート方向
   */
  onSortChange?: (columnId: string, direction: SortDirection) => void;
  
  /**
   * ページ番号（0から開始）
   * @default 0
   */
  page?: number;
  
  /**
   * 1ページあたりのアイテム数
   * @default 10
   */
  pageSize?: number;
  
  /**
   * 総アイテム数（サーバーページネーション用）
   */
  totalCount?: number;
  
  /**
   * ページ変更時のコールバック
   * @param page ページ番号
   * @param pageSize 1ページあたりのアイテム数
   */
  onPageChange?: (page: number, pageSize: number) => void;
  
  /**
   * データロード中かどうか
   * @default false
   */
  loading?: boolean;
  
  /**
   * データが空の場合に表示するメッセージ
   * @default '表示するデータがありません'
   */
  emptyMessage?: string;
  
  /**
   * テーブルのアクション
   */
  actions?: TableAction<T>[];
  
  /**
   * 行のクリック時のコールバック
   * @param item クリックされた行のデータ
   */
  onRowClick?: (item: T) => void;
  
  /**
   * 行の条件付きクラス
   * @param item 行のデータ
   * @return 適用するクラス名
   */
  rowClassName?: (item: T) => string;
  
  /**
   * コンテナのクラス名
   */
  className?: string;
  
  /**
   * ID属性（テスト用）
   */
  dataTestId?: string;
}
```

## 状態管理

```typescript
// 内部で管理する状態
const [internalSelectedItems, setInternalSelectedItems] = useState<T[]>([]);
const [internalPage, setInternalPage] = useState<number>(page || 0);
const [internalPageSize, setInternalPageSize] = useState<number>(pageSize || 10);
const [internalSortBy, setInternalSortBy] = useState<string | undefined>(sortBy);
const [internalSortDirection, setInternalSortDirection] = useState<SortDirection>(sortDirection || null);
```

## 振る舞い

### ソート処理

```typescript
const handleSort = (columnId: string) => {
  // 現在のソート状態を確認
  const newDirection: SortDirection = 
    internalSortBy === columnId 
      ? internalSortDirection === 'asc' 
        ? 'desc' 
        : internalSortDirection === 'desc' 
          ? null 
          : 'asc'
      : 'asc';
  
  // 外部制御の場合
  if (onSortChange) {
    onSortChange(columnId, newDirection);
  } else {
    // 内部状態を更新
    setInternalSortBy(newDirection === null ? undefined : columnId);
    setInternalSortDirection(newDirection);
  }
};
```

### 選択処理

```typescript
const handleRowSelect = (item: T, checked: boolean) => {
  let newSelectedItems: T[];
  
  if (selectionType === 'single') {
    newSelectedItems = checked ? [item] : [];
  } else {
    newSelectedItems = checked
      ? [...internalSelectedItems, item]
      : internalSelectedItems.filter(i => i !== item);
  }
  
  // 外部制御の場合
  if (onSelectionChange) {
    onSelectionChange(newSelectedItems);
  } else {
    // 内部状態を更新
    setInternalSelectedItems(newSelectedItems);
  }
};

const handleSelectAll = (checked: boolean) => {
  const newSelectedItems = checked ? [...data] : [];
  
  // 外部制御の場合
  if (onSelectionChange) {
    onSelectionChange(newSelectedItems);
  } else {
    // 内部状態を更新
    setInternalSelectedItems(newSelectedItems);
  }
};
```

### ページネーション処理

```typescript
const handlePageChange = (newPage: number) => {
  // 外部制御の場合
  if (onPageChange) {
    onPageChange(newPage, internalPageSize);
  } else {
    // 内部状態を更新
    setInternalPage(newPage);
  }
};

const handlePageSizeChange = (newPageSize: number) => {
  // 外部制御の場合
  if (onPageChange) {
    onPageChange(0, newPageSize); // サイズ変更時は最初のページに戻る
  } else {
    // 内部状態を更新
    setInternalPage(0);
    setInternalPageSize(newPageSize);
  }
};
```

## スタイル

```typescript
// 基本スタイル
const tableContainerStyles = classNames(
  'table-container',
  className
);

const tableStyles = classNames(
  'table',
  {
    'table--loading': loading
  }
);

const headerCellStyles = (column: Column<T>) => classNames(
  'table__header-cell',
  `table__header-cell--align-${column.align || 'left'}`,
  {
    'table__header-cell--sortable': column.sortable,
    'table__header-cell--sorted-asc': internalSortBy === column.id && internalSortDirection === 'asc',
    'table__header-cell--sorted-desc': internalSortBy === column.id && internalSortDirection === 'desc'
  }
);

const bodyCellStyles = (column: Column<T>) => classNames(
  'table__body-cell',
  `table__body-cell--align-${column.align || 'left'}`
);

const rowStyles = (item: T) => classNames(
  'table__row',
  {
    'table__row--selected': isItemSelected(item),
    'table__row--clickable': !!onRowClick
  },
  rowClassName && rowClassName(item)
);
```

## レスポンシブ対応

```scss
// テーブルのレスポンシブ対応（スタイル例）
.table-container {
  width: 100%;
  overflow-x: auto;
  
  @media (max-width: 768px) {
    .table {
      display: none;
    }
    
    .table-cards {
      display: block;
    }
  }
  
  @media (min-width: 769px) {
    .table {
      display: table;
    }
    
    .table-cards {
      display: none;
    }
  }
}

// カードビュー（モバイル表示用）
.table-card {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-bottom: 16px;
  padding: 16px;
  
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  &__field {
    display: flex;
    margin-bottom: 8px;
    
    &-label {
      font-weight: 600;
      width: 40%;
    }
    
    &-value {
      width: 60%;
    }
  }
}
```

## アクセシビリティ対応

- テーブルには適切な `role="table"` 属性を設定
- ヘッダーセルには `scope="col"` 属性を設定
- ソート可能な列には `aria-sort` 属性を設定（`"ascending"`, `"descending"`, `"none"`）
- 選択可能な行には `aria-selected` 属性を設定
- 選択チェックボックスには適切なラベルを設定
- キーボードナビゲーションをサポート（矢印キーで行間移動、Enter/Spaceキーで選択）
- スクリーンリーダー対応の説明文や状態通知を実装

## テスト計画

### ユニットテスト

```typescript
describe('Table', () => {
  // レンダリングテスト
  it('データと列定義を正しくレンダリングする', () => {
    // テスト実装
  });
  
  // ソートテスト
  it('列ヘッダーをクリックするとソートが切り替わる', () => {
    // テスト実装
  });
  
  // 選択テスト
  it('単一選択モードで行を選択できる', () => {
    // テスト実装
  });
  
  it('複数選択モードで複数の行を選択できる', () => {
    // テスト実装
  });
  
  it('全選択チェックボックスですべての行を選択できる', () => {
    // テスト実装
  });
  
  // ページネーションテスト
  it('ページを切り替えることができる', () => {
    // テスト実装
  });
  
  it('ページサイズを変更できる', () => {
    // テスト実装
  });
  
  // ローディング状態テスト
  it('ローディング中は適切なインジケータを表示する', () => {
    // テスト実装
  });
  
  // 空データテスト
  it('データが空の場合は空メッセージを表示する', () => {
    // テスト実装
  });
  
  // アクションテスト
  it('アクションボタンをクリックするとコールバックが呼ばれる', () => {
    // テスト実装
  });
  
  // 行クリックテスト
  it('行をクリックするとコールバックが呼ばれる', () => {
    // テスト実装
  });
});
```

## 実装例

```tsx
import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { Checkbox } from '../atoms/Checkbox';

export const Table = <T extends unknown>({
  data,
  columns,
  selectionType = 'none',
  selectedItems: externalSelectedItems,
  onSelectionChange,
  sortBy: externalSortBy,
  sortDirection: externalSortDirection,
  onSortChange,
  page: externalPage = 0,
  pageSize: externalPageSize = 10,
  totalCount,
  onPageChange,
  loading = false,
  emptyMessage = '表示するデータがありません',
  actions = [],
  onRowClick,
  rowClassName,
  className,
  dataTestId = 'table'
}: TableProps<T>) => {
  // 状態管理（実装詳細は省略）
  
  // 表示するデータの計算
  const displayData = useMemo(() => {
    if (onPageChange) {
      // 外部ページネーションの場合はそのまま表示
      return data;
    }
    
    // 内部ページネーションの場合は現在のページ分だけ抽出
    const start = internalPage * internalPageSize;
    const end = start + internalPageSize;
    return data.slice(start, end);
  }, [data, internalPage, internalPageSize, onPageChange]);
  
  // テーブルレンダリング
  return (
    <div className={tableContainerStyles} data-testid={dataTestId}>
      {/* アクションバー */}
      {actions.length > 0 && (
        <div className="table-actions">
          {actions.map(action => (
            <Button
              key={action.id}
              onClick={() => action.onClick(effectiveSelectedItems)}
              variant={action.variant || 'primary'}
              disabled={!action.isEnabled?.(effectiveSelectedItems) ?? false}
              style={{
                display: !action.isVisible?.(effectiveSelectedItems) ?? true
                  ? 'inline-flex'
                  : 'none'
              }}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
      
      {/* ローディングインジケータ */}
      {loading && <div className="table-loading">読み込み中...</div>}
      
      {/* テーブル */}
      <table className={tableStyles} role="table">
        <thead>
          <tr>
            {/* 選択列 */}
            {selectionType === 'multiple' && (
              <th className="table__header-cell table__header-cell--checkbox">
                <Checkbox
                  checked={
                    effectiveSelectedItems.length > 0 && 
                    effectiveSelectedItems.length === data.length
                  }
                  indeterminate={
                    effectiveSelectedItems.length > 0 && 
                    effectiveSelectedItems.length < data.length
                  }
                  onChange={handleSelectAll}
                  aria-label="すべて選択"
                />
              </th>
            )}
            
            {/* 列ヘッダー */}
            {columns
              .filter(col => col.visible !== false)
              .map(column => (
                <th
                  key={column.id}
                  className={headerCellStyles(column)}
                  style={{ width: column.width || 'auto' }}
                  onClick={() => column.sortable && handleSort(column.id)}
                  aria-sort={
                    internalSortBy === column.id
                      ? internalSortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                  scope="col"
                >
                  <div className="table__header-cell-content">
                    <span>{column.header}</span>
                    {column.sortable && (
                      <span className="table__sort-icon">
                        {/* ソートアイコン */}
                      </span>
                    )}
                  </div>
                </th>
              ))}
          </tr>
        </thead>
        
        <tbody>
          {displayData.length === 0 ? (
            <tr>
              <td
                colSpan={
                  columns.filter(col => col.visible !== false).length + 
                  (selectionType === 'multiple' ? 1 : 0)
                }
                className="table__empty-message"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            displayData.map((item, index) => (
              <tr
                key={index}
                className={rowStyles(item)}
                onClick={() => onRowClick && onRowClick(item)}
                aria-selected={isItemSelected(item)}
              >
                {/* 選択チェックボックス */}
                {selectionType === 'multiple' && (
                  <td className="table__body-cell table__body-cell--checkbox">
                    <Checkbox
                      checked={isItemSelected(item)}
                      onChange={(checked) => handleRowSelect(item, checked)}
                      aria-label="行を選択"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                )}
                
                {/* セルデータ */}
                {columns
                  .filter(col => col.visible !== false)
                  .map(column => (
                    <td
                      key={column.id}
                      className={bodyCellStyles(column)}
                    >
                      {column.accessor(item)}
                    </td>
                  ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {/* モバイル表示用カードビュー */}
      <div className="table-cards">
        {displayData.length === 0 ? (
          <div className="table-empty-message">{emptyMessage}</div>
        ) : (
          displayData.map((item, index) => (
            <div
              key={index}
              className={classNames(
                'table-card',
                {
                  'table-card--selected': isItemSelected(item),
                  'table-card--clickable': !!onRowClick
                },
                rowClassName && rowClassName(item)
              )}
              onClick={() => onRowClick && onRowClick(item)}
            >
              <div className="table-card__header">
                {/* 選択チェックボックス */}
                {selectionType !== 'none' && (
                  <Checkbox
                    checked={isItemSelected(item)}
                    onChange={(checked) => handleRowSelect(item, checked)}
                    aria-label="行を選択"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
              </div>
              
              {/* フィールド表示 */}
              {columns
                .filter(col => col.visible !== false)
                .map(column => (
                  <div key={column.id} className="table-card__field">
                    <div className="table-card__field-label">
                      {column.header}:
                    </div>
                    <div className="table-card__field-value">
                      {column.accessor(item)}
                    </div>
                  </div>
                ))}
            </div>
          ))
        )}
      </div>
      
      {/* ページネーション */}
      {(totalCount || data.length) > 0 && (
        <div className="table-pagination">
          {/* ページネーションコントロール実装（詳細省略） */}
        </div>
      )}
    </div>
  );
};

export default Table;
```

## 使用例

```tsx
// 基本的な使用例
<Table
  data={users}
  columns={[
    {
      id: 'name',
      header: '名前',
      accessor: (user) => user.name,
      sortable: true
    },
    {
      id: 'email',
      header: 'メールアドレス',
      accessor: (user) => user.email
    },
    {
      id: 'role',
      header: '役割',
      accessor: (user) => user.role
    }
  ]}
/>

// 選択機能付きの例
<Table
  data={tasks}
  columns={taskColumns}
  selectionType="multiple"
  selectedItems={selectedTasks}
  onSelectionChange={setSelectedTasks}
  actions={[
    {
      id: 'complete',
      label: '完了にする',
      onClick: handleCompleteTasks,
      isVisible: (items) => items.length > 0,
      isEnabled: (items) => items.some(task => !task.completed)
    },
    {
      id: 'delete',
      label: '削除',
      variant: 'danger',
      onClick: handleDeleteTasks,
      isVisible: (items) => items.length > 0
    }
  ]}
/>

// サーバーページネーション付きの例
<Table
  data={recipes}
  columns={recipeColumns}
  page={page}
  pageSize={pageSize}
  totalCount={totalRecipes}
  onPageChange={handlePageChange}
  loading={isLoading}
  onRowClick={handleRecipeClick}
/>
```

## 注意事項

- 大量のデータを扱う場合は仮想スクロールの実装を検討する
- モバイル表示ではカード形式に切り替えるが、必要に応じて表示する列を制限することも検討する
- セルの内容が長い場合の折り返しや省略表示のオプションを提供する
- ソート・フィルターのサーバー処理とクライアント処理の両方に対応できるよう設計する
- アクセシビリティに配慮し、キーボードナビゲーションとスクリーンリーダー対応を徹底する

---

作成日: 2025-05-02
最終更新日: 2025-05-02
作成者: Claude