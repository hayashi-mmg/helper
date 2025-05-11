/**
 * ヘルパー用ダッシュボードヘッダーコンポーネント
 * ヘルパーダッシュボードの上部に表示されるヘッダー
 */
import { FC } from 'react';
import { 
  Flex, 
  IconButton, 
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Box,
  useColorModeValue,
  useColorMode,
  HStack
} from '@chakra-ui/react';
import { 
  Bars3Icon,
  MoonIcon,
  SunIcon,
  BellIcon
} from '@heroicons/react/24/outline';

export interface HeaderProps {
  /**
   * ページのタイトル
   */
  title: string;
  /**
   * モバイル画面でのサイドバートグル関数
   */
  onMenuToggle?: () => void;
}

/**
 * ヘッダーコンポーネント
 * ページタイトル、通知アイコン、ユーザーメニューを表示
 */
export const Header: FC<HeaderProps> = ({ 
  title, 
  onMenuToggle 
}) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue('white', 'gray.800');
  
  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      w="full"
      px={4}
      h="16"
      bg={bgColor}
    >
      <HStack spacing={4}>
        <IconButton
          aria-label="Open menu"
          display={{ base: 'flex', md: 'none' }}
          onClick={onMenuToggle}
          icon={<Box as={Bars3Icon} w={5} h={5} />}
          variant="ghost"
        />
        <Text fontSize="lg" fontWeight="medium">
          {title}
        </Text>
      </HStack>

      <HStack spacing={4}>
        <IconButton
          aria-label="Toggle dark mode"
          icon={
            colorMode === 'light' 
              ? <Box as={MoonIcon} w={5} h={5} /> 
              : <Box as={SunIcon} w={5} h={5} />
          }
          onClick={toggleColorMode}
          variant="ghost"
        />
        
        <IconButton
          aria-label="Notifications"
          icon={<Box as={BellIcon} w={5} h={5} />}
          variant="ghost"
        />
        
        <Menu>
          <MenuButton
            as={Avatar}
            size="sm"
            cursor="pointer"
            src=""
            name="ヘルパー"
          />
          <MenuList>
            <MenuItem>プロフィール</MenuItem>
            <MenuItem>設定</MenuItem>
            <MenuItem>ログアウト</MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </Flex>
  );
};

export default Header;
