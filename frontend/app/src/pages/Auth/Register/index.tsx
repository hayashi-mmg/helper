import { Box, Heading, Button, FormControl, FormLabel, Input, Stack, Text, Link, FormErrorMessage, useToast } from '@chakra-ui/react';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuthStore } from '../../../hooks/useAuth';
import { useState } from 'react';

/**
 * ユーザー登録ページコンポーネント
 * 新規アカウント作成フォームを提供する
 */
const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    
    const { register, error } = useAuthStore();
    const toast = useToast();

    /**
     * フォーム送信処理
     * @param e - フォームイベント
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        
        // 入力検証
        const newErrors: {[key: string]: string} = {};
        
        if (!username.trim()) {
            newErrors.username = 'ユーザー名は必須です';
        }
        
        if (!email.trim()) {
            newErrors.email = 'メールアドレスは必須です';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = '有効なメールアドレスを入力してください';
        }
        
        if (!password) {
            newErrors.password = 'パスワードは必須です';
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
        
        try {
            // 登録処理
            await register(username, email, password);
            toast({
                title: 'アカウントが作成されました',
                description: 'ログインページに移動します',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (err) {
            console.error('登録エラー:', err);
        }
    };

    return (
        <Box maxW="md" mx="auto" mt="8" p="6" borderWidth="1px" borderRadius="lg">
            <Heading mb="6" textAlign="center">アカウント登録</Heading>
            
            {error && (
                <Text color="red.500" mb="4" textAlign="center">
                    {error}
                </Text>
            )}
            
            <form onSubmit={handleSubmit}>
                <Stack spacing="4">
                    <FormControl isInvalid={!!errors.username}>
                        <FormLabel>ユーザー名</FormLabel>
                        <Input 
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        {errors.username && (
                            <FormErrorMessage>{errors.username}</FormErrorMessage>
                        )}
                    </FormControl>
                    
                    <FormControl isInvalid={!!errors.email}>
                        <FormLabel>メールアドレス</FormLabel>
                        <Input 
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        {errors.email && (
                            <FormErrorMessage>{errors.email}</FormErrorMessage>
                        )}
                    </FormControl>
                    
                    <FormControl isInvalid={!!errors.password}>
                        <FormLabel>パスワード</FormLabel>
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
                        <FormLabel>パスワード（確認）</FormLabel>
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
                        登録する
                    </Button>
                </Stack>
            </form>
            
            <Text mt="4" textAlign="center">
                すでにアカウントをお持ちですか？{' '}
                <Link as={RouterLink} to="/login" color="blue.500">
                    ログイン
                </Link>
            </Text>
        </Box>
    );
};

export default RegisterPage;
