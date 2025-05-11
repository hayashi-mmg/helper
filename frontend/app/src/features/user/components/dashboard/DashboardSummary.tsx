import { SimpleGrid } from "@chakra-ui/react";
import { FiActivity, FiCheck, FiList, FiStar } from "react-icons/fi";
import { StatCard } from "./StatCard";
import { UserSummary } from "../../types";

interface DashboardSummaryProps {
  summary: UserSummary;
  isLoading?: boolean;
}

/**
 * ダッシュボードのサマリーカードグリッド
 * ユーザーのリクエスト状況を表示する
 * 
 * @param {DashboardSummaryProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} サマリーカードグリッド
 */
export const DashboardSummary = ({ summary, isLoading = false }: DashboardSummaryProps): JSX.Element => {
  // データがなければデフォルト値を使用
  const data = summary || {
    totalRequests: 0,
    activeRequests: 0,
    completedRequests: 0,
    favoriteHelpers: 0
  };

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
      <StatCard
        title="総依頼数"
        stat={isLoading ? "読込中..." : data.totalRequests}
        icon={<FiList size={20} />}
        colorScheme="blue"
      />
      <StatCard
        title="進行中の依頼"
        stat={isLoading ? "読込中..." : data.activeRequests}
        icon={<FiActivity size={20} />}
        colorScheme="orange"
      />
      <StatCard
        title="完了した依頼"
        stat={isLoading ? "読込中..." : data.completedRequests}
        icon={<FiCheck size={20} />}
        colorScheme="green"
      />
      <StatCard
        title="お気に入りヘルパー"
        stat={isLoading ? "読込中..." : data.favoriteHelpers}
        icon={<FiStar size={20} />}
        colorScheme="purple"
      />
    </SimpleGrid>
  );
};
