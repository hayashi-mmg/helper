import React, { useRef, useState } from 'react';
import {
    FormControl,
    FormLabel,
    FormErrorMessage,
    FormHelperText,
    Button,
    Input,
    Box,
    Flex,
    Text,
    Image,
    Icon,
    IconButton,
    useColorModeValue,
    List,
    ListItem,
    Progress,
} from '@chakra-ui/react';
import { AttachmentIcon, CloseIcon, DownloadIcon } from '@chakra-ui/icons';

export interface FileInfo {
    /**
     * ファイル名
     */
    name: string;
    
    /**
     * ファイルサイズ（バイト）
     */
    size: number;
    
    /**
     * MIMEタイプ
     */
    type: string;
    
    /**
     * ファイルデータ（Blob/File）
     */
    file: File;
    
    /**
     * プレビュー用URL（画像の場合）
     */
    preview?: string;
}

export interface FileUploadInputProps {
    /**
     * ラベル
     */
    label?: string;
    
    /**
     * 選択されたファイル情報の配列
     */
    value?: FileInfo[];
    
    /**
     * エラーメッセージ
     */
    error?: string;
    
    /**
     * ヘルプテキスト
     */
    helperText?: string;
    
    /**
     * 必須フィールドかどうか
     * @default false
     */
    isRequired?: boolean;
    
    /**
     * 複数ファイルの選択を許可するかどうか
     * @default false
     */
    multiple?: boolean;
    
    /**
     * 許可するファイルタイプ（例: "image/*", ".pdf,.doc"）
     */
    accept?: string;
    
    /**
     * ファイルサイズの上限（バイト単位）
     * @default 5242880 (5MB)
     */
    maxSize?: number;
    
    /**
     * 画像プレビューを表示するかどうか
     * @default true
     */
    showPreview?: boolean;
    
    /**
     * ドラッグ&ドロップを有効にするかどうか
     * @default true
     */
    enableDragDrop?: boolean;
    
    /**
     * コンポーネントが無効化されているかどうか
     * @default false
     */
    isDisabled?: boolean;
    
    /**
     * ファイルが選択されたときのコールバック
     */
    onChange?: (files: FileInfo[]) => void;
    
    /**
     * アップロード中かどうか
     * @default false
     */
    isUploading?: boolean;
    
    /**
     * アップロードの進捗（0～100）
     */
    progress?: number;
    
    /**
     * コンポーネントのID
     */
    id?: string;
}

/**
 * ファイルアップロードコンポーネント
 * ファイルの選択とプレビュー機能を提供します
 */
