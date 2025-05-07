import React from 'react';
import { styled } from '@mui/material/styles';
import { Grid as MuiGrid } from '@mui/material';

export type GridProps = {
    /**
     * グリッドの中身
     */
    children: React.ReactNode;
    /**
     * グリッドのコンテナかどうか
     */
    container?: boolean;
    /**
     * グリッドのアイテムかどうか
     */
    item?: boolean;
    /**
     * グリッド間の間隔
     */
    spacing?: number;
    /**
     * アイテムの配置方法
     */
    alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
    /**
     * アイテムの水平方向の配置
     */
    justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
    /**
     * グリッドシステムの分割数（デフォルトは12）に対する列数
     * xs, sm, md, lg, xlはブレークポイントに応じた値を指定
     */
    xs?: number | 'auto' | boolean;
    sm?: number | 'auto' | boolean;
    md?: number | 'auto' | boolean;
    lg?: number | 'auto' | boolean;
    xl?: number | 'auto' | boolean;
    /**
     * 方向
     */
    direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
    /**
     * ラップ設定
     */
    wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
    /**
     * 追加のCSSクラス
     */
    className?: string;
    /**
     * テスト用のdata-testid属性
     */
    'data-testid'?: string;
};

/**
 * グリッドレイアウトコンポーネント
 * レスポンシブなグリッドレイアウトを実現するためのコンポーネント
 * Material-UIのGridコンポーネントをラップして使いやすくしている
 */
export const Grid: React.FC<GridProps> = ({ 
    children,
    container = false,
    item = false,
    spacing = 2,
    alignItems,
    justifyContent,
    xs,
    sm,
    md,
    lg,
    xl,
    direction = 'row',
    wrap = 'wrap',
    className,
    'data-testid': dataTestId = 'grid',
    ...rest 
}) => {
    return (
        <MuiGrid
            container={container}
            item={item}
            spacing={spacing}
            alignItems={alignItems}
            justifyContent={justifyContent}
            xs={xs}
            sm={sm}
            md={md}
            lg={lg}
            xl={xl}
            direction={direction}
            wrap={wrap}
            className={className}
            data-testid={dataTestId}
            {...rest}
        >
            {children}
        </MuiGrid>
    );
};

export default Grid;