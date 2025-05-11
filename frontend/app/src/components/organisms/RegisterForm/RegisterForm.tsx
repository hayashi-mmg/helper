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
    IconButton,
    Checkbox,
    Divider
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../../../store/useAuthStore';
import { Link as RouterLink } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useState } from 'react';

// バリデーションスキーマ
const registerSchema = z.object({
    name: z
        .string()
        .min(1, '名前は必須です')
        .max(50, '名前は50文字以内で入力してください'),
    email: z
        .string()
        .min(1, 'メールアドレスは必須です')
        .email('正しいメールアドレス形式で入力してください'),
    password: z
        .string()
        .min(1, 'パスワードは必須です')
        .min(8, 'パスワードは8文字以上で入力してください')
        .regex(/[A-Z]/, 'パスワードには大文字を含める必要があります')
        .regex(/[a-z]/, 'パスワードには小文字を含める必要があります')
        .regex(/[0-9]/, 'パスワードには数字を含める必要があります'),
    confirmPassword: z
        .string()
        .min(1, 'パスワード（確認）は必須です'),
    agreeTerms: z
        .boolean()
        .refine(val => val === true, {
            message: '利用規約に同意する必要があります',
        }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "パスワードが一致しません",
    path: ["confirmPassword"],
});

// フォーム入力の型定義
type RegisterFormInputs = z.infer<typeof registerSchema>;

export interface RegisterFormProps {
    /**
     * 登録成功時のコールバック
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
     * ログインページへのリンクを表示するか
     * @default true
     */
    showLoginLink?: boolean;
    
    /**
     * ログインページへのリンクURL
     * @default "/login"
     */
    loginUrl?: string;
    
    /**
     * 利用規約ページへのURL
     * @default "/terms"
     */
    termsUrl?: string;
    
    /**
     * プライバシーポリシーページへのURL
     * @default "/privacy"
     */
    privacyUrl?: string;
}

/**
 * ユーザー登録フォームコンポーネント
 * 
 * 新規ユーザー登録機能を提供します。
 * React Hook FormとZodを使用したバリデーションを実装しています。
 */
const RegisterForm: React.FC<RegisterFormProps> = ({
    onSuccess,
    externalError,
    formAction,
    showLoginLink = true,
    loginUrl = '/login',
    termsUrl = '/terms',
    privacyUrl = '/privacy'
}) => {
    const [isLoading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const register = useAuthStore(state => state.register);
    const authError = useAuthStore(state => state.error);
    const clearError = useAuthStore(state => state.clearError);
    const toast = useToast();
    
    const { 
        register: registerField, 
        handleSubmit, 
        formState: { errors }
    } = useForm<RegisterFormInputs>({
        resolver: zodResolver(registerSchema),
        mode: 'onChange'
    });
    
    // パスワード表示/非表示の切り替え
    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);
    
    // フォーム送信処理
    const onSubmit = async (data: RegisterFormInputs) => {
        try {
            setLoading(true);
            clearError();
            await register(data.email, data.password, data.name);
            
            // 登録成功
            toast({
                title: '会員登録完了',
                description: 'アカウント登録が完了しました',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
            
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('登録処理中にエラーが発生しました', error);
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
                data-testid="register-form"
            >
                <VStack spacing={4}>
                    <FormControl isInvalid={!!errors.name}>
                        <FormLabel htmlFor="name">名前</FormLabel>
                        <Input
                            id="name"
                            placeholder="山田 太郎"
                            {...registerField('name')}
                            data-testid="register-name"
                        />
                        <FormErrorMessage>
                            {errors.name?.message}
                        </FormErrorMessage>
                    </FormControl>
                
                    <FormControl isInvalid={!!errors.email}>
                        <FormLabel htmlFor="email">メールアドレス</FormLabel>
                        <Input
                            id="email"
                            type="email"
                            placeholder="your-email@example.com"
                            {...registerField('email')}
                            data-testid="register-email"
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
                                {...registerField('password')}
                                data-testid="register-password"
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
                    
                    <FormControl isInvalid={!!errors.confirmPassword}>
                        <FormLabel htmlFor="confirmPassword">パスワード（確認）</FormLabel>
                        <InputGroup>
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="同じパスワードを再入力"
                                {...registerField('confirmPassword')}
                                data-testid="register-confirm-password"
                            />
                            <InputRightElement>
                                <IconButton
                                    aria-label={showConfirmPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                                    icon={showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                    variant="ghost"
                                    onClick={toggleConfirmPasswordVisibility}
                                    size="sm"
                                />
                            </InputRightElement>
                        </InputGroup>
                        <FormErrorMessage>
                            {errors.confirmPassword?.message}
                        </FormErrorMessage>
                    </FormControl>
                    
                    <FormControl isInvalid={!!errors.agreeTerms}>
                        <Checkbox
                            id="agreeTerms"
                            {...registerField('agreeTerms')}
                            data-testid="register-agree-terms"
                        >
                            <Text fontSize="sm">
                                <Link as={RouterLink} to={termsUrl} color="blue.500" isExternal>利用規約</Link>
                                {' '}および{' '}
                                <Link as={RouterLink} to={privacyUrl} color="blue.500" isExternal>プライバシーポリシー</Link>
                                {' '}に同意します
                            </Text>
                        </Checkbox>
                        <FormErrorMessage>
                            {errors.agreeTerms?.message}
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
                        loadingText="登録中..."
                        data-testid="register-submit"
                    >
                        会員登録
                    </Button>
                </VStack>
            </form>
            
            {showLoginLink && (
                <Box mt={6}>
                    <Divider mb={4} />
                    <Text fontSize="sm" textAlign="center">
                        すでにアカウントをお持ちですか？{' '}
                        <Link 
                            as={RouterLink}
                            to={loginUrl}
                            color="blue.500"
                            fontWeight="medium"
                        >
                            ログイン
                        </Link>
                    </Text>
                </Box>
            )}
        </Box>
    );
};

export default RegisterForm;
