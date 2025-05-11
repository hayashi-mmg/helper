import {
  Button,
  Flex,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  SimpleGrid,
  Spinner,
  Center
} from "@chakra-ui/react";
import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import Header from "../../common/components/Header";
import Sidebar from "../../common/components/Sidebar";
import { 
  DashboardContent, 
  DashboardLayout, 
  HelperCard 
} from "../components";
import { useHelpers } from "../hooks/useHelperHooks";
import { HelperFilter, HelperSkill, HelperStatus } from "../types";



/**
 * ヘルパー一覧ページ
 * 全ヘルパーのリストを表示し、検索やフィルタリング機能を提供する
 * 
 * @returns {JSX.Element} ヘルパー一覧ページ
 */
export const HelpersPage = (): JSX.Element => {
  const navigate = useNavigate();
  
  // フィルター状態
  const [filter, setFilter] = useState<HelperFilter>({
    page: 1,
    limit: 12,
  });
  
  // 検索クエリ
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // ヘルパーデータ取得
  const { data: helpersData, isLoading } = useHelpers(filter);
  
  // ページ変更ハンドラー
  const handlePageChange = (page: number) => {
    setFilter(prev => ({ ...prev, page }));
  };
  
  // フィルター変更ハンドラー
  const handleFilterChange = (filterName: string, value: string) => {
    setFilter(prev => ({ 
      ...prev, 
      page: 1, // フィルター変更時は1ページ目に戻る
      [filterName]: value || undefined 
    }));
  };
  
  // 検索実行ハンドラー
  const handleSearch = () => {
    setFilter(prev => ({ 
      ...prev, 
      page: 1, 
      search: searchQuery
    }));
  };
  
  // 検索入力時のEnterキー処理
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // ヘルパー詳細ページへの遷移
  const handleViewHelper = (helperId: string) => {
    navigate(`/helpers/${helperId}`);
  };
  
  return (
    <DashboardLayout
      header={<Header />}
      sidebar={<Sidebar />}
    >
      <DashboardContent title="ヘルパー一覧">
        {/* 検索とフィルターエリア */}
        <Flex 
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "stretch", md: "center" }}
          mb={6}
          gap={4}
        >
          {/* 検索ボックス */}
          <InputGroup maxW={{ base: "full", md: "400px" }}>
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="名前、スキルなどで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
            />
            <Button ml={2} onClick={handleSearch}>検索</Button>
          </InputGroup>
          
          {/* フィルターエリア */}
          <Flex gap={3} wrap="wrap">
            <Select 
              placeholder="ステータス"
              maxW="150px"
              value={filter.status || ""}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value={HelperStatus.ACTIVE}>活動中</option>
              <option value={HelperStatus.INACTIVE}>非活動</option>
              <option value={HelperStatus.ONLEAVE}>休暇中</option>
            </Select>
            
            <Select 
              placeholder="スキル"
              maxW="200px"
              value={filter.skill || ""}
              onChange={(e) => handleFilterChange("skill", e.target.value)}
            >
              <option value={HelperSkill.COOKING}>料理</option>
              <option value={HelperSkill.CLEANING}>掃除</option>
              <option value={HelperSkill.CHILDCARE}>子育て支援</option>
              <option value={HelperSkill.ELDERCARE}>高齢者ケア</option>
              <option value={HelperSkill.ERRAND}>買い物</option>
              <option value={HelperSkill.OTHER}>その他</option>
            </Select>
          </Flex>
        </Flex>
        
        {/* ヘルパーリスト */}
        {isLoading ? (
          <Center py={10}>
            <Spinner size="xl" thickness="4px" color="blue.500" />
          </Center>
        ) : helpersData && helpersData.items.length > 0 ? (
          <>
            <SimpleGrid 
              columns={{ base: 1, sm: 2, md: 3, lg: 4 }} 
              spacing={6}
              mb={6}
            >
              {helpersData.items.map((helper) => (
                <HelperCard 
                  key={helper.id}
                  helper={helper}
                  onClick={() => handleViewHelper(helper.id)}
                />
              ))}
            </SimpleGrid>
            
            {/* ページネーション */}
            {helpersData.totalPages > 1 && (
              <Flex justify="center" mt={6}>
                <Button
                  onClick={() => handlePageChange(filter.page! - 1)}
                  isDisabled={filter.page === 1}
                  mr={2}
                >
                  前へ
                </Button>
                <Text alignSelf="center" mx={2}>
                  {filter.page} / {helpersData.totalPages}
                </Text>
                <Button
                  onClick={() => handlePageChange(filter.page! + 1)}
                  isDisabled={filter.page === helpersData.totalPages}
                  ml={2}
                >
                  次へ
                </Button>
              </Flex>
            )}
          </>
        ) : (
          <Center py={10} flexDirection="column">
            <Text fontSize="lg" mb={4}>ヘルパーが見つかりませんでした</Text>
            <Button onClick={() => setFilter({ page: 1, limit: 12 })}>
              フィルターをリセット
            </Button>
          </Center>
        )}
      </DashboardContent>
    </DashboardLayout>
  );
};
