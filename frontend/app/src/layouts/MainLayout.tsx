import { Box, Container, Flex, IconButton, Link as ChakraLink } from '@chakra-ui/react';
import { useColorMode } from '@chakra-ui/color-mode';
import { Link as RouterLink } from 'react-router-dom';
import { ReactNode } from 'react';

/**
 * メインレイアウトコンポーネントのプロパティ
 */
interface MainLayoutProps {
    children: ReactNode;
}

/**
 * アプリケーションのメインレイアウト
 * ヘッダー、フッター、メインコンテンツ領域を含む
 * 
 * @param props - コンポーネントのプロパティ
 * @returns {JSX.Element} レイアウトコンポーネント
 */
const MainLayout = ({ children }: MainLayoutProps): JSX.Element => {
    const { colorMode, toggleColorMode } = useColorMode();

    return (
        <Box minH="100vh" display="flex" flexDirection="column">
            {/* ヘッダー */}
            <Box as="header" bg={colorMode === 'light' ? 'blue.500' : 'blue.900'} color="white" py={4}>
                <Container maxW="container.xl">
                    <Flex justify="space-between" align="center">
                        <Flex gap={8} align="center">
                            <ChakraLink as={RouterLink} to="/" fontSize="xl" fontWeight="bold">
                                ヘルパーシステム
                            </ChakraLink>
                            
                            <Flex gap={4} align="center">
                                <ChakraLink as={RouterLink} to="/">ホーム</ChakraLink>
                                <ChakraLink as={RouterLink} to="/dashboard">ダッシュボード</ChakraLink>
                            </Flex>
                        </Flex>
                        
                        <Flex gap={4} align="center">
                            <ChakraLink as={RouterLink} to="/auth">ログイン</ChakraLink>
                            <IconButton
                                aria-label={`${colorMode === 'light' ? 'ダーク' : 'ライト'}モードに切り替え`}
                                icon={colorMode === 'light' ? <span>🌙</span> : <span>☀️</span>}
                                onClick={toggleColorMode}
                                variant="ghost"
                                color="white"
                                _hover={{ bg: 'blue.600' }}
                            />
                        </Flex>
                    </Flex>
                </Container>
            </Box>
            
            {/* メインコンテンツ */}
            <Box as="main" flex="1">
                {children}
            </Box>
            
            {/* フッター */}
            <Box as="footer" py={6} bg={colorMode === 'light' ? 'gray.100' : 'gray.900'}>
                <Container maxW="container.xl" textAlign="center">
                    <Box>&copy; {new Date().getFullYear()} ヘルパーシステム</Box>
                </Container>
            </Box>
        </Box>
    );
};

export default MainLayout;