import { Box, Heading, Text } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';

/**
 * リクエスト詳細ページコンポーネント
 */
const RequestDetailPage = () => {
    const { requestId } = useParams<{ requestId: string }>();
    
    return (
        <Box p="4">
            <Heading as="h1" mb="6">リクエスト詳細</Heading>
            <Text>リクエストID: {requestId}</Text>
            <Text>リクエスト詳細ページの実装が必要です</Text>
        </Box>
    );
};

export default RequestDetailPage;
