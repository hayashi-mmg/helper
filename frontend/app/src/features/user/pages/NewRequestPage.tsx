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
import { useNavigate, useLocation } from "react-router-dom";
import { 
  DashboardContent, 
  DashboardLayout, 
  RequestForm 
} from "../components";
import { useHelper } from "../hooks/useHelperHooks";
import { useCreateRequest } from "../hooks/useRequestHooks";
import Header from "../../common/components/Header";
import Sidebar from "../../common/components/Sidebar";
import { RequestFormData } from "../types";

/**
 * 新規リクエスト作成ページ
 * 新しい依頼を作成するためのフォームを提供する
 * 
 * @returns {JSX.Element} 新規リクエスト作成ページ
 */
export const NewRequestPage = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  
  // URLからヘルパーIDを取得（オプション）
  const params = new URLSearchParams(location.search);
  const helperId = params.get('helperId');
  
  // 選択されたヘルパー情報を取得（指定された場合）
  const { data: helper, isLoading: isHelperLoading } = useHelper(helperId || undefined);
  
  // 依頼作成ミューテーション
  const createMutation = useCreateRequest();
  
  // 依頼一覧に戻る
  const handleBack = () => {
    navigate('/requests');
  };
  
  // フォーム送信ハンドラー
  const handleSubmit = async (formData: RequestFormData) => {
    try {
      // ヘルパーIDが指定されている場合は追加
      const requestData = helperId 
        ? { ...formData, helperId } 
        : formData;
        
      // 依頼作成API呼び出し
      await createMutation.mutateAsync(requestData);
      
      // 成功メッセージ表示
      toast({
        title: "依頼を作成しました",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      // 依頼一覧ページに遷移
      navigate('/requests');
    } catch (error) {
      // エラーメッセージ表示
      toast({
        title: "依頼の作成に失敗しました",
        description: error.message || "不明なエラーが発生しました",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <DashboardLayout
      header={<Header />}
      sidebar={<Sidebar />}
    >
      <DashboardContent title="新規依頼作成">
        {/* 戻るボタン */}
        <Button
          leftIcon={<FiArrowLeft />}
          variant="ghost"
          mb={6}
          onClick={handleBack}
        >
          依頼一覧に戻る
        </Button>
        
        {/* ヘルパー選択されている場合はその情報を表示 */}
        {helperId && (
          <Box mb={6} p={4} borderWidth="1px" borderRadius="md">
            {isHelperLoading ? (
              <Center py={4}>
                <Spinner size="sm" mr={2} />
                <Text>ヘルパー情報を読み込み中...</Text>
              </Center>
            ) : helper ? (
              <Flex direction="column">
                <Text fontWeight="bold">選択中のヘルパー:</Text>
                <Text>
                  {helper.lastName} {helper.firstName}
                </Text>
                {helper.email && <Text fontSize="sm">{helper.email}</Text>}
              </Flex>
            ) : (
              <Text>指定されたヘルパーが見つかりません</Text>
            )}
          </Box>
        )}
        
        {/* リクエストフォーム */}
        <RequestForm
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
          submitLabel="依頼を作成"
        />
      </DashboardContent>
    </DashboardLayout>
  );
};
