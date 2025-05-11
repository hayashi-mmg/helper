import { Box, Heading, Text } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';

/**
 * ヘルパー詳細ページコンポーネント
 */
const HelperDetailPage = () => {
    const { helperId } = useParams<{ helperId: string }>();
    
    return (
        <Box p="4">
            <Heading as="h1" mb="6">ヘルパー詳細</Heading>
            <Text>ヘルパーID: {helperId}</Text>
            <Text>ヘルパー詳細ページの実装が必要です</Text>
        </Box>
    );
};

export default HelperDetailPage;
