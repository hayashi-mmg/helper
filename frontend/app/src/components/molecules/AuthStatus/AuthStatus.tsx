import {
    Box,
    Button,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuDivider,
    Avatar,
    Text,
    Flex,
    useColorModeValue,
    IconButton,
} from '@chakra-ui/react';
import { FiChevronDown, FiLogOut, FiSettings, FiUser, FiLogIn } from 'react-icons/fi';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/useAuthStore';

export interface AuthStatusProps {
    /**
     * ログインページへのURL
     * @default "/login"
     */
    loginUrl?: string;
    
    /**
     * 会員登録ページへのURL
     * @default "/register"
     */
    registerUrl?: string;
    
    /**
     * プロフィールページへのURL
     * @default "/profile"
     */
    profileUrl?: string;
    
    /**
     * 設定ページへのURL
     * @default "/settings"
     */
    settingsUrl?: string;
    
    /**
     * コンポーネントの表示サイズ
     * @default "md"
     */
    size?: 'sm' | 'md' | 'lg';
    
    /**
     * モバイルデザインを強制するか
     * @default false
     */
    forceMobile?: boolean;
}

/**
 * 認証状態表示コンポーネント
 * 
 * ログイン状態やユーザー情報を表示し、関連するアクションを提供します。
 * 未ログイン時はログイン/登録ボタン、ログイン時はユーザーメニューを表示します。
 */
const AuthStatus: React.FC<AuthStatusProps> = ({
    loginUrl = '/login',
    registerUrl = '/register',
    profileUrl = '/profile',
    settingsUrl = '/settings',
    size = 'md',
    forceMobile = false
}) => {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const user = useAuthStore(state => state.user);
    const logout = useAuthStore(state => state.logout);
    const navigate = useNavigate();
    
    // カラー設定
    const menuBg = useColorModeValue('white', 'gray.800');
    const menuBorder = useColorModeValue('gray.200', 'gray.700');
    
    // サイズの設定
    const avatarSize = size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm';
    const buttonSize = size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm';
    const fontSize = size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm';
    
    // ログアウト処理
    const handleLogout = () => {
        logout();
        navigate(loginUrl);
    };
    
    // モバイルデザインまたはsmサイズの場合
    const isMobileStyle = forceMobile || size === 'sm';
    
    // 未認証時の表示
    if (!isAuthenticated) {
        return (
            <Flex align="center" gap={2}>
                {!isMobileStyle ? (
                    <>
                        <Button
                            as={RouterLink}
                            to={loginUrl}
                            variant="ghost"
                            size={buttonSize}
                            data-testid="auth-login-button"
                        >
                            ログイン
                        </Button>
                        <Button
                            as={RouterLink}
                            to={registerUrl}
                            colorScheme="blue"
                            size={buttonSize}
                            data-testid="auth-register-button"
                        >
                            会員登録
                        </Button>
                    </>
                ) : (
                    <>
                        <IconButton
                            as={RouterLink}
                            to={loginUrl}
                            aria-label="ログイン"
                            icon={<FiLogIn />}
                            size={buttonSize}
                            variant="ghost"
                            data-testid="auth-login-icon"
                        />
                        <Button
                            as={RouterLink}
                            to={registerUrl}
                            colorScheme="blue"
                            size={buttonSize}
                            data-testid="auth-register-button-mobile"
                        >
                            登録
                        </Button>
                    </>
                )}
            </Flex>
        );
    }
    
    // 認証済み時のユーザーメニュー
    return (
        <Box data-testid="auth-user-menu">
            <Menu>
                <MenuButton
                    as={Button}
                    rounded="full"
                    variant="link"
                    cursor="pointer"
                    minW={0}
                >
                    <Flex align="center" gap={2}>
                        <Avatar
                            size={avatarSize}
                            name={user?.name}
                            src={user?.avatar}
                        />
                        {!isMobileStyle && (
                            <Flex align="center">
                                <Text fontSize={fontSize} mr={1} fontWeight="medium">
                                    {user?.name}
                                </Text>
                                <FiChevronDown />
                            </Flex>
                        )}
                    </Flex>
                </MenuButton>
                <MenuList
                    bg={menuBg}
                    borderColor={menuBorder}
                    zIndex={100}
                >
                    <Box px={3} py={1}>
                        <Text fontWeight="bold">
                            {user?.name}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                            {user?.email}
                        </Text>
                    </Box>
                    <MenuDivider />
                    <MenuItem 
                        as={RouterLink} 
                        to={profileUrl}
                        icon={<FiUser />}
                        data-testid="auth-profile-link"
                    >
                        プロフィール
                    </MenuItem>
                    <MenuItem 
                        as={RouterLink} 
                        to={settingsUrl}
                        icon={<FiSettings />}
                        data-testid="auth-settings-link"
                    >
                        設定
                    </MenuItem>
                    <MenuDivider />
                    <MenuItem 
                        icon={<FiLogOut />}
                        onClick={handleLogout}
                        data-testid="auth-logout-button"
                    >
                        ログアウト
                    </MenuItem>
                </MenuList>
            </Menu>
        </Box>
    );
};

export default AuthStatus;
