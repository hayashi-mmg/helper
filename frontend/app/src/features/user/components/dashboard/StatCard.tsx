import { Box, Flex, Stat, StatLabel, StatNumber, StatHelpText, Icon, useColorModeValue } from "@chakra-ui/react";
import { ReactElement } from "react";

interface StatCardProps {
  title: string;
  stat: string | number;
  icon: ReactElement;
  helpText?: string;
  colorScheme?: string;
}

/**
 * サマリーカード用の統計情報表示コンポーネント
 * アイコン付きの統計情報を表示する
 * 
 * @param {StatCardProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} 統計カード
 */
export const StatCard = ({ title, stat, icon, helpText, colorScheme = "blue" }: StatCardProps): JSX.Element => {
  // カラーモードに応じた色設定
  const bgColor = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.100");
  const iconBgLight = `${colorScheme}.100`;
  const iconBgDark = `${colorScheme}.800`;
  const iconBg = useColorModeValue(iconBgLight, iconBgDark);
  const iconColor = useColorModeValue(`${colorScheme}.600`, `${colorScheme}.200`);

  return (
    <Stat
      px={4}
      py={5}
      bg={bgColor}
      borderRadius="lg"
      boxShadow="sm"
      position="relative"
      overflow="hidden"
    >
      <Flex justifyContent="space-between">
        <Box>
          <StatLabel color={textColor} fontSize="sm" fontWeight="medium">
            {title}
          </StatLabel>
          <StatNumber fontSize="2xl" fontWeight="bold" color={textColor}>
            {stat}
          </StatNumber>
          {helpText && (
            <StatHelpText fontSize="xs" color="gray.500">
              {helpText}
            </StatHelpText>
          )}
        </Box>
        <Box
          p={2}
          borderRadius="full"
          bg={iconBg}
          color={iconColor}
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="48px"
          height="48px"
        >
          {icon}
        </Box>
      </Flex>
    </Stat>
  );
};
