/**
 * ヘルパー用サイドバーコンポーネント
 * ヘルパーダッシュボードの左側に表示されるナビゲーションメニュー
 */
import { FC } from 'react';
import { 
  Box, 
  Flex, 
  VStack, 
  Text, 
  Icon, 
  useColorModeValue,
  Link
} from '@chakra-ui/react';
import { NavLink as RouterLink } from 'react-router-dom';
import { 
  HomeIcon, 
  UsersIcon, 
  ClipboardDocumentCheckIcon, 
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';

interface NavItemProps {
  icon: any;
  children: string;
  to: string;
}

/**
 * ナビゲーションアイテムコンポーネント
 */
const NavItem: FC<NavItemProps> = ({ icon, children, to }) => {
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const activeColor = useColorModeValue('blue.700', 'blue.200');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  
  return (
    <Link
      as={RouterLink}
      to={to}
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
      end={to === '/helper'}
    >
      {({ isActive }) => (
        <Flex
          align="center"
          p="4"
          mx="4"
          borderRadius="lg"
          role="group"
          cursor="pointer"
          bg={isActive ? activeBg : 'transparent'}
          color={isActive ? activeColor : ''}
          _hover={{
            bg: hoverBg,
          }}
        >
          <Icon
            mr="4"
            fontSize="16"
            as={icon}
            w={5}
            h={5}
          />
          {children}
        </Flex>
      )}
    </Link>
  );
};

/**
 * サイドバーコンポーネント
 */
export const Sidebar: FC = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Box
      bg={bgColor}
      borderRight="1px"
      borderColor={borderColor}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontWeight="bold">
          ヘルパー
        </Text>
      </Flex>
      
      <VStack spacing="1" align="stretch" mt={4}>
        <NavItem icon={HomeIcon} to="/helper">
          ダッシュボード
        </NavItem>
        <NavItem icon={UsersIcon} to="/helper/users">
          担当ユーザー
        </NavItem>
        <NavItem icon={ClipboardDocumentCheckIcon} to="/helper/tasks">
          未完了タスク
        </NavItem>
        <NavItem icon={CalendarDaysIcon} to="/helper/schedule">
          スケジュール
        </NavItem>
        <NavItem icon={ChatBubbleLeftRightIcon} to="/helper/feedback">
          フィードバック
        </NavItem>
        <NavItem icon={QrCodeIcon} to="/helper/qrcode">
          QRコード
        </NavItem>
      </VStack>
    </Box>
  );
};

export default Sidebar;
