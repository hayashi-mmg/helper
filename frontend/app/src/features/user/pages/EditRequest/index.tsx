import { Box, Heading, Text } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';

/**
 * リクエスト編集ページコンポーネント
 */
const EditRequestPage = () => {
    const { requestId } = useParams<{ requestId: string }>();
    
    return (
        <Box p="4">
            <Heading as="h1" mb="6">リクエスト編集</Heading>
            <Text>リクエストID: {requestId}</Text>
            <Text>リクエスト編集ページの実装が必要です</Text>
        </Box>
    );
};

export default EditRequestPage;
