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
  Icon,
  Text,
  Skeleton,
  Link
} from "@chakra-ui/react";
import { FiChevronRight } from "react-icons/fi";
import { format } from "date-fns";
import { Request, RequestStatus } from "../../types";
import { Link as RouterLink } from "react-router-dom";

interface RecentRequestsProps {
  requests: Request[];
  isLoading?: boolean;
  title?: string;
  limit?: number;
  showViewAll?: boolean;
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
 * 最近のリクエスト一覧を表示するコンポーネント
 * 
 * @param {RecentRequestsProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} 最近のリクエスト一覧
 */
export const RecentRequests = ({
  requests,
  isLoading = false,
  title = "最近の依頼",
  limit = 5,
  showViewAll = true
}: RecentRequestsProps): JSX.Element => {
  // 表示件数を制限
  const displayRequests = requests?.slice(0, limit) || [];

  return (
    <Box bg="white" borderRadius="lg" boxShadow="sm" p={6} mb={6}>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading as="h2" size="md">
          {title}
        </Heading>
        {showViewAll && (
          <Button
            as={RouterLink}
            to="/requests"
            size="sm"
            colorScheme="blue"
            variant="outline"
            rightIcon={<Icon as={FiChevronRight} />}
          >
            すべて表示
          </Button>
        )}
      </Flex>

      {isLoading ? (
        // ローディング表示
        <Box>
          {Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} height="40px" my={2} />
          ))}
        </Box>
      ) : displayRequests.length > 0 ? (
        // リクエスト一覧
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>タイトル</Th>
              <Th>依頼日</Th>
              <Th>予定日</Th>
              <Th>ステータス</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {displayRequests.map((request) => (
              <Tr key={request.id}>
                <Td>
                  <Link as={RouterLink} to={`/requests/${request.id}`} color="blue.600" fontWeight="medium">
                    {request.title}
                  </Link>
                </Td>
                <Td>{format(new Date(request.createdAt), "yyyy/MM/dd")}</Td>
                <Td>{format(new Date(request.scheduledDate), "yyyy/MM/dd")}</Td>
                <Td>
                  <Badge colorScheme={getStatusColorScheme(request.status)}>
                    {getStatusLabel(request.status)}
                  </Badge>
                </Td>
                <Td textAlign="right">
                  <Button
                    as={RouterLink}
                    to={`/requests/${request.id}`}
                    size="xs"
                    variant="ghost"
                    colorScheme="blue"
                    rightIcon={<Icon as={FiChevronRight} />}
                  >
                    詳細
                  </Button>
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
    </Box>
  );
};
