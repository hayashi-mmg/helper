import { Box, Flex, Skeleton, Text } from "@chakra-ui/react";
import { 
  DashboardContent, 
  DashboardLayout, 
  DashboardSummary, 
  RecentRequests 
} from "../components";
import { useCurrentUser, useUserSummary } from "../hooks/useUserHooks";
import { useRecentRequests } from "../hooks/useRequestHooks";
import Header from "../../common/components/Header";
import Sidebar from "../../common/components/Sidebar";

/**
 * ユーザーダッシュボードページ
 * ユーザーのリクエスト状況や最近の依頼を表示する
 * 
 * @returns {JSX.Element} ダッシュボードページ
 */
export const DashboardPage = (): JSX.Element => {
  // ユーザー情報を取得
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  
  // ユーザーサマリーを取得
  const { data: summary, isLoading: isSummaryLoading } = useUserSummary(currentUser?.id);
  
  // 最近のリクエストを取得
  const { data: recentRequests, isLoading: isRequestsLoading } = useRecentRequests({
    limit: 5,
  });

  return (
    <DashboardLayout
      header={<Header />}
      sidebar={<Sidebar />}
    >
      <DashboardContent title="ダッシュボード">
        {isUserLoading ? (
          <Skeleton height="50px" mb={4} />
        ) : currentUser ? (
          <Text fontSize="lg" mb={6}>
            ようこそ、{currentUser.lastName} {currentUser.firstName}さん
          </Text>
        ) : null}
        
        {/* サマリー情報 */}
        <Box mb={8}>
          <DashboardSummary 
            summary={summary || {
              totalRequests: 0,
              activeRequests: 0,
              completedRequests: 0,
              favoriteHelpers: 0
            }} 
            isLoading={isSummaryLoading} 
          />
        </Box>

        {/* 最近の依頼一覧 */}
        <RecentRequests 
          requests={recentRequests?.items || []} 
          isLoading={isRequestsLoading}
          title="最近の依頼"
          limit={5}
          showViewAll={true}
        />
      </DashboardContent>
    </DashboardLayout>
  );
};
