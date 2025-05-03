import * as React from 'react';
import classNames from 'classnames';
import './CardGrid.css';

export interface CardGridProps {
  /**
   * グリッドアイテム（通常はCardコンポーネント）
   */
  children: React.ReactNode;
  
  /**
   * カード間のギャップ
   * @default 16
   */
  gap?: number | { x: number, y: number };
  
  /**
   * 各ブレークポイントでの行あたりのカード数
   * @default { sm: 1, md: 2, lg: 3, xl: 4 }
   */
  columns?: {
    sm?: number; // 576px以上のカラム数
    md?: number; // 768px以上のカラム数
    lg?: number; // 992px以上のカラム数
    xl?: number; // 1200px以上のカラム数
  };
  
  /**
   * カード幅を均等にするか
   * @default true
   */
  equalWidth?: boolean;
  
  /**
   * カード高さを均等にするか
   * @default false
   */
  equalHeight?: boolean;
  
  /**
   * 追加のクラス名
   */
  className?: string;
}

export const CardGrid: React.FC<CardGridProps> = ({
  children = null,
  gap = 16,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  equalWidth = true,
  equalHeight = false,
  className
}) => {
  const containerClasses = classNames(
    'card-grid',
    {
      'equal-width': equalWidth,
      'equal-height': equalHeight
    },
    className
  );
  
  const gapValue = typeof gap === 'number'
    ? `${gap}px`
    : `${gap.y}px ${gap.x}px`;
  
  const style: React.CSSProperties = {
    '--card-gap': gapValue
  } as React.CSSProperties;
  
  // レスポンシブカラム設定をCSSカスタムプロパティとして設定
  const cssVars: { [key: string]: string | number } = {};
  Object.entries(columns).forEach(([breakpoint, count]) => {
    cssVars[`--card-columns-${breakpoint}`] = count;
  });
  
  const mergedStyles = {
    ...style,
    ...cssVars
  };
  
  return (
    <div className={containerClasses} style={mergedStyles}>
      {React.Children.map(children, child => (
        <div className="card-grid__item">
          {child}
        </div>
      ))}
    </div>
  );
};

export default CardGrid;