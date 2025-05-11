import { 
    Box, 
    Heading, 
    Text, 
    SimpleGrid,  
    Grid, 
    GridItem, 
    Stack
} from '@chakra-ui/react';
import Card from '../../../../components/atoms/Card';
import { CardHeader, CardBody } from '../../../../components/atoms/CardLayout';

/**
 * ダッシュボードページコンポーネント
 * ユーザーのメインダッシュボード画面
 */
const DashboardPage = () => {
    return (
        <Box p="4">
            <Heading as="h1" mb="6">ダッシュボード</Heading>
            
            <SimpleGrid columns={{ base: 1, md: 3 }} gap="4" mb="6">                <Card>
                    <CardHeader title="リクエスト概要" />
                    <CardBody>                        <Stack gap={2}>
                            <Text fontWeight="medium">進行中のリクエスト</Text>
                            <Text fontSize="2xl">3</Text>
                        </Stack>
                    </CardBody>
                </Card>
                  <Card>
                    <CardHeader title="ヘルパー情報" />
                    <CardBody>                        <Stack gap={2}>
                            <Text fontWeight="medium">登録済みヘルパー</Text>
                            <Text fontSize="2xl">12</Text>
                        </Stack>
                    </CardBody>
                </Card>
                  <Card>
                    <CardHeader title="通知" />
                    <CardBody>                        <Stack gap={2}>
                            <Text fontWeight="medium">未読通知</Text>
                            <Text fontSize="2xl">5</Text>
                        </Stack>
                    </CardBody>
                </Card>
            </SimpleGrid>
            
            <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(4, 1fr)" }} gap={6}>
                <GridItem colSpan={{ base: 1, md: 2 }}>                    <Card>
                        <CardHeader title="最近のリクエスト" />
                        <CardBody>
                            <Text>リクエストデータがありません</Text>
                        </CardBody>
                    </Card>
                </GridItem>
                
                <GridItem colSpan={{ base: 1, md: 2 }}>                    <Card>
                        <CardHeader title="最近のアクティビティ" />
                        <CardBody>
                            <Text>最近のアクティビティはありません</Text>
                        </CardBody>
                    </Card>
                </GridItem>
            </Grid>
        </Box>
    );
};

export default DashboardPage;
