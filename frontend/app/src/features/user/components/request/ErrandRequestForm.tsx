import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Stack,
  VStack,
  HStack,
  IconButton,
  Button,
  InputGroup,
  InputLeftElement
} from "@chakra-ui/react";
import { useFieldArray, useForm } from "react-hook-form";
import { FiMapPin, FiPlus, FiTrash2 } from "react-icons/fi";
import { CreateErrandRequest, CreateRequestBase, RequestType } from "../../types";
import { RequestForm } from "./RequestForm";

interface ErrandRequestFormProps {
  initialData?: Partial<CreateErrandRequest>;
  onSubmit: (data: CreateErrandRequest) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

/**
 * 買い物リクエストフォームコンポーネント
 * 
 * @param {ErrandRequestFormProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} 買い物リクエストフォーム
 */
export const ErrandRequestForm = ({
  initialData,
  onSubmit,
  isLoading = false,
  submitLabel = "送信"
}: ErrandRequestFormProps): JSX.Element => {
  // 買い物リクエスト用のフォーム
  const {
    register,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<CreateErrandRequest>({
    defaultValues: {
      location: "",
      items: [""],
      budget: 0,
      ...initialData
    }
  });

  // 買い物リストのフィールド配列
  const itemsFieldArray = useFieldArray({
    control,
    name: "items"
  });

  // フォーム送信処理
  const handleFormSubmit = (baseData: CreateRequestBase, errandData: CreateErrandRequest) => {
    // 基本データと買い物データをマージ
    const combinedData: CreateErrandRequest = {
      ...baseData,
      ...errandData,
      type: RequestType.ERRAND
    };
    
    onSubmit(combinedData);
  };

  return (
    <RequestForm
      initialData={initialData}
      onSubmit={(baseData) => handleFormSubmit(baseData, {
        location: register("location").value,
        items: register("items").value,
        budget: register("budget").value
      })}
      isLoading={isLoading}
      submitLabel={submitLabel}
    >
      <Stack spacing={4}>
        {/* 買い物場所 */}
        <FormControl isInvalid={!!errors.location}>
          <FormLabel>買い物場所（任意）</FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <FiMapPin color="gray.300" />
            </InputLeftElement>
            <Input
              {...register("location")}
              placeholder="例：〇〇スーパー、〇〇ショッピングモール"
              isDisabled={isLoading}
            />
          </InputGroup>
          <FormErrorMessage>
            {errors.location && errors.location.message}
          </FormErrorMessage>
        </FormControl>

        {/* 予算 */}
        <FormControl isInvalid={!!errors.budget}>
          <FormLabel>予算（円）</FormLabel>
          <InputGroup>
            <Input
              {...register("budget", {
                valueAsNumber: true,
                min: {
                  value: 0,
                  message: "0以上の値を入力してください"
                }
              })}
              type="number"
              placeholder="例：5000"
              isDisabled={isLoading}
            />
          </InputGroup>
          <FormErrorMessage>
            {errors.budget && errors.budget.message}
          </FormErrorMessage>
        </FormControl>

        {/* 買い物リスト */}
        <FormControl>
          <FormLabel>買い物リスト</FormLabel>
          <VStack spacing={2} align="stretch">
            {itemsFieldArray.fields.map((field, index) => (
              <HStack key={field.id} spacing={2}>
                <FormControl isInvalid={!!errors.items?.[index]}>
                  <Input
                    {...register(`items.${index}` as const, {
                      required: index === 0 ? "少なくとも1つの項目が必要です" : false
                    })}
                    placeholder={`買い物項目 ${index + 1}`}
                    isDisabled={isLoading}
                  />
                  <FormErrorMessage>
                    {errors.items?.[index]?.message}
                  </FormErrorMessage>
                </FormControl>
                <IconButton
                  aria-label="項目を削除"
                  icon={<FiTrash2 />}
                  variant="ghost"
                  colorScheme="red"
                  size="sm"
                  isDisabled={itemsFieldArray.fields.length <= 1 || isLoading}
                  onClick={() => itemsFieldArray.remove(index)}
                />
              </HStack>
            ))}

            <Button
              leftIcon={<FiPlus />}
              variant="outline"
              size="sm"
              onClick={() => itemsFieldArray.append("")}
              isDisabled={isLoading}
            >
              項目を追加
            </Button>
          </VStack>
        </FormControl>
      </Stack>
    </RequestForm>
  );
};
