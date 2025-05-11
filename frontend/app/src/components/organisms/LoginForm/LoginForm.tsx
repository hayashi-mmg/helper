import { useState } from 'react';
import { 
    Box, 
    Button, 
    FormControl, 
    FormLabel, 
    Input, 
    FormErrorMessage,
    VStack,
    Link,
    Text,
    useToast,
    InputGroup,
    InputRightElement,
    IconButton
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../../../store/useAuthStore';
import { Link as RouterLink } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useState } from 'react';

// バリデーションスキーマ
const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'メールアドレスは必須です')
        .email('正しいメールアドレス形式で入力してください'),
    password: z
        .string()
        .min(1, 'パスワードは必須です')
        .min(8, 'パスワードは8文字以上で入力してください')
});

// フォーム入力の型定義
type LoginFormInputs = z.infer<typeof loginSchema>;

export interface LoginFormProps {
    /**
     * ログイン成功時のコールバック
     */
    onSuccess?: () => void;
    
    /**
     * 外部からのエラーメッセージ
     */
    externalError?: string;
    
    /**
     * フォームのアクション（フォーム送信先URL）
     * 直接API呼び出しでなくフォーム送信する場合に使用
     */
    formAction?: string;
    
    /**
     * パスワードリセットページへのリンクを表示するか
     * @default true
     */
    showForgotPassword?: boolean;
    
    /**
     * 会員登録ページへのリンクを表示するか
     * @default true
     */
    showSignUpLink?: boolean;
    
    /**
     * 会員登録ページへのリンクURL
     * @default "/register"
     */
    signUpUrl?: string;
    
    /**
     * パスワードリセットページへのリンクURL
     * @default "/reset-password"
     */
    forgotPasswordUrl?: string;
}

/**
 * ログインフォームコンポーネント
 * 
 * メールアドレスとパスワードによるログイン機能を提供します。
 * React Hook FormとZodを使用したバリデーションを実装しています。
 */
const LoginForm: React.FC<LoginFormProps> = ({
    onSuccess,
    externalError,
    formAction,
    showForgotPassword = true,
    showSignUpLink = true,
    signUpUrl = '/register',
    forgotPasswordUrl = '/reset-password'
}) => {
    const [isLoading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const login = useAuthStore(state => state.login);
    const authError = useAuthStore(state => state.error);
    const clearError = useAuthStore(state => state.clearError);
    const toast = useToast();
    
    const { 
        register, 
        handleSubmit, 
        formState: { errors }
    } = useForm<LoginFormInputs>({
        resolver: zodResolver(loginSchema),
        mode: 'onChange'
    });
    
    // パスワード表示/非表示の切り替え
    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    
    // フォーム送信処理
    const onSubmit = async (data: LoginFormInputs) => {
        try {
            setLoading(true);
            clearError();
            await login(data.email, data.password);
            
            // ログイン成功
            toast({
                title: 'ログイン成功',
                description: 'ようこそ戻ってきました',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
            
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('ログイン処理中にエラーが発生しました', error);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <Box width="100%">
            <form 
                onSubmit={handleSubmit(onSubmit)} 
                action={formAction}
                noValidate
                data-testid="login-form"
            >
                <VStack spacing={4}>
                    <FormControl isInvalid={!!errors.email}>
                        <FormLabel htmlFor="email">メールアドレス</FormLabel>
                        <Input
                            id="email"
                            type="email"
                            placeholder="your-email@example.com"
                            {...register('email')}
                            data-testid="login-email"
                        />
                        <FormErrorMessage>
                            {errors.email?.message}
                        </FormErrorMessage>
                    </FormControl>
                    
                    <FormControl isInvalid={!!errors.password}>
                        <FormLabel htmlFor="password">パスワード</FormLabel>
                        <InputGroup>
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="パスワードを入力"
                                {...register('password')}
                                data-testid="login-password"
                            />
                            <InputRightElement>
                                <IconButton
                                    aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                                    icon={showPassword ? <FiEyeOff /> : <FiEye />}
                                    variant="ghost"
                                    onClick={togglePasswordVisibility}
                                    size="sm"
                                />
                            </InputRightElement>
                        </InputGroup>
                        <FormErrorMessage>
                            {errors.password?.message}
                        </FormErrorMessage>
                    </FormControl>
                    
                    {(authError || externalError) && (
                        <Text color="red.500" fontSize="sm" textAlign="center">
                            {externalError || authError}
                        </Text>
                    )}
                    
                    <Button
                        colorScheme="blue"
                        width="100%"
                        type="submit"
                        isLoading={isLoading}
                        loadingText="ログイン中..."
                        data-testid="login-submit"
                    >
                        ログイン
                    </Button>
                </VStack>
            </form>
            
            <VStack mt={4} spacing={2}>
                {showForgotPassword && (
                    <Link 
                        as={RouterLink}
                        to={forgotPasswordUrl}
                        color="blue.500"
                        fontSize="sm"
                    >
                        パスワードをお忘れですか？
                    </Link>
                )}
                
                {showSignUpLink && (
                    <Text fontSize="sm">
                        アカウントをお持ちでないですか？{' '}
                        <Link 
                            as={RouterLink}
                            to={signUpUrl}
                            color="blue.500"
                            fontWeight="medium"
                        >
                            会員登録
                        </Link>
                    </Text>
                )}
            </VStack>
        </Box>
    );
};

export default LoginForm;
