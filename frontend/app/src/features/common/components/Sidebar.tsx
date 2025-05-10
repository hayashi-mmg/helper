import { 
  Box, 
  Flex, 
  VStack, 
  Icon, 
  Text, 
  Divider,
  useColorModeValue
} from "@chakra-ui/react";
import { 
  FiHome, 
  FiClipboard, 
  FiUsers, 
  FiSettings,
  FiHelpCircle,
  FiLogOut
} from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import { useAuthState, useLogout } from "../../auth/hooks/useAuth";

/**
 * サイドバーのナビゲーションリンク項目の型定義
 */
type NavItemProps = {
  icon: React.ElementType;
  children: React.ReactNode;
  to: string;
  isActive?: boolean;
  onClick?: () => void;
};

/**
 * サイドバーのナビゲーションリンク項目コンポーネント
 */
const NavItem = ({ icon, children, to, isActive, onClick }: NavItemProps) => {
  // アクティブかどうかでスタイルを変える
  const activeColor = useColorModeValue("blue.500", "blue.300");
  const hoverBg = useColorModeValue("gray.100", "gray.700");
  const bg = isActive ? useColorModeValue("blue.50", "blue.900") : "transparent";
  const color = isActive ? activeColor : useColorModeValue("gray.700", "gray.200");

  return (
    <Link to={to} onClick={onClick} style={{ textDecoration: "none" }}>
      <Flex
        align="center"
        p="3"
        mx="4"
        borderRadius="md"
        role="group"
        cursor="pointer"
        bg={bg}
        color={color}
        _hover={{
          bg: hoverBg,
          color: activeColor,
        }}
      >
        <Icon
          mr="3"
          fontSize="16"
          as={icon}
          color={isActive ? activeColor : "inherit"}
        />
        <Text fontSize="md" fontWeight={isActive ? "medium" : "normal"}>
          {children}
        </Text>
      </Flex>
    </Link>
  );
};

/**
 * サイドバーコンポーネント
 * アプリケーションの主要な導線となるナビゲーションを提供
 * 
 * @returns {JSX.Element} サイドバーコンポーネント
 */
const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuthState();
  const { logout } = useLogout();

  // 現在のパスがリンクのパスに一致するかチェック
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <Box
      as="nav"
      pos="fixed"
      top="60px"
      left="0"
      h="calc(100vh - 60px)"
      w="240px"
      bg={useColorModeValue("white", "gray.800")}
      borderRightWidth="1px"
      borderColor={useColorModeValue("gray.200", "gray.700")}
      py="5"
    >
      <VStack spacing="1" align="stretch">
        <NavItem icon={FiHome} to="/dashboard" isActive={isActive("/dashboard")}>
          ダッシュボード
        </NavItem>
        <NavItem icon={FiClipboard} to="/requests" isActive={isActive("/requests")}>
          依頼一覧
        </NavItem>
        <NavItem icon={FiUsers} to="/helpers" isActive={isActive("/helpers")}>
          ヘルパー一覧
        </NavItem>

        <Divider my="3" />

        <NavItem icon={FiSettings} to="/settings" isActive={isActive("/settings")}>
          設定
        </NavItem>
        <NavItem icon={FiHelpCircle} to="/help" isActive={isActive("/help")}>
          ヘルプ
        </NavItem>

        <Box flexGrow={1} />

        {user && (
          <NavItem icon={FiLogOut} to="#" onClick={logout}>
            ログアウト
          </NavItem>
        )}
      </VStack>
    </Box>
  );
};

export default Sidebar;
