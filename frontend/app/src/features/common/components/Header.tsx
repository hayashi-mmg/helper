import { 
  Box,
  Flex,
  HStack,
  Image,
  Text,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  IconButton,
  useColorMode,
  useColorModeValue,
  Badge
} from "@chakra-ui/react";
import { FiUser, FiSun, FiMoon, FiBell } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useAuthState, useLogout } from "../../auth/hooks/useAuth";
import { useNotifications } from "../../user/hooks/useNotificationHooks";

/**
 * アプリケーションのヘッダーコンポーネント
 * アプリケーション上部に表示され、ユーザー関連アクションやナビゲーションを提供
 * 
 * @returns {JSX.Element} ヘッダーコンポーネント
 */
const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user } = useAuthState();
  const { logout } = useLogout();
  
  // 通知データを取得
  const { data: notifications } = useNotifications();
  const unreadNotifications = notifications?.filter(n => !n.isRead) || [];
  
  // ロゴイメージパス
  const logoSrc = useColorModeValue("/logo-dark.svg", "/logo-light.svg");

  return (
    <Box
      as="header"
      position="fixed"
      top="0"
      left="0"
      right="0"
      height="60px"
      bg={useColorModeValue("white", "gray.800")}
      borderBottomWidth="1px"
      borderColor={useColorModeValue("gray.200", "gray.700")}
      zIndex="sticky"
      px={4}
    >
      <Flex h="100%" alignItems="center" justifyContent="space-between">
        {/* ロゴ部分 */}
        <Link to="/">
          <Flex alignItems="center">
            <Image src={logoSrc} alt="Helper System" h="30px" />
            <Text
              ml={3}
              fontSize="xl"
              fontWeight="bold"
              color={useColorModeValue("blue.600", "blue.300")}
            >
              ヘルパーシステム
            </Text>
          </Flex>
        </Link>

        {/* 右側のアクション */}
        <HStack spacing={3}>
          {/* カラーモード切替ボタン */}
          <IconButton
            aria-label="カラーモード切替"
            icon={colorMode === "light" ? <FiMoon /> : <FiSun />}
            variant="ghost"
            onClick={toggleColorMode}
          />
          
          {/* 通知ボタン */}
          <Box position="relative">
            <IconButton
              aria-label="通知"
              icon={<FiBell />}
              variant="ghost"
            />
            {unreadNotifications.length > 0 && (
              <Badge
                colorScheme="red"
                borderRadius="full"
                position="absolute"
                top="0"
                right="0"
                transform="translate(25%, -25%)"
              >
                {unreadNotifications.length}
              </Badge>
            )}
          </Box>
          
          {/* ユーザーメニュー */}
          {user ? (
            <Menu>
              <MenuButton
                as={Button}
                variant="ghost"
                rounded="full"
                cursor="pointer"
              >
                <Avatar 
                  size="sm" 
                  name={`${user.lastName} ${user.firstName}`} 
                  src={user.avatarUrl} 
                />
              </MenuButton>
              <MenuList>
                <Text px={4} py={2} fontWeight="medium">
                  {user.lastName} {user.firstName}
                </Text>
                <MenuDivider />
                <Link to="/profile">
                  <MenuItem>プロフィール</MenuItem>
                </Link>
                <Link to="/settings">
                  <MenuItem>設定</MenuItem>
                </Link>
                <MenuDivider />
                <MenuItem onClick={logout}>ログアウト</MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Link to="/login">
              <Button leftIcon={<FiUser />} colorScheme="blue" variant="outline">
                ログイン
              </Button>
            </Link>
          )}
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;
