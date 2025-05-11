
import { Box, SimpleGrid, SimpleGridProps } from '@chakra-ui/react';

export interface GridLayoutProps extends Omit<SimpleGridProps, 'columns'> {
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
}

/**
 * グリッドベースのレイアウトシステム
 * レスポンシブ対応のフレキシブルな配置を提供します
 */
export const GridLayout: React.FC<GridLayoutProps> = ({
    children,
    columns = 12,
    gap = 4,
    responsive = { sm: 1, md: 2, lg: 3, xl: 4 },
    autoRows = true,
    ...rest
}) => {
    // レスポンシブカラム設定
    const responsiveColumns = {
        base: 1,
        sm: responsive.sm || 1,
        md: responsive.md || 2,
        lg: responsive.lg || 3,
        xl: responsive.xl || 4
    };
    
    // 単一の数値かx/yを持つオブジェクトかによってギャップの設定を変更
    const gapValue = typeof gap === 'number' 
        ? gap
        : [gap.y, gap.x];
    
    return (
        <SimpleGrid
            columns={responsiveColumns}
            spacing={gapValue}
            autoRows={autoRows ? 'auto' : undefined}
            data-testid="grid-layout"
            {...rest}
        >
            {children}
        </SimpleGrid>
    );
};

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
     * 追加のスタイル
     */
    style?: React.CSSProperties;
    
    /**
     * 追加のクラス名
     */
    className?: string;
}

/**
 * GridLayout内で使用する個別のグリッドアイテム
 */
export const GridItem: React.FC<GridItemProps> = ({
    children,
    colSpan = 1,
    rowSpan = 1,
    style,
    className
}) => {
    // 横方向のスパン
    const colSpanValue = typeof colSpan === 'number'
        ? { base: colSpan }
        : { 
            base: 1, 
            sm: colSpan.sm,
            md: colSpan.md,
            lg: colSpan.lg,
            xl: colSpan.xl
        };
    
    return (
        <Box
            gridColumn={Object.entries(colSpanValue)
                .filter(([_, value]) => value !== undefined)
                .map(([key, value]) => `${key === 'base' ? '' : `${key}:`}span ${value}`)
                .join(';')
            }
            gridRow={`span ${rowSpan}`}
            className={`grid-item ${className || ''}`}
            style={style}
            data-testid="grid-item"
        >
            {children}
        </Box>
    );
};

export default {
    GridLayout,
    GridItem
};