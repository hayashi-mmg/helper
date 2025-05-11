/**
 * 未完了タスク一覧表示コンポーネント
 * ヘルパーの未完了タスクを一覧で表示する
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
  Avatar,
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
  FormControl,
  FormLabel,
  Checkbox,
  Stack,
  Collapse,
  Divider,
  Link
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
  SparklesIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
  EllipsisVerticalIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Task, TaskType } from '../../types/task';
import { taskPriorityColors, taskPriorityLabels, taskTypeLabels } from '../../mocks/tasks';
import { useState } from 'react';

export interface PendingTasksListProps {
  /**
   * 表示するタスクリスト
   */
  tasks: Task[];
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
   * ソート変更時のコールバック
   */
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  /**
   * タスクのステータス更新時のコールバック
   */
  onStatusChange?: (taskId: string, status: string) => void;
  /**
   * タスクをクリックした時のコールバック
   */
  onTaskClick?: (taskId: string) => void;
}

/**
 * タスク種類に対応するアイコンを取得
 */
const getTaskTypeIcon = (type: TaskType) => {
  switch (type) {
    case 'cooking':
      return FireIcon;
    case 'errand':
      return ShoppingBagIcon;
    case 'cleaning':
      return SparklesIcon;
    default:
      return DocumentTextIcon;
  }
};

/**
 * 未完了タスク一覧表示コンポーネント
 */
