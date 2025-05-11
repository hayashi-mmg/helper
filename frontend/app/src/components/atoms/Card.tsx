
import { Box, BoxProps, useColorModeValue } from '@chakra-ui/react';

export type ShadowSize = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface StyleProps {
    /**
     * カードの角丸のサイズ
     */
    borderRadius?: string;
    
    /**
     * カードの枠線の色
     */
    borderColor?: string;
    
    /**
     * カードの背景色（hover時）
     */
    hoverBgColor?: string;
    
    /**
     * その他のカスタムスタイルプロパティ
     */
    [key: string]: any;
}

export interface CardProps extends BoxProps {
    /**
     * カードの影のサイズ
     * @default 'md'
     */
    shadowSize?: ShadowSize;
    
    /**
     * カードの背景色
     */
    bgColor?: string;
    
    /**
     * カードに枠線を表示するかどうか
     * @default false
     */
    withBorder?: boolean;
    
    /**
     * カードにホバーエフェクトを適用するかどうか
     * @default false
     */
    withHoverEffect?: boolean;
    
    /**
     * カードのスタイルをカスタマイズするためのプロパティ
     */
    styleProps?: StyleProps;
    
    /**
     * カードの内容
     */
    children: React.ReactNode;
}

/**
 * カードコンポーネント
 * 
 * コンテンツを整理して表示するためのコンテナコンポーネント。
 * 様々な情報表示、フォーム、リストなどを囲むために使用できる汎用的なUIコンポーネントです。
 * 
 * @example
 * ```jsx
 * <Card shadowSize="lg" withBorder withHoverEffect>
 *   <Box p={4}>
 *     <Text>カードのコンテンツ</Text>
 *   </Box>
 * </Card>
 * ```
 */
const Card: React.FC<CardProps> = ({
    shadowSize = 'md',
    bgColor,
    withBorder = false,
    withHoverEffect = false,
    styleProps = {},
    children,
    ...rest
}) => {
    // デフォルトの色設定
    const defaultBgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
    
    // 影の設定
    const shadowMap: Record<ShadowSize, string> = {
        none: 'none',
        sm: 'sm',
        md: 'md',
        lg: 'lg',
        xl: 'xl',
    };
    
    const shadow = shadowMap[shadowSize] || 'md';
    
    // スタイルのマージ
    const finalStyleProps = {
        borderRadius: 'md',
        borderColor: styleProps.borderColor || borderColor,
        hoverBgColor: styleProps.hoverBgColor || hoverBgColor,
        ...styleProps
    };
    
    return (
        <Box
            borderRadius={finalStyleProps.borderRadius}
            bg={bgColor || defaultBgColor}
            boxShadow={shadow}
            border={withBorder ? '1px solid' : 'none'}
            borderColor={finalStyleProps.borderColor}
            overflow="hidden"
            transition="all 0.2s ease"
            _hover={
                withHoverEffect
                    ? {
                          boxShadow: shadowSize === 'none' ? 'sm' : shadowMap[shadowSize === 'xl' ? 'xl' : 'lg'],
                          bg: finalStyleProps.hoverBgColor,
                          transform: 'translateY(-2px)',
                      }
                    : undefined
            }
            {...rest}
        >
            {children}
        </Box>
    );
};

export default Card;