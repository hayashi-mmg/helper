
import { render, screen } from '../../../test-utils/providers';
import ContentContainer from './ContentContainer';
import { Component } from 'react';

describe('ContentContainer Component', () => {
    it('renders children correctly', () => {
        render(
            <ContentContainer>
                <div>テストコンテンツ</div>
            </ContentContainer>
        );
        
        expect(screen.getByText('テストコンテンツ')).toBeInTheDocument();
    });
    
    it('applies appropriate styles based on maxWidth prop', () => {
        const sizes = ['xs', 'sm', 'md', 'lg', 'xl', 'full'] as const;
        const maxWidthMap = {
            xs: '480px',
            sm: '600px',
            md: '960px',
            lg: '1280px',
            xl: '1920px',
            full: '100%'
        };
        
        sizes.forEach(size => {
            const { container, unmount } = render(
                <ContentContainer maxWidth={size}>テスト</ContentContainer>
            );
            
            const containerEl = container.querySelector('[data-testid="content-container"]');
            expect(containerEl).toHaveStyle(`max-width: ${maxWidthMap[size]}`);
            
            unmount();
        });
    });
    
    it('applies horizontal padding when withHorizontalPadding is true', () => {
        const { container } = render(
            <ContentContainer withHorizontalPadding={true}>
                コンテンツ
            </ContentContainer>
        );
        
        const containerEl = container.querySelector('[data-testid="content-container"]');
        // base: 4 (16px) の padding が適用されていることを確認
        expect(containerEl).toHaveStyle('padding-left: var(--chakra-space-4)');
        expect(containerEl).toHaveStyle('padding-right: var(--chakra-space-4)');
    });
    
    it('does not apply horizontal padding when withHorizontalPadding is false', () => {
        const { container } = render(
            <ContentContainer withHorizontalPadding={false}>
                コンテンツ
            </ContentContainer>
        );
        
        const containerEl = container.querySelector('[data-testid="content-container"]');
        expect(containerEl).toHaveStyle('padding-left: 0px');
        expect(containerEl).toHaveStyle('padding-right: 0px');
    });
    
    it('applies vertical padding when withVerticalPadding is true', () => {
        const { container } = render(
            <ContentContainer withVerticalPadding={true}>
                コンテンツ
            </ContentContainer>
        );
        
        const containerEl = container.querySelector('[data-testid="content-container"]');
        // py: 6 (24px) の padding が適用されていることを確認
        expect(containerEl).toHaveStyle('padding-top: var(--chakra-space-6)');
        expect(containerEl).toHaveStyle('padding-bottom: var(--chakra-space-6)');
    });
    
    it('does not apply vertical padding when withVerticalPadding is false', () => {
        const { container } = render(
            <ContentContainer withVerticalPadding={false}>
                コンテンツ
            </ContentContainer>
        );
        
        const containerEl = container.querySelector('[data-testid="content-container"]');
        expect(containerEl).toHaveStyle('padding-top: 0px');
        expect(containerEl).toHaveStyle('padding-bottom: 0px');
    });
    
    it('centers content when centered prop is true', () => {
        const { container } = render(
            <ContentContainer centered={true}>
                コンテンツ
            </ContentContainer>
        );
        
        const containerEl = container.querySelector('[data-testid="content-container"]');
        expect(containerEl).toHaveStyle('margin-left: auto');
        expect(containerEl).toHaveStyle('margin-right: auto');
    });
    
    it('does not center content when centered prop is false', () => {
        const { container } = render(
            <ContentContainer centered={false}>
                コンテンツ
            </ContentContainer>
        );
        
        const containerEl = container.querySelector('[data-testid="content-container"]');
        expect(containerEl).not.toHaveStyle('margin-left: auto');
        expect(containerEl).not.toHaveStyle('margin-right: auto');
    });
});