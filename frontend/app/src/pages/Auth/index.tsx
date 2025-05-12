import { Box, Heading, Text, Container, VStack } from '@chakra-ui/react';
import LoginForm from './LoginForm';

/**
 * 認証ページコンポーネント
 * ログインと新規登録の機能を提供する
 * 
 * @returns {JSX.Element} 認証ページのUI
 */
const AuthPage = (): JSX.Element => {
    return (
        <Container maxW="md" py={12}>
            <VStack spacing={8} align="stretch">
                <Box textAlign="center">
                    <Heading as="h1" size="xl">ヘルパーシステム</Heading>
                    <Text mt={2} color="gray.600">アカウント管理</Text>
                </Box>
                <Box p={8} borderWidth="1px" borderRadius="lg" boxShadow="md">
                    <Heading as="h2" size="md" mb={4} textAlign="center">ログイン</Heading>
                    <LoginForm />
                </Box>
            </VStack>
        </Container>
    );
};

export default AuthPage;