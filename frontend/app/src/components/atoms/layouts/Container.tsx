import React from 'react';
import { styled } from '@mui/material/styles';
import { Box as MuiBox } from '@mui/material';

export type ContainerProps = {
    /**
     * コンテナの中身
     */
    children: React.ReactNode;
    /**
     * 最大幅
     */
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | string;
    /**
     * パディング
     */
    padding?: string | number;
    /**
     * 追加のCSSクラス
     */
    className?: string;
    /**
     * テスト用のdata-testid属性
     */
    'data-testid'?: string;
};

const StyledContainer = styled(MuiBox, {
    shouldForwardProp: (prop) => 
        !['maxWidth', 'padding'].includes(prop as string),
})<ContainerProps>(({ theme, maxWidth, padding }) => ({
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    boxSizing: 'border-box',
    padding: padding !== undefined ? padding : theme.spacing(2),
    maxWidth: (() => {
        if (!maxWidth) return theme.breakpoints.values.lg + 'px';
        if (typeof maxWidth === 'string' && 
            ['xs', 'sm', 'md', 'lg', 'xl'].includes(maxWidth)) {
            return theme.breakpoints.values[maxWidth as keyof typeof theme.breakpoints.values] + 'px';
        }
        return maxWidth;
    })(),
}));

/**
 * コンテンツを適切に配置するためのコンテナコンポーネント
 * レスポンシブデザインに対応し、幅・パディングを調整可能
 */
export const Container: React.FC<ContainerProps> = ({ 
    children,
    maxWidth = 'lg',
    padding,
    className,
    'data-testid': dataTestId = 'container',
    ...rest 
}) => {
    return (
        <StyledContainer
            maxWidth={maxWidth}
            padding={padding}
            className={className}
            data-testid={dataTestId}
            {...rest}
        >
            {children}
        </StyledContainer>
    );
};

export default Container;