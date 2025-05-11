
import { render, screen, fireEvent, waitFor } from '../../../test-utils/providers';
import FileUploadInput, { FileInfo } from './FileUploadInput';
import { Component } from 'react';

// ファイルオブジェクトのモック作成
const createMockFile = (name: string, size: number, type: string): File => {
    const file = new File(["dummy content"], name, { type });
    Object.defineProperty(file, 'size', {
        value: size,
        configurable: true
    });
    return file;
};

// URL.createObjectURLとURL.revokeObjectURLのモック
const mockCreateObjectURL = jest.fn(() => 'mock-url');
const mockRevokeObjectURL = jest.fn();

// グローバルURLオブジェクトをモック
global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

describe('FileUploadInput Component', () => {
    beforeEach(() => {
        // 各テスト前にモック関数をリセット
        jest.clearAllMocks();
    });

    it('renders with label correctly', () => {
        render(<FileUploadInput label="添付ファイル" />);
        
        expect(screen.getByText('添付ファイル')).toBeInTheDocument();
        expect(screen.getByText(/クリックまたはファイルをドラッグ＆ドロップしてください/)).toBeInTheDocument();
    });

    it('renders with helper text correctly', () => {
        render(
            <FileUploadInput 
                label="添付ファイル" 
                helperText="最大3ファイルまでアップロードできます" 
            />
        );
        
        expect(screen.getByText('最大3ファイルまでアップロードできます')).toBeInTheDocument();
    });

    it('renders with error message correctly', () => {
        render(
            <FileUploadInput 
                label="添付ファイル" 
                error="ファイルを選択してください" 
            />
        );
        
        expect(screen.getByText('ファイルを選択してください')).toBeInTheDocument();
    });

    it('prioritizes error message over helper text', () => {
        render(
            <FileUploadInput 
                label="添付ファイル" 
                helperText="最大3ファイルまでアップロードできます" 
                error="ファイルを選択してください" 
            />
        );
        
        expect(screen.getByText('ファイルを選択してください')).toBeInTheDocument();
        expect(screen.queryByText('最大3ファイルまでアップロードできます')).not.toBeInTheDocument();
    });

    it('displays custom accepted file types and size limits', () => {
        const maxSize = 2 * 1024 * 1024; // 2MB
        render(
            <FileUploadInput 
                label="画像アップロード" 
                accept="image/png,image/jpeg" 
                maxSize={maxSize}
            />
        );
        
        expect(screen.getByText(/対応形式: image\/png,image\/jpeg/)).toBeInTheDocument();
        expect(screen.getByText(/最大サイズ: 2.0 MB/)).toBeInTheDocument();
    });

    it('renders differently for multiple file selection', () => {
        render(<FileUploadInput label="添付ファイル" multiple />);
        
        expect(screen.getByText(/複数のファイルを選択できます/)).toBeInTheDocument();
        
        // hiddenのinput要素がmultiple属性を持っていることを確認
        const input = document.querySelector('input[type="file"]');
        expect(input).toHaveAttribute('multiple');
    });

    it('shows file list when files are selected', () => {
        // モックファイル情報
        const mockFiles: FileInfo[] = [
            {
                name: 'document.pdf',
                size: 1024 * 500, // 500KB
                type: 'application/pdf',
                file: createMockFile('document.pdf', 1024 * 500, 'application/pdf')
            },
            {
                name: 'image.png',
                size: 1024 * 200, // 200KB
                type: 'image/png',
                file: createMockFile('image.png', 1024 * 200, 'image/png'),
                preview: 'mock-image-url'
            }
        ];
        
        render(<FileUploadInput label="添付ファイル" value={mockFiles} />);
        
        // ファイル名が表示されていることを確認
        expect(screen.getByText('document.pdf')).toBeInTheDocument();
        expect(screen.getByText('image.png')).toBeInTheDocument();
        
        // ファイルサイズが表示されていることを確認
        expect(screen.getByText('500.0 KB')).toBeInTheDocument();
        expect(screen.getByText('200.0 KB')).toBeInTheDocument();
    });

    it('calls onChange when files are selected', async () => {
        const handleChange = jest.fn();
        
        render(<FileUploadInput label="添付ファイル" onChange={handleChange} />);
        
        // ファイル選択をシミュレート
        const file = createMockFile('test.txt', 1024, 'text/plain');
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        
        // モックでファイル選択をシミュレート
        // Note: fireEventではinput type="file"のファイル選択をシミュレートする際に制限があるため簡易的に実装
        Object.defineProperty(input, 'files', {
            value: [file],
            configurable: true
        });
        
        fireEvent.change(input);
        
        // onChangeが呼ばれたことを確認
        expect(handleChange).toHaveBeenCalledTimes(1);
        
        // 渡された引数を確認
        const filesArg = handleChange.mock.calls[0][0];
        expect(filesArg).toHaveLength(1);
        expect(filesArg[0].name).toBe('test.txt');
        expect(filesArg[0].size).toBe(1024);
        expect(filesArg[0].type).toBe('text/plain');
        expect(filesArg[0].file).toBe(file);
    });

    it('displays upload progress when isUploading is true', () => {
        render(<FileUploadInput label="添付ファイル" isUploading progress={75} />);
        
        expect(screen.getByText('アップロード中... 75%')).toBeInTheDocument();
        expect(document.querySelector('.chakra-progress')).toBeInTheDocument();
    });

    it('disables the component when isDisabled is true', () => {
        render(<FileUploadInput label="添付ファイル" isDisabled />);
        
        // ドロップゾーンが無効化されていることを確認
        const dropzone = screen.getByTestId(/file-upload-.*-dropzone/);
        expect(dropzone).toHaveStyle('opacity: 0.6');
        expect(dropzone).toHaveStyle('cursor: not-allowed');
        
        // input要素も無効化されていることを確認
        const input = document.querySelector('input[type="file"]');
        expect(input).toBeDisabled();
    });

    it('allows removing selected files', () => {
        const handleChange = jest.fn();
        const mockFiles: FileInfo[] = [
            {
                name: 'document.pdf',
                size: 1024 * 500,
                type: 'application/pdf',
                file: createMockFile('document.pdf', 1024 * 500, 'application/pdf')
            }
        ];
        
        render(
            <FileUploadInput 
                label="添付ファイル" 
                value={mockFiles} 
                onChange={handleChange} 
            />
        );
        
        // 削除ボタンをクリック
        const removeButton = screen.getByLabelText('ファイルを削除');
        fireEvent.click(removeButton);
        
        // onChangeが呼ばれ、空の配列が渡されたことを確認
        expect(handleChange).toHaveBeenCalledWith([]);
        
        // プレビューURLがある場合はrevokeObjectURLが呼ばれることを確認
        const mockFilesWithPreview: FileInfo[] = [
            {
                name: 'image.png',
                size: 1024 * 200,
                type: 'image/png',
                file: createMockFile('image.png', 1024 * 200, 'image/png'),
                preview: 'mock-url'
            }
        ];
        
        handleChange.mockClear();
        
        render(
            <FileUploadInput 
                label="添付ファイル" 
                value={mockFilesWithPreview} 
                onChange={handleChange} 
            />
        );
        
        const removeButton2 = screen.getByLabelText('ファイルを削除');
        fireEvent.click(removeButton2);
        
        expect(mockRevokeObjectURL).toHaveBeenCalledWith('mock-url');
    });
});