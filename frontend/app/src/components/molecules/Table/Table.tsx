import React, { useState, useEffect, useMemo } from 'react';
import styled, { css } from 'styled-components';
import classNames from 'classnames';
import { Typography } from '../../atoms/Typography';
import { Button } from '../../atoms/Button';
import { Checkbox } from '../../atoms/Checkbox';
import {
  tableStyles,
  tableHeaderStyles,
  tableBodyStyles,
  tableResponsiveStyles,
  tableCardsStyles
} from './tableStyles';

/**
 * 列定義のインターフェース
 */
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

/**
 * テーブルアクション定義のインターフェース
 */
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

/**
 * ソート方向の型定義
 */
export type SortDirection = 'asc' | 'desc' | null;

/**
 * テーブルコンポーネントのProps
 */
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

// スタイル定義を適用したコンポーネント
const TableContainer = styled.div`
  ${tableResponsiveStyles}
`;

const StyledTable = styled.table`
  ${tableStyles}
  
  thead {
    ${tableHeaderStyles}
  }
  
  tbody {
    ${tableBodyStyles}
  }
  
  ${tableCardsStyles}
`;

/**
 * テーブルコンポーネント
 * データを行と列の形式で表示し、ソート・選択・ページネーション機能を提供します
 */
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
  // 内部で管理する状態
  const [internalSelectedItems, setInternalSelectedItems] = useState<T[]>([]);
  const [internalPage, setInternalPage] = useState<number>(externalPage);
  const [internalPageSize, setInternalPageSize] = useState<number>(externalPageSize);
  const [internalSortBy, setInternalSortBy] = useState<string | undefined>(externalSortBy);
  const [internalSortDirection, setInternalSortDirection] = useState<SortDirection>(externalSortDirection || null);
  
  // 外部からのprops変更時に内部状態を同期
  useEffect(() => {
    if (externalSelectedItems !== undefined) {
      setInternalSelectedItems(externalSelectedItems);
    }
  }, [externalSelectedItems]);
  
  useEffect(() => {
    setInternalPage(externalPage);
  }, [externalPage]);
  
  useEffect(() => {
    setInternalPageSize(externalPageSize);
  }, [externalPageSize]);
  
  useEffect(() => {
    setInternalSortBy(externalSortBy);
  }, [externalSortBy]);
  
  useEffect(() => {
    setInternalSortDirection(externalSortDirection || null);
  }, [externalSortDirection]);
  
  // 使用する選択アイテム（外部制御または内部状態）
  const effectiveSelectedItems = externalSelectedItems !== undefined 
    ? externalSelectedItems 
    : internalSelectedItems;
  
  // アイテムが選択されているか確認する関数
  const isItemSelected = (item: T): boolean => {
    return effectiveSelectedItems.includes(item);
  };
  
  // ソート処理
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
  
  // 選択処理
  const handleRowSelect = (item: T, checked: boolean) => {
    let newSelectedItems: T[];
    
    if (selectionType === 'single') {
      newSelectedItems = checked ? [item] : [];
    } else {
      newSelectedItems = checked
        ? [...effectiveSelectedItems, item]
        : effectiveSelectedItems.filter(i => i !== item);
    }
    
    // 外部制御の場合
    if (onSelectionChange) {
      onSelectionChange(newSelectedItems);
    } else {
      // 内部状態を更新
      setInternalSelectedItems(newSelectedItems);
    }
  };
  
  // 全選択処理
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
  
  // ページネーション処理
  const handlePageChange = (newPage: number) => {
    // 外部制御の場合
    if (onPageChange) {
      onPageChange(newPage, internalPageSize);
    } else {
      // 内部状態を更新
      setInternalPage(newPage);
    }
  };
  
  // ページサイズ変更処理
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
  
  // テーブルスタイルの計算
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
  
  // ページネーションコントロール用データ
  const totalPages = useMemo(() => {
    const total = totalCount || data.length;
    return Math.ceil(total / internalPageSize);
  }, [totalCount, data.length, internalPageSize]);
  
  // ページネーションボタン生成
  const renderPaginationButtons = () => {
    // 簡易的なページネーション実装
    // （実際の実装ではもっと複雑なロジックが必要になる場合があります）
    const buttons = [];
    
    // 前へボタン
    buttons.push(
      <Button
        key="prev"
        variant="outline"
        onClick={() => handlePageChange(internalPage - 1)}
        disabled={internalPage === 0}
        size="small"
      >
        前へ
      </Button>
    );
    
    // ページ情報
    buttons.push(
      <div key="info" style={{ margin: '0 1rem' }}>
        <Typography variant="body2">
          {`${internalPage + 1} / ${totalPages || 1} ページ`}
        </Typography>
      </div>
    );
    
    // 次へボタン
    buttons.push(
      <Button
        key="next"
        variant="outline"
        onClick={() => handlePageChange(internalPage + 1)}
        disabled={internalPage >= totalPages - 1}
        size="small"
      >
        次へ
      </Button>
    );
    
    return buttons;
  };
  
  return (
    <TableContainer className={tableContainerStyles} data-testid={dataTestId}>
      {/* アクションバー */}
      {actions.length > 0 && (
        <div className="table-actions">
          {actions.map(action => {
            const isVisible = action.isVisible ? action.isVisible(effectiveSelectedItems) : true;
            const isEnabled = action.isEnabled ? action.isEnabled(effectiveSelectedItems) : true;
            
            if (!isVisible) return null;
            
            return (
              <Button
                key={action.id}
                onClick={() => action.onClick(effectiveSelectedItems)}
                variant={action.variant || 'primary'}
                disabled={!isEnabled}
              >
                {action.label}
              </Button>
            );
          })}
        </div>
      )}
      
      {/* ローディングインジケータ */}
      {loading && (
        <div className="table-loading">
          <Typography>読み込み中...</Typography>
        </div>
      )}
      
      {/* テーブル */}
      <StyledTable className={tableStyles} role="table">
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
                  onChange={(e) => handleSelectAll(e.target.checked)}
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
                        {/* ソートアイコン表示 */}
                        {internalSortBy === column.id && (
                          internalSortDirection === 'asc' ? ' ▲' : ' ▼'
                        )}
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
                      onChange={(e) => handleRowSelect(item, e.target.checked)}
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
      </StyledTable>
      
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
                    onChange={(e) => handleRowSelect(item, e.target.checked)}
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
      {(totalCount || data.length) > internalPageSize && (
        <div className="table-pagination">
          {renderPaginationButtons()}
        </div>
      )}
    </TableContainer>
  );
};

export default Table;
