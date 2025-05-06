import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotFoundPage from '../index';

// テスト用ラッパーコンポーネント（react-router-dom対応）
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
        {children}
    </BrowserRouter>
);

describe('NotFoundPage', () => {
    it('404ページが正しくレンダリングされること', () => {
        render(
            <TestWrapper>
                <NotFoundPage />
            </TestWrapper>
        );
        
        // 見出し要素を確認
        expect(screen.getByText('404')).toBeInTheDocument();
        expect(screen.getByText('ページが見つかりません')).toBeInTheDocument();
        
        // 説明文を確認
        expect(screen.getByText('お探しのページは存在しないか、移動した可能性があります。')).toBeInTheDocument();
        
        // ホームに戻るボタンを確認
        const homeButton = screen.getByText('ホームに戻る');
        expect(homeButton).toBeInTheDocument();
        expect(homeButton.closest('a')).toHaveAttribute('href', '/');
    });
});