export const PendingTasksList: FC<PendingTasksListProps> = ({
  tasks,
  isLoading = false,
  totalItems = 0,
  currentPage = 1,
  itemsPerPage = 10,
  onPageChange,
  onSearch,
  onFilter,
  onSort,
  onStatusChange,
  onTaskClick
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    types: [] as string[],
    priorities: [] as string[],
    dueDateFrom: '',
    dueDateTo: '',
  });
  const [sortField, setSortField] = useState('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
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
      types: [],
      priorities: [],
      dueDateFrom: '',
      dueDateTo: '',
    });
  };
  
  // ソート変更
  const handleSort = (field: string) => {
    const direction = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(direction);
    onSort?.(field, direction);
  };
  
  // タスク種類のフィルター変更
  const handleTaskTypeFilter = (type: string) => {
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
  
  // 優先度のフィルター変更
  const handlePriorityFilter = (priority: string) => {
    if (filters.priorities.includes(priority)) {
      setFilters({
        ...filters,
        priorities: filters.priorities.filter(p => p !== priority)
      });
    } else {
      setFilters({
        ...filters,
        priorities: [...filters.priorities, priority]
      });
    }
  };
  
  // タスク完了マーク処理
  const handleCompleteTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 親要素のクリックイベント伝播を防止
    onStatusChange?.(taskId, 'completed');
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
              placeholder="タスクを検索..."
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
          
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<Box as={ChevronDownIcon} w={4} h={4} />}
              variant="outline"
              size={{ base: 'sm', md: 'md' }}
            >
              並び替え
            </MenuButton>
            <MenuList>
              <MenuItem
                icon={
                  <Box as={sortField === 'dueDate' ? (sortDirection === 'asc' ? ChevronDownIcon : ChevronRightIcon) : CalendarDaysIcon} w={4} h={4} />
                }
                onClick={() => handleSort('dueDate')}
              >
                期限日 {sortField === 'dueDate' && (sortDirection === 'asc' ? '(昇順)' : '(降順)')}
              </MenuItem>
              <MenuItem
                icon={
                  <Box as={sortField === 'priority' ? (sortDirection === 'asc' ? ChevronDownIcon : ChevronRightIcon) : FunnelIcon} w={4} h={4} />
                }
                onClick={() => handleSort('priority')}
              >
                優先度 {sortField === 'priority' && (sortDirection === 'asc' ? '(低→高)' : '(高→低)')}
              </MenuItem>
              <MenuItem
                icon={
                  <Box as={sortField === 'createdAt' ? (sortDirection === 'asc' ? ChevronDownIcon : ChevronRightIcon) : CalendarDaysIcon} w={4} h={4} />
                }
                onClick={() => handleSort('createdAt')}
              >
                作成日 {sortField === 'createdAt' && (sortDirection === 'asc' ? '(昇順)' : '(降順)')}
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
        
        <HStack>
          <Text fontSize="sm">表示件数:</Text>
          <Select
            size="sm"
            width="70px"
            defaultValue="10"
            onChange={(e) => {
              // 表示件数変更の処理（実際にはここでAPIを呼び出し）
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
          
          <Stack spacing={4} direction={{ base: 'column', md: 'row' }}>
            <Box minW="200px">
              <Text fontWeight="medium" mb={2}>タスクの種類</Text>
              <Stack>
                <Checkbox 
                  isChecked={filters.types.includes('cooking')}
                  onChange={() => handleTaskTypeFilter('cooking')}
                >
                  <HStack>
                    <Box as={FireIcon} w={4} h={4} />
                    <Text>料理</Text>
                  </HStack>
                </Checkbox>
                <Checkbox 
                  isChecked={filters.types.includes('errand')}
                  onChange={() => handleTaskTypeFilter('errand')}
                >
                  <HStack>
                    <Box as={ShoppingBagIcon} w={4} h={4} />
                    <Text>お使い</Text>
                  </HStack>
                </Checkbox>
                <Checkbox 
                  isChecked={filters.types.includes('cleaning')}
                  onChange={() => handleTaskTypeFilter('cleaning')}
                >
                  <HStack>
                    <Box as={SparklesIcon} w={4} h={4} />
                    <Text>掃除</Text>
                  </HStack>
                </Checkbox>
                <Checkbox 
                  isChecked={filters.types.includes('other')}
                  onChange={() => handleTaskTypeFilter('other')}
                >
                  <HStack>
                    <Box as={DocumentTextIcon} w={4} h={4} />
                    <Text>その他</Text>
                  </HStack>
                </Checkbox>
              </Stack>
            </Box>
            
            <Divider orientation='vertical' />
            
            <Box minW="150px">
              <Text fontWeight="medium" mb={2}>優先度</Text>
              <Stack>
                <Checkbox 
                  isChecked={filters.priorities.includes('high')}
                  onChange={() => handlePriorityFilter('high')}
                >
                  <Badge colorScheme="red" px={2}>高</Badge>
                </Checkbox>
                <Checkbox 
                  isChecked={filters.priorities.includes('medium')}
                  onChange={() => handlePriorityFilter('medium')}
                >
                  <Badge colorScheme="orange" px={2}>中</Badge>
                </Checkbox>
                <Checkbox 
                  isChecked={filters.priorities.includes('low')}
                  onChange={() => handlePriorityFilter('low')}
                >
                  <Badge colorScheme="green" px={2}>低</Badge>
                </Checkbox>
              </Stack>
            </Box>
            
            <Divider orientation='vertical' />
            
            <Box>
              <Text fontWeight="medium" mb={2}>期限日</Text>
              <Stack spacing={3}>
                <FormControl>
                  <FormLabel fontSize="sm">開始日</FormLabel>
                  <Input
                    type="date"
                    value={filters.dueDateFrom}
                    onChange={(e) => setFilters({
                      ...filters,
                      dueDateFrom: e.target.value
                    })}
                    size="sm"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">終了日</FormLabel>
                  <Input
                    type="date"
                    value={filters.dueDateTo}
                    onChange={(e) => setFilters({
                      ...filters,
                      dueDateTo: e.target.value
                    })}
                    size="sm"
                  />
                </FormControl>
              </Stack>
            </Box>
          </Stack>
          
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
      
      {/* タスクテーブル */}
      <Box
        border="1px"
        borderColor={borderColor}
        borderRadius="md"
        overflow="hidden"
      >
        <Table variant="simple">
          <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
            <Tr>
              <Th>タスク</Th>
              <Th display={{ base: 'none', md: 'table-cell' }}>期限日</Th>
              <Th display={{ base: 'none', md: 'table-cell' }}>ユーザー</Th>
              <Th width="100px" textAlign="center">優先度</Th>
              <Th width="100px" textAlign="center">アクション</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <Tr>
                <Td colSpan={5} textAlign="center" py={10}>
                  <Spinner size="lg" />
                </Td>
              </Tr>
            ) : tasks.length === 0 ? (
              <Tr>
                <Td colSpan={5} textAlign="center" py={10}>
                  未完了のタスクはありません
                </Td>
              </Tr>
            ) : (
              tasks.map((task) => {
                const TypeIcon = getTaskTypeIcon(task.type);
                return (
                  <Tr 
                    key={task.id} 
                    cursor="pointer" 
                    _hover={{ bg: hoverBg }}
                    onClick={() => onTaskClick?.(task.id)}
                  >
                    <Td>
                      <HStack spacing={3}>
                        <Tooltip label={taskTypeLabels[task.type]}>
                          <Box as={TypeIcon} w={5} h={5} color="blue.500" />
                        </Tooltip>
                        <Box>
                          <Text fontWeight="medium">{task.title}</Text>
                          <Text 
                            fontSize="sm" 
                            color="gray.500" 
                            noOfLines={1}
                          >
                            {task.description}
                          </Text>
                        </Box>
                      </HStack>
                    </Td>
                    <Td display={{ base: 'none', md: 'table-cell' }}>
                      <Text>
                        {format(new Date(task.dueDate), 'yyyy/MM/dd', { locale: ja })}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {format(new Date(task.dueDate), 'HH:mm', { locale: ja })}
                      </Text>
                    </Td>
                    <Td display={{ base: 'none', md: 'table-cell' }}>
                      <HStack>
                        <Avatar size="xs" name={task.userName} src={task.userAvatarUrl} />
                        <Text fontSize="sm">{task.userName}</Text>
                      </HStack>
                    </Td>
                    <Td textAlign="center">
                      <Badge 
                        colorScheme={taskPriorityColors[task.priority]}
                        px={2}
                        py={1}
                        borderRadius="full"
                      >
                        {taskPriorityLabels[task.priority]}
                      </Badge>
                    </Td>
                    <Td textAlign="center">
                      <HStack spacing={2} justifyContent="center">
                        <Tooltip label="完了としてマーク">
                          <IconButton
                            aria-label="タスク完了"
                            icon={<Box as={CheckCircleIcon} w={5} h={5} />}
                            size="sm"
                            colorScheme="green"
                            variant="outline"
                            onClick={(e) => handleCompleteTask(task.id, e)}
                          />
                        </Tooltip>
                        
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            aria-label="アクションメニュー"
                            icon={<Box as={EllipsisVerticalIcon} w={4} h={4} />}
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <MenuList onClick={(e) => e.stopPropagation()}>
                            <MenuItem>詳細を表示</MenuItem>
                            <MenuItem>進行中にする</MenuItem>
                            <MenuItem>キャンセル</MenuItem>
                          </MenuList>
                        </Menu>
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

export default PendingTasksList;
