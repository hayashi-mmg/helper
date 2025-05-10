import { useState } from "react";
import { 
  Box, 
  Button, 
  Center, 
  Flex, 
  Spinner, 
  Text, 
  useToast, 
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure
} from "@chakra-ui/react";
import { FiArrowLeft, FiEdit, FiTrash2 } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { 
  DashboardContent, 
  DashboardLayout, 
  RequestDetail 
} from "../components";
import { useRequest, useDeleteRequest } from "../hooks/useRequestHooks";
import Header from "../../common/components/Header";
import Sidebar from "../../common/components/Sidebar";
import { RequestStatus } from "../types";

/**
 * リクエスト詳細ページ
 * 特定のリクエストの詳細情報を表示する
 * 
 * @returns {JSX.Element} リクエスト詳細ページ
 */
export const RequestDetailPage = (): JSX.Element => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();
  
  // リクエストデータ取得
  const { 
    data: request, 
    isLoading,
    refetch
  } = useRequest(requestId);
  
  // 削除ミューテーション
  const deleteMutation = useDeleteRequest();
  
  // 編集ページへ移動
  const handleEdit = () => {
    navigate(`/requests/${requestId}/edit`);
  };
  
  // 削除確認ダイアログを開く
  const handleDeleteConfirm = () => {
    onOpen();
  };
  
  // リクエスト削除実行
  const handleDelete = async () => {
    if (!requestId) return;
    
    try {
      await deleteMutation.mutateAsync(requestId);
      toast({
        title: "依頼を削除しました",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      navigate('/requests');
    } catch (error) {
      toast({
        title: "依頼の削除に失敗しました",
        description: error.message || "不明なエラーが発生しました",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      onClose();
    }
  };
  
  // 依頼一覧に戻る
  const handleBack = () => {
    navigate('/requests');
  };
  
  // 削除可能かどうかを判定
  const canDelete = request && 
    request.status !== RequestStatus.INPROGRESS && 
    request.status !== RequestStatus.COMPLETED;
  
  // 編集可能かどうかを判定
  const canEdit = request && 
    request.status !== RequestStatus.COMPLETED;
  
  // ローディング表示
  if (isLoading) {
    return (
      <DashboardLayout
        header={<Header />}
        sidebar={<Sidebar />}
      >
        <DashboardContent>
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
        <DashboardContent>
          <Center py={10} flexDirection="column" gap={4}>
            <Text fontSize="lg">依頼が見つかりませんでした</Text>
            <Button leftIcon={<FiArrowLeft />} onClick={handleBack}>
              依頼一覧に戻る
            </Button>
          </Center>
        </DashboardContent>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      header={<Header />}
      sidebar={<Sidebar />}
    >
      <DashboardContent>
        {/* アクションボタン */}
        <Flex justifyContent="space-between" mb={6}>
          <Button
            leftIcon={<FiArrowLeft />}
            variant="ghost"
            onClick={handleBack}
          >
            依頼一覧に戻る
          </Button>
          
          <Flex gap={2}>
            {canEdit && (
              <Button
                leftIcon={<FiEdit />}
                colorScheme="blue"
                onClick={handleEdit}
              >
                編集
              </Button>
            )}
            
            {canDelete && (
              <Button
                leftIcon={<FiTrash2 />}
                colorScheme="red"
                onClick={handleDeleteConfirm}
              >
                削除
              </Button>
            )}
          </Flex>
        </Flex>
        
        {/* リクエスト詳細 */}
        <RequestDetail
          request={request}
          onEdit={handleEdit}
          onDelete={handleDeleteConfirm}
          canEdit={canEdit}
          canDelete={canDelete}
        />
        
        {/* 削除確認ダイアログ */}
        <AlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                依頼の削除
              </AlertDialogHeader>

              <AlertDialogBody>
                この依頼を削除してもよろしいですか？この操作は取り消せません。
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>
                  キャンセル
                </Button>
                <Button 
                  colorScheme="red" 
                  onClick={handleDelete} 
                  ml={3}
                  isLoading={deleteMutation.isPending}
                >
                  削除する
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </DashboardContent>
    </DashboardLayout>
  );
};
