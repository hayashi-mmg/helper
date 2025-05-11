import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Stack,
  VStack,
  HStack,
  IconButton,
  Text,
  Box,
  Flex,
  Divider
} from "@chakra-ui/react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { CreateCookingRequest, CreateRequestBase, Ingredient, RecipeDetails, RequestType } from "../../types";
import { RequestForm } from "./RequestForm";
import { useState } from "react";

interface CookingRequestFormProps {
  initialData?: Partial<CreateCookingRequest>;
  onSubmit: (data: CreateCookingRequest) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

/**
 * デフォルトのレシピ詳細情報
 */
const DEFAULT_RECIPE_DETAILS: RecipeDetails = {
  name: "",
  ingredients: [{ name: "", quantity: "", unit: "" }],
  instructions: [""],
  servings: 2,
  cookingTime: 30
};

/**
 * 料理リクエストフォームコンポーネント
 * 
 * @param {CookingRequestFormProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} 料理リクエストフォーム
 */
export const CookingRequestForm = ({
  initialData,
  onSubmit,
  isLoading = false,
  submitLabel = "送信"
}: CookingRequestFormProps): JSX.Element => {
  const [useRecipeUrl, setUseRecipeUrl] = useState<boolean>(!!initialData?.recipeUrl);
  
  // 料理リクエスト用のフォーム
  const {
    register,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<CreateCookingRequest>({
    defaultValues: {
      recipeUrl: "",
      dietaryRestrictions: [],
      recipeDetails: DEFAULT_RECIPE_DETAILS,
      ...initialData
    }
  });

  // 食材リストのフィールド配列
  const ingredientsFieldArray = useFieldArray({
    control,
    name: "recipeDetails.ingredients"
  });

  // 手順リストのフィールド配列
  const instructionsFieldArray = useFieldArray({
    control,
    name: "recipeDetails.instructions"
  });

  // フォーム送信処理
  const handleFormSubmit = (baseData: CreateRequestBase, cookingData: CreateCookingRequest) => {
    // 基本データと料理データをマージ
    const combinedData: CreateCookingRequest = {
      ...baseData,
      ...cookingData,
      type: RequestType.COOKING
    };
    
    // レシピURLモードとレシピ詳細モードの切り替え
    if (useRecipeUrl) {
      delete combinedData.recipeDetails;
    } else {
      delete combinedData.recipeUrl;
    }
    
    onSubmit(combinedData);
  };

  return (
    <RequestForm
      initialData={initialData}
      onSubmit={(baseData) => handleFormSubmit(baseData, useRecipeUrl ? 
        { recipeUrl: register("recipeUrl").value } : 
        { recipeDetails: register("recipeDetails").value }
      )}
      isLoading={isLoading}
      submitLabel={submitLabel}
    >
      <Stack spacing={4}>
        {/* レシピ入力方法選択 */}
        <FormControl>
          <FormLabel>レシピ入力方法</FormLabel>
          <HStack>
            <Button
              onClick={() => setUseRecipeUrl(true)}
              colorScheme={useRecipeUrl ? "blue" : "gray"}
              variant={useRecipeUrl ? "solid" : "outline"}
              size="sm"
            >
              レシピURL
            </Button>
            <Button
              onClick={() => setUseRecipeUrl(false)}
              colorScheme={!useRecipeUrl ? "blue" : "gray"}
              variant={!useRecipeUrl ? "solid" : "outline"}
              size="sm"
            >
              レシピ詳細
            </Button>
          </HStack>
        </FormControl>

        {/* レシピURL入力 */}
        {useRecipeUrl ? (
          <FormControl isInvalid={!!errors.recipeUrl} isRequired>
            <FormLabel>レシピURL</FormLabel>
            <Input
              {...register("recipeUrl", {
                required: useRecipeUrl ? "レシピURLは必須です" : false,
                pattern: {
                  value: /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/,
                  message: "有効なURLを入力してください"
                }
              })}
              placeholder="https://example.com/recipe/12345"
              isDisabled={isLoading}
            />
            <FormErrorMessage>
              {errors.recipeUrl && errors.recipeUrl.message}
            </FormErrorMessage>
          </FormControl>
        ) : (
          <>
            {/* レシピ名 */}
            <FormControl isInvalid={!!errors.recipeDetails?.name} isRequired>
              <FormLabel>レシピ名</FormLabel>
              <Input
                {...register("recipeDetails.name", {
                  required: !useRecipeUrl ? "レシピ名は必須です" : false
                })}
                placeholder="例：鶏肉のトマト煮込み"
                isDisabled={isLoading}
              />
              <FormErrorMessage>
                {errors.recipeDetails?.name && errors.recipeDetails.name.message}
              </FormErrorMessage>
            </FormControl>

            {/* サービング数と調理時間 */}
            <HStack spacing={4}>
              <FormControl isInvalid={!!errors.recipeDetails?.servings}>
                <FormLabel>人数</FormLabel>
                <Controller
                  name="recipeDetails.servings"
                  control={control}
                  rules={{
                    min: {
                      value: 1,
                      message: "1人以上で入力してください"
                    }
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      min={1}
                      isDisabled={isLoading}
                    />
                  )}
                />
                <FormErrorMessage>
                  {errors.recipeDetails?.servings && errors.recipeDetails.servings.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.recipeDetails?.cookingTime}>
                <FormLabel>調理時間（分）</FormLabel>
                <Controller
                  name="recipeDetails.cookingTime"
                  control={control}
                  rules={{
                    min: {
                      value: 1,
                      message: "1分以上で入力してください"
                    }
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      min={1}
                      isDisabled={isLoading}
                    />
                  )}
                />
                <FormErrorMessage>
                  {errors.recipeDetails?.cookingTime && errors.recipeDetails.cookingTime.message}
                </FormErrorMessage>
              </FormControl>
            </HStack>

            {/* 材料リスト */}
            <FormControl>
              <FormLabel>材料</FormLabel>
              <VStack spacing={2} align="stretch">
                {ingredientsFieldArray.fields.map((field, index) => (
                  <HStack key={field.id} spacing={2}>
                    <FormControl isInvalid={!!errors.recipeDetails?.ingredients?.[index]?.name} flexGrow={2}>
                      <Input
                        {...register(`recipeDetails.ingredients.${index}.name` as const, {
                          required: "材料名は必須です"
                        })}
                        placeholder="材料名"
                        isDisabled={isLoading}
                      />
                      <FormErrorMessage>
                        {errors.recipeDetails?.ingredients?.[index]?.name?.message}
                      </FormErrorMessage>
                    </FormControl>

                    <FormControl flexGrow={1}>
                      <Input
                        {...register(`recipeDetails.ingredients.${index}.quantity` as const)}
                        placeholder="量"
                        isDisabled={isLoading}
                      />
                    </FormControl>

                    <FormControl flexGrow={1}>
                      <Input
                        {...register(`recipeDetails.ingredients.${index}.unit` as const)}
                        placeholder="単位"
                        isDisabled={isLoading}
                      />
                    </FormControl>

                    <IconButton
                      aria-label="材料を削除"
                      icon={<FiTrash2 />}
                      variant="ghost"
                      colorScheme="red"
                      size="sm"
                      isDisabled={ingredientsFieldArray.fields.length <= 1 || isLoading}
                      onClick={() => ingredientsFieldArray.remove(index)}
                    />
                  </HStack>
                ))}

                <Button
                  leftIcon={<FiPlus />}
                  variant="outline"
                  size="sm"
                  onClick={() => ingredientsFieldArray.append({ name: "", quantity: "", unit: "" })}
                  isDisabled={isLoading}
                >
                  材料を追加
                </Button>
              </VStack>
            </FormControl>

            {/* 調理手順 */}
            <FormControl>
              <FormLabel>調理手順</FormLabel>
              <VStack spacing={2} align="stretch">
                {instructionsFieldArray.fields.map((field, index) => (
                  <HStack key={field.id} spacing={2} align="flex-start">
                    <Box mt={2}>
                      <Text fontWeight="bold">{index + 1}.</Text>
                    </Box>
                    <FormControl isInvalid={!!errors.recipeDetails?.instructions?.[index]}>
                      <Input
                        {...register(`recipeDetails.instructions.${index}` as const, {
                          required: "手順は必須です"
                        })}
                        placeholder={`手順${index + 1}`}
                        isDisabled={isLoading}
                      />
                      <FormErrorMessage>
                        {errors.recipeDetails?.instructions?.[index]?.message}
                      </FormErrorMessage>
                    </FormControl>
                    <IconButton
                      aria-label="手順を削除"
                      icon={<FiTrash2 />}
                      variant="ghost"
                      colorScheme="red"
                      size="sm"
                      isDisabled={instructionsFieldArray.fields.length <= 1 || isLoading}
                      onClick={() => instructionsFieldArray.remove(index)}
                    />
                  </HStack>
                ))}

                <Button
                  leftIcon={<FiPlus />}
                  variant="outline"
                  size="sm"
                  onClick={() => instructionsFieldArray.append("")}
                  isDisabled={isLoading}
                >
                  手順を追加
                </Button>
              </VStack>
            </FormControl>
          </>
        )}

        <Divider />

        {/* 食事制限 */}
        <FormControl>
          <FormLabel>食事制限（任意）</FormLabel>
          <Input
            {...register("dietaryRestrictions")}
            placeholder="例：卵アレルギー、グルテンフリー"
            isDisabled={isLoading}
          />
        </FormControl>
      </Stack>
    </RequestForm>
  );
};
