
import { render, screen } from '../../../test-utils/providers';
import AuthLayout from './AuthLayout';
import { Component } from 'react';

describe('AuthLayout Component', () => {
    it('renders children correctly', () => {
        render(
            <AuthLayout>
                <form>ログインフォーム</form>
            </AuthLayout>
        );
        
        expect(screen.getByText('ログインフォーム')).toBeInTheDocument();
    });
    
    it('displays logo by default', () => {
        render(<AuthLayout>コンテンツ</AuthLayout>);
        
        // ロゴ画像が表示されていることを確認
        const logo = screen.getByAltText('ヘルパーシステム');
        expect(logo).toBeInTheDocument();
        expect(logo.tagName).toBe('IMG');
    });
    
    it('hides logo when showLogo is false', () => {
        render(<AuthLayout showLogo={false}>コンテンツ</AuthLayout>);
        
        // ロゴ画像が表示されていないことを確認
        expect(screen.queryByAltText('ヘルパーシステム')).toBeNull();
    });
    
    it('displays title when provided', () => {
        render(<AuthLayout title="ログイン">コンテンツ</AuthLayout>);
        
        expect(screen.getByText('ログイン')).toBeInTheDocument();
        expect(screen.getByRole('heading')).toHaveTextContent('ログイン');
    });
    
    it('displays footer content when provided', () => {
        render(
            <AuthLayout footerContent={<p>フッターテキスト</p>}>
                コンテンツ
            </AuthLayout>
        );
        
        expect(screen.getByText('フッターテキスト')).toBeInTheDocument();
    });
    
    it('applies background image when provided', () => {
        const bgImage = 'https://example.com/bg.jpg';
        const { container } = render(
            <AuthLayout backgroundImage={bgImage}>コンテンツ</AuthLayout>
        );
        
        // スタイルが正しく適用されているか確認
        const rootElement = container.firstChild as HTMLElement;
        expect(rootElement).toHaveStyle(`background-image: url(${bgImage})`);
    });
});