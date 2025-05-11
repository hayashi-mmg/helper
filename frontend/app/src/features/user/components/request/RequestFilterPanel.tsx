import {
  Box,
  Button,
  Collapse,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Icon,
  Input,
  Select,
  useColorModeValue,
  useDisclosure
} from "@chakra-ui/react";
import { FiChevronDown, FiChevronUp, FiFilter } from "react-icons/fi";
import { useEffect, useState } from "react";
import { RequestFilter, RequestStatus, RequestType } from "../../types";

interface RequestFilterPanelProps {
  initialFilter?: RequestFilter;
  onFilterChange: (filter: RequestFilter) => void;
  isLoading?: boolean;
}

/**
 * リクエストフィルターパネルコンポーネント
 * リクエスト一覧のフィルタリング条件を設定するパネル
 * 
 * @param {RequestFilterPanelProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} フィルターパネル
 */
export const RequestFilterPanel = ({
  initialFilter = {},
  onFilterChange,
  isLoading = false
}: RequestFilterPanelProps): JSX.Element => {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: false });
  const [filter, setFilter] = useState<RequestFilter>(initialFilter);

  const bgColor = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // 初期フィルター値が変更された場合は状態を更新
  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  // フィルター適用ハンドラー
  const handleApplyFilter = () => {
    onFilterChange(filter);
  };

  // フィルターリセットハンドラー
  const handleResetFilter = () => {
    const resetFilter: RequestFilter = {};
    setFilter(resetFilter);
    onFilterChange(resetFilter);
  };

  // フィルター値変更ハンドラー
  const handleFilterChange = (field: keyof RequestFilter, value: any) => {
    setFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Box
      bg={bgColor}
      borderRadius="lg"
      boxShadow="sm"
      p={4}
      mb={6}
      borderWidth="1px"
      borderColor={borderColor}
    >
      <Flex
        onClick={onToggle}
        cursor="pointer"
        justifyContent="space-between"
        alignItems="center"
        mb={isOpen ? 4 : 0}
      >
        <Flex alignItems="center">
          <Icon as={FiFilter} mr={2} />
          <Heading as="h3" size="sm">
            フィルター条件
          </Heading>
        </Flex>
        <Icon as={isOpen ? FiChevronUp : FiChevronDown} />
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <Divider my={4} />

        <Grid templateColumns="repeat(12, 1fr)" gap={4}>
          {/* ステータスフィルター */}
          <GridItem colSpan={{ base: 12, md: 6, lg: 3 }}>
            <FormControl>
              <FormLabel fontSize="sm">ステータス</FormLabel>
              <Select
                placeholder="すべて"
                value={filter.status || ""}
                onChange={e => handleFilterChange("status", e.target.value || undefined)}
                isDisabled={isLoading}
              >
                {Object.values(RequestStatus).map(status => (
                  <option key={status} value={status}>
                    {status === RequestStatus.PENDING && "保留中"}
                    {status === RequestStatus.ACCEPTED && "受付済み"}
                    {status === RequestStatus.INPROGRESS && "進行中"}
                    {status === RequestStatus.COMPLETED && "完了"}
                    {status === RequestStatus.CANCELLED && "キャンセル"}
                    {status === RequestStatus.REJECTED && "却下"}
                  </option>
                ))}
              </Select>
            </FormControl>
          </GridItem>

          {/* タイプフィルター */}
          <GridItem colSpan={{ base: 12, md: 6, lg: 3 }}>
            <FormControl>
              <FormLabel fontSize="sm">タイプ</FormLabel>
              <Select
                placeholder="すべて"
                value={filter.type || ""}
                onChange={e => handleFilterChange("type", e.target.value || undefined)}
                isDisabled={isLoading}
              >
                {Object.values(RequestType).map(type => (
                  <option key={type} value={type}>
                    {type === RequestType.COOKING && "料理"}
                    {type === RequestType.ERRAND && "買い物"}
                    {type === RequestType.CLEANING && "掃除"}
                    {type === RequestType.OTHER && "その他"}
                  </option>
                ))}
              </Select>
            </FormControl>
          </GridItem>

          {/* 日付範囲フィルター */}
          <GridItem colSpan={{ base: 12, md: 6, lg: 3 }}>
            <FormControl>
              <FormLabel fontSize="sm">開始日</FormLabel>
              <Input
                type="date"
                value={filter.startDate || ""}
                onChange={e => handleFilterChange("startDate", e.target.value || undefined)}
                isDisabled={isLoading}
              />
            </FormControl>
          </GridItem>

          <GridItem colSpan={{ base: 12, md: 6, lg: 3 }}>
            <FormControl>
              <FormLabel fontSize="sm">終了日</FormLabel>
              <Input
                type="date"
                value={filter.endDate || ""}
                onChange={e => handleFilterChange("endDate", e.target.value || undefined)}
                isDisabled={isLoading}
              />
            </FormControl>
          </GridItem>
        </Grid>

        <Flex justifyContent="flex-end" mt={4} gap={2}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilter}
            isDisabled={isLoading}
          >
            リセット
          </Button>
          <Button
            colorScheme="blue"
            size="sm"
            onClick={handleApplyFilter}
            isDisabled={isLoading}
          >
            フィルター適用
          </Button>
        </Flex>
      </Collapse>
    </Box>
  );
};
