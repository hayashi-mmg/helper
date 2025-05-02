import React from 'react';
import classNames from 'classnames';
import './GridLayout.css';

export interface GridLayoutProps {
  /**
   * グリッドアイテム
   */
  children: React.ReactNode;
  
  /**
   * グリッドカラム数
   * @default 12
   */
  columns?: number;
  
  /**
   * グリッドアイテム間のギャップ
   * @default 16
   */
  gap?: number | { x: number, y: number };
  
  /**
   * レスポンシブ設定
   * @default { sm: 1, md: 2, lg: 3, xl: 4 }
   */
  responsive?: {
    sm?: number; // 576px以上のカラム数
    md?: number; // 768px以上のカラム数
    lg?: number; // 992px以上のカラム数
    xl?: number; // 1200px以上のカラム数
  };
  
  /**
   * 自動行高さを使用するか
   * @default true
   */
  autoRows?: boolean;
  
  /**
   * 追加のクラス名
   */
  className?: string;
}

export interface GridItemProps {
  /**
   * グリッドアイテムの内容
   */
  children: React.ReactNode;
  
  /**
   * 横方向のグリッドセル数
   * @default 1
   */
  colSpan?: number | { sm?: number, md?: number, lg?: number, xl?: number };
  
  /**
   * 縦方向のグリッドセル数
   * @default 1
   */
  rowSpan?: number;
  
  /**
   * 追加のクラス名
   */
  className?: string;
}

export const GridLayout: React.FC<GridLayoutProps> = ({
  children,
  columns = 12,
  gap = 16,
  responsive = { sm: 1, md: 2, lg: 3, xl: 4 },
  autoRows = true,
  className
}) => {
  const containerClasses = classNames(
    'grid-layout',
    {
      'auto-rows': autoRows
    },
    className
  );
  
  const gapStyle = typeof gap === 'number'
    ? { gap: `${gap}px` }
    : { columnGap: `${gap.x}px`, rowGap: `${gap.y}px` };
  
  const style: React.CSSProperties = {
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    ...gapStyle
  };
  
  // レスポンシブスタイルをCSSカスタムプロパティとして設定
  const cssVars: { [key: string]: string | number } = {};
  Object.entries(responsive).forEach(([breakpoint, cols]) => {
    cssVars[`--grid-columns-${breakpoint}`] = cols;
  });
  
  const mergedStyles = {
    ...style,
    ...cssVars
  };
  
  return (
    <div className={containerClasses} style={mergedStyles}>
      {children}
    </div>
  );
};

export const GridItem: React.FC<GridItemProps> = ({
  children,
  colSpan = 1,
  rowSpan = 1,
  className
}) => {
  const itemClasses = classNames(
    'grid-item',
    className
  );
  
  const style: React.CSSProperties = {
    gridColumn: typeof colSpan === 'number' 
      ? `span ${colSpan}` 
      : undefined,
    gridRow: `span ${rowSpan}`
  };
  
  // レスポンシブcolSpanをCSSカスタムプロパティとして設定
  const cssVars: { [key: string]: string | number } = {};
  if (typeof colSpan !== 'number') {
    Object.entries(colSpan).forEach(([breakpoint, span]) => {
      cssVars[`--col-span-${breakpoint}`] = span;
    });
  }
  
  const mergedStyles = {
    ...style,
    ...cssVars
  };
  
  return (
    <div className={itemClasses} style={mergedStyles}>
      {children}
    </div>
  );
};

export default GridLayout;