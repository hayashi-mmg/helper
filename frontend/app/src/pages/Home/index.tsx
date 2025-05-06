import { Box, Heading, Text, Container, VStack } from '@chakra-ui/react';

/**
 * ホームページコンポーネント
 * アプリケーションのメインページを表示する
 * 
 * @returns {JSX.Element} ホームページのUI
 */
const HomePage = (): JSX.Element => {
    return (
        <Container maxW="container.xl" py={8}>
            <VStack spacing={8} align="stretch">
                <Box p={6} borderRadius="md" bg="brand.50">
                    <VStack spacing={4} align="stretch">
                        <Heading as="h1" size="xl">ヘルパーシステム</Heading>
                        <Text fontSize="lg">ホームページへようこそ</Text>
                    </VStack>
                </Box>
                
                <Box p={6} borderWidth="1px" borderRadius="md">
                    <VStack spacing={4} align="stretch">
                        <Heading as="h2" size="lg">最新情報</Heading>
                        <Text>システムの最新情報がここに表示されます。</Text>
                    </VStack>
                </Box>
            </VStack>
        </Container>
    );
};

export default HomePage;