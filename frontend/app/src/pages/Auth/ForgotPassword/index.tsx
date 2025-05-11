import { Box, Button, FormControl, FormLabel, Heading, Input, Stack, Text, FormErrorMessage, useToast } from '@chakra-ui/react';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuthStore } from '../../../hooks/useAuth';
import { useState } from 'react';

/**
 * パスワード再設定リクエストページコンポーネント
 * パスワードを忘れたユーザー向けの再設定メール送信フォーム
 */
const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');
    
    const { resetPassword } = useAuthStore();
    const toast = useToast();

    /**
     * フォーム送信処理
     * @param e - フォームイベント
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        // 入力検証
        if (!email.trim()) {
            setError('メールアドレスを入力してください');
            return;
        }
        
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('有効なメールアドレスを入力してください');
            return;
        }
        
        try {
            // パスワードリセットメール送信
            await resetPassword(email);
            setIsSubmitted(true);
            toast({
                title: 'パスワード再設定メールを送信しました',
                description: 'メールの指示に従ってパスワードを再設定してください',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (err) {
            console.error('パスワード再設定エラー:', err);
            setError('パスワード再設定メールの送信に失敗しました。後でもう一度お試しください。');
        }
    };

    return (
        <Box maxW="md" mx="auto" mt="8" p="6" borderWidth="1px" borderRadius="lg">
            <Heading mb="6" textAlign="center">パスワードをお忘れですか？</Heading>
            
            {!isSubmitted ? (
                <>
                    <Text mb="4">
                        アカウントに関連付けられたメールアドレスを入力してください。パスワード再設定用のリンクをお送りします。
                    </Text>
                    
                    {error && (
                        <Text color="red.500" mb="4" textAlign="center">
                            {error}
                        </Text>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                        <Stack spacing="4">
                            <FormControl isInvalid={!!error}>
                                <FormLabel>メールアドレス</FormLabel>
                                <Input 
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                {error && (
                                    <FormErrorMessage>{error}</FormErrorMessage>
                                )}
                            </FormControl>
                            
                            <Button 
                                type="submit" 
                                colorScheme="blue" 
                                size="lg" 
                                width="full"
                            >
                                再設定メールを送信
                            </Button>
                        </Stack>
                    </form>
                </>
            ) : (
                <Text textAlign="center">
                    パスワード再設定用のメールを送信しました。メールの指示に従って操作を完了してください。
                </Text>
            )}
            
            <Text mt="4" textAlign="center">
                <RouterLink to="/login">ログインページに戻る</RouterLink>
            </Text>
        </Box>
    );
};

export default ForgotPasswordPage;
