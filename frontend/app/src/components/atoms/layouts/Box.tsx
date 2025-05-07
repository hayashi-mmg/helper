import React from 'react';
import { styled } from '@mui/material/styles';
import { Box as MuiBox } from '@mui/material';

export type BoxProps = {
    /**
     * ボックスの中身
     */
    children?: React.ReactNode;
    /**
     * 表示/非表示
     */
    display?: string;
    /**
     * パディング
     * 1つの値または、上下左右それぞれの値を指定（例: '8px' または '8px 16px'）
     */
    padding?: string | number;
    /**
     * マージン
     * 1つの値または、上下左右それぞれの値を指定（例: '8px' または '8px 16px'）
     */
    margin?: string | number;
    /**
     * 幅
     */
    width?: string | number;
    /**
     * 高さ
     */
    height?: string | number;
    /**
     * 背景色
     */
    backgroundColor?: string;
    /**
     * ボーダー
     */
    border?: string;
    /**
     * ボーダーラディウス
     */
    borderRadius?: string | number;
    /**
     * ボックスシャドウ
     */
    boxShadow?: string;
    /**
     * 追加のCSSクラス
     */
    className?: string;
    /**
     * onClick イベントハンドラ
     */
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
    /**
     * テスト用のdata-testid属性
     */
    'data-testid'?: string;
};

const StyledBox = styled(MuiBox)<BoxProps>(({
    theme,
    display,
    padding,
    margin,
    width,
    height,
    backgroundColor,
    border,
    borderRadius,
    boxShadow
}) => ({
    display: display || 'block',
    padding: padding !== undefined ? padding : 0,
    margin: margin !== undefined ? margin : 0,
    width: width !== undefined ? width : 'auto',
    height: height !== undefined ? height : 'auto',
    backgroundColor: backgroundColor || 'transparent',
    border: border || 'none',
    borderRadius: borderRadius !== undefined ? borderRadius : 0,
    boxShadow: boxShadow || 'none',
}));

/**
 * 基本的なボックスレイアウトコンポーネント
 * パディング、マージン、幅、高さ、背景色など様々なスタイリングオプションをサポート
 */
export const Box: React.FC<BoxProps> = ({ 
    children,
    display,
    padding,
    margin,
    width,
    height,
    backgroundColor,
    border,
    borderRadius,
    boxShadow,
    className,
    onClick,
    'data-testid': dataTestId = 'box',
    ...rest 
}) => {
    return (
        <StyledBox
            display={display}
            padding={padding}
            margin={margin}
            width={width}
            height={height}
            backgroundColor={backgroundColor}
            border={border}
            borderRadius={borderRadius}
            boxShadow={boxShadow}
            className={className}
            onClick={onClick}
            data-testid={dataTestId}
            {...rest}
        >
            {children}
        </StyledBox>
    );
};

export default Box;