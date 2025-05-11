
import { Box, Flex, Image, useColorModeValue } from '@chakra-ui/react';

export interface AuthLayoutProps {
    /**
     * レイアウトタイトル
     */
    title?: string;
    
    /**
     * 認証フォームコンテンツ
     */
    children: React.ReactNode;
    
    /**
     * ロゴ表示
     * @default true
     */
    showLogo?: boolean;
    
    /**
     * 背景画像URL
     */
    backgroundImage?: string;
    
    /**
     * フッターコンテンツ
     */
    footerContent?: React.ReactNode;
    
    /**
     * 追加のクラス名
     */
    className?: string;
}

/**
 * 認証関連ページ（ログイン、登録など）用のシンプルなレイアウト
 * 中央寄せのコンテンツエリアのみを含む
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({
    title,
    children,
    showLogo = true,
    backgroundImage,
    footerContent,
    className
}) => {
    const bgColor = useColorModeValue('gray.50', 'gray.900');
    const cardBgColor = useColorModeValue('white', 'gray.800');
    
    return (
        <Flex
            direction="column"
            minH="100vh"
            align="center"
            justify="center"
            bg={bgColor}
            py={12}
            px={4}
            style={
                backgroundImage
                    ? {
                        backgroundImage: `url(${backgroundImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }
                    : {}
            }
            className={className}
            data-testid="auth-layout"
        >
            <Box
                w="full"
                maxW="480px"
                bg={cardBgColor}
                boxShadow="lg"
                rounded="lg"
                p={8}
                textAlign="center"
                position="relative"
            >
                {showLogo && (
                    <Box mb={6} display="flex" justifyContent="center">
                        <Image 
                            src="/logo.png" 
                            alt="ヘルパーシステム" 
                            fallbackSrc="https://via.placeholder.com/150x50?text=ヘルパーシステム"
                            h="50px"
                            objectFit="contain"
                        />
                    </Box>
                )}
                
                {title && (
                    <Box 
                        as="h1" 
                        fontSize="2xl" 
                        fontWeight="bold" 
                        mb={6}
                    >
                        {title}
                    </Box>
                )}
                
                <Box mb={6}>
                    {children}
                </Box>
            </Box>
            
            {footerContent && (
                <Box mt={6} textAlign="center">
                    {footerContent}
                </Box>
            )}
        </Flex>
    );
};

export default AuthLayout;