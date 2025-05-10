import { useState } from "react";
import { 
  Box, 
  Button, 
  Center, 
  Flex, 
  Spinner, 
  Text,
  useToast
} from "@chakra-ui/react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { 
  DashboardContent, 
  DashboardLayout, 
  RequestForm 
} from "../components";
import { useRequest, useUpdateRequest } from "../hooks/useRequestHooks";
import Header from "../../common/components/Header";
import Sidebar from "../../common/components/Sidebar";
import { RequestFormData } from "../types";

/**
 * リクエスト編集ページ
 * 既存の依頼情報を編集するためのフォームを提供する
 * 
 * @returns {JSX.Element} リクエスト編集ページ
 */
export const EditRequestPage = (): JSX.Element => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  
  // リクエストデータ取得
  const { 
    data: request, 
    isLoading,
    refetch
  } = useRequest(requestId);
  
  // 更新ミューテーション
  const updateMutation = useUpdateRequest();
  
  // リクエスト詳細に戻る
  const handleBack = () => {
    navigate(`/requests/${requestId}`);
  };
  
  // フォーム送信ハンドラー
  const handleSubmit = async (formData: RequestFormData) => {
    if (!requestId) return;
    
    try {
      // 依頼更新API呼び出し
      await updateMutation.mutateAsync({
        id: requestId,
        ...formData
      });
      
      // 成功メッセージ表示
      toast({
        title: "依頼を更新しました",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      // リクエスト詳細ページに遷移
      navigate(`/requests/${requestId}`);
    } catch (error) {
      // エラーメッセージ表示
      toast({
        title: "依頼の更新に失敗しました",
        description: error.message || "不明なエラーが発生しました",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // ローディング表示
  if (isLoading) {
    return (
      <DashboardLayout
        header={<Header />}
        sidebar={<Sidebar />}
      >
        <DashboardContent title="依頼の編集">
          <Center py={10}>
            <Spinner size="xl" thickness="4px" color="blue.500" />
          </Center>
        </DashboardContent>
      </DashboardLayout>
    );
  }
  
  // リクエストが見つからない場合
  if (!request) {
    return (
      <DashboardLayout
        header={<Header />}
        sidebar={<Sidebar />}
      >
        <DashboardContent title="依頼の編集">
          <Center py={10} flexDirection="column" gap={4}>
            <Text fontSize="lg">依頼が見つかりませんでした</Text>
            <Button onClick={() => navigate('/requests')}>
              依頼一覧に戻る
            </Button>
          </Center>
        </DashboardContent>
      </DashboardLayout>
    );
  }

  // フォーム初期データの準備
  const initialData: RequestFormData = {
    title: request.title,
    description: request.description,
    type: request.type,
    scheduledDate: request.scheduledDate,
    estimatedDuration: request.estimatedDuration
  };

  return (
    <DashboardLayout
      header={<Header />}
      sidebar={<Sidebar />}
    >
      <DashboardContent title="依頼の編集">
        {/* 戻るボタン */}
        <Button
          leftIcon={<FiArrowLeft />}
          variant="ghost"
          mb={6}
          onClick={handleBack}
        >
          依頼詳細に戻る
        </Button>
        
        {/* リクエストフォーム */}
        <RequestForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isLoading={updateMutation.isPending}
          submitLabel="変更を保存"
        />
      </DashboardContent>
    </DashboardLayout>
  );
};
