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
    Alert,
    AlertIcon,
    Divider
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link as RouterLink } from 'react-router-dom';
import { useState } from 'react';

// バリデーションスキーマ
const passwordResetSchema = z.object({
    email: z
        .string()
        .min(1, 'メールアドレスは必須です')
        .email('正しいメールアドレス形式で入力してください'),
});

// フォーム入力の型定義
type PasswordResetFormInputs = z.infer<typeof passwordResetSchema>;

export interface PasswordResetFormProps {
    /**
     * 送信成功時のコールバック
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
     * ログインページへのリンクURL
     * @default "/login"
     */
    loginUrl?: string;
    
    /**
     * 会員登録ページへのリンクURL
     * @default "/register"
     */
    registerUrl?: string;
}

/**
 * パスワードリセットフォームコンポーネント
 * 
 * パスワードリセットメール送信機能を提供します。
 * React Hook FormとZodを使用したバリデーションを実装しています。
 */
const PasswordResetForm: React.FC<PasswordResetFormProps> = ({
    onSuccess,
    externalError,
    formAction,
    loginUrl = '/login',
    registerUrl = '/register'
}) => {
    const [isLoading, setLoading] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState('');
    const toast = useToast();
    
    const { 
        register,
        handleSubmit, 
        formState: { errors }
    } = useForm<PasswordResetFormInputs>({
        resolver: zodResolver(passwordResetSchema),
        mode: 'onChange'
    });
    
    // フォーム送信処理
    const onSubmit = async (data: PasswordResetFormInputs) => {
        try {
            setLoading(true);
            
            // TODO: 実際のAPIリクエストを実装する
            // 現在はモック処理
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 送信成功
            setSubmitSuccess(true);
            setSubmittedEmail(data.email);
            
            toast({
                title: 'メール送信完了',
                description: 'パスワードリセット用のメールを送信しました',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
            
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('パスワードリセットメール送信中にエラーが発生しました', error);
            toast({
                title: 'エラーが発生しました',
                description: error instanceof Error ? error.message : 'パスワードリセットメールの送信に失敗しました',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };
    
    // 送信成功後の表示
    if (submitSuccess) {
        return (
            <Box width="100%" data-testid="password-reset-success">
                <Alert status="success" borderRadius="md" mb={4}>
                    <AlertIcon />
                    パスワードリセット用のメールを送信しました
                </Alert>
                
                <Text mb={4}>
                    <strong>{submittedEmail}</strong> 宛にパスワードリセット用のリンクをお送りしました。
                    メールの指示に従ってパスワードのリセット手続きを完了してください。
                </Text>
                
                <Text mb={4} fontSize="sm">
                    メールが届かない場合は、迷惑メールフォルダをご確認いただくか、
                    メールアドレスが正しく入力されているかご確認ください。
                </Text>
                
                <Button 
                    as={RouterLink}
                    to={loginUrl}
                    colorScheme="blue"
                    width="100%"
                    mt={4}
                >
                    ログインページに戻る
                </Button>
            </Box>
        );
    }
    
    return (
        <Box width="100%">
            <Text mb={6}>
                登録時に使用したメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
            </Text>
            
            <form 
                onSubmit={handleSubmit(onSubmit)} 
                action={formAction}
                noValidate
                data-testid="password-reset-form"
            >
                <VStack spacing={4}>
                    <FormControl isInvalid={!!errors.email}>
                        <FormLabel htmlFor="email">メールアドレス</FormLabel>
                        <Input
                            id="email"
                            type="email"
                            placeholder="your-email@example.com"
                            {...register('email')}
                            data-testid="password-reset-email"
                        />
                        <FormErrorMessage>
                            {errors.email?.message}
                        </FormErrorMessage>
                    </FormControl>
                    
                    {externalError && (
                        <Text color="red.500" fontSize="sm" textAlign="center">
                            {externalError}
                        </Text>
                    )}
                    
                    <Button
                        colorScheme="blue"
                        width="100%"
                        type="submit"
                        isLoading={isLoading}
                        loadingText="送信中..."
                        data-testid="password-reset-submit"
                    >
                        パスワードリセットリンクを送信
                    </Button>
                </VStack>
            </form>
            
            <Box mt={6}>
                <Divider mb={4} />
                <VStack spacing={2}>
                    <Link 
                        as={RouterLink}
                        to={loginUrl}
                        color="blue.500"
                    >
                        ログインページに戻る
                    </Link>
                    
                    <Text fontSize="sm">
                        アカウントをお持ちでないですか？{' '}
                        <Link 
                            as={RouterLink}
                            to={registerUrl}
                            color="blue.500"
                        >
                            会員登録
                        </Link>
                    </Text>
                </VStack>
            </Box>
        </Box>
    );
};

export default PasswordResetForm;
