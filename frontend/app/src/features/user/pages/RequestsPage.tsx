import { useState } from "react";
import { Box, Button, Flex, useDisclosure } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { 
  DashboardContent, 
  DashboardLayout, 
  RequestFilterPanel, 
  RequestList 
} from "../components";
import { useRequests } from "../hooks/useRequestHooks";
import Header from "../../common/components/Header";
import Sidebar from "../../common/components/Sidebar";
import { RequestFilter } from "../types";

/**
 * リクエスト一覧ページ
 * ユーザーの全リクエストを表示し、フィルタリング機能を提供する
 * 
 * @returns {JSX.Element} リクエスト一覧ページ
 */
export const RequestsPage = (): JSX.Element => {
  const navigate = useNavigate();
  
  // フィルター状態
  const [filter, setFilter] = useState<RequestFilter>({
    page: 1,
    limit: 10,
  });
  
  // リクエストデータ取得
  const { 
    data: requestsData, 
    isLoading, 
    refetch 
  } = useRequests(filter);
  
  // フィルター変更ハンドラー
  const handleFilterChange = (newFilter: RequestFilter) => {
    setFilter(prev => ({ ...prev, ...newFilter, page: 1 }));
  };
  
  // ページ変更ハンドラー
  const handlePageChange = (page: number) => {
    setFilter(prev => ({ ...prev, page }));
  };
  
  // リクエスト詳細表示ハンドラー
  const handleViewRequest = (requestId: string) => {
    navigate(`/requests/${requestId}`);
  };
  
  // リクエスト編集ハンドラー
  const handleEditRequest = (requestId: string) => {
    navigate(`/requests/${requestId}/edit`);
  };
  
  // リクエスト削除ハンドラー
  const handleDeleteRequest = (requestId: string) => {
    // 削除確認モーダル表示（実際の実装は別途必要）
    if (window.confirm('この依頼を削除してもよろしいですか？')) {
      // 削除処理を呼び出し、成功後にリストをリフレッシュ
      console.log(`依頼ID ${requestId} を削除`);
      refetch();
    }
  };
  
  // 新規リクエスト作成ハンドラー
  const handleCreateRequest = () => {
    navigate('/requests/new');
  };

  return (
    <DashboardLayout
      header={<Header />}
      sidebar={<Sidebar />}
    >
      <DashboardContent title="依頼一覧">
        {/* アクションボタン */}
        <Flex justifyContent="flex-end" mb={4}>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="blue"
            onClick={handleCreateRequest}
          >
            新規依頼作成
          </Button>
        </Flex>
        
        {/* フィルターパネル */}
        <RequestFilterPanel
          initialFilter={filter}
          onFilterChange={handleFilterChange}
          isLoading={isLoading}
        />
        
        {/* リクエスト一覧 */}
        <RequestList
          requests={requestsData?.items || []}
          isLoading={isLoading}
          totalItems={requestsData?.totalItems || 0}
          page={filter.page || 1}
          totalPages={requestsData?.totalPages || 1}
          limit={filter.limit || 10}
          onPageChange={handlePageChange}
          onFilterChange={handleFilterChange}
          filter={filter}
          onViewRequest={handleViewRequest}
          onEditRequest={handleEditRequest}
          onDeleteRequest={handleDeleteRequest}
        />
      </DashboardContent>
    </DashboardLayout>
  );
};
