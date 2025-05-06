import { useEffect, useState } from 'react'
import './App.css'
import { setupCspViolationReporting } from './utils/security'
import { getEnv } from './utils/env'
import { 
    Box, 
    Container, 
    Heading, 
    Text, 
    VStack, 
    HStack,
    List,
    ListItem,
    ListIcon,
    useColorMode,
    IconButton
} from '@chakra-ui/react'
import Button from './components/atoms/Button'
import Input from './components/atoms/Input'

/**
 * アプリケーションのルートコンポーネント
 * セキュリティ設定と基本的なレイアウトを提供
 */
function App() {
    // アプリ名を環境変数から取得
    const appName = getEnv('VITE_APP_NAME', 'ヘルパーシステム')
    const [inputValue, setInputValue] = useState('')
    const [showError, setShowError] = useState(false)
    const { colorMode, toggleColorMode } = useColorMode()

    // CSP違反レポートの設定
    useEffect(() => {
        setupCspViolationReporting()
        
        // CSRF保護のためのメタタグを追加
        const csrfMeta = document.createElement('meta')
        csrfMeta.setAttribute('name', 'csrf-token')
        csrfMeta.setAttribute('content', crypto.randomUUID())
        document.head.appendChild(csrfMeta)
        
        return () => {
            // クリーンアップ時にメタタグを削除
            document.head.removeChild(csrfMeta)
        }
    }, [])

    // 入力フィールドの検証
    const validateInput = () => {
        setShowError(inputValue.length < 3)
    }

    return (
        <Container maxW="container.xl" py={8}>
            <VStack spacing={8} align="stretch">
                <Box as="header" py={4} display="flex" justifyContent="space-between" alignItems="center">
                    <Heading as="h1" size="xl">{appName}</Heading>
                    <IconButton
                        aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
                        icon={colorMode === 'light' ? <span>🌙</span> : <span>☀️</span>}
                        onClick={toggleColorMode}
                        variant="ghost"
                    />
                </Box>
                
                <Box as="main">
                    <VStack spacing={6} align="stretch">
                        <Box bg={colorMode === 'light' ? 'brand.50' : 'brand.900'} p={6} borderRadius="md">
                            <VStack spacing={4} align="stretch">
                                <Heading as="h2" size="lg">UIライブラリ導入完了</Heading>
                                <Text>Chakra UIを使用したコンポーネントのデモンストレーション</Text>
                            </VStack>
                        </Box>
                        
                        <Box p={6} borderWidth="1px" borderRadius="md">
                            <VStack spacing={6} align="stretch">
                                <Heading as="h3" size="md">ボタンコンポーネント</Heading>
                                
                                <HStack spacing={4}>
                                    <Button>デフォルト</Button>
                                    <Button colorScheme="blue">青色</Button>
                                    <Button variant="outline">アウトライン</Button>
                                    <Button isDisabled>無効</Button>
                                    <Button isLoading>読み込み中</Button>
                                </HStack>
                            </VStack>
                        </Box>
                        
                        <Box p={6} borderWidth="1px" borderRadius="md">
                            <VStack spacing={6} align="stretch">
                                <Heading as="h3" size="md">フォームコンポーネント</Heading>
                                
                                <Input
                                    id="demo-input"
                                    label="お名前"
                                    placeholder="名前を入力してください"
                                    helperText="3文字以上入力してください"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onBlur={validateInput}
                                    errorMessage={showError ? "3文字以上入力してください" : undefined}
                                />
                                
                                <HStack>
                                    <Button onClick={validateInput}>検証</Button>
                                    <Button 
                                        variant="outline" 
                                        onClick={() => {
                                            setInputValue('')
                                            setShowError(false)
                                        }}
                                    >
                                        クリア
                                    </Button>
                                </HStack>
                            </VStack>
                        </Box>
                        
                        <Box p={6} borderWidth="1px" borderRadius="md">
                            <VStack spacing={4} align="stretch">
                                <Heading as="h3" size="md">完了した設定</Heading>
                                
                                <List spacing={2}>
                                    <ListItem>
                                        <ListIcon as={() => <span>✅</span>} />
                                        Chakra UIのインストールと基本設定
                                    </ListItem>
                                    <ListItem>
                                        <ListIcon as={() => <span>✅</span>} />
                                        カスタムテーマの作成
                                    </ListItem>
                                    <ListItem>
                                        <ListIcon as={() => <span>✅</span>} />
                                        グローバルスタイルの適用
                                    </ListItem>
                                    <ListItem>
                                        <ListIcon as={() => <span>✅</span>} />
                                        基本コンポーネントの実装
                                    </ListItem>
                                    <ListItem>
                                        <ListIcon as={() => <span>✅</span>} />
                                        テストコードの作成
                                    </ListItem>
                                </List>
                            </VStack>
                        </Box>
                    </VStack>
                </Box>
                
                <Box as="footer" py={4} textAlign="center">
                    <Text>&copy; {new Date().getFullYear()} {appName}</Text>
                </Box>
            </VStack>
        </Container>
    )
}

export default App
