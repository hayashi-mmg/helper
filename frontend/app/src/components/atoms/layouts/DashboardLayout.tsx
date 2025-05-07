import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import MainLayout, { MainLayoutProps } from './MainLayout';

export interface DashboardLayoutProps extends Omit<MainLayoutProps, 'title'> {
    /**
     * ダッシュボードタイトル
     */
    title: string;
    
    /**
     * アクションボタン群
     */
    actions?: React.ReactNode;
    
    /**
     * ダッシュボードフィルター
     */
    filters?: React.ReactNode;
}

/**
 * ダッシュボード画面用の特殊レイアウト
 * サイドバー付きのグリッドベースレイアウトを提供します
 */
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
    title,
    sidebarOpen = true,
    children,
    actions,
    filters,
    sidebarContent,
    className,
    ...rest
}) => {
    const ACTION_BAR_HEIGHT = "56px";
    const FILTER_BAR_HEIGHT = "48px";
    
    return (
        <MainLayout
            title={title}
            sidebarOpen={sidebarOpen}
            sidebarContent={sidebarContent}
            className={className}
            {...rest}
        >
            <Flex 
                direction="column"
                h="100%"
                data-testid="dashboard-layout"
            >
                {actions && (
                    <Flex
                        h={ACTION_BAR_HEIGHT}
                        alignItems="center"
                        justifyContent="flex-end"
                        mb={filters ? 2 : 4}
                        px={4}
                        bg="white"
                        borderRadius="md"
                        boxShadow="sm"
                        className="dashboard-layout__actions"
                    >
                        {actions}
                    </Flex>
                )}
                
                {filters && (
                    <Box
                        h={FILTER_BAR_HEIGHT}
                        mb={4}
                        px={4}
                        py={2}
                        bg="white"
                        borderRadius="md"
                        boxShadow="sm"
                        className="dashboard-layout__filters"
                    >
                        {filters}
                    </Box>
                )}
                
                <Box 
                    flex="1"
                    bg="white"
                    borderRadius="md"
                    boxShadow="sm"
                    overflowY="auto"
                    className="dashboard-layout__content"
                    p={4}
                >
                    {children}
                </Box>
            </Flex>
        </MainLayout>
    );
};

export default DashboardLayout;