import { Box, Heading, Text, Container, VStack, Button } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

/**
 * 404ページコンポーネント
 * ページが見つからない場合に表示する
 * 
 * @returns {JSX.Element} 404ページのUI
 */
const NotFoundPage = (): JSX.Element => {
    return (
        <Container maxW="lg" py={16}>
            <VStack spacing={8} align="center">
                <Box textAlign="center">
                    <Heading as="h1" size="4xl" mb={2}>404</Heading>
                    <Heading as="h2" size="xl" mb={6}>ページが見つかりません</Heading>
                    <Text fontSize="lg" mb={8}>
                        お探しのページは存在しないか、移動した可能性があります。
                    </Text>
                    <Button as={Link} to="/" colorScheme="blue" size="lg">
                        ホームに戻る
                    </Button>
                </Box>
            </VStack>
        </Container>
    );
};

export default NotFoundPage;