import {
  Box,
  Button,
  Flex,
  Heading,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Badge,
  Text,
  Link,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  useColorModeValue,
  Skeleton,
  Select,
  HStack
} from "@chakra-ui/react";
import { FiChevronDown, FiEdit, FiEye, FiTrash2 } from "react-icons/fi";
import { format } from "date-fns";
import { Link as RouterLink } from "react-router-dom";
import { Request, RequestStatus, RequestType, RequestFilter } from "../../types";
import { useState } from "react";

interface RequestListProps {
  requests: Request[];
  isLoading?: boolean;
  totalItems?: number;
  page?: number;
  totalPages?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
  onFilterChange?: (filter: RequestFilter) => void;
  filter?: RequestFilter;
  onViewRequest?: (requestId: string) => void;
  onEditRequest?: (requestId: string) => void;
  onDeleteRequest?: (requestId: string) => void;
}

/**
 * ステータスに応じたバッジのカラースキームを返す
 * 
 * @param {RequestStatus} status - リクエストのステータス
 * @returns {string} カラースキーム
 */
const getStatusColorScheme = (status: RequestStatus): string => {
  switch (status) {
    case RequestStatus.PENDING:
      return "yellow";
    case RequestStatus.ACCEPTED:
      return "blue";
    case RequestStatus.INPROGRESS:
      return "orange";
    case RequestStatus.COMPLETED:
      return "green";
    case RequestStatus.CANCELLED:
      return "red";
    case RequestStatus.REJECTED:
      return "gray";
    default:
      return "gray";
  }
};

/**
 * ステータスの日本語表示を返す
 * 
 * @param {RequestStatus} status - リクエストのステータス
 * @returns {string} ステータスの日本語表示
 */
const getStatusLabel = (status: RequestStatus): string => {
  switch (status) {
    case RequestStatus.PENDING:
      return "保留中";
    case RequestStatus.ACCEPTED:
      return "受付済み";
    case RequestStatus.INPROGRESS:
      return "進行中";
    case RequestStatus.COMPLETED:
      return "完了";
    case RequestStatus.CANCELLED:
      return "キャンセル";
    case RequestStatus.REJECTED:
      return "却下";
    default:
      return "不明";
  }
};

/**
 * リクエストタイプの日本語表示を返す
 * 
 * @param {RequestType} type - リクエストのタイプ
 * @returns {string} リクエストタイプの日本語表示
 */
const getTypeLabel = (type: RequestType): string => {
  switch (type) {
    case RequestType.COOKING:
      return "料理";
    case RequestType.ERRAND:
      return "買い物";
    case RequestType.CLEANING:
      return "掃除";
    case RequestType.OTHER:
      return "その他";
    default:
      return "不明";
  }
};

/**
 * リクエスト一覧表示コンポーネント
 * リクエストの一覧を表示し、フィルタリング、ページング機能を提供する
 * 
 * @param {RequestListProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} リクエスト一覧
 */
