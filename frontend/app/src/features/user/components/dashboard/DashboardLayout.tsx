import { Box, Flex, Heading } from "@chakra-ui/react";
import { ReactNode } from "react";

interface DashboardLayoutProps {
  header?: ReactNode;
  sidebar?: ReactNode;
  children: ReactNode;
}

/**
 * ダッシュボードレイアウトコンポーネント
 * ヘッダー、サイドバー、メインコンテンツエリアを含むレイアウト
 * 
 * @param {DashboardLayoutProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} ダッシュボードレイアウト
 */
export const DashboardLayout = ({ header, sidebar, children }: DashboardLayoutProps): JSX.Element => {
  return (
    <Box minH="100vh" bg="gray.50">
      {/* ヘッダー部分 */}
      {header && (
        <Box as="header" position="fixed" width="full" zIndex="docked">
          {header}
        </Box>
      )}

      {/* コンテンツエリア */}
      <Flex pt={header ? "64px" : 0}>
        {/* サイドバー */}
        {sidebar && (
          <Box
            as="aside"
            position="fixed"
            left={0}
            width="250px"
            height="calc(100vh - 64px)"
            borderRight="1px"
            borderColor="gray.200"
            bg="white"
            overflowY="auto"
            transition="all 0.3s"
          >
            {sidebar}
          </Box>
        )}

        {/* メインコンテンツ */}
        <Box
          as="main"
          flex="1"
          ml={sidebar ? "250px" : 0}
          p={6}
          transition="all 0.3s"
        >
          {children}
        </Box>
      </Flex>
    </Box>
  );
};

interface DashboardContentProps {
  title?: string;
  children: ReactNode;
}

/**
 * ダッシュボードコンテンツコンポーネント
 * タイトルとコンテンツを表示する
 * 
 * @param {DashboardContentProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} ダッシュボードコンテンツ
 */
export const DashboardContent = ({ title, children }: DashboardContentProps): JSX.Element => {
  return (
    <Box>
      {title && (
        <Heading as="h1" size="lg" mb={6}>
          {title}
        </Heading>
      )}
      {children}
    </Box>
  );
};
