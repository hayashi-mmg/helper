import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EditorLayout } from '../EditorLayout';

// SplitLayoutコンポーネントをモック
jest.mock('../SplitLayout', () => ({
  __esModule: true,
  default: ({ leftPane, rightPane }) => (
    <div data-testid="mock-split-layout">
      <div data-testid="mock-left-pane">{leftPane}</div>
      <div data-testid="mock-right-pane">{rightPane}</div>
    </div>
  )
}));

describe('EditorLayout', () => {
  it('renders correctly with default props', () => {
    render(
      <EditorLayout
        title="エディタータイトル"
        previewContent={<div>プレビュー</div>}
      >
        エディターコンテンツ
      </EditorLayout>
    );
    
    // タイトルが表示されていることを確認
    expect(screen.getByText('エディタータイトル')).toBeInTheDocument();
    
    // デフォルトでプレビューが表示されていることを確認
    expect(screen.getByTestId('mock-split-layout')).toBeInTheDocument();
    expect(screen.getByTestId('mock-left-pane')).toHaveTextContent('エディターコンテンツ');
    expect(screen.getByTestId('mock-right-pane')).toHaveTextContent('プレビュー');
  });
  
  it('toggles preview when button is clicked', () => {
    render(
      <EditorLayout
        title="エディタータイトル"
        previewContent={<div>プレビュー</div>}
      >
        エディターコンテンツ
      </EditorLayout>
    );
    
    // プレビュートグルボタンを取得
    const toggleButton = screen.getByRole('button', { name: /プレビューを隠す/i });
    
    // SplitLayoutが表示されていることを確認
    expect(screen.getByTestId('mock-split-layout')).toBeInTheDocument();
    
    // ボタンをクリックしてプレビューを非表示にする
    fireEvent.click(toggleButton);
    
    // SplitLayoutが非表示になり、エディターコンテンツのみが表示されていることを確認
    expect(screen.queryByTestId('mock-split-layout')).not.toBeInTheDocument();
    expect(screen.getByText('エディターコンテンツ')).toBeInTheDocument();
    
    // ボタンのテキストが変更されていることを確認
    expect(screen.getByRole('button', { name: /プレビューを表示/i })).toBeInTheDocument();
    
    // 再度クリックしてプレビューを表示する
    fireEvent.click(screen.getByRole('button', { name: /プレビューを表示/i }));
    
    // SplitLayoutが再表示されていることを確認
    expect(screen.getByTestId('mock-split-layout')).toBeInTheDocument();
  });
  
  it('calls onSave callback when save button is clicked', () => {
    const handleSave = jest.fn();
    
    render(
      <EditorLayout
        title="エディタータイトル"
        previewContent={<div>プレビュー</div>}
        onSave={handleSave}
      >
        エディターコンテンツ
      </EditorLayout>
    );
    
    // 保存ボタンが表示されていることを確認
    const saveButton = screen.getByRole('button', { name: /保存/i });
    
    // 保存ボタンをクリックする
    fireEvent.click(saveButton);
    
    // コールバックが呼び出されたことを確認
    expect(handleSave).toHaveBeenCalledTimes(1);
  });
  
  it('does not render save button when onSave is not provided', () => {
    render(
      <EditorLayout
        title="エディタータイトル"
        previewContent={<div>プレビュー</div>}
      >
        エディターコンテンツ
      </EditorLayout>
    );
    
    // 保存ボタンが表示されていないことを確認
    expect(screen.queryByRole('button', { name: /保存/i })).not.toBeInTheDocument();
  });
  
  it('renders toolbar when provided', () => {
    render(
      <EditorLayout
        title="エディタータイトル"
        previewContent={<div>プレビュー</div>}
        toolbar={<div data-testid="toolbar-content">ツールバーコンテンツ</div>}
      >
        エディターコンテンツ
      </EditorLayout>
    );
    
    // ツールバーが表示されていることを確認
    expect(screen.getByTestId('toolbar-content')).toBeInTheDocument();
    expect(screen.getByText('ツールバーコンテンツ')).toBeInTheDocument();
  });
  
  it('calls onTogglePreview callback when toggle button is clicked', () => {
    const handleTogglePreview = jest.fn();
    
    render(
      <EditorLayout
        title="エディタータイトル"
        previewContent={<div>プレビュー</div>}
        onTogglePreview={handleTogglePreview}
      >
        エディターコンテンツ
      </EditorLayout>
    );
    
    // プレビュートグルボタンをクリックする
    fireEvent.click(screen.getByRole('button', { name: /プレビューを隠す/i }));
    
    // コールバックが呼び出されたことを確認
    expect(handleTogglePreview).toHaveBeenCalledTimes(1);
  });
  
  it('initializes preview visibility based on showPreview prop', () => {
    render(
      <EditorLayout
        title="エディタータイトル"
        previewContent={<div>プレビュー</div>}
        showPreview={false}
      >
        エディターコンテンツ
      </EditorLayout>
    );
    
    // プレビューが最初から非表示になっていることを確認
    expect(screen.queryByTestId('mock-split-layout')).not.toBeInTheDocument();
    expect(screen.getByText('エディターコンテンツ')).toBeInTheDocument();
    
    // ボタンのテキストが表示用になっていることを確認
    expect(screen.getByRole('button', { name: /プレビューを表示/i })).toBeInTheDocument();
  });
  
  it('applies additional className correctly', () => {
    render(
      <EditorLayout
        title="エディタータイトル"
        previewContent={<div>プレビュー</div>}
        className="custom-class"
      >
        エディターコンテンツ
      </EditorLayout>
    );
    
    // エディタレイアウト要素にカスタムクラスが適用されていることを確認
    const editorLayoutElement = screen.getByText('エディタータイトル').closest('.editor-layout');
    expect(editorLayoutElement).toHaveClass('custom-class');
  });
});
