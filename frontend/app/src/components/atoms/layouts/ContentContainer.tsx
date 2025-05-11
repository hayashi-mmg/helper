
import { Box, BoxProps } from '@chakra-ui/react';

export interface ContentContainerProps extends Omit<BoxProps, 'maxWidth'> {
    /**
     * コンテナ内のコンテンツ
     */
    children: React.ReactNode;
    
    /**
     * コンテナの最大幅
     * @default 'lg'
     */
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
    
    /**
     * 水平方向の余白を追加
     * @default true
     */
    withHorizontalPadding?: boolean;
    
    /**
     * 垂直方向の余白を追加
     * @default true
     */
    withVerticalPadding?: boolean;
    
    /**
     * 中央配置
     * @default true
     */
    centered?: boolean;
}

/**
 * コンテンツエリアのラッパーコンポーネント
 * 適切なパディングとマージンを提供します
 */
export const ContentContainer: React.FC<ContentContainerProps> = ({
    children,
    maxWidth = 'lg',
    withHorizontalPadding = true,
    withVerticalPadding = true,
    centered = true,
    ...rest
}) => {
    // 最大幅の定義
    const maxWidthMap = {
        xs: '480px',
        sm: '600px',
        md: '960px',
        lg: '1280px',
        xl: '1920px',
        full: '100%'
    };
    
    return (
        <Box
            width="100%"
            maxWidth={maxWidthMap[maxWidth]}
            px={withHorizontalPadding ? { base: 4, md: 6, lg: 8 } : 0}
            py={withVerticalPadding ? 6 : 0}
            mx={centered ? 'auto' : undefined}
            data-testid="content-container"
            {...rest}
        >
            {children}
        </Box>
    );
};

export default ContentContainer;