export const FileUploadInput: React.FC<FileUploadInputProps> = ({
    label,
    value = [],
    error,
    helperText,
    isRequired = false,
    multiple = false,
    accept,
    maxSize = 5 * 1024 * 1024, // 5MB
    showPreview = true,
    enableDragDrop = true,
    isDisabled = false,
    onChange,
    isUploading = false,
    progress = 0,
    id,
}) => {
    // 一意のIDを生成（指定がない場合）
    const fileInputId = id || `file-upload-${Math.random().toString(36).substr(2, 9)}`;
    
    // 入力要素への参照
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // ドラッグオーバー状態
    const [isDragOver, setIsDragOver] = useState(false);
    
    // 内部エラー状態
    const [internalError, setInternalError] = useState<string | null>(null);
    
    // テーマの色
    const bgColor = useColorModeValue('gray.50', 'gray.700');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const dragOverColor = useColorModeValue('blue.50', 'blue.900');
    
    // ファイル選択ダイアログを開く
    const openFileDialog = () => {
        if (!isDisabled && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    
    // ファイルサイズをフォーマット
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        else if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        else return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    };
    
    // ファイル処理関数
    const processFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        
        setInternalError(null);
        
        // 選択されたファイルをFileInfo配列に変換
        const newFiles: FileInfo[] = [];
        
        Array.from(files).forEach(file => {
            // ファイルサイズチェック
            if (file.size > maxSize) {
                setInternalError(`ファイルサイズが大きすぎます。上限は${formatFileSize(maxSize)}です。`);
                return;
            }
            
            const fileInfo: FileInfo = {
                name: file.name,
                size: file.size,
                type: file.type,
                file: file,
            };
            
            // 画像ファイルの場合はプレビューURLを生成
            if (file.type.startsWith('image/')) {
                fileInfo.preview = URL.createObjectURL(file);
            }
            
            newFiles.push(fileInfo);
        });
        
        if (newFiles.length > 0) {
            // 複数ファイル選択の場合は既存のファイルに追加、そうでなければ置き換え
            const updatedFiles = multiple ? [...value, ...newFiles] : newFiles;
            
            if (onChange) {
                onChange(updatedFiles);
            }
        }
    };
    
    // ファイル選択ハンドラー
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(e.target.files);
        
        // 同じファイルを再選択できるようにする
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    // ファイル削除ハンドラー
    const handleRemoveFile = (index: number) => {
        if (isDisabled || isUploading) return;
        
        const updatedFiles = [...value];
        
        // プレビューURLがある場合は解放
        if (updatedFiles[index].preview) {
            URL.revokeObjectURL(updatedFiles[index].preview);
        }
        
        updatedFiles.splice(index, 1);
        
        if (onChange) {
            onChange(updatedFiles);
        }
    };
    
    // ドラッグ&ドロップイベントハンドラー
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!isDisabled && !isUploading && enableDragDrop) {
            setIsDragOver(true);
        }
    };
    
    const handleDragLeave = () => {
        setIsDragOver(false);
    };
    
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        
        if (!isDisabled && !isUploading && enableDragDrop) {
            setIsDragOver(false);
            processFiles(e.dataTransfer.files);
        }
    };
    
    // 表示するエラー（外部から渡されたエラーと内部エラーを統合）
    const displayError = error || internalError;
    
    return (
        <FormControl isInvalid={!!displayError} isRequired={isRequired} mb={4}>
            {label && (
                <FormLabel htmlFor={fileInputId}>{label}</FormLabel>
            )}
            
            <Box 
                borderWidth={2} 
                borderRadius="md" 
                borderStyle="dashed" 
                borderColor={isDragOver ? 'blue.400' : borderColor}
                bg={isDragOver ? dragOverColor : bgColor}
                p={4} 
                textAlign="center"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                position="relative"
                data-testid={`${fileInputId}-dropzone`}
                opacity={isDisabled ? 0.6 : 1}
                cursor={isDisabled ? 'not-allowed' : 'pointer'}
                onClick={openFileDialog}
            >
                <Input
                    id={fileInputId}
                    ref={fileInputRef}
                    type="file"
                    multiple={multiple}
                    accept={accept}
                    onChange={handleFileChange}
                    display="none"
                    data-testid={`${fileInputId}-input`}
                    disabled={isDisabled || isUploading}
                />
                
                <Icon as={AttachmentIcon} boxSize={10} color="gray.500" mb={2} />
                
                <Text mb={2}>
                    {enableDragDrop 
                        ? 'クリックまたはファイルをドラッグ＆ドロップしてください'
                        : 'クリックしてファイルを選択してください'
                    }
                </Text>
                
                <Text fontSize="sm" color="gray.500">
                    {multiple ? '複数のファイルを選択できます' : ''}
                    {accept && ` • 対応形式: ${accept}`}
                    {` • 最大サイズ: ${formatFileSize(maxSize)}`}
                </Text>
                
                {isUploading && (
                    <Box mt={4} w="100%">
                        <Progress 
                            value={progress} 
                            size="sm" 
                            colorScheme="blue" 
                            borderRadius="full"
                        />
                        <Text fontSize="sm" mt={1} color="blue.500">
                            アップロード中... {progress}%
                        </Text>
                    </Box>
                )}
            </Box>
            
            {value.length > 0 && (
                <List spacing={2} mt={4}>
                    {value.map((file, index) => (
                        <ListItem 
                            key={`${file.name}-${index}`}
                            p={2}
                            borderWidth={1}
                            borderRadius="md"
                            borderColor={borderColor}
                        >
                            <Flex alignItems="center">
                                {/* 画像ファイルの場合はプレビューを表示 */}
                                {showPreview && file.preview && (
                                    <Box mr={3} width="48px" height="48px" flexShrink={0}>
                                        <Image 
                                            src={file.preview} 
                                            alt={file.name} 
                                            objectFit="cover"
                                            width="100%"
                                            height="100%"
                                            borderRadius="md"
                                        />
                                    </Box>
                                )}
                                
                                <Box flex="1">
                                    <Text fontWeight="medium" isTruncated title={file.name}>
                                        {file.name}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">
                                        {formatFileSize(file.size)}
                                    </Text>
                                </Box>
                                
                                <IconButton
                                    icon={<CloseIcon />}
                                    aria-label="ファイルを削除"
                                    size="sm"
                                    colorScheme="red"
                                    variant="ghost"
                                    isDisabled={isDisabled || isUploading}
                                    onClick={() => handleRemoveFile(index)}
                                />
                            </Flex>
                        </ListItem>
                    ))}
                </List>
            )}
            
            {helperText && !displayError && (
                <FormHelperText mt={2}>{helperText}</FormHelperText>
            )}
            
            {displayError && (
                <FormErrorMessage>{displayError}</FormErrorMessage>
            )}
        </FormControl>
    );
};

export default FileUploadInput;