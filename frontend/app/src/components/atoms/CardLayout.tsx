
import { Box, Flex, Heading, HeadingProps, Divider, useColorModeValue } from '@chakra-ui/react';
import Card, { CardProps } from './Card';

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * カードのタイトル
     */
    title?: React.ReactNode;
    
    /**
     * ヘッダーの右側に表示するアクション要素
     */
    action?: React.ReactNode;
    
    /**
     * Headingコンポーネントのプロパティ
     */
    titleProps?: HeadingProps;
    
    /**
     * ヘッダーの追加のスタイル
     */
    [key: string]: any;
}

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * ボディの追加のスタイル
     */
    [key: string]: any;
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * フッターの追加のスタイル
     */
    [key: string]: any;
}

export interface CardLayoutProps extends CardProps {
    /**
     * カードのタイトル（ヘッダーに表示）
     */
    title?: React.ReactNode;
    
    /**
     * カードのヘッダーに表示するアクション要素
     */
    headerAction?: React.ReactNode;
    
    /**
     * カスタムヘッダーコンポーネント。title と headerAction を上書きする
     */
    header?: React.ReactNode;
    
    /**
     * カスタムフッターコンポーネント
     */
    footer?: React.ReactNode;
    
    /**
     * ヘッダーのスタイルプロパティ
     */
    headerProps?: Omit<CardHeaderProps, 'title' | 'action'>;
    
    /**
     * ボディのスタイルプロパティ
     */
    bodyProps?: CardBodyProps;
    
    /**
     * フッターのスタイルプロパティ
     */
    footerProps?: CardFooterProps;
}

/**
 * カードヘッダーコンポーネント
 * @param props CardHeaderProps
 * @returns JSX要素
 */
export const CardHeader: React.FC<CardHeaderProps> = ({
    title,
    action,
    titleProps = {},
    children,
    ...rest
}) => {
    return (
        <Box px={4} py={3} {...rest}>
            {title || action ? (
                <Flex justifyContent="space-between" alignItems="center">
                    {title && (
                        <Heading size="md" {...titleProps}>
                            {title}
                        </Heading>
                    )}
                    {action && <Box>{action}</Box>}
                </Flex>
            ) : (
                children
            )}
        </Box>
    );
};

/**
 * カードボディコンポーネント
 * @param props CardBodyProps
 * @returns JSX要素
 */
export const CardBody: React.FC<CardBodyProps> = ({ children, ...rest }) => {
    return (
        <Box p={4} {...rest}>
            {children}
        </Box>
    );
};

/**
 * カードフッターコンポーネント
 * @param props CardFooterProps
 * @returns JSX要素
 */
export const CardFooter: React.FC<CardFooterProps> = ({ children, ...rest }) => {
    const bgColor = useColorModeValue('gray.50', 'gray.700');
    
    return (
        <>
            <Divider />
            <Box px={4} py={3} bg={bgColor} {...rest}>
                <Flex justifyContent="flex-end">{children}</Flex>
            </Box>
        </>
    );
};

/**
 * カードレイアウトコンポーネント
 * 
 * ヘッダー、ボディ、フッターを持つ構造化されたカードUIを提供します。
 * 
 * @example
 * ```jsx
 * <CardLayout 
 *   title="カードタイトル" 
 *   headerAction={<Button size="sm">編集</Button>}
 *   footer={<Button colorScheme="blue">保存</Button>}
 * >
 *   <Text>カードのコンテンツ</Text>
 * </CardLayout>
 * ```
 */
const CardLayout: React.FC<CardLayoutProps> = ({
    title,
    headerAction,
    header,
    footer,
    headerProps = {},
    bodyProps = {},
    footerProps = {},
    children,
    ...rest
}) => {
    return (
        <Card {...rest}>
            {(header || title || headerAction) && (
                <>
                    {header || (
                        <CardHeader title={title} action={headerAction} {...headerProps} />
                    )}
                    <Divider />
                </>
            )}
            
            <CardBody {...bodyProps}>{children}</CardBody>
            
            {footer && <CardFooter {...footerProps}>{footer}</CardFooter>}
        </Card>
    );
};

export default CardLayout;