/**
 * リクエスト詳細表示コンポーネント
 * 特定のユーザーからのリクエストの詳細情報を表示する
 */
import { FC, useState } from 'react';
import { 
  Box, 
  VStack,
  HStack,
  Flex,
  Text, 
  Badge,
  Heading,
  Divider,
  Button,
  IconButton,
  Tag,
  TagLabel,
  TagLeftIcon,
  Avatar,
  Textarea,
  FormControl,
  FormLabel,
  useColorModeValue,
  useToast,
  Tooltip,
  Link,
  Image,
  Collapse,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  List,
  ListItem,
  ListIcon,
  Skeleton,
  SkeletonText,
  SkeletonCircle
} from '@chakra-ui/react';
import { 
  FireIcon, 
  ShoppingBagIcon, 
  DocumentTextIcon,
  ClockIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  LinkIcon,
  CheckIcon,
  CameraIcon,
  PencilIcon,
  ArrowTopRightOnSquareIcon,
  ExclamationCircleIcon,
  ArrowUturnLeftIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Request, RequestComment } from '../../types/request';

export interface RequestDetailsDisplayProps {
  /**
   * 表示するリクエスト情報
   */
  request?: Request;
  /**
   * データ読込中フラグ
   */
  isLoading?: boolean;
  /**
   * リクエスト更新中フラグ
   */
  isUpdating?: boolean;
  /**
   * コメント送信中フラグ
   */
  isSendingComment?: boolean;
  /**
   * ステータス更新時のコールバック
   */
  onStatusChange?: (requestId: string, newStatus: string) => void;
  /**
   * コメント追加時のコールバック
   */
  onAddComment?: (requestId: string, comment: string) => void;
  /**
   * 戻るボタンクリック時のコールバック
   */
  onBack?: () => void;
  /**
   * レシピ詳細表示時のコールバック
   */
  onViewRecipe?: (recipeUrl: string) => void;
  /**
   * タスク完了報告フォーム表示時のコールバック
   */
  onCompleteTask?: (requestId: string) => void;
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
 * 優先度のラベルを取得
 */
const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'high':
      return '高';
    case 'medium':
      return '中';
    case 'low':
      return '低';
    default:
      return '中';
  }
};

/**
 * リクエスト詳細表示コンポーネント
 */
