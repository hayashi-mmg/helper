/**
 * ユーザー別リクエスト一覧表示コンポーネント
 * 特定のユーザーから受けたリクエストを一覧で表示する
 */
import { FC, useState } from 'react';
import { 
  Box, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  Badge,
  Text,
  HStack,
  Button,
  useColorModeValue,
  IconButton,
  Flex,
  Input,
  Select,
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
  Avatar,
  Tag,
  TagLabel,
  TagLeftIcon,
  Divider,
  Collapse
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  FireIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  PlayIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Request } from '../../types/request';

export interface UserRequestsListProps {
  /**
   * 表示するリクエストリスト
   */
  requests: Request[];
  /**
   * データ読み込み中フラグ
   */
  isLoading?: boolean;
  /**
   * 総件数
   */
  totalItems?: number;
  /**
   * 現在のページ番号
   */
  currentPage?: number;
  /**
   * 1ページあたりの件数
   */
  itemsPerPage?: number;
  /**
   * ユーザーID（特定ユーザーのリクエストのみ表示する場合）
   */
  userId?: string;
  /**
   * ページ変更時のコールバック
   */
  onPageChange?: (page: number) => void;
  /**
   * キーワード検索時のコールバック
   */
  onSearch?: (keyword: string) => void;
  /**
   * フィルター適用時のコールバック
   */
  onFilter?: (filters: any) => void;
  /**
   * ステータス更新時のコールバック
   */
  onStatusChange?: (requestId: string, status: string) => void;
  /**
   * リクエストをクリックした時のコールバック
   */
  onRequestClick?: (requestId: string) => void;
}

/**
 * リクエスト状態に対応するバッジカラーの設定
 */
const statusColors: Record<string, string> = {
  pending: 'yellow',
  in_progress: 'blue',
  completed: 'green',
  cancelled: 'gray'
};

/**
 * リクエスト状態の日本語表示
 */
const statusLabels: Record<string, string> = {
  pending: '未対応',
  in_progress: '進行中',
  completed: '完了',
  cancelled: 'キャンセル'
};

/**
 * リクエストタイプのアイコンを取得
 */
const getRequestTypeIcon = (type: string) => {
  switch (type) {
    case 'cooking':
      return FireIcon;
    case 'errand':
      return ShoppingBagIcon;
    default:
      return DocumentTextIcon;
  }
};

/**
 * リクエストタイプのラベルを取得
 */
const getRequestTypeLabel = (type: string) => {
  switch (type) {
    case 'cooking':
      return '料理';
    case 'errand':
      return 'お使い';
    default:
      return 'その他';
  }
};

/**
 * ユーザー別リクエスト一覧表示コンポーネント
 */
export const UserRequestsList: FC<UserRequestsListProps> = ({
  requests,
  isLoading = false,
  totalItems = 0,
  currentPage = 1,
  itemsPerPage = 10,
  userId,
  onPageChange,
  onSearch,
  onFilter,
  onStatusChange,
  onRequestClick
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    status: [] as string[],
    types: [] as string[]
  });
  
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const filterBg = useColorModeValue('gray.50', 'gray.800');
  
  // ページ総数を計算
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // 検索実行
  const handleSearch = () => {
    onSearch?.(searchKeyword);
  };
  
  // フィルター適用
  const applyFilters = () => {
    onFilter?.(filters);
    setShowFilter(false);
  };
  
  // フィルターリセット
  const resetFilters = () => {
    setFilters({
      status: [],
      types: []
    });
  };
  
  // ステータスフィルター変更
  const handleStatusFilter = (status: string) => {
    if (filters.status.includes(status)) {
      setFilters({
        ...filters,
        status: filters.status.filter(s => s !== status)
      });
    } else {
      setFilters({
        ...filters,
        status: [...filters.status, status]
      });
    }
  };
  
  // タイプフィルター変更
  const handleTypeFilter = (type: string) => {
    if (filters.types.includes(type)) {
      setFilters({
        ...filters,
        types: filters.types.filter(t => t !== type)
      });
    } else {
      setFilters({
        ...filters,
        types: [...filters.types, type]
      });
    }
  };
  
  // リクエストステータス変更
  const handleStatusChange = (requestId: string, newStatus: string) => {
    onStatusChange?.(requestId, newStatus);
  };
  
  return (
    <Box>
      {/* 検索・フィルターエリア */}
      <Flex 
        mb={4} 
        justifyContent="space-between" 
        alignItems="center"
        flexDir={{ base: 'column', md: 'row' }}
        gap={2}
      >
        <HStack>
          <Box position="relative" width={{ base: 'full', md: 'auto' }}>
            <Input
              placeholder="リクエストを検索..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              pr="8"
              width={{ base: 'full', md: '250px' }}
            />
            <IconButton
              aria-label="Search"
              icon={<Box as={MagnifyingGlassIcon} w={4} h={4} />}
              position="absolute"
              right="2"
              top="50%"
              transform="translateY(-50%)"
              variant="ghost"
              onClick={handleSearch}
              zIndex={2}
              size="sm"
            />
          </Box>
          
          <Button
            leftIcon={<Box as={FunnelIcon} w={4} h={4} />}
            variant="outline"
            onClick={() => setShowFilter(!showFilter)}
            size={{ base: 'sm', md: 'md' }}
          >
            フィルター
          </Button>
          
          <Button
            leftIcon={<Box as={ArrowPathIcon} w={4} h={4} />}
            variant="outline"
            onClick={() => {
              // リフレッシュ処理
              setSearchKeyword('');
              resetFilters();
              onFilter?.({});
            }}
            size={{ base: 'sm', md: 'md' }}
          >
            リセット
          </Button>
        </HStack>
        
        <HStack>
          <Text fontSize="sm">表示件数:</Text>
          <Select
            size="sm"
            width="70px"
            defaultValue="10"
            onChange={(e) => {
              // 表示件数変更の処理
            }}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </Select>
        </HStack>
      </Flex>
      
      {/* フィルターパネル */}
      <Collapse in={showFilter}>
        <Box 
          p={4} 
          bg={filterBg}
          borderRadius="md"
          mb={4}
          border="1px"
          borderColor={borderColor}
        >
          <HStack justifyContent="space-between" mb={4}>
            <Text fontWeight="medium">詳細検索</Text>
            <Button 
              leftIcon={<Box as={ArrowPathIcon} w={4} h={4} />} 
              size="sm"
              variant="ghost"
              onClick={resetFilters}
            >
              リセット
            </Button>
          </HStack>
          
          <HStack spacing={8} flexWrap="wrap">
            <Box>
              <Text fontWeight="medium" mb={2}>ステータス</Text>
              <HStack spacing={2} flexWrap="wrap">
                <Tag
                  size="md"
                  variant={filters.status.includes('pending') ? 'solid' : 'outline'}
                  colorScheme="yellow"
                  cursor="pointer"
                  onClick={() => handleStatusFilter('pending')}
                >
                  <TagLabel>未対応</TagLabel>
                </Tag>
                <Tag
                  size="md"
                  variant={filters.status.includes('in_progress') ? 'solid' : 'outline'}
                  colorScheme="blue"
                  cursor="pointer"
                  onClick={() => handleStatusFilter('in_progress')}
                >
                  <TagLabel>進行中</TagLabel>
                </Tag>
                <Tag
                  size="md"
                  variant={filters.status.includes('completed') ? 'solid' : 'outline'}
                  colorScheme="green"
                  cursor="pointer"
                  onClick={() => handleStatusFilter('completed')}
                >
                  <TagLabel>完了</TagLabel>
                </Tag>
                <Tag
                  size="md"
                  variant={filters.status.includes('cancelled') ? 'solid' : 'outline'}
                  colorScheme="gray"
                  cursor="pointer"
                  onClick={() => handleStatusFilter('cancelled')}
                >
                  <TagLabel>キャンセル</TagLabel>
                </Tag>
              </HStack>
            </Box>
            
            <Box>
              <Text fontWeight="medium" mb={2}>タイプ</Text>
              <HStack spacing={2} flexWrap="wrap">
                <Tag
                  size="md"
                  variant={filters.types.includes('cooking') ? 'solid' : 'outline'}
                  colorScheme="red"
                  cursor="pointer"
                  onClick={() => handleTypeFilter('cooking')}
                >
                  <TagLeftIcon as={FireIcon} boxSize='12px' />
                  <TagLabel>料理</TagLabel>
                </Tag>
                <Tag
                  size="md"
                  variant={filters.types.includes('errand') ? 'solid' : 'outline'}
                  colorScheme="purple"
                  cursor="pointer"
                  onClick={() => handleTypeFilter('errand')}
                >
                  <TagLeftIcon as={ShoppingBagIcon} boxSize='12px' />
                  <TagLabel>お使い</TagLabel>
                </Tag>
                <Tag
                  size="md"
                  variant={filters.types.includes('other') ? 'solid' : 'outline'}
                  colorScheme="blue"
                  cursor="pointer"
                  onClick={() => handleTypeFilter('other')}
                >
                  <TagLeftIcon as={DocumentTextIcon} boxSize='12px' />
                  <TagLabel>その他</TagLabel>
                </Tag>
              </HStack>
            </Box>
          </HStack>
          
          <Flex justifyContent="flex-end" mt={4}>
            <Button 
              colorScheme="blue"
              onClick={applyFilters}
            >
              適用
            </Button>
          </Flex>
        </Box>
      </Collapse>
      
      {/* リクエストテーブル */}
      <Box
        border="1px"
        borderColor={borderColor}
        borderRadius="md"
        overflow="hidden"
      >
        <Table variant="simple">
          <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
            <Tr>
              <Th>リクエスト</Th>
              <Th display={{ base: 'none', md: 'table-cell' }}>日時</Th>
              {!userId && (
                <Th display={{ base: 'none', md: 'table-cell' }}>ユーザー</Th>
              )}
              <Th width="120px" textAlign="center">ステータス</Th>
              <Th width="120px" textAlign="center">アクション</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <Tr>
                <Td colSpan={userId ? 4 : 5} textAlign="center" py={10}>
                  <Spinner size="lg" />
                </Td>
              </Tr>
            ) : requests.length === 0 ? (
              <Tr>
                <Td colSpan={userId ? 4 : 5} textAlign="center" py={10}>
                  リクエストがありません
                </Td>
              </Tr>
            ) : (
              requests.map((request) => {
                const TypeIcon = getRequestTypeIcon(request.type);
                const typeLabel = getRequestTypeLabel(request.type);
                
                return (
                  <Tr 
                    key={request.id} 
                    cursor="pointer" 
                    _hover={{ bg: hoverBg }}
                    onClick={() => onRequestClick?.(request.id)}
                  >
                    <Td>
                      <HStack spacing={3}>
                        <Tooltip label={typeLabel}>
                          <Box as={TypeIcon} w={5} h={5} color="blue.500" />
                        </Tooltip>
                        <Box>
                          <Text fontWeight="medium">{request.title}</Text>
                          <Text 
                            fontSize="sm" 
                            color="gray.500" 
                            noOfLines={1}
                          >
                            {request.description}
                          </Text>
                          
                          {request.type === 'cooking' && request.recipeUrl && (
                            <Text fontSize="xs" color="blue.500" mt={1}>
                              レシピURL: あり
                            </Text>
                          )}
                        </Box>
                      </HStack>
                    </Td>
                    <Td display={{ base: 'none', md: 'table-cell' }}>
                      <Text fontSize="sm">
                        作成: {format(new Date(request.createdAt), 'yyyy/MM/dd', { locale: ja })}
                      </Text>
                      {request.dueDate && (
                        <Text fontSize="sm" fontWeight="medium">
                          期限: {format(new Date(request.dueDate), 'yyyy/MM/dd HH:mm', { locale: ja })}
                        </Text>
                      )}
                    </Td>
                    {!userId && (
                      <Td display={{ base: 'none', md: 'table-cell' }}>
                        <HStack>
                          <Avatar size="xs" name={request.userName} />
                          <Text fontSize="sm">{request.userName}</Text>
                        </HStack>
                      </Td>
                    )}
                    <Td textAlign="center">
                      <Badge
                        colorScheme={statusColors[request.status]}
                        px={2}
                        py={1}
                        borderRadius="full"
                      >
                        {statusLabels[request.status]}
                      </Badge>
                    </Td>
                    <Td textAlign="center">
                      <HStack spacing={2} justifyContent="center">
                        {request.status === 'pending' && (
                          <Tooltip label="進行中にする">
                            <IconButton
                              aria-label="進行中にする"
                              icon={<Box as={PlayIcon} w={4} h={4} />}
                              size="sm"
                              colorScheme="blue"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation(); // 親要素のクリックイベントを防止
                                handleStatusChange(request.id, 'in_progress');
                              }}
                            />
                          </Tooltip>
                        )}
                        
                        {request.status === 'in_progress' && (
                          <Tooltip label="完了する">
                            <IconButton
                              aria-label="完了する"
                              icon={<Box as={CheckCircleIcon} w={4} h={4} />}
                              size="sm"
                              colorScheme="green"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation(); // 親要素のクリックイベントを防止
                                handleStatusChange(request.id, 'completed');
                              }}
                            />
                          </Tooltip>
                        )}
                        
                        {(request.status === 'pending' || request.status === 'in_progress') && (
                          <Tooltip label="キャンセル">
                            <IconButton
                              aria-label="キャンセル"
                              icon={<Box as={XMarkIcon} w={4} h={4} />}
                              size="sm"
                              colorScheme="red"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation(); // 親要素のクリックイベントを防止
                                handleStatusChange(request.id, 'cancelled');
                              }}
                            />
                          </Tooltip>
                        )}
                        
                        <Tooltip label="詳細を表示">
                          <IconButton
                            as={RouterLink}
                            to={`/helper/requests/${request.id}`}
                            aria-label="詳細を表示"
                            icon={<Box as={ChevronRightIcon} w={4} h={4} />}
                            size="sm"
                            variant="ghost"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                );
              })
            )}
          </Tbody>
        </Table>
      </Box>
      
      {/* ページネーション */}
      {totalPages > 1 && (
        <Flex justifyContent="center" mt={4} alignItems="center">
          <IconButton
            aria-label="Previous page"
            icon={<Box as={ChevronLeftIcon} w={4} h={4} />}
            isDisabled={currentPage === 1}
            onClick={() => onPageChange?.(currentPage - 1)}
            me={2}
          />
          
          <Text fontSize="sm">
            {currentPage} / {totalPages} ページ (全{totalItems}件)
          </Text>
          
          <IconButton
            aria-label="Next page"
            icon={<Box as={ChevronRightIcon} w={4} h={4} />}
            isDisabled={currentPage === totalPages}
            onClick={() => onPageChange?.(currentPage + 1)}
            ms={2}
          />
        </Flex>
      )}
    </Box>
  );
};

export default UserRequestsList;
