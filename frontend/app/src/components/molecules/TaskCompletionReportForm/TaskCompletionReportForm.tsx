/**
 * タスク完了報告フォームコンポーネント
 * ヘルパーがタスク完了時のレポートを作成するためのフォーム
 */
import { FC, useState, useRef } from 'react';
import { 
  Box, 
  VStack, 
  HStack,
  Flex,
  Text, 
  Heading,
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  Input,
  Textarea,
  Button,
  IconButton,
  Switch,
  Checkbox,
  Select,
  RadioGroup,
  Radio,
  Image,
  Badge,
  Divider,
  useColorModeValue,
  useToast,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Spinner,
  Alert,
  AlertIcon,
  CloseButton,
  TabPanels,
  TabPanel,
  Tabs,
  TabList,
  Tab,
  Stack
} from '@chakra-ui/react';
import { 
  ArrowUturnLeftIcon, 
  PaperAirplaneIcon, 
  XMarkIcon, 
  PhotoIcon, 
  TrashIcon, 
  PlusIcon, 
  ExclamationTriangleIcon, 
  StarIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

import { Request } from '../../types/request';

export interface TaskCompletionFormData {
  /**
   * タスクID
   */
  taskId: string;
  /**
   * 完了日時
   */
  completedAt: string;
  /**
   * 作業詳細
   */
  workDetails: string;
  /**
   * 使用した材料（料理リクエストの場合）
   */
  materialsUsed?: string;
  /**
   * 特記事項
   */
  specialNotes?: string;
  /**
   * 次回への提案
   */
  suggestionsForNext?: string;
  /**
   * 添付画像のID一覧
   */
  imageIds?: string[];
  /**
   * タスク満足度（1-5）
   */
  satisfactionLevel?: number;
  /**
   * タスク完了の証明チェックリスト
   */
  completionChecklist: {
    /**
     * タスク指示通り完了
     */
    taskCompletedAsRequested: boolean;
    /**
     * 安全に配慮
     */
    safetyMeasuresTaken: boolean;
    /**
     * 清掃完了
     */
    cleanupCompleted: boolean;
  };
}

export interface TaskCompletionReportFormProps {
  /**
   * 対象リクエスト情報
   */
  request?: Request;
  /**
   * データ読込中フラグ
   */
  isLoading?: boolean;
  /**
   * 送信中フラグ
   */
  isSubmitting?: boolean;
  /**
   * フォーム送信時のコールバック
   */
  onSubmit?: (formData: TaskCompletionFormData) => void;
  /**
   * キャンセル時のコールバック
   */
  onCancel?: () => void;
  /**
   * 画像アップロードのコールバック
   * 成功時にはIDを返すことを想定
   */
  onImageUpload?: (file: File) => Promise<string>;
  /**
   * 画像削除のコールバック
   */
  onImageDelete?: (imageId: string) => Promise<void>;
}

/**
 * タスク完了報告フォームコンポーネント
 */
export const TaskCompletionReportForm: FC<TaskCompletionReportFormProps> = ({
  request,
  isLoading = false,
  isSubmitting = false,
  onSubmit,
  onCancel,
  onImageUpload,
  onImageDelete
}) => {
  // フォームの状態
  const [formData, setFormData] = useState<TaskCompletionFormData>({
    taskId: request?.id || '',
    completedAt: new Date().toISOString().slice(0, 16), // YYYY-MM-DDThh:mm
    workDetails: '',
    materialsUsed: '',
    specialNotes: '',
    suggestionsForNext: '',
    imageIds: [],
    satisfactionLevel: 5,
    completionChecklist: {
      taskCompletedAsRequested: false,
      safetyMeasuresTaken: false,
      cleanupCompleted: false
    }
  });
  
  // アップロードした画像プレビュー用の状態
  const [uploadedImages, setUploadedImages] = useState<{id: string, url: string}[]>([]);
  
  // 画像アップロード中の状態
  const [isUploading, setIsUploading] = useState(false);
  
  // バリデーションエラーの状態
  const [errors, setErrors] = useState<Partial<Record<keyof TaskCompletionFormData, string>>>({});
  
  // ファイル入力用のref
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // トースト通知
  const toast = useToast();
  
  // スタイルに関する変数
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const errorColor = useColorModeValue('red.500', 'red.300');
  
  // フォーム入力変更ハンドラ
  const handleChange = (
    field: keyof TaskCompletionFormData, 
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // エラー状態をクリア
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };
  
  // チェックリスト項目変更ハンドラ
  const handleChecklistChange = (
    field: keyof TaskCompletionFormData['completionChecklist'], 
    checked: boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      completionChecklist: {
        ...prev.completionChecklist,
        [field]: checked
      }
    }));
  };
  
  // 画像アップロードハンドラ
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !onImageUpload) return;
    
    try {
      setIsUploading(true);
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // ファイルサイズのチェック（10MB以下）
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: 'ファイルサイズエラー',
            description: `${file.name} は10MB以上あります。より小さいファイルを選択してください。`,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          continue;
        }
        
        // ファイルタイプのチェック
        if (!file.type.startsWith('image/')) {
          toast({
            title: 'ファイル形式エラー',
            description: `${file.name} は画像ファイルではありません。`,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          continue;
        }
        
        // 画像のアップロード
        const imageId = await onImageUpload(file);
        
        // 画像のURLを生成（実際のシステムではサーバーからURLを取得する）
        const imageUrl = URL.createObjectURL(file);
        
        // アップロードした画像をプレビューに追加
        setUploadedImages(prev => [...prev, { id: imageId, url: imageUrl }]);
        
        // フォームデータに画像IDを追加
        setFormData(prev => ({
          ...prev,
          imageIds: [...(prev.imageIds || []), imageId]
        }));
      }
      
      // ファイル入力をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      toast({
        title: '画像アップロードエラー',
        description: 'アップロード中にエラーが発生しました。再度お試しください。',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Image upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };
  
  // 画像削除ハンドラ
  const handleImageDelete = async (imageId: string) => {
    try {
      if (onImageDelete) {
        await onImageDelete(imageId);
      }
      
      // プレビューから削除
      setUploadedImages(prev => prev.filter(img => img.id !== imageId));
      
      // フォームデータからIDを削除
      setFormData(prev => ({
        ...prev,
        imageIds: (prev.imageIds || []).filter(id => id !== imageId)
      }));
      
    } catch (error) {
      toast({
        title: '画像削除エラー',
        description: '画像の削除中にエラーが発生しました。',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Image delete error:', error);
    }
  };
  
  // フォーム送信ハンドラ
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    const newErrors: Partial<Record<keyof TaskCompletionFormData, string>> = {};
    
    if (!formData.workDetails.trim()) {
      newErrors.workDetails = '作業内容を入力してください';
    }
    
    if (request?.type === 'cooking' && !formData.materialsUsed?.trim()) {
      newErrors.materialsUsed = '使用した材料を入力してください';
    }
    
    // チェックリストの確認
    if (!formData.completionChecklist.taskCompletedAsRequested) {
      newErrors.completionChecklist = 'タスクが指示通りに完了したことを確認してください';
    }
    
    if (!formData.completionChecklist.safetyMeasuresTaken) {
      newErrors.completionChecklist = newErrors.completionChecklist || '安全対策を確認してください';
    }
    
    if (!formData.completionChecklist.cleanupCompleted) {
      newErrors.completionChecklist = newErrors.completionChecklist || '清掃完了を確認してください';
    }
    
    // エラーがあれば表示して送信しない
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      
      toast({
        title: '入力エラー',
        description: '必須項目を入力してください',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      return;
    }
    
    // フォーム送信
    if (onSubmit) {
      onSubmit(formData);
    }
  };
  
  // ローディング表示
  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" mb={4} />
        <Text>データを読み込み中...</Text>
      </Box>
    );
  }
  
  // リクエストがない場合
  if (!request) {
    return (
      <Box p={5} borderRadius="md" bg="red.50" textAlign="center">
        <Box as={ExclamationTriangleIcon} w={10} h={10} color="red.500" mx="auto" mb={3} />
        <Heading size="md" mb={2} color="red.500">リクエストが見つかりません</Heading>
        <Text mb={5}>タスク報告の対象となるリクエスト情報が取得できませんでした。</Text>
        <Button onClick={onCancel}>戻る</Button>
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
            onClick={onCancel}
            size="sm"
            variant="outline"
          />
          
          <Heading size="md">タスク完了報告</Heading>
        </HStack>
        
        <HStack>
          <Badge colorScheme="blue" fontSize="md" px={2} py={1}>
            {request.type === 'cooking' ? '料理' : 
            request.type === 'errand' ? 'お使い' : 'その他'}
          </Badge>
          <Text fontWeight="medium" fontSize="sm">{request.title}</Text>
        </HStack>
      </Flex>
      
      <Divider mb={6} />
      
      <form onSubmit={handleSubmit}>
        <Tabs variant="enclosed" mb={6}>
          <TabList>
            <Tab>基本情報</Tab>
            <Tab>画像と添付資料</Tab>
            <Tab>確認と最終報告</Tab>
          </TabList>
          
          <TabPanels>
            {/* タブ1: 基本情報 */}
            <TabPanel>
              <VStack spacing={5} align="stretch">
                {/* 完了日時 */}
                <FormControl isRequired>
                  <FormLabel>完了日時</FormLabel>
                  <Input
                    type="datetime-local"
                    value={formData.completedAt}
                    onChange={(e) => handleChange('completedAt', e.target.value)}
                    max={new Date().toISOString().slice(0, 16)} // 現在より未来の日時は選択不可
                  />
                </FormControl>
                
                {/* 作業内容 */}
                <FormControl isRequired isInvalid={!!errors.workDetails}>
                  <FormLabel>作業内容</FormLabel>
                  <Textarea
                    placeholder="実施した作業の詳細を記入してください"
                    value={formData.workDetails}
                    onChange={(e) => handleChange('workDetails', e.target.value)}
                    rows={5}
                  />
                  {errors.workDetails ? (
                    <FormErrorMessage>{errors.workDetails}</FormErrorMessage>
                  ) : (
                    <FormHelperText>
                      実施したタスクの内容や手順を具体的に記入してください
                    </FormHelperText>
                  )}
                </FormControl>
                
                {/* 料理リクエストの場合の追加フィールド */}
                {request.type === 'cooking' && (
                  <FormControl isRequired isInvalid={!!errors.materialsUsed}>
                    <FormLabel>使用した材料</FormLabel>
                    <Textarea
                      placeholder="使用した食材や調味料を記入してください"
                      value={formData.materialsUsed}
                      onChange={(e) => handleChange('materialsUsed', e.target.value)}
                      rows={3}
                    />
                    {errors.materialsUsed && (
                      <FormErrorMessage>{errors.materialsUsed}</FormErrorMessage>
                    )}
                  </FormControl>
                )}
                
                {/* 特記事項 */}
                <FormControl>
                  <FormLabel>特記事項</FormLabel>
                  <Textarea
                    placeholder="特記事項があれば記入してください"
                    value={formData.specialNotes}
                    onChange={(e) => handleChange('specialNotes', e.target.value)}
                    rows={3}
                  />
                  <FormHelperText>
                    通常と異なる対応をした場合や、相談事項があればこちらに記入してください
                  </FormHelperText>
                </FormControl>
              </VStack>
            </TabPanel>
            
            {/* タブ2: 画像と添付資料 */}
            <TabPanel>
              <VStack spacing={5} align="stretch">
                {/* 画像アップロード */}
                <FormControl>
                  <FormLabel>完了報告画像</FormLabel>
                  <Button
                    leftIcon={<Box as={PhotoIcon} w={5} h={5} />}
                    onClick={() => fileInputRef.current?.click()}
                    isLoading={isUploading}
                    loadingText="アップロード中"
                    mb={4}
                  >
                    画像をアップロード
                  </Button>
                  <Input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    multiple
                    hidden
                  />
                  <FormHelperText mb={4}>
                    完了したタスクの状態が分かる写真をアップロードしてください（10MB以下/1枚）
                  </FormHelperText>
                  
                  {/* 画像プレビュー */}
                  {uploadedImages.length > 0 ? (
                    <Flex flexWrap="wrap" gap={4}>
                      {uploadedImages.map((image) => (
                        <Box
                          key={image.id}
                          position="relative"
                          width="150px"
                          height="150px"
                          border="1px"
                          borderColor={borderColor}
                          borderRadius="md"
                          overflow="hidden"
                        >
                          <Image
                            src={image.url}
                            alt="アップロード画像"
                            w="full"
                            h="full"
                            objectFit="cover"
                          />
                          <IconButton
                            aria-label="画像を削除"
                            icon={<Box as={TrashIcon} w={4} h={4} />}
                            size="sm"
                            colorScheme="red"
                            position="absolute"
                            top={1}
                            right={1}
                            onClick={() => handleImageDelete(image.id)}
                          />
                        </Box>
                      ))}
                    </Flex>
                  ) : (
                    <Box 
                      p={6} 
                      borderWidth="2px" 
                      borderStyle="dashed" 
                      borderColor={borderColor}
                      borderRadius="md"
                      textAlign="center"
                      bg={useColorModeValue('gray.50', 'gray.700')}
                    >
                      <Box as={PhotoIcon} w={8} h={8} color="gray.400" mx="auto" mb={2} />
                      <Text color="gray.500">アップロードした画像がここに表示されます</Text>
                    </Box>
                  )}
                </FormControl>
                
                {/* 次回への提案 */}
                <FormControl>
                  <FormLabel>次回への提案や改善点</FormLabel>
                  <Textarea
                    placeholder="次回以降のタスクへの提案や改善点があれば記入してください"
                    value={formData.suggestionsForNext}
                    onChange={(e) => handleChange('suggestionsForNext', e.target.value)}
                    rows={3}
                  />
                </FormControl>
              </VStack>
            </TabPanel>
            
            {/* タブ3: 確認と最終報告 */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                {/* 満足度評価 */}
                <FormControl>
                  <FormLabel>タスク満足度</FormLabel>
                  <Text fontSize="sm" color="gray.500" mb={2}>
                    タスクの完了状況に対する自己評価を選択してください
                  </Text>
                  <Flex gap={1}>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <IconButton
                        key={rating}
                        aria-label={`${rating}点`}
                        icon={
                          <Box 
                            as={rating <= formData.satisfactionLevel! ? StarIconSolid : StarIcon} 
                            w={6} 
                            h={6} 
                          />
                        }
                        variant="unstyled"
                        color={rating <= formData.satisfactionLevel! ? "yellow.400" : "gray.300"}
                        onClick={() => handleChange('satisfactionLevel', rating)}
                      />
                    ))}
                  </Flex>
                  <Text fontSize="sm" mt={1}>
                    {formData.satisfactionLevel === 5 && '非常に満足 - 期待以上の完成度です'}
                    {formData.satisfactionLevel === 4 && '満足 - 良好な完成度です'}
                    {formData.satisfactionLevel === 3 && '普通 - 要件は満たしています'}
                    {formData.satisfactionLevel === 2 && 'やや不満 - 改善の余地があります'}
                    {formData.satisfactionLevel === 1 && '不満 - 基準を満たしていません'}
                  </Text>
                </FormControl>
                
                {/* チェックリスト */}
                <FormControl isInvalid={!!errors.completionChecklist}>
                  <FormLabel>完了確認チェックリスト</FormLabel>
                  <Card variant="outline">
                    <CardBody>
                      <VStack align="start" spacing={3}>
                        <Checkbox
                          isChecked={formData.completionChecklist.taskCompletedAsRequested}
                          onChange={(e) => 
                            handleChecklistChange('taskCompletedAsRequested', e.target.checked)
                          }
                          colorScheme="green"
                        >
                          タスクは依頼通りに完了しました
                        </Checkbox>
                        
                        <Checkbox
                          isChecked={formData.completionChecklist.safetyMeasuresTaken}
                          onChange={(e) => 
                            handleChecklistChange('safetyMeasuresTaken', e.target.checked)
                          }
                          colorScheme="green"
                        >
                          安全に配慮して作業を行いました
                        </Checkbox>
                        
                        <Checkbox
                          isChecked={formData.completionChecklist.cleanupCompleted}
                          onChange={(e) => 
                            handleChecklistChange('cleanupCompleted', e.target.checked)
                          }
                          colorScheme="green"
                        >
                          作業後の清掃・片付けを完了しました
                        </Checkbox>
                      </VStack>
                      
                      {errors.completionChecklist && (
                        <Text color={errorColor} fontSize="sm" mt={2}>
                          {errors.completionChecklist}
                        </Text>
                      )}
                    </CardBody>
                  </Card>
                </FormControl>
                
                {/* フォーム概要 */}
                <Card variant="outline">
                  <CardHeader pb={0}>
                    <Heading size="sm">入力内容の確認</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack align="stretch" spacing={3} fontSize="sm">
                      <HStack justify="space-between">
                        <Text fontWeight="bold">タスク名:</Text>
                        <Text>{request.title}</Text>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontWeight="bold">完了日時:</Text>
                        <Text>{new Date(formData.completedAt).toLocaleString('ja-JP')}</Text>
                      </HStack>
                      
                      <HStack align="start">
                        <Text fontWeight="bold">作業内容:</Text>
                        <Text noOfLines={2}>{formData.workDetails || '(未入力)'}</Text>
                      </HStack>
                      
                      {request.type === 'cooking' && (
                        <HStack align="start">
                          <Text fontWeight="bold">使用材料:</Text>
                          <Text noOfLines={2}>{formData.materialsUsed || '(未入力)'}</Text>
                        </HStack>
                      )}
                      
                      <HStack justify="space-between">
                        <Text fontWeight="bold">添付画像:</Text>
                        <Text>{uploadedImages.length}枚</Text>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontWeight="bold">満足度:</Text>
                        <Flex gap={1}>
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <Box
                              key={rating}
                              as={rating <= formData.satisfactionLevel! ? StarIconSolid : StarIcon} 
                              w={4} 
                              h={4}
                              color={rating <= formData.satisfactionLevel! ? "yellow.400" : "gray.300"}
                            />
                          ))}
                        </Flex>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
        
        <Flex justify="space-between" mt={8}>
          <Button 
            leftIcon={<Box as={XMarkIcon} w={5} h={5} />}
            variant="outline" 
            onClick={onCancel}
          >
            キャンセル
          </Button>
          
          <Button 
            type="submit"
            colorScheme="blue"
            rightIcon={<Box as={PaperAirplaneIcon} w={5} h={5} />}
            isLoading={isSubmitting}
            loadingText="送信中"
          >
            完了報告を送信
          </Button>
        </Flex>
      </form>
    </Box>
  );
};

export default TaskCompletionReportForm;