export const RequestDetailsDisplay: FC<RequestDetailsDisplayProps> = ({
  request,
  isLoading = false,
  isUpdating = false,
  isSendingComment = false,
  onStatusChange,
  onAddComment,
  onBack,
  onViewRecipe,
  onCompleteTask
}) => {
  const [comment, setComment] = useState('');
  const toast = useToast();
  
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('white', 'gray.800');
  const cardBgColor = useColorModeValue('gray.50', 'gray.700');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const hoverColor = useColorModeValue('gray.100', 'gray.600');
  
  // コメント送信ハンドラー
  const handleSendComment = () => {
    if (!comment.trim()) {
      toast({
        title: 'コメントを入力してください',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (request && onAddComment) {
      onAddComment(request.id, comment);
      setComment('');
    }
  };
  
  // ステータス変更ハンドラー
  const handleStatusChange = (newStatus: string) => {
    if (request && onStatusChange) {
      onStatusChange(request.id, newStatus);
    }
  };
  
  // レシピ表示ハンドラー
  const handleViewRecipe = () => {
    if (request?.recipeUrl && onViewRecipe) {
      onViewRecipe(request.recipeUrl);
    }
  };
  
  // タスク完了報告ハンドラー
  const handleCompleteTask = () => {
    if (request && onCompleteTask) {
      onCompleteTask(request.id);
    }
  };
  
  // 料理リクエスト固有の情報を表示
  const renderCookingRequestInfo = () => {
    if (!request || request.type !== 'cooking') return null;
    
    return (
      <Box 
        p={4} 
        borderRadius="md" 
        border="1px" 
        borderColor={borderColor}
        bg={cardBgColor}
        mt={4}
      >
        <HStack spacing={3} mb={3}>
          <Box as={FireIcon} w={5} h={5} color="red.500" />
          <Heading size="sm">料理リクエスト情報</Heading>
        </HStack>
        
        <Divider mb={4} />
        
        {request.ingredients && request.ingredients.length > 0 && (
          <Box mb={4}>
            <Text fontWeight="medium" mb={2}>材料:</Text>
            <List spacing={1}>
              {request.ingredients.map((ingredient, index) => (
                <ListItem key={index} fontSize="sm" display="flex" alignItems="center">
                  <Box as={CheckIcon} w={4} h={4} color="green.500" mr={2} />
                  {ingredient}
                </ListItem>
              ))}
            </List>
          </Box>
        )}
        
        {request.recipeUrl && (
          <Box>
            <Text fontWeight="medium" mb={1}>レシピ情報:</Text>
            <HStack>
              <IconButton
                aria-label="レシピを見る"
                icon={<Box as={ArrowTopRightOnSquareIcon} w={4} h={4} />}
                size="sm"
                onClick={handleViewRecipe}
              />
              <Text fontSize="sm" color="blue.500">
                <Link href={request.recipeUrl} isExternal>
                  レシピを開く
                </Link>
              </Text>
            </HStack>
          </Box>
        )}
      </Box>
    );
  };
  
  // コメント一覧を表示
  const renderComments = () => {
    if (!request?.comments || request.comments.length === 0) {
      return (
        <Box 
          p={4} 
          borderRadius="md" 
          bg={cardBgColor}
          textAlign="center"
        >
          <Text color={mutedColor}>コメントはまだありません</Text>
        </Box>
      );
    }
    
    return request.comments.map((comment) => (
      <Box 
        key={comment.id}
        p={3}
        mb={3}
        borderRadius="md"
        borderWidth="1px"
        borderColor={borderColor}
        bg={comment.userType === 'helper' ? 'blue.50' : bgColor}
      >
        <HStack spacing={3} mb={2}>
          <Avatar size="sm" name={comment.userName} />
          <Box>
            <Text fontWeight="bold" fontSize="sm">
              {comment.userName}
              <Badge 
                ml={2} 
                colorScheme={comment.userType === 'user' ? 'green' : 'blue'}
                fontSize="xs"
              >
                {comment.userType === 'user' ? 'ユーザー' : 'ヘルパー'}
              </Badge>
            </Text>
            <Text fontSize="xs" color={mutedColor}>
              {format(new Date(comment.createdAt), 'yyyy/MM/dd HH:mm', { locale: ja })}
            </Text>
          </Box>
        </HStack>
        
        <Text fontSize="sm" whiteSpace="pre-line">
          {comment.content}
        </Text>
      </Box>
    ));
  };
  
  // ローディング中の表示
  if (isLoading) {
    return (
      <Box>
        <HStack mb={5}>
          <IconButton
            aria-label="戻る"
            icon={<Box as={ArrowUturnLeftIcon} w={5} h={5} />}
            size="sm"
            variant="outline"
            onClick={onBack}
          />
          <SkeletonText noOfLines={1} width="200px" skeletonHeight="6" />
        </HStack>
        
        <Box mb={5}>
          <SkeletonText noOfLines={2} spacing="4" skeletonHeight="4" />
        </Box>
        
        <Divider mb={5} />
        
        <Flex direction={{ base: 'column', md: 'row' }} gap={5}>
          <Box flex="3">
            <SkeletonText noOfLines={4} spacing="4" skeletonHeight="4" mb={5} />
            <SkeletonText noOfLines={3} spacing="4" skeletonHeight="4" mb={5} />
            <Skeleton height="200px" mb={5} />
          </Box>
          
          <Box flex="2">
            <Skeleton height="100px" mb={5} />
            <SkeletonText noOfLines={2} spacing="4" skeletonHeight="4" mb={5} />
            <Skeleton height="150px" />
          </Box>
        </Flex>
      </Box>
    );
  }
  
  // リクエストデータがない場合
  if (!request) {
    return (
      <Box 
        p={5} 
        textAlign="center" 
        borderRadius="md" 
        bg="red.50" 
        color="red.500"
      >
        <Box as={ExclamationCircleIcon} w={10} h={10} mx="auto" mb={3} />
        <Heading size="md" mb={2}>リクエストが見つかりません</Heading>
        <Text mb={5}>リクエストデータの取得に失敗しました。</Text>
        <Button 
          leftIcon={<Box as={ArrowUturnLeftIcon} w={5} h={5} />} 
          onClick={onBack}
        >
          戻る
        </Button>
      </Box>
    );
  }
  
  const TypeIcon = getRequestTypeIcon(request.type);
  const typeLabel = getRequestTypeLabel(request.type);
  
  return (
    <Box>
      {/* ヘッダー */}
      <Flex 
        justifyContent="space-between" 
        alignItems={{ base: 'flex-start', md: 'center' }}
        mb={4}
        flexDirection={{ base: 'column', md: 'row' }}
        gap={{ base: 3, md: 0 }}
      >
        <HStack>
          <IconButton
            aria-label="戻る"
            icon={<Box as={ArrowUturnLeftIcon} w={5} h={5} />}
            onClick={onBack}
            size="sm"
            variant="outline"
          />
          
          <Heading size="md">リクエスト詳細</Heading>
        </HStack>
        
        <HStack spacing={3}>
          <Badge 
            colorScheme={statusColors[request.status]} 
            fontSize="sm" 
            py={1} 
            px={3} 
            borderRadius="full"
          >
            {statusLabels[request.status]}
          </Badge>
          
          <Tag size="md" variant="subtle" colorScheme={request.priority === 'high' ? 'red' : request.priority === 'medium' ? 'blue' : 'gray'}>
            <TagLabel>優先度: {getPriorityLabel(request.priority)}</TagLabel>
          </Tag>
        </HStack>
      </Flex>
      
      <Divider mb={5} />
      
      <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
        {/* リクエスト詳細 */}
        <Box flex="3">
          <Card mb={5}>
            <CardHeader pb={0}>
              <HStack>
                <Box as={TypeIcon} w={5} h={5} color="blue.500" />
                <Heading size="md">{request.title}</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <Text>{request.description}</Text>
            </CardBody>
          </Card>
          
          {/* 料理リクエスト追加情報 */}
          {renderCookingRequestInfo()}
          
          {/* 添付画像 */}
          {request.images && request.images.length > 0 && (
            <Box mt={5}>
              <Heading size="sm" mb={3}>添付画像</Heading>
              <Flex wrap="wrap" gap={4}>
                {request.images.map((img, idx) => (
                  <Image 
                    key={idx} 
                    src={img} 
                    alt={`画像 ${idx+1}`} 
                    boxSize="200px" 
                    objectFit="cover" 
                    borderRadius="md"
                  />
                ))}
              </Flex>
            </Box>
          )}
          
          {/* コメント入力 */}
          <Box mt={6}>
            <Heading size="sm" mb={3}>
              <HStack>
                <Box as={ChatBubbleLeftRightIcon} w={5} h={5} />
                <Text>コメント</Text>
              </HStack>
            </Heading>
            
            <FormControl mb={3}>
              <Textarea
                placeholder="コメントを入力..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                resize="vertical"
                disabled={isSendingComment || request.status === 'cancelled'}
                rows={3}
              />
            </FormControl>
            
            <Flex justify="flex-end">
              <Button
                colorScheme="blue"
                onClick={handleSendComment}
                isLoading={isSendingComment}
                loadingText="送信中"
                isDisabled={comment.trim() === '' || request.status === 'cancelled'}
              >
                コメント送信
              </Button>
            </Flex>
            
            {/* コメント一覧 */}
            <Box mt={4}>
              {renderComments()}
            </Box>
          </Box>
        </Box>
        
        {/* サイドバー情報 */}
        <Box flex="2">
          <Card mb={5}>
            <CardHeader pb={0}>
              <Heading size="sm">リクエスト情報</Heading>
            </CardHeader>
            <CardBody>
              <List spacing={3}>
                <ListItem fontSize="sm">
                  <HStack>
                    <Box as={ClockIcon} w={4} h={4} color={mutedColor} />
                    <Text fontWeight="medium" width="80px">作成日時:</Text>
                    <Text>{format(new Date(request.createdAt), 'yyyy/MM/dd HH:mm', { locale: ja })}</Text>
                  </HStack>
                </ListItem>
                
                {request.dueDate && (
                  <ListItem fontSize="sm">
                    <HStack>
                      <Box as={ClockIcon} w={4} h={4} color={mutedColor} />
                      <Text fontWeight="medium" width="80px">期限:</Text>
                      <Text fontWeight="bold" color={new Date(request.dueDate) < new Date() ? 'red.500' : undefined}>
                        {format(new Date(request.dueDate), 'yyyy/MM/dd HH:mm', { locale: ja })}
                      </Text>
                    </HStack>
                  </ListItem>
                )}
                
                <ListItem fontSize="sm">
                  <HStack>
                    <Avatar size="xs" name={request.userName} />
                    <Text fontWeight="medium" width="80px">依頼者:</Text>
                    <Text>{request.userName}</Text>
                  </HStack>
                </ListItem>
                
                <ListItem fontSize="sm">
                  <HStack>
                    <Box as={TypeIcon} w={4} h={4} color={mutedColor} />
                    <Text fontWeight="medium" width="80px">種別:</Text>
                    <Text>{typeLabel}</Text>
                  </HStack>
                </ListItem>
              </List>
            </CardBody>
          </Card>
          
          {/* ステータス操作 */}
          <Card>
            <CardHeader pb={0}>
              <Heading size="sm">タスク操作</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {request.status === 'pending' && (
                  <Button
                    colorScheme="blue"
                    leftIcon={<Box as={PlayIcon} w={4} h={4} />}
                    onClick={() => handleStatusChange('in_progress')}
                    isLoading={isUpdating}
                    loadingText="更新中"
                    w="full"
                  >
                    作業開始
                  </Button>
                )}
                
                {request.status === 'in_progress' && (
                  <Button
                    colorScheme="green"
                    leftIcon={<Box as={CheckIcon} w={4} h={4} />}
                    onClick={handleCompleteTask}
                    w="full"
                  >
                    完了報告フォームを開く
                  </Button>
                )}
                
                {(request.status === 'pending' || request.status === 'in_progress') && (
                  <Button
                    colorScheme="red"
                    variant="outline"
                    leftIcon={<Box as={XMarkIcon} w={4} h={4} />}
                    onClick={() => handleStatusChange('cancelled')}
                    isLoading={isUpdating}
                    loadingText="更新中"
                    w="full"
                  >
                    キャンセル
                  </Button>
                )}
                
                {request.status === 'completed' && (
                  <Box 
                    p={3} 
                    bg="green.50" 
                    borderRadius="md" 
                    textAlign="center"
                  >
                    <Text color="green.500" fontWeight="medium">
                      このタスクは完了しています
                    </Text>
                  </Box>
                )}
                
                {request.status === 'cancelled' && (
                  <Box 
                    p={3} 
                    bg="gray.50" 
                    borderRadius="md" 
                    textAlign="center"
                  >
                    <Text color="gray.500" fontWeight="medium">
                      このタスクはキャンセルされました
                    </Text>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>
        </Box>
      </Flex>
    </Box>
  );
};

export default RequestDetailsDisplay;
