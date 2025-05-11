/**
 * 担当ユーザー一覧表示コンポーネント
 * ヘルパーが担当しているユーザーを一覧で表示する
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
  Link
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { User } from '../../types/user';

export interface AssignedUsersListProps {
  /**
   * 表示するユーザーリスト
   */
  users: User[];
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
   * ユーザーをクリックした時のコールバック
   */
  onUserClick?: (userId: string) => void;
}

/**
 * 担当ユーザー一覧表示コンポーネント
 */
export const AssignedUsersList: FC<AssignedUsersListProps> = ({
  users,
  isLoading = false,
  totalItems = 0,
  currentPage = 1,
  itemsPerPage = 10,
  onPageChange,
  onSearch,
  onUserClick
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  
  // ページ総数を計算
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // 検索実行
  const handleSearch = () => {
    onSearch?.(searchKeyword);
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
              placeholder="ユーザーを検索..."
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
      
      {/* ユーザーテーブル */}
      <Box
        border="1px"
        borderColor={borderColor}
        borderRadius="md"
        overflow="hidden"
      >
        <Table variant="simple">
          <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
            <Tr>
              <Th>名前</Th>
              <Th display={{ base: 'none', md: 'table-cell' }}>住所</Th>
              <Th display={{ base: 'none', md: 'table-cell' }}>連絡先</Th>
              <Th>未処理</Th>
              <Th>アクション</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <Tr>
                <Td colSpan={5} textAlign="center" py={10}>
                  <Spinner size="lg" />
                </Td>
              </Tr>
            ) : users.length === 0 ? (
              <Tr>
                <Td colSpan={5} textAlign="center" py={10}>
                  担当ユーザーがいません
                </Td>
              </Tr>
            ) : (
              users.map((user) => (
                <Tr 
                  key={user.id} 
                  cursor="pointer" 
                  _hover={{ bg: hoverBg }}
                  onClick={() => onUserClick?.(user.id)}
                >
                  <Td>
                    <HStack spacing={3}>
                      <Avatar size="sm" name={user.name} src={user.avatarUrl} />
                      <Text>{user.name}</Text>
                    </HStack>
                  </Td>
                  <Td display={{ base: 'none', md: 'table-cell' }}>{user.address}</Td>
                  <Td display={{ base: 'none', md: 'table-cell' }}>{user.phone}</Td>
                  <Td>
                    {user.pendingRequests > 0 ? (
                      <Badge colorScheme={user.pendingRequests > 2 ? 'red' : 'orange'} borderRadius="full" px={2}>
                        {user.pendingRequests}
                      </Badge>
                    ) : (
                      <Badge colorScheme="green" borderRadius="full" px={2}>
                        なし
                      </Badge>
                    )}
                  </Td>
                  <Td>
                    <Link as={RouterLink} to={`/helper/users/${user.id}`}>
                      <Button size="sm" colorScheme="blue">
                        詳細
                      </Button>
                    </Link>
                  </Td>
                </Tr>
              ))
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

export default AssignedUsersList;
