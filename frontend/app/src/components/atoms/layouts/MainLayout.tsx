import React, { useState } from 'react';
import { Box, Flex, useBreakpointValue, IconButton } from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';

export interface MainLayoutProps {
    /**
     * ヘッダーの表示・非表示
     * @default true
     */
    showHeader?: boolean;
    
    /**
     * サイドバーの表示・非表示
     * @default true
     */
    showSidebar?: boolean;
    
    /**
     * フッターの表示・非表示
     * @default true
     */
    showFooter?: boolean;
    
    /**
     * サイドバーを開いた状態で初期表示するか
     * @default true
     */
    sidebarOpen?: boolean;
    
    /**
     * ヘッダーに表示するタイトル
     */
    title?: string;
    
    /**
     * メインコンテンツ
     */
    children: React.ReactNode;
    
    /**
     * カスタムヘッダーコンテンツ
     */
    headerContent?: React.ReactNode;
    
    /**
     * カスタムサイドバーコンテンツ
     */
    sidebarContent?: React.ReactNode;
    
    /**
     * カスタムフッターコンテンツ
     */
    footerContent?: React.ReactNode;
    
    /**
     * 追加のクラス名
     */
    className?: string;
}

/**
 * アプリケーションの主要レイアウトを提供するコンポーネント
 * ヘッダー、サイドバー、メインコンテンツエリア、フッターを含みます
 */
export const MainLayout: React.FC<MainLayoutProps> = ({
    showHeader = true,
    showSidebar = true,
    showFooter = true,
    sidebarOpen = true,
    title,
    children,
    headerContent,
    sidebarContent,
    footerContent,
    className
}) => {
    const [isSidebarOpen, setSidebarOpen] = useState(sidebarOpen);
    const isMobile = useBreakpointValue({ base: true, md: false });
    
    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };
    
    const HEADER_HEIGHT = "64px";
    const FOOTER_HEIGHT = "48px";
    const SIDEBAR_WIDTH = isSidebarOpen ? "240px" : "64px";
    const MOBILE_SIDEBAR_WIDTH = "240px";
    
    return (
        <Flex 
            direction="column" 
            h="100vh" 
            className={className}
            data-testid="main-layout"
        >
            {showHeader && (
                <Flex
                    as="header"
                    role="banner"
                    position="fixed"
                    top="0"
                    left="0"
                    right="0"
                    h={HEADER_HEIGHT}
                    bg="white"
                    borderBottomWidth="1px"
                    borderBottomColor="gray.200"
                    px={4}
                    alignItems="center"
                    zIndex="sticky"
                    boxShadow="sm"
                >
                    {showSidebar && (
                        <IconButton
                            icon={<HamburgerIcon />}
                            variant="ghost"
                            onClick={toggleSidebar}
                            aria-label="Toggle Sidebar"
                            mr={3}
                            display={{ base: "block", md: isMobile ? "block" : "none" }}
                            aria-expanded={isSidebarOpen ? "true" : "false"}
                        />
                    )}

                    {title && (
                        <Box as="h1" fontSize="xl" fontWeight="bold" flex="1">
                            {title}
                        </Box>
                    )}
                    
                    {headerContent}
                </Flex>
            )}
            
            <Flex flex="1" mt={showHeader ? HEADER_HEIGHT : 0}>
                {showSidebar && (
                    <Box
                        as="aside"
                        role="complementary"
                        position="fixed"
                        left={0}
                        top={showHeader ? HEADER_HEIGHT : 0}
                        h={`calc(100vh - ${showHeader ? HEADER_HEIGHT : "0px"} - ${showFooter ? FOOTER_HEIGHT : "0px"})`}
                        w={isMobile ? (isSidebarOpen ? MOBILE_SIDEBAR_WIDTH : "0px") : SIDEBAR_WIDTH}
                        bg="white"
                        borderRightWidth="1px"
                        borderRightColor="gray.200"
                        transition="width 0.3s ease-in-out"
                        overflowX="hidden"
                        overflowY="auto"
                        boxShadow="sm"
                        zIndex="banner"
                        className={isSidebarOpen ? "open" : ""}
                        aria-hidden={!isSidebarOpen}
                        px={isSidebarOpen ? 3 : 0}
                        py={4}
                        transform={{
                            base: isSidebarOpen ? "translateX(0)" : "translateX(-100%)",
                            md: "translateX(0)"
                        }}
                        transitionProperty="transform, width"
                        transitionDuration="0.3s"
                    >
                        {sidebarContent}
                    </Box>
                )}
                
                <Box
                    as="main"
                    role="main"
                    flex="1"
                    ml={{ 
                        base: "0", 
                        md: showSidebar ? (isSidebarOpen ? SIDEBAR_WIDTH : "64px") : "0" 
                    }}
                    p={4}
                    bg="gray.50"
                    transition="margin-left 0.3s ease-in-out"
                    overflowY="auto"
                    h={`calc(100vh - ${showHeader ? HEADER_HEIGHT : "0px"} - ${showFooter ? FOOTER_HEIGHT : "0px"})`}
                >
                    {children}
                </Box>
            </Flex>
            
            {showFooter && (
                <Box
                    as="footer"
                    role="contentinfo"
                    position="fixed"
                    bottom="0"
                    left="0"
                    right="0"
                    h={FOOTER_HEIGHT}
                    bg="white"
                    borderTopWidth="1px"
                    borderTopColor="gray.200"
                    px={4}
                    display="flex"
                    alignItems="center"
                    zIndex="docked"
                >
                    {footerContent || <Box mx="auto" fontSize="sm" color="gray.500">© 2025 ヘルパーシステム</Box>}
                </Box>
            )}
        </Flex>
    );
};

export default MainLayout;