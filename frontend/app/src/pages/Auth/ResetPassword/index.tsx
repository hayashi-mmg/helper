import { Box, Button, FormControl, FormLabel, Heading, Input, Stack, Text, FormErrorMessage, useToast } from '@chakra-ui/react';
import { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../hooks/useAuth';
import { useState } from 'react';

/**
 * パスワード再設定ページコンポーネント
 * トークン付きURLからアクセスされ、新しいパスワードを設定する
 */
const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [isCompleted, setIsCompleted] = useState(false);
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    
    const location = useLocation();
    const toast = useToast();
    
    // URLからトークンを取得
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    /**
     * フォーム送信処理
     * @param e - フォームイベント
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        
        // 入力検証
        const newErrors: {[key: string]: string} = {};
        
        if (!password) {
            newErrors.password = '新しいパスワードは必須です';
        } else if (password.length < 8) {
            newErrors.password = 'パスワードは8文字以上必要です';
        }
        
        if (password !== passwordConfirm) {
            newErrors.passwordConfirm = 'パスワードが一致しません';
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        if (!token) {
            toast({
                title: 'エラー',
                description: '無効なリセットリンクです。パスワード再設定メールを再度リクエストしてください。',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            return;
        }
          try {
            // 認証サービスを使用してパスワードリセットを実行
            const authService = (await import('../../../services/authService')).default;
            await authService.confirmPasswordReset(token, password);
            
            setIsCompleted(true);
            toast({
                title: 'パスワードが正常に再設定されました',
                description: '新しいパスワードでログインできます',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (err) {
            console.error('パスワード再設定エラー:', err);
            toast({
                title: 'エラー',
                description: 'パスワードの再設定に失敗しました。もう一度お試しください。',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    // トークンがない場合はエラーメッセージを表示
    if (!token && !isCompleted) {
        return (
            <Box maxW="md" mx="auto" mt="8" p="6" borderWidth="1px" borderRadius="lg">
                <Heading mb="6" textAlign="center">無効なリンク</Heading>
                <Text textAlign="center">
                    このリンクは無効または期限切れです。
                    <br />
                    パスワード再設定プロセスをもう一度開始してください。
                </Text>
                <Button 
                    as={RouterLink} 
                    to="/forgot-password"
                    mt="4"
                    width="full"
                    colorScheme="blue"
                >
                    パスワード再設定を再リクエスト
                </Button>
            </Box>
        );
    }

    return (
        <Box maxW="md" mx="auto" mt="8" p="6" borderWidth="1px" borderRadius="lg">
            <Heading mb="6" textAlign="center">新しいパスワードの設定</Heading>
            
            {!isCompleted ? (
                <form onSubmit={handleSubmit}>
                    <Stack spacing="4">
                        <FormControl isInvalid={!!errors.password}>
                            <FormLabel>新しいパスワード</FormLabel>
                            <Input 
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {errors.password && (
                                <FormErrorMessage>{errors.password}</FormErrorMessage>
                            )}
                        </FormControl>
                        
                        <FormControl isInvalid={!!errors.passwordConfirm}>
                            <FormLabel>パスワードの確認</FormLabel>
                            <Input 
                                type="password"
                                value={passwordConfirm}
                                onChange={(e) => setPasswordConfirm(e.target.value)}
                            />
                            {errors.passwordConfirm && (
                                <FormErrorMessage>{errors.passwordConfirm}</FormErrorMessage>
                            )}
                        </FormControl>
                        
                        <Button 
                            type="submit" 
                            colorScheme="blue" 
                            size="lg" 
                            width="full"
                        >
                            パスワードを再設定
                        </Button>
                    </Stack>
                </form>
            ) : (
                <>
                    <Text textAlign="center" mb="4">
                        パスワードが正常に再設定されました。新しいパスワードでログインしてください。
                    </Text>
                    <Button 
                        as={RouterLink}
                        to="/login"
                        colorScheme="blue"
                        width="full"
                    >
                        ログインページへ
                    </Button>
                </>
            )}
        </Box>
    );
};

export default ResetPasswordPage;
