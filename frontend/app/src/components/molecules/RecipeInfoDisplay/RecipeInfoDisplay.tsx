/**
 * レシピ情報表示コンポーネント
 * 料理リクエストのレシピ情報を表示する
 */
import { FC, useState } from 'react';
import { 
  Box, 
  VStack, 
  HStack,
  Flex,
  Text,
  Heading,
  Image,
  Badge,
  List,
  ListItem,
  ListIcon,
  OrderedList,
  UnorderedList,
  Divider,
  Button,
  IconButton,
  Link,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Spinner,
  Skeleton,
  SkeletonText,
  Card,
  CardHeader,
  CardBody,
  Tag,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { 
  ClockIcon,
  UserIcon,
  FireIcon,
  ShieldCheckIcon,
  ScaleIcon,
  BeakerIcon,
  ArrowUturnLeftIcon,
  PrinterIcon,
  CheckIcon,
  ExclamationCircleIcon,
  BookOpenIcon,
  LinkIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

export interface RecipeInfo {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  servings: number;
  cookingTime: number; // 分単位
  difficultyLevel: 'easy' | 'medium' | 'hard';
  calories?: number;
  sourceUrl?: string;
  author?: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  tips?: string[];
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    sugar?: number;
    sodium?: number;
  };
}

export interface RecipeIngredient {
  name: string;
  amount: string;
  optional?: boolean;
  substitute?: string;
}

export interface RecipeStep {
  order: number;
  description: string;
  imageUrl?: string;
  tip?: string;
  timer?: number; // タイマー設定（秒）
}

export interface RecipeInfoDisplayProps {
  /**
   * レシピ情報
   */
  recipe?: RecipeInfo;
  /**
   * データ読込中フラグ
   */
  isLoading?: boolean;
  /**
   * エラーメッセージ
   */
  error?: string;
  /**
   * 戻るボタンクリック時のコールバック
   */
  onBack?: () => void;
  /**
   * 印刷ボタンクリック時のコールバック
   */
  onPrint?: () => void;
  /**
   * レシピのソースを開くときのコールバック
   */
  onOpenSource?: (url: string) => void;
}

/**
 * レシピ情報表示コンポーネント
 */
export const RecipeInfoDisplay: FC<RecipeInfoDisplayProps> = ({
  recipe,
  isLoading = false,
  error,
  onBack,
  onPrint,
  onOpenSource
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headingColor = useColorModeValue('gray.700', 'white');
  const cardBgColor = useColorModeValue('gray.50', 'gray.700');
  const activeStepBg = useColorModeValue('blue.50', 'blue.900');
  const activeStepBorder = useColorModeValue('blue.500', 'blue.200');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  
  // 調理時間の表示形式を整える
  const formatCookingTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}分`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}時間${remainingMinutes > 0 ? ` ${remainingMinutes}分` : ''}`;
  };
  
  // 難易度表示
  const getDifficultyLabel = (level: string) => {
    switch (level) {
      case 'easy':
        return '簡単';
      case 'medium':
        return '普通';
      case 'hard':
        return '難しい';
      default:
        return '普通';
    }
  };
  
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy':
        return 'green';
      case 'medium':
        return 'blue';
      case 'hard':
        return 'red';
      default:
        return 'blue';
    }
  };
  
  // ステップをクリックしたときの処理
  const handleStepClick = (index: number) => {
    setActiveStepIndex(activeStepIndex === index ? null : index);
  };
  
  // ソースURLを開く処理
  const handleOpenSource = () => {
    if (recipe?.sourceUrl && onOpenSource) {
      onOpenSource(recipe.sourceUrl);
    }
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
          <Skeleton height="30px" width="200px" />
        </HStack>
        
        <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
          <Box flex="3">
            <Skeleton height="300px" mb={6} />
            <SkeletonText mt="4" noOfLines={4} spacing="4" skeletonHeight="3" />
          </Box>
          
          <Box flex="2">
            <Skeleton height="150px" mb={6} />
            <SkeletonText mt="4" noOfLines={6} spacing="4" skeletonHeight="3" />
          </Box>
        </Flex>
      </Box>
    );
  }
  
  // エラーの表示
  if (error) {
    return (
      <Box 
        p={5} 
        textAlign="center" 
        borderRadius="md" 
        bg="red.50" 
        color="red.500"
      >
        <Box as={ExclamationCircleIcon} w={10} h={10} mx="auto" mb={3} />
        <Heading size="md" mb={2}>レシピ情報の読み込みに失敗しました</Heading>
        <Text mb={5}>{error}</Text>
        <Button 
          leftIcon={<Box as={ArrowUturnLeftIcon} w={5} h={5} />} 
          onClick={onBack}
        >
          戻る
        </Button>
      </Box>
    );
  }
  
  // レシピデータがない場合
  if (!recipe) {
    return (
      <Box 
        p={5} 
        textAlign="center" 
        borderRadius="md" 
        bg="orange.50" 
        color="orange.500"
      >
        <Box as={BookOpenIcon} w={10} h={10} mx="auto" mb={3} />
        <Heading size="md" mb={2}>レシピ情報がありません</Heading>
        <Text mb={5}>このリクエストにはレシピ情報が登録されていません。</Text>
        <Button 
          leftIcon={<Box as={ArrowUturnLeftIcon} w={5} h={5} />} 
          onClick={onBack}
        >
          戻る
        </Button>
      </Box>
    );
  }
  
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
          
          <Heading size="md" color={headingColor}>レシピ詳細</Heading>
        </HStack>
        
        <HStack spacing={3}>
          <IconButton
            aria-label="印刷"
            icon={<Box as={PrinterIcon} w={5} h={5} />}
            onClick={onPrint}
            size="sm"
            variant="outline"
          />
          
          {recipe.sourceUrl && (
            <Button
              leftIcon={<Box as={LinkIcon} w={4} h={4} />}
              size="sm"
              variant="outline"
              onClick={handleOpenSource}
            >
              元のレシピを開く
            </Button>
          )}
        </HStack>
      </Flex>
      
      <Divider mb={6} />
      
      <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
        {/* メイン情報 */}
        <Box flex="3">
          {/* レシピタイトルと画像 */}
          <Heading 
            as="h1" 
            size="lg" 
            mb={4}
            color={headingColor}
            textAlign={{ base: 'center', md: 'left' }}
          >
            {recipe.title}
          </Heading>
          
          {recipe.imageUrl && (
            <Box 
              mb={5}
              borderRadius="md" 
              overflow="hidden"
            >
              <Image
                src={recipe.imageUrl}
                alt={recipe.title}
                objectFit="cover"
                w="full"
                h={{ base: "200px", md: "300px" }}
              />
            </Box>
          )}
          
          {/* 説明 */}
          {recipe.description && (
            <Box mb={5}>
              <Text fontSize="md">{recipe.description}</Text>
            </Box>
          )}
          
          {/* レシピ情報 */}
          <Flex 
            wrap="wrap" 
            gap={4} 
            mb={6}
            bg={cardBgColor}
            p={4}
            borderRadius="md"
            justifyContent={{ base: 'center', md: 'flex-start' }}
          >
            <Box textAlign="center" minW="100px">
              <Box as={ClockIcon} w={6} h={6} mx="auto" mb={1} color="blue.500" />
              <Text fontWeight="bold" fontSize="md">調理時間</Text>
              <Text fontSize="sm">{formatCookingTime(recipe.cookingTime)}</Text>
            </Box>
            
            <Box textAlign="center" minW="100px">
              <Box as={UserIcon} w={6} h={6} mx="auto" mb={1} color="purple.500" />
              <Text fontWeight="bold" fontSize="md">人数</Text>
              <Text fontSize="sm">{recipe.servings}人分</Text>
            </Box>
            
            <Box textAlign="center" minW="100px">
              <Box as={ScaleIcon} w={6} h={6} mx="auto" mb={1} color="orange.500" />
              <Text fontWeight="bold" fontSize="md">難易度</Text>
              <Badge colorScheme={getDifficultyColor(recipe.difficultyLevel)}>
                {getDifficultyLabel(recipe.difficultyLevel)}
              </Badge>
            </Box>
            
            {recipe.calories && (
              <Box textAlign="center" minW="100px">
                <Box as={FireIcon} w={6} h={6} mx="auto" mb={1} color="red.500" />
                <Text fontWeight="bold" fontSize="md">カロリー</Text>
                <Text fontSize="sm">{recipe.calories}kcal</Text>
              </Box>
            )}
          </Flex>
          
          {/* 調理手順 */}
          <Box mb={6}>
            <Heading as="h2" size="md" mb={4} color={headingColor}>
              調理手順
            </Heading>
            
            <VStack spacing={4} align="stretch">
              {recipe.steps.map((step, index) => (
                <Box
                  key={index}
                  p={4}
                  border="1px"
                  borderColor={activeStepIndex === index ? activeStepBorder : borderColor}
                  borderRadius="md"
                  bg={activeStepIndex === index ? activeStepBg : bgColor}
                  onClick={() => handleStepClick(index)}
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ bg: activeStepIndex === index ? activeStepBg : useColorModeValue('gray.50', 'gray.700') }}
                >
                  <Flex gap={3}>
                    <Box
                      minW="30px"
                      h="30px"
                      borderRadius="full"
                      bg={useColorModeValue('blue.500', 'blue.400')}
                      color="white"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontWeight="bold"
                      fontSize="sm"
                    >
                      {step.order}
                    </Box>
                    
                    <Box flex="1">
                      <Text>{step.description}</Text>
                      
                      {step.tip && activeStepIndex === index && (
                        <Box 
                          mt={3} 
                          p={3} 
                          bg={useColorModeValue('yellow.50', 'yellow.900')}
                          borderRadius="md"
                        >
                          <Text fontSize="sm" fontStyle="italic">
                            <Text as="span" fontWeight="bold" mr={1}>ヒント:</Text>
                            {step.tip}
                          </Text>
                        </Box>
                      )}
                      
                      {step.imageUrl && activeStepIndex === index && (
                        <Box mt={3}>
                          <Image 
                            src={step.imageUrl} 
                            alt={`手順 ${step.order}`} 
                            borderRadius="md"
                            maxH="200px"
                          />
                        </Box>
                      )}
                      
                      {step.timer && activeStepIndex === index && (
                        <Button
                          mt={3}
                          leftIcon={<Box as={ClockIcon} w={4} h={4} />}
                          size="sm"
                          colorScheme="blue"
                          variant="outline"
                        >
                          {Math.floor(step.timer / 60)}分{step.timer % 60 > 0 ? `${step.timer % 60}秒` : ''}のタイマーをセット
                        </Button>
                      )}
                    </Box>
                  </Flex>
                </Box>
              ))}
            </VStack>
          </Box>
          
          {/* 調理のコツ */}
          {recipe.tips && recipe.tips.length > 0 && (
            <Box mb={6}>
              <Heading as="h2" size="md" mb={3} color={headingColor}>
                調理のコツ
              </Heading>
              
              <Card>
                <CardBody>
                  <UnorderedList spacing={2}>
                    {recipe.tips.map((tip, index) => (
                      <ListItem key={index}>{tip}</ListItem>
                    ))}
                  </UnorderedList>
                </CardBody>
              </Card>
            </Box>
          )}
        </Box>
        
        {/* 材料表示 */}
        <Box flex="2">
          <Card mb={6}>
            <CardHeader pb={2}>
              <Heading size="md" color={headingColor}>材料</Heading>
              <Text fontSize="sm" color={mutedColor}>
                {recipe.servings}人分
              </Text>
            </CardHeader>
            
            <CardBody pt={0}>
              <Divider mb={4} />
              
              <List spacing={2}>
                {recipe.ingredients.map((ingredient, index) => (
                  <ListItem
                    key={index}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    py={1}
                    borderBottom="1px"
                    borderColor="gray.100"
                  >
                    <HStack>
                      <ListIcon
                        as={CheckIcon}
                        color={ingredient.optional ? 'gray.400' : 'green.500'}
                      />
                      <Text 
                        fontSize="sm" 
                        fontWeight={ingredient.optional ? 'normal' : 'medium'}
                        color={ingredient.optional ? mutedColor : undefined}
                      >
                        {ingredient.name}
                        {ingredient.optional && (
                          <Text as="span" fontSize="xs" ml={1} color={mutedColor}>(任意)</Text>
                        )}
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color={mutedColor}>{ingredient.amount}</Text>
                  </ListItem>
                ))}
              </List>
              
              {/* 代替材料がある場合の表示 */}
              {recipe.ingredients.some(ing => ing.substitute) && (
                <Box mt={4}>
                  <Text fontSize="sm" fontWeight="medium" mb={1}>代替材料:</Text>
                  <List fontSize="xs" spacing={1} color={mutedColor}>
                    {recipe.ingredients
                      .filter(ing => ing.substitute)
                      .map((ing, index) => (
                        <ListItem key={index}>
                          ・{ing.name} → {ing.substitute}
                        </ListItem>
                      ))
                    }
                  </List>
                </Box>
              )}
            </CardBody>
          </Card>
          
          {/* 栄養情報 */}
          {recipe.nutrition && (
            <Card>
              <CardHeader pb={0}>
                <Heading size="md" color={headingColor}>栄養情報</Heading>
                <Text fontSize="sm" color={mutedColor}>1人分あたりの概算</Text>
              </CardHeader>
              
              <CardBody>
                <Box>
                  {recipe.nutrition.calories && (
                    <HStack 
                      justify="space-between" 
                      py={2} 
                      borderBottom="1px" 
                      borderColor="gray.100"
                    >
                      <Text fontSize="sm">カロリー</Text>
                      <Text fontSize="sm" fontWeight="medium">{recipe.nutrition.calories}kcal</Text>
                    </HStack>
                  )}
                  
                  {recipe.nutrition.protein && (
                    <HStack 
                      justify="space-between" 
                      py={2} 
                      borderBottom="1px" 
                      borderColor="gray.100"
                    >
                      <Text fontSize="sm">タンパク質</Text>
                      <Text fontSize="sm">{recipe.nutrition.protein}g</Text>
                    </HStack>
                  )}
                  
                  {recipe.nutrition.carbs && (
                    <HStack 
                      justify="space-between" 
                      py={2} 
                      borderBottom="1px" 
                      borderColor="gray.100"
                    >
                      <Text fontSize="sm">炭水化物</Text>
                      <Text fontSize="sm">{recipe.nutrition.carbs}g</Text>
                    </HStack>
                  )}
                  
                  {recipe.nutrition.fat && (
                    <HStack 
                      justify="space-between" 
                      py={2} 
                      borderBottom="1px" 
                      borderColor="gray.100"
                    >
                      <Text fontSize="sm">脂質</Text>
                      <Text fontSize="sm">{recipe.nutrition.fat}g</Text>
                    </HStack>
                  )}
                  
                  {recipe.nutrition.sugar && (
                    <HStack 
                      justify="space-between" 
                      py={2} 
                      borderBottom="1px" 
                      borderColor="gray.100"
                    >
                      <Text fontSize="sm">糖質</Text>
                      <Text fontSize="sm">{recipe.nutrition.sugar}g</Text>
                    </HStack>
                  )}
                  
                  {recipe.nutrition.sodium && (
                    <HStack 
                      justify="space-between" 
                      py={2} 
                      borderColor="gray.100"
                    >
                      <Text fontSize="sm">塩分</Text>
                      <Text fontSize="sm">{recipe.nutrition.sodium}mg</Text>
                    </HStack>
                  )}
                </Box>
              </CardBody>
            </Card>
          )}
          
          {/* 作者情報 */}
          {recipe.author && (
            <Box mt={4} fontSize="sm" textAlign="right" color={mutedColor}>
              レシピ提供: {recipe.author}
            </Box>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export default RecipeInfoDisplay;
