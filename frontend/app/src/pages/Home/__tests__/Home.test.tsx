import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from '../index';

// Chakra UIコンポーネントのモック
vi.mock('@chakra-ui/react', async () => {
    const actual = await vi.importActual('@chakra-ui/react');
    return {
        ...actual as any,
        // 必要に応じてChakra UIコンポーネントをモック
    };
});

describe('HomePage', () => {
    it('正しくレンダリングされること', () => {
        render(<HomePage />);
        
        // 見出し要素を確認
        expect(screen.getByText('ヘルパーシステム')).toBeInTheDocument();
        expect(screen.getByText('ホームページへようこそ')).toBeInTheDocument();
        
        // コンテンツ要素を確認
        expect(screen.getByText('最新情報')).toBeInTheDocument();
        expect(screen.getByText('システムの最新情報がここに表示されます。')).toBeInTheDocument();
    });
});