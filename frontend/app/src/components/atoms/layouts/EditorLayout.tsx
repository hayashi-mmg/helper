import { useState } from 'react';
import { Box, Flex, Button, IconButton, useColorModeValue } from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useState } from 'react';

export interface EditorLayoutProps {
    /**
     * エディタタイトル
     */
    title: string;
    
    /**
     * エディタメインコンテンツ
     */
    children: React.ReactNode;
    
    /**
     * ツールバーコンテンツ
     */
    toolbar?: React.ReactNode;
    
    /**
     * プレビューパネルの表示
     * @default true
     */
    showPreview?: boolean;
    
    /**
     * プレビューコンテンツ
     */
    previewContent?: React.ReactNode;
    
    /**
     * 保存ボタンクリック時のコールバック
     */
    onSave?: () => void;
    
    /**
     * プレビュートグルボタンクリック時のコールバック
     */
    onTogglePreview?: () => void;
    
    /**
     * 追加のクラス名
     */
    className?: string;
}

/**
 * コンテンツ編集ページ用のレイアウト
 * ツールバー、編集エリア、プレビューエリアを含みます
 */
export const EditorLayout: React.FC<EditorLayoutProps> = ({
    title,
    children,
    toolbar,
    showPreview = true,
    previewContent,
    onSave,
    onTogglePreview,
    className
}) => {
    const [isPreviewVisible, setPreviewVisible] = useState(showPreview);
    
    const handleTogglePreview = () => {
        const newState = !isPreviewVisible;
        setPreviewVisible(newState);
        if (onTogglePreview) {
            onTogglePreview();
        }
    };
    
    const TOOLBAR_HEIGHT = "48px";
    const headerBg = useColorModeValue('white', 'gray.800');
    const contentBg = useColorModeValue('white', 'gray.900');
    const previewBg = useColorModeValue('gray.50', 'gray.700');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    
    return (
        <Flex 
            direction="column" 
            h="100vh"
            data-testid="editor-layout"
            className={className}
        >
            {/* ヘッダー */}
            <Flex
                h="64px"
                p={4}
                bg={headerBg}
                borderBottomWidth="1px"
                borderBottomColor={borderColor}
                alignItems="center"
                justifyContent="space-between"
            >
                <Box as="h1" fontSize="xl" fontWeight="bold" flex="1">
                    {title}
                </Box>
                
                <Flex>
                    <IconButton
                        icon={isPreviewVisible ? <ViewOffIcon /> : <ViewIcon />}
                        aria-label={isPreviewVisible ? "プレビューを隠す" : "プレビューを表示"}
                        mr={2}
                        onClick={handleTogglePreview}
                    />
                    
                    {onSave && (
                        <Button colorScheme="blue" onClick={onSave}>
                            保存
                        </Button>
                    )}
                </Flex>
            </Flex>
            
            {/* ツールバー */}
            {toolbar && (
                <Flex
                    as="div"
                    role="toolbar"
                    h={TOOLBAR_HEIGHT}
                    p={2}
                    bg={headerBg}
                    borderBottomWidth="1px"
                    borderBottomColor={borderColor}
                    alignItems="center"
                >
                    {toolbar}
                </Flex>
            )}
            
            {/* メインエリア */}
            <Flex 
                flex="1"
                overflow="hidden"
            >
                {/* 編集エリア */}
                <Box
                    flex={isPreviewVisible ? "60%" : "100%"}
                    bg={contentBg}
                    overflowY="auto"
                    transition="flex 0.3s ease-in-out"
                    p={4}
                >
                    {children}
                </Box>
                
                {/* プレビューエリア */}
                {isPreviewVisible && previewContent && (
                    <>
                        {/* スプリッター */}
                        <Box
                            role="separator"
                            w="4px"
                            bg={borderColor}
                            cursor="col-resize"
                            _hover={{ bg: 'gray.300' }}
                            onDoubleClick={() => {
                                // ダブルクリックで50/50リセット
                            }}
                        />
                        
                        {/* プレビュー */}
                        <Box
                            flex="40%"
                            bg={previewBg}
                            overflowY="auto"
                            p={4}
                        >
                            {previewContent}
                        </Box>
                    </>
                )}
            </Flex>
        </Flex>
    );
};

export default EditorLayout;