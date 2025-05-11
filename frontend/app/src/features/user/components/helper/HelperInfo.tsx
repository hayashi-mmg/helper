import { Avatar, Badge, Box, Flex, Heading, HStack, Icon, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import { FiCalendar, FiPhoneCall, FiMail, FiStar } from "react-icons/fi";
import { Helper, HelperSkill, HelperStatus } from "../../types";

interface HelperInfoProps {
  helper: Helper;
  isLoading?: boolean;
}

/**
 * スキルに応じたラベルを返す
 * 
 * @param {HelperSkill} skill - ヘルパーのスキル
 * @returns {string} スキルの日本語表示
 */
const getSkillLabel = (skill: HelperSkill): string => {
  switch (skill) {
    case HelperSkill.COOKING:
      return "料理";
    case HelperSkill.ERRAND:
      return "買い物";
    case HelperSkill.CLEANING:
      return "掃除";
    case HelperSkill.ELDERCARE:
      return "高齢者ケア";
    case HelperSkill.CHILDCARE:
      return "子育て支援";
    case HelperSkill.OTHER:
      return "その他";
    default:
      return "不明";
  }
};

/**
 * ステータスに応じたバッジのカラースキームとラベルを返す
 * 
 * @param {HelperStatus} status - ヘルパーのステータス
 * @returns {Object} カラースキームとラベル
 */
const getStatusInfo = (status: HelperStatus): { colorScheme: string; label: string } => {
  switch (status) {
    case HelperStatus.ACTIVE:
      return { colorScheme: "green", label: "活動中" };
    case HelperStatus.INACTIVE:
      return { colorScheme: "gray", label: "非活動" };
    case HelperStatus.ONLEAVE:
      return { colorScheme: "yellow", label: "休暇中" };
    default:
      return { colorScheme: "gray", label: "不明" };
  }
};

/**
 * ヘルパー情報表示コンポーネント
 * ヘルパーのプロフィール情報を表示する
 * 
 * @param {HelperInfoProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} ヘルパー情報
 */
export const HelperInfo = ({ helper, isLoading = false }: HelperInfoProps): JSX.Element => {
  const bgColor = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.700", "gray.100");

  // ステータス情報取得
  const statusInfo = getStatusInfo(helper.status);

  // 評価の星表示用
  const renderRating = () => {
    if (!helper.rating) return "未評価";
    return `${helper.rating.toFixed(1)} / 5.0`;
  };

  return (
    <Box
      bg={bgColor}
      borderRadius="lg"
      boxShadow="sm"
      p={6}
      borderWidth="1px"
      borderColor={borderColor}
    >
      <Flex direction={{ base: "column", md: "row" }} alignItems={{ base: "center", md: "flex-start" }}>
        {/* ヘルパープロフィール画像 */}
        <Box mr={{ base: 0, md: 6 }} mb={{ base: 4, md: 0 }} textAlign="center">
          <Avatar
            size="xl"
            name={`${helper.firstName} ${helper.lastName}`}
            src={helper.profileImage}
            mb={2}
          />
          <Badge colorScheme={statusInfo.colorScheme} fontSize="xs" px={2} py={1} borderRadius="full">
            {statusInfo.label}
          </Badge>
        </Box>

        {/* ヘルパー情報 */}
        <Box flex="1">
          <Heading as="h3" size="md" mb={2} color={textColor}>
            {helper.firstName} {helper.lastName}
          </Heading>

          <HStack spacing={2} mb={3} color="yellow.500" align="center">
            <Icon as={FiStar} />
            <Text fontSize="sm">{renderRating()}</Text>
          </HStack>

          {/* 連絡先情報 */}
          <VStack align="flex-start" spacing={2} mb={4}>
            <Flex align="center">
              <Icon as={FiMail} mr={2} color="blue.500" />
              <Text fontSize="sm">{helper.email}</Text>
            </Flex>
            {helper.phoneNumber && (
              <Flex align="center">
                <Icon as={FiPhoneCall} mr={2} color="blue.500" />
                <Text fontSize="sm">{helper.phoneNumber}</Text>
              </Flex>
            )}
            {helper.availability && (
              <Flex align="center">
                <Icon as={FiCalendar} mr={2} color="blue.500" />
                <Text fontSize="sm">稼働スケジュール有り</Text>
              </Flex>
            )}
          </VStack>

          {/* スキル */}
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              スキル:
            </Text>
            <HStack spacing={2} flexWrap="wrap">
              {helper.skills.map((skill) => (
                <Badge
                  key={skill}
                  colorScheme="blue"
                  variant="subtle"
                  px={2}
                  py={1}
                  borderRadius="md"
                  fontSize="xs"
                >
                  {getSkillLabel(skill)}
                </Badge>
              ))}
            </HStack>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};
