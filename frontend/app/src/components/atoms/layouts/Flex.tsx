import React from 'react';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

export type FlexProps = {
    /**
     * フレックスボックスの中身
     */
    children: React.ReactNode;
    /**
     * フレックスアイテムの配置方向
     */
    direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    /**
     * 主軸に沿ったアイテムの配置
     */
    justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
    /**
     * 交差軸に沿ったアイテムの配置
     */
    alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
    /**
     * アイテム間のギャップ
     */
    gap?: string | number;
    /**
     * ラップ設定
     */
    wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
    /**
     * フレックスグロー
     */
    flexGrow?: number;
    /**
     * フレックスシュリンク
     */
    flexShrink?: number;
    /**
     * フレックスベース
     */
    flexBasis?: string | number;
    /**
     * 幅
     */
    width?: string | number;
    /**
     * 高さ
     */
    height?: string | number;
    /**
     * パディング
     */
    padding?: string | number;
    /**
     * マージン
     */
    margin?: string | number;
    /**
     * 追加のCSSクラス
     */
    className?: string;
    /**
     * テスト用のdata-testid属性
     */
    'data-testid'?: string;
};

const StyledFlex = styled(Box)<FlexProps>(({
    theme,
    direction,
    justifyContent,
    alignItems,
    gap,
    wrap,
    flexGrow,
    flexShrink,
    flexBasis,
    width,
    height,
    padding,
    margin
}) => ({
    display: 'flex',
    flexDirection: direction || 'row',
    justifyContent: justifyContent || 'flex-start',
    alignItems: alignItems || 'stretch',
    gap: gap !== undefined ? gap : theme.spacing(2),
    flexWrap: wrap || 'nowrap',
    flexGrow: flexGrow !== undefined ? flexGrow : 0,
    flexShrink: flexShrink !== undefined ? flexShrink : 1,
    flexBasis: flexBasis !== undefined ? flexBasis : 'auto',
    width: width !== undefined ? width : 'auto',
    height: height !== undefined ? height : 'auto',
    padding: padding !== undefined ? padding : 0,
    margin: margin !== undefined ? margin : 0,
}));

/**
 * フレックスボックスレイアウトコンポーネント
 * 方向、配置、ギャップなどを柔軟に設定可能
 */
export const Flex: React.FC<FlexProps> = ({ 
    children,
    direction = 'row',
    justifyContent = 'flex-start',
    alignItems = 'stretch',
    gap,
    wrap = 'nowrap',
    flexGrow,
    flexShrink,
    flexBasis,
    width,
    height,
    padding,
    margin,
    className,
    'data-testid': dataTestId = 'flex',
    ...rest 
}) => {
    return (
        <StyledFlex
            direction={direction}
            justifyContent={justifyContent}
            alignItems={alignItems}
            gap={gap}
            wrap={wrap}
            flexGrow={flexGrow}
            flexShrink={flexShrink}
            flexBasis={flexBasis}
            width={width}
            height={height}
            padding={padding}
            margin={margin}
            className={className}
            data-testid={dataTestId}
            {...rest}
        >
            {children}
        </StyledFlex>
    );
};

export default Flex;