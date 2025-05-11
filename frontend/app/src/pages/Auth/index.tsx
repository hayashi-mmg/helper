import { useState } from 'react';
import { Box, Heading, Text, Container, VStack, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

/**
 * 認証ページコンポーネント
 * ログインと新規登録の機能を提供する
 * 
 * @returns {JSX.Element} 認証ページのUI
 */
const AuthPage = (): JSX.Element => {
    const [tabIndex, setTabIndex] = useState(0);

    return (
        <Container maxW="md" py={12}>
            <VStack spacing={8} align="stretch">
                <Box textAlign="center">
                    <Heading as="h1" size="xl">ヘルパーシステム</Heading>
                    <Text mt={2} color="gray.600">アカウント管理</Text>
                </Box>
                
                <Box p={8} borderWidth="1px" borderRadius="lg" boxShadow="md">
                    <Tabs isFitted variant="enclosed" index={tabIndex} onChange={setTabIndex}>
                        <TabList mb={4}>
                            <Tab>ログイン</Tab>
                            <Tab>新規登録</Tab>
                        </TabList>
                        <TabPanels>                            <TabPanel p={0} pt={4}>
                                <LoginForm />
                            </TabPanel>
                            <TabPanel p={0} pt={4}>
                                <RegisterForm />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </Box>
            </VStack>
        </Container>
    );
};

export default AuthPage;