import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Stack,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Heading,
  Divider,
  useColorModeValue
} from "@chakra-ui/react";
import { Controller, useForm } from "react-hook-form";
import { RequestType, CreateRequestBase } from "../../types";

interface RequestFormProps {
  initialData?: Partial<CreateRequestBase>;
  onSubmit: (data: CreateRequestBase) => void;
  isLoading?: boolean;
  submitLabel?: string;
  children?: React.ReactNode;
}

/**
 * 基本リクエストフォームコンポーネント
 * 全てのリクエストタイプに共通するフォーム要素を含む
 * 
 * @param {RequestFormProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} リクエストフォーム
 */
export const RequestForm = ({
  initialData,
  onSubmit,
  isLoading = false,
  submitLabel = "送信",
  children
}: RequestFormProps): JSX.Element => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors }
  } = useForm<CreateRequestBase>({
    defaultValues: {
      title: "",
      description: "",
      type: RequestType.COOKING,
      scheduledDate: "",
      estimatedDuration: 60,
      ...initialData
    }
  });

  const selectedType = watch("type");
  const bgColor = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // フォーム送信処理
  const handleFormSubmit = (data: CreateRequestBase) => {
    onSubmit(data);
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit(handleFormSubmit)}
      bg={bgColor}
      p={6}
      borderRadius="lg"
      boxShadow="sm"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <Heading as="h2" size="md" mb={4}>
        依頼情報
      </Heading>
      
      <Stack spacing={4}>
        {/* タイトル */}
        <FormControl isInvalid={!!errors.title} isRequired>
          <FormLabel>タイトル</FormLabel>
          <Input
            {...register("title", {
              required: "タイトルは必須です",
              maxLength: {
                value: 100,
                message: "100文字以内で入力してください"
              }
            })}
            placeholder="依頼のタイトル"
            isDisabled={isLoading}
          />
          <FormErrorMessage>
            {errors.title && errors.title.message}
          </FormErrorMessage>
        </FormControl>

        {/* 依頼タイプ */}
        <FormControl isInvalid={!!errors.type} isRequired>
          <FormLabel>依頼タイプ</FormLabel>
          <Select
            {...register("type", {
              required: "依頼タイプは必須です"
            })}
            isDisabled={isLoading}
          >
            <option value={RequestType.COOKING}>料理</option>
            <option value={RequestType.ERRAND}>買い物</option>
            <option value={RequestType.CLEANING}>掃除</option>
            <option value={RequestType.OTHER}>その他</option>
          </Select>
          <FormErrorMessage>
            {errors.type && errors.type.message}
          </FormErrorMessage>
        </FormControl>

        {/* 予定日 */}
        <FormControl isInvalid={!!errors.scheduledDate} isRequired>
          <FormLabel>予定日</FormLabel>
          <Input
            type="date"
            {...register("scheduledDate", {
              required: "予定日は必須です"
            })}
            isDisabled={isLoading}
          />
          <FormErrorMessage>
            {errors.scheduledDate && errors.scheduledDate.message}
          </FormErrorMessage>
        </FormControl>

        {/* 所要時間（分） */}
        <FormControl isInvalid={!!errors.estimatedDuration}>
          <FormLabel>予想所要時間（分）</FormLabel>
          <Controller
            name="estimatedDuration"
            control={control}
            rules={{
              min: {
                value: 1,
                message: "1分以上で設定してください"
              },
              max: {
                value: 480,
                message: "最大8時間（480分）までです"
              }
            }}
            render={({ field }) => (
              <NumberInput
                {...field}
                min={1}
                max={480}
                step={5}
                isDisabled={isLoading}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            )}
          />
          <FormErrorMessage>
            {errors.estimatedDuration && errors.estimatedDuration.message}
          </FormErrorMessage>
        </FormControl>

        {/* 説明 */}
        <FormControl isInvalid={!!errors.description} isRequired>
          <FormLabel>説明</FormLabel>
          <Textarea
            {...register("description", {
              required: "説明は必須です",
              minLength: {
                value: 10,
                message: "10文字以上入力してください"
              },
              maxLength: {
                value: 1000,
                message: "1000文字以内で入力してください"
              }
            })}
            placeholder="依頼の詳細説明"
            rows={4}
            isDisabled={isLoading}
          />
          <FormErrorMessage>
            {errors.description && errors.description.message}
          </FormErrorMessage>
        </FormControl>

        {/* 各リクエストタイプ固有のフォーム要素 */}
        {children && (
          <>
            <Divider my={4} />
            <Heading as="h3" size="sm" mb={4}>
              {selectedType === RequestType.COOKING && "料理の詳細情報"}
              {selectedType === RequestType.ERRAND && "買い物の詳細情報"}
              {selectedType === RequestType.CLEANING && "掃除の詳細情報"}
              {selectedType === RequestType.OTHER && "その他の詳細情報"}
            </Heading>
            {children}
          </>
        )}

        {/* 送信ボタン */}
        <Box pt={4}>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isLoading}
            loadingText="送信中..."
            width={{ base: "full", md: "auto" }}
          >
            {submitLabel}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};