export const RequestList = ({
  requests,
  isLoading = false,
  totalItems = 0,
  page = 1,
  totalPages = 1,
  limit = 10,
  onPageChange,
  onFilterChange,
  filter = {},
  onViewRequest,
  onEditRequest,
  onDeleteRequest
}: RequestListProps): JSX.Element => {
  const bgColor = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  
  // ローカルフィルター状態
  const [localFilter, setLocalFilter] = useState<RequestFilter>(filter);

  // フィルター変更ハンドラー
  const handleFilterChange = (key: keyof RequestFilter, value: any) => {
    const newFilter = { ...localFilter, [key]: value, page: 1 };
    setLocalFilter(newFilter);
    onFilterChange?.(newFilter);
  };

  // ページネーションのレンダリング
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <Flex justifyContent="center" mt={4} alignItems="center">
        <Button
          size="sm"
          onClick={() => onPageChange?.(page - 1)}
          isDisabled={page === 1}
          mr={2}
        >
          前へ
        </Button>
        <Text fontSize="sm">
          {page} / {totalPages} ページ ({totalItems} 件中 {(page - 1) * limit + 1}-
          {Math.min(page * limit, totalItems)} を表示)
        </Text>
        <Button
          size="sm"
          onClick={() => onPageChange?.(page + 1)}
          isDisabled={page === totalPages}
          ml={2}
        >
          次へ
        </Button>
      </Flex>
    );
  };

  return (
    <Box bg={bgColor} borderRadius="lg" boxShadow="sm" p={6} borderWidth="1px" borderColor={borderColor}>
      {/* ヘッダー部分 */}
      <Flex justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
        <Heading as="h2" size="md">
          依頼一覧 {!isLoading && totalItems > 0 && <Badge ml={2}>{totalItems}件</Badge>}
        </Heading>
        
        {/* フィルターコントロール */}
        <HStack spacing={3}>
          <Select
            size="sm"
            value={localFilter.status || ""}
            onChange={(e) => handleFilterChange("status", e.target.value || undefined)}
            placeholder="ステータス"
            width="auto"
          >
            {Object.values(RequestStatus).map((status) => (
              <option key={status} value={status}>
                {getStatusLabel(status)}
              </option>
            ))}
          </Select>
          
          <Select
            size="sm"
            value={localFilter.type || ""}
            onChange={(e) => handleFilterChange("type", e.target.value || undefined)}
            placeholder="タイプ"
            width="auto"
          >
            {Object.values(RequestType).map((type) => (
              <option key={type} value={type}>
                {getTypeLabel(type)}
              </option>
            ))}
          </Select>
          
          <Button
            size="sm"
            colorScheme="blue"
            variant="outline"
            onClick={() => {
              const emptyFilter: RequestFilter = { page: 1, limit };
              setLocalFilter(emptyFilter);
              onFilterChange?.(emptyFilter);
            }}
          >
            リセット
          </Button>
        </HStack>
      </Flex>

      {/* テーブル部分 */}
      {isLoading ? (
        // ローディング表示
        <Box>
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} height="40px" my={2} />
          ))}
        </Box>
      ) : requests.length > 0 ? (
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>タイトル</Th>
              <Th>タイプ</Th>
              <Th>予定日</Th>
              <Th>ステータス</Th>
              <Th isNumeric>操作</Th>
            </Tr>
          </Thead>
          <Tbody>
            {requests.map((request) => (
              <Tr key={request.id}>
                <Td>
                  <Link
                    as={RouterLink}
                    to={`/requests/${request.id}`}
                    color="blue.600"
                    fontWeight="medium"
                  >
                    {request.title}
                  </Link>
                </Td>
                <Td>{getTypeLabel(request.type)}</Td>
                <Td>{format(new Date(request.scheduledDate), "yyyy/MM/dd")}</Td>
                <Td>
                  <Badge colorScheme={getStatusColorScheme(request.status)}>
                    {getStatusLabel(request.status)}
                  </Badge>
                </Td>
                <Td isNumeric>
                  <Menu>
                    <MenuButton
                      as={Button}
                      size="xs"
                      variant="ghost"
                      rightIcon={<Icon as={FiChevronDown} />}
                    >
                      操作
                    </MenuButton>
                    <MenuList>
                      <MenuItem
                        icon={<Icon as={FiEye} />}
                        onClick={() => onViewRequest?.(request.id)}
                      >
                        詳細を見る
                      </MenuItem>
                      <MenuItem
                        icon={<Icon as={FiEdit} />}
                        onClick={() => onEditRequest?.(request.id)}
                        isDisabled={request.status === RequestStatus.COMPLETED}
                      >
                        編集する
                      </MenuItem>
                      <MenuItem
                        icon={<Icon as={FiTrash2} />}
                        onClick={() => onDeleteRequest?.(request.id)}
                        isDisabled={
                          request.status === RequestStatus.INPROGRESS || 
                          request.status === RequestStatus.COMPLETED
                        }
                      >
                        削除する
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        // データがない場合
        <Flex justifyContent="center" alignItems="center" py={10}>
          <Text color="gray.500">依頼はありません</Text>
        </Flex>
      )}
      
      {/* ページネーション部分 */}
      {renderPagination()}
    </Box>
  );
};
