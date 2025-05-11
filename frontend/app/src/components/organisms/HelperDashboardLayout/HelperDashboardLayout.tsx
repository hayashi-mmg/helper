/**
 * ヘルパー用ダッシュボードレイアウトコンポーネント
 * ヘルパーがログインした際に表示されるメインの画面レイアウト
 */
import { FC, ReactNode } from 'react';
import { Box, Flex, Grid, GridItem, useColorModeValue } from '@chakra-ui/react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export interface HelperDashboardLayoutProps {
  /**
   * メインコンテンツ
   */
  children: ReactNode;
  /**
   * ページタイトル
   */
  title?: string;
}

/**
 * ヘルパー用ダッシュボードのレイアウトコンポーネント
 * サイドバー、ヘッダー、メインコンテンツエリアを含む
 */
export const HelperDashboardLayout: FC<HelperDashboardLayoutProps> = ({ children, title = 'ダッシュボード' }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Grid
      templateAreas={{
        base: `"header" "main"`,
        md: `"sidebar header" "sidebar main"`,
      }}
      templateColumns={{
        base: '1fr',
        md: '250px 1fr',
      }}
      templateRows={{
        base: 'auto 1fr',
        md: 'auto 1fr',
      }}
      minH="100vh"
    >
      <GridItem area="sidebar" display={{ base: 'none', md: 'block' }}>
        <Sidebar />
      </GridItem>
      
      <GridItem 
        area="header" 
        bg={bgColor} 
        borderBottom="1px" 
        borderColor={borderColor}
      >
        <Header title={title} />
      </GridItem>
      
      <GridItem 
        area="main" 
        bg={useColorModeValue('gray.50', 'gray.900')} 
        p={4}
        overflowY="auto"
      >
        <Box 
          bg={bgColor}
          borderRadius="lg"
          boxShadow="sm"
          p={4}
          minH="calc(100vh - 8rem)"
        >
          {children}
        </Box>
      </GridItem>
    </Grid>
  );
};

export default HelperDashboardLayout;
