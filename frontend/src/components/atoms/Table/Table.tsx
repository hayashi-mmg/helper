import React, { useState, useEffect, useMemo } from 'react';
import classNames from 'classnames';
import { Typography } from '../Typography';
import { Button } from '../Button';
import { Checkbox } from '../Checkbox';

/**
 * 列定義
 */
export interface Column<T> {
    id: string;
    header: string;
    accessor: (item: T) => React.ReactNode;
    sortable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
    visible?: boolean;
}

/**
 * テーブルアクション
 */
export interface TableAction<T> {
    id: string;
    label: string;
    onClick: (selectedItems: T[]) => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    isVisible?: (selectedItems: T[]) => boolean;
    isEnabled?: (selectedItems: T[]) => boolean;
}

export type SortDirection = 'asc' | 'desc' | null;

/**
 * TableProps
 */
export interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    selectionType?: 'none' | 'single' | 'multiple';
    selectedItems?: T[];
    onSelectionChange?: (selectedItems: T[]) => void;
    sortBy?: string;
    sortDirection?: SortDirection;
    onSortChange?: (columnId: string, direction: SortDirection) => void;
    page?: number;
    pageSize?: number;
    totalCount?: number;
    onPageChange?: (page: number, pageSize: number) => void;
    loading?: boolean;
    emptyMessage?: string;
    actions?: TableAction<T>[];
    onRowClick?: (item: T) => void;
    rowClassName?: (item: T) => string;
    className?: string;
    dataTestId?: string;
}

/**
 * Table コンポーネント
 * @param props TableProps<T>
 * @returns JSX.Element
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
    dataTestId = 'table',
}: TableProps<T>) => {
    // 内部状態
    const [internalSelectedItems, setInternalSelectedItems] = useState<T[]>([]);
    const [internalPage, setInternalPage] = useState<number>(externalPage);
    const [internalPageSize, setInternalPageSize] = useState<number>(externalPageSize);
    const [internalSortBy, setInternalSortBy] = useState<string | undefined>(externalSortBy);
    const [internalSortDirection, setInternalSortDirection] = useState<SortDirection>(externalSortDirection || null);

    // 外部制御優先
    const effectiveSelectedItems = externalSelectedItems !== undefined ? externalSelectedItems : internalSelectedItems;
    const effectivePage = onPageChange ? externalPage : internalPage;
    const effectivePageSize = onPageChange ? externalPageSize : internalPageSize;
    const effectiveSortBy = onSortChange ? externalSortBy : internalSortBy;
    const effectiveSortDirection = onSortChange ? externalSortDirection : internalSortDirection;

    // ソート処理
    const handleSort = (columnId: string) => {
        const newDirection: SortDirection =
            effectiveSortBy === columnId
                ? effectiveSortDirection === 'asc'
                    ? 'desc'
                    : effectiveSortDirection === 'desc'
                        ? null
                        : 'asc'
                : 'asc';
        if (onSortChange) {
            onSortChange(columnId, newDirection);
        } else {
            setInternalSortBy(newDirection === null ? undefined : columnId);
            setInternalSortDirection(newDirection);
        }
    };

    // 選択処理
    const isItemSelected = (item: T) => effectiveSelectedItems.some(i => i === item);
    const handleRowSelect = (item: T, checked: boolean) => {
        let newSelectedItems: T[];
        if (selectionType === 'single') {
            newSelectedItems = checked ? [item] : [];
        } else {
            newSelectedItems = checked
                ? [...effectiveSelectedItems, item]
                : effectiveSelectedItems.filter(i => i !== item);
        }
        if (onSelectionChange) {
            onSelectionChange(newSelectedItems);
        } else {
            setInternalSelectedItems(newSelectedItems);
        }
    };
    const handleSelectAll = (checked: boolean) => {
        const newSelectedItems = checked ? [...data] : [];
        if (onSelectionChange) {
            onSelectionChange(newSelectedItems);
        } else {
            setInternalSelectedItems(newSelectedItems);
        }
    };

    // ページネーション処理
    const handlePageChange = (newPage: number) => {
        if (onPageChange) {
            onPageChange(newPage, effectivePageSize);
        } else {
            setInternalPage(newPage);
        }
    };
    const handlePageSizeChange = (newPageSize: number) => {
        if (onPageChange) {
            onPageChange(0, newPageSize);
        } else {
            setInternalPage(0);
            setInternalPageSize(newPageSize);
        }
    };

    // ページデータ計算
    const displayData = useMemo(() => {
        if (onPageChange) {
            return data;
        }
        const start = effectivePage * effectivePageSize;
        const end = start + effectivePageSize;
        return data.slice(start, end);
    }, [data, effectivePage, effectivePageSize, onPageChange]);

    // スタイル
    const tableContainerStyles = classNames('table-container', className);
    const tableStyles = classNames('table', { 'table--loading': loading });
    const headerCellStyles = (column: Column<T>) => classNames(
        'table__header-cell',
        `table__header-cell--align-${column.align || 'left'}`,
        {
            'table__header-cell--sortable': column.sortable,
            'table__header-cell--sorted-asc': effectiveSortBy === column.id && effectiveSortDirection === 'asc',
            'table__header-cell--sorted-desc': effectiveSortBy === column.id && effectiveSortDirection === 'desc'
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
                            disabled={action.isEnabled ? !action.isEnabled(effectiveSelectedItems) : false}
                            style={{ display: action.isVisible ? (action.isVisible(effectiveSelectedItems) ? 'inline-flex' : 'none') : 'inline-flex' }}
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
                                    onChange={e => handleSelectAll(e.target.checked)}
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
                                        effectiveSortBy === column.id
                                            ? effectiveSortDirection === 'asc'
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
                                                {effectiveSortBy === column.id ? (
                                                    effectiveSortDirection === 'asc' ? '▲' : effectiveSortDirection === 'desc' ? '▼' : ''
                                                ) : '⇅'}
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
                                {selectionType === 'multiple' && (
                                    <td className="table__body-cell table__body-cell--checkbox">
                                        <Checkbox
                                            checked={isItemSelected(item)}
                                            onChange={e => handleRowSelect(item, e.target.checked)}
                                            aria-label="行を選択"
                                            onClick={e => e.stopPropagation()}
                                        />
                                    </td>
                                )}
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
                                {selectionType !== 'none' && (
                                    <Checkbox
                                        checked={isItemSelected(item)}
                                        onChange={e => handleRowSelect(item, e.target.checked)}
                                        aria-label="行を選択"
                                        onClick={e => e.stopPropagation()}
                                    />
                                )}
                            </div>
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
            {/* ページネーション（詳細省略） */}
            {(totalCount || data.length) > 0 && (
                <div className="table-pagination">
                    {/* ページネーションコントロール実装 */}
                </div>
            )}
        </div>
    );
};

export default Table;
