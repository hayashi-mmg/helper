import { 
  Box, 
  Button, 
  Center, 
  Flex, 
  Spinner, 
  Text, 
  useToast,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
import { FiArrowLeft, FiCalendar, FiMail } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import Header from "../../common/components/Header";
import Sidebar from "../../common/components/Sidebar";
import { 
  DashboardContent, 
  DashboardLayout, 
  HelperInfo,
  HelperReviews,
  HelperAvailability
} from "../components";
import { useHelper } from "../hooks/useHelperHooks";

/**
 * ヘルパー詳細ページ
 * 特定のヘルパーの詳細情報を表示する
 * 
 * @returns {JSX.Element} ヘルパー詳細ページ
 */
export const HelperDetailPage = (): JSX.Element => {
  const { helperId } = useParams<{ helperId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  
  // ヘルパー情報を取得
  const { data: helper, isLoading } = useHelper(helperId);
  
  // ヘルパー一覧に戻る
  const handleBack = () => {
    navigate('/helpers');
  };
  
  // 依頼作成
  const handleCreateRequest = () => {
    navigate(`/requests/new?helperId=${helperId}`);
  };
  
  // メール送信
  const handleSendEmail = () => {
    if (helper?.email) {
      window.location.href = `mailto:${helper.email}`;
    }
  };
  
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
  
  // ヘルパーが見つからない場合
  if (!helper) {
    return (
      <DashboardLayout
        header={<Header />}
        sidebar={<Sidebar />}
      >
        <DashboardContent>
          <Center py={10} flexDirection="column" gap={4}>
            <Text fontSize="lg">ヘルパーが見つかりませんでした</Text>
            <Button leftIcon={<FiArrowLeft />} onClick={handleBack}>
              ヘルパー一覧に戻る
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
      <DashboardContent title={`${helper.lastName} ${helper.firstName}`}>
        {/* 戻るボタン */}
        <Button
          leftIcon={<FiArrowLeft />}
          variant="ghost"
          mb={6}
          onClick={handleBack}
        >
          ヘルパー一覧に戻る
        </Button>
        
        {/* ヘルパー情報 */}
        <HelperInfo helper={helper} />
        
        {/* アクションボタン */}
        <Flex mt={6} mb={8} gap={4}>
          <Button
            leftIcon={<FiCalendar />}
            colorScheme="blue"
            onClick={handleCreateRequest}
          >
            このヘルパーに依頼する
          </Button>
          
          {helper.email && (
            <Button
              leftIcon={<FiMail />}
              variant="outline"
              colorScheme="blue"
              onClick={handleSendEmail}
            >
              メールを送る
            </Button>
          )}
        </Flex>
        
        {/* 詳細タブ */}
        <Tabs colorScheme="blue" mt={6}>
          <TabList>
            <Tab>稼働スケジュール</Tab>
            <Tab>レビュー</Tab>
            <Tab>実績</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel>
              <HelperAvailability 
                availability={helper.availability} 
              />
            </TabPanel>
            <TabPanel>
              <HelperReviews 
                helperId={helper.id} 
              />
            </TabPanel>
            <TabPanel>
              <Text fontSize="lg" mb={4}>実績情報</Text>
              <Box>
                <Text>依頼完了数: {helper.completedRequestsCount || 0}件</Text>
                <Text>登録日: {new Date(helper.createdAt).toLocaleDateString('ja-JP')}</Text>
                <Text>最終活動日: {helper.lastActiveAt ? new Date(helper.lastActiveAt).toLocaleDateString('ja-JP') : '未活動'}</Text>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </DashboardContent>
    </DashboardLayout>
  );
};
