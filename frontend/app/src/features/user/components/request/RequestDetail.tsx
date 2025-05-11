import {
  Box,
  Button,
  Heading,
  HStack,
  Text,
  Badge,
  Stack,
  Flex,
  Divider,
  List,
  ListItem,
  ListIcon,
  VStack,
  IconButton,
  useColorModeValue,
  Grid,
  GridItem,
  Tag
} from "@chakra-ui/react";
import { format } from "date-fns";
import { FiCalendar, FiClock, FiTag, FiCheck, FiCheckCircle, FiExternalLink, FiEdit, FiTrash2 } from "react-icons/fi";
import { Link as RouterLink } from "react-router-dom";
import { 
  CookingRequest, 
  ErrandRequest, 
  RequestStatus, 
  RequestType, 
  Request as RequestModel
} from "../../types";

interface RequestDetailProps {
  request: RequestModel | CookingRequest | ErrandRequest;
  onEdit?: () => void;
  onDelete?: () => void;
  isLoading?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

/**
 * ステータスに応じたバッジのカラースキームとラベルを返す
 * 
 * @param {RequestStatus} status - リクエストのステータス
 * @returns {{colorScheme: string, label: string}} カラースキームとラベル
 */
const getStatusInfo = (status: RequestStatus): {colorScheme: string, label: string} => {
  switch (status) {
    case RequestStatus.PENDING:
      return { colorScheme: "yellow", label: "保留中" };
    case RequestStatus.ACCEPTED:
      return { colorScheme: "blue", label: "受付済み" };
    case RequestStatus.INPROGRESS:
      return { colorScheme: "orange", label: "進行中" };
    case RequestStatus.COMPLETED:
      return { colorScheme: "green", label: "完了" };
    case RequestStatus.CANCELLED:
      return { colorScheme: "red", label: "キャンセル" };
    case RequestStatus.REJECTED:
      return { colorScheme: "gray", label: "却下" };
    default:
      return { colorScheme: "gray", label: "不明" };
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
 * リクエスト詳細表示コンポーネント
 * リクエストの詳細情報を表示する
 * 
 * @param {RequestDetailProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} リクエスト詳細
 */
export const RequestDetail = ({
  request,
  onEdit,
  onDelete,
  isLoading = false,
  canEdit = true,
  canDelete = true
}: RequestDetailProps): JSX.Element => {
  const bgColor = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  
  // リクエストステータスの情報
  const statusInfo = getStatusInfo(request.status);
  
  // リクエスト種別に応じた詳細情報を判定
  const isCookingRequest = request.type === RequestType.COOKING && 'recipeDetails' in request;
  const isErrandRequest = request.type === RequestType.ERRAND && 'items' in request;
  
  // 料理リクエストの場合の型キャスト
  const cookingRequest = request as CookingRequest;
  
  // 買い物リクエストの場合の型キャスト
  const errandRequest = request as ErrandRequest;

  return (
    <Box
      bg={bgColor}
      borderRadius="lg"
      boxShadow="sm"
      p={6}
      borderWidth="1px"
      borderColor={borderColor}
    >
      <Flex justifyContent="space-between" alignItems="flex-start" mb={4}>
        <Heading as="h1" size="lg" mb={2}>
          {request.title}
        </Heading>
        
        <HStack>
          {canEdit && onEdit && (
            <IconButton
              aria-label="編集"
              icon={<FiEdit />}
              colorScheme="blue"
              variant="outline"
              onClick={onEdit}
              isDisabled={isLoading || request.status === RequestStatus.COMPLETED}
            />
          )}
          {canDelete && onDelete && (
            <IconButton
              aria-label="削除"
              icon={<FiTrash2 />}
              colorScheme="red"
              variant="outline"
              onClick={onDelete}
              isDisabled={
                isLoading || 
                request.status === RequestStatus.INPROGRESS || 
                request.status === RequestStatus.COMPLETED
              }
            />
          )}
        </HStack>
      </Flex>

      {/* リクエスト基本情報 */}
      <Grid templateColumns="repeat(12, 1fr)" gap={4} mb={6}>
        <GridItem colSpan={{ base: 12, md: 6, lg: 3 }}>
          <Stack spacing={1}>
            <Text color="gray.500" fontSize="sm">
              ステータス
            </Text>
            <Badge colorScheme={statusInfo.colorScheme} fontSize="md" px={2} py={1} borderRadius="md">
              {statusInfo.label}
            </Badge>
          </Stack>
        </GridItem>
        
        <GridItem colSpan={{ base: 12, md: 6, lg: 3 }}>
          <Stack spacing={1}>
            <Text color="gray.500" fontSize="sm">
              <HStack>
                <FiTag />
                <Text>タイプ</Text>
              </HStack>
            </Text>
            <Text>{getTypeLabel(request.type)}</Text>
          </Stack>
        </GridItem>
        
        <GridItem colSpan={{ base: 12, md: 6, lg: 3 }}>
          <Stack spacing={1}>
            <Text color="gray.500" fontSize="sm">
              <HStack>
                <FiCalendar />
                <Text>予定日</Text>
              </HStack>
            </Text>
            <Text>{format(new Date(request.scheduledDate), "yyyy年MM月dd日")}</Text>
          </Stack>
        </GridItem>
        
        <GridItem colSpan={{ base: 12, md: 6, lg: 3 }}>
          <Stack spacing={1}>
            <Text color="gray.500" fontSize="sm">
              <HStack>
                <FiClock />
                <Text>予想所要時間</Text>
              </HStack>
            </Text>
            <Text>{request.estimatedDuration || "未設定"} {request.estimatedDuration ? "分" : ""}</Text>
          </Stack>
        </GridItem>
      </Grid>

      {/* 説明 */}
      <Box mb={6}>
        <Text fontWeight="medium" mb={2}>
          説明
        </Text>
        <Box borderWidth="1px" borderRadius="md" p={4} bg={useColorModeValue("gray.50", "gray.600")}>
          <Text whiteSpace="pre-wrap">{request.description}</Text>
        </Box>
      </Box>

      {/* リクエストタイプ別の詳細情報 */}
      <Divider my={6} />

      {/* 料理リクエストの詳細 */}
      {isCookingRequest && (
        <>
          <Heading as="h2" size="md" mb={4}>
            料理の詳細情報
          </Heading>

          {cookingRequest.recipeUrl && (
            <Box mb={4}>
              <Text fontWeight="medium" mb={2}>
                レシピURL
              </Text>
              <Button
                as="a"
                href={cookingRequest.recipeUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
                size="sm"
                leftIcon={<FiExternalLink />}
              >
                レシピを開く
              </Button>
            </Box>
          )}

          {cookingRequest.recipeDetails && (
            <>
              <Box mb={4}>
                <Text fontWeight="medium" mb={2}>
                  レシピ名
                </Text>
                <Text>{cookingRequest.recipeDetails.name}</Text>
              </Box>

              <HStack mb={4} spacing={10}>
                <Box>
                  <Text fontWeight="medium" mb={2}>
                    人数
                  </Text>
                  <Text>{cookingRequest.recipeDetails.servings}人分</Text>
                </Box>

                <Box>
                  <Text fontWeight="medium" mb={2}>
                    調理時間
                  </Text>
                  <Text>{cookingRequest.recipeDetails.cookingTime}分</Text>
                </Box>
              </HStack>

              <Box mb={4}>
                <Text fontWeight="medium" mb={2}>
                  材料
                </Text>
                <Grid templateColumns="repeat(12, 1fr)" gap={2}>
                  {cookingRequest.recipeDetails.ingredients.map((ingredient, index) => (
                    <GridItem key={index} colSpan={{ base: 12, md: 6, lg: 4 }}>
                      <HStack
                        p={2}
                        borderWidth="1px"
                        borderRadius="md"
                        borderColor="gray.200"
                      >
                        <Text flex="1">{ingredient.name}</Text>
                        {ingredient.quantity && ingredient.unit && (
                          <Tag size="sm">
                            {ingredient.quantity} {ingredient.unit}
                          </Tag>
                        )}
                      </HStack>
                    </GridItem>
                  ))}
                </Grid>
              </Box>

              <Box mb={4}>
                <Text fontWeight="medium" mb={2}>
                  調理手順
                </Text>
                <List spacing={3}>
                  {cookingRequest.recipeDetails.instructions.map((instruction, index) => (
                    <ListItem key={index} p={2} bg="gray.50" borderRadius="md">
                      <HStack align="flex-start">
                        <ListIcon as={FiCheckCircle} color="green.500" mt={1} />
                        <Text>{instruction}</Text>
                      </HStack>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </>
          )}

          {cookingRequest.dietaryRestrictions && cookingRequest.dietaryRestrictions.length > 0 && (
            <Box mb={4}>
              <Text fontWeight="medium" mb={2}>
                食事制限
              </Text>
              <HStack spacing={2} flexWrap="wrap">
                {cookingRequest.dietaryRestrictions.map((restriction, index) => (
                  <Tag key={index} colorScheme="red" size="md">
                    {restriction}
                  </Tag>
                ))}
              </HStack>
            </Box>
          )}
        </>
      )}

      {/* 買い物リクエストの詳細 */}
      {isErrandRequest && (
        <>
          <Heading as="h2" size="md" mb={4}>
            買い物の詳細情報
          </Heading>

          {errandRequest.location && (
            <Box mb={4}>
              <Text fontWeight="medium" mb={2}>
                買い物場所
              </Text>
              <Text>{errandRequest.location}</Text>
            </Box>
          )}

          <Box mb={4}>
            <Text fontWeight="medium" mb={2}>
              予算
            </Text>
            <Text>{errandRequest.budget?.toLocaleString() || "未設定"} {errandRequest.budget ? "円" : ""}</Text>
          </Box>

          <Box mb={4}>
            <Text fontWeight="medium" mb={2}>
              買い物リスト
            </Text>
            {errandRequest.items && errandRequest.items.length > 0 ? (
              <List spacing={2}>
                {errandRequest.items.map((item, index) => (
                  <ListItem key={index}>
                    <HStack>
                      <ListIcon as={FiCheck} color="green.500" />
                      <Text>{item}</Text>
                    </HStack>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Text color="gray.500">買い物項目が指定されていません</Text>
            )}
          </Box>
        </>
      )}

      {/* 作成日/更新日 */}
      <Divider my={6} />
      <HStack justifyContent="space-between" fontSize="sm" color="gray.500">
        <Text>作成日: {format(new Date(request.createdAt), "yyyy年MM月dd日 HH:mm")}</Text>
        <Text>更新日: {format(new Date(request.updatedAt), "yyyy年MM月dd日 HH:mm")}</Text>
      </HStack>
    </Box>
  );
};
