import React from 'react';
import { render, screen, fireEvent } from '../../../test-utils/providers';
import EditorLayout from './EditorLayout';

describe('EditorLayout Component', () => {
    it('renders title and content correctly', () => {
        render(
            <EditorLayout title="エディタタイトル">
                エディタコンテンツ
            </EditorLayout>
        );
        
        expect(screen.getByText('エディタタイトル')).toBeInTheDocument();
        expect(screen.getByText('エディタコンテンツ')).toBeInTheDocument();
    });
    
    it('renders toolbar when provided', () => {
        render(
            <EditorLayout 
                title="エディタ"
                toolbar={<button>ツールバーボタン</button>}
            >
                コンテンツ
            </EditorLayout>
        );
        
        expect(screen.getByRole('toolbar')).toBeInTheDocument();
        expect(screen.getByText('ツールバーボタン')).toBeInTheDocument();
    });
    
    it('toggles preview when preview button is clicked', () => {
        const mockTogglePreview = jest.fn();
        
        render(
            <EditorLayout 
                title="エディタ"
                showPreview={true}
                previewContent={<div>プレビュー</div>}
                onTogglePreview={mockTogglePreview}
            >
                エディタコンテンツ
            </EditorLayout>
        );
        
        // プレビューが表示されていることを確認
        expect(screen.getByText('プレビュー')).toBeInTheDocument();
        
        // プレビュー切り替えボタンをクリック
        const toggleButton = screen.getByRole('button', { name: 'プレビューを隠す' });
        fireEvent.click(toggleButton);
        
        // コールバックが呼ばれたことを確認
        expect(mockTogglePreview).toHaveBeenCalledTimes(1);
        
        // プレビューが非表示になったことを確認
        expect(screen.queryByText('プレビュー')).not.toBeInTheDocument();
    });
    
    it('calls onSave when save button is clicked', () => {
        const mockSave = jest.fn();
        
        render(
            <EditorLayout 
                title="エディタ"
                onSave={mockSave}
            >
                コンテンツ
            </EditorLayout>
        );
        
        // 保存ボタンをクリック
        const saveButton = screen.getByRole('button', { name: '保存' });
        fireEvent.click(saveButton);
        
        // コールバックが呼ばれたことを確認
        expect(mockSave).toHaveBeenCalledTimes(1);
    });
    
    it('does not render save button when onSave is not provided', () => {
        render(
            <EditorLayout title="エディタ">
                コンテンツ
            </EditorLayout>
        );
        
        // 保存ボタンが表示されていないことを確認
        expect(screen.queryByRole('button', { name: '保存' })).not.toBeInTheDocument();
    });
    
    it('initializes preview visibility based on showPreview prop', () => {
        // showPreview=falseで初期化
        const { rerender } = render(
            <EditorLayout 
                title="エディタ"
                showPreview={false}
                previewContent={<div>プレビュー</div>}
            >
                コンテンツ
            </EditorLayout>
        );
        
        // プレビューが非表示であることを確認
        expect(screen.queryByText('プレビュー')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'プレビューを表示' })).toBeInTheDocument();
        
        // showPreview=trueで再レンダリング
        rerender(
            <EditorLayout 
                title="エディタ"
                showPreview={true}
                previewContent={<div>プレビュー</div>}
            >
                コンテンツ
            </EditorLayout>
        );
        
        // プレビューが表示されていることを確認
        expect(screen.getByText('プレビュー')).toBeInTheDocument();
    });
});