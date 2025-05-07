import React from 'react';
import { Box } from '@chakra-ui/react';

export interface CardGridProps {
    /**
     * グリッドアイテム（通常はCardコンポーネント）
     */
    children: React.ReactNode;
    
    /**
     * カード間のギャップ
     * @default 4
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
     * カードの最小幅
     * @default 250px
     */
    minCardWidth?: string | number;
    
    /**
     * 追加のクラス名
     */
    className?: string;
}

/**
 * カードコンポーネント用のグリッドレイアウト
 * 均等配置と可変サイズに対応
 */
export const CardGrid: React.FC<CardGridProps> = ({
    children,
    gap = 4,
    columns = { sm: 1, md: 2, lg: 3, xl: 4 },
    equalWidth = true,
    equalHeight = false,
    minCardWidth = '250px',
    className
}) => {
    // ギャップ設定
    const gapX = typeof gap === 'number' ? gap : gap.x;
    const gapY = typeof gap === 'number' ? gap : gap.y;
    
    const gapStyle = {
        gap: typeof gap === 'number' 
            ? `var(--chakra-space-${gap})` 
            : `var(--chakra-space-${gap.y}) var(--chakra-space-${gap.x})`
    };
    
    // グリッドテンプレート設定
    const gridTemplateColumnsStyle = {
        gridTemplateColumns: equalWidth
            ? `repeat(auto-fit, minmax(${typeof minCardWidth === 'number' ? `${minCardWidth}px` : minCardWidth}, 1fr))`
            : `repeat(auto-fit, minmax(${typeof minCardWidth === 'number' ? `${minCardWidth}px` : minCardWidth}, auto))`
    };
    
    // レスポンシブ設定
    const responsiveStyle = {};
    Object.entries(columns).forEach(([key, value]) => {
        if (value !== undefined) {
            // メディアクエリは実際のCSSでは適用されないが、カスタムプロパティとして保持
            responsiveStyle[`--card-columns-${key}`] = value;
        }
    });
    
    return (
        <Box
            display="grid"
            width="100%"
            className={`card-grid ${className || ''} ${equalHeight ? 'equal-height' : ''} ${equalWidth ? 'equal-width' : ''}`}
            style={{
                ...gapStyle,
                ...gridTemplateColumnsStyle,
                ...responsiveStyle
            }}
            data-testid="card-grid"
        >
            {React.Children.map(children, (child, index) => (
                <Box
                    key={index}
                    className="card-grid__item"
                    height={equalHeight ? '100%' : 'auto'}
                    data-testid={`card-item-${index}`}
                >
                    {child}
                </Box>
            ))}
        </Box>
    );
};

export default CardGrid;