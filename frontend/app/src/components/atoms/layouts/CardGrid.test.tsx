import React from 'react';
import { render, screen } from '../../../test-utils/providers';
import CardGrid from './CardGrid';

describe('CardGrid Component', () => {
    it('renders children correctly', () => {
        render(
            <CardGrid>
                <div>カード1</div>
                <div>カード2</div>
                <div>カード3</div>
            </CardGrid>
        );
        
        expect(screen.getByText('カード1')).toBeInTheDocument();
        expect(screen.getByText('カード2')).toBeInTheDocument();
        expect(screen.getByText('カード3')).toBeInTheDocument();
    });
    
    it('applies correct grid styles', () => {
        const { container } = render(
            <CardGrid>
                <div>カード1</div>
            </CardGrid>
        );
        
        const grid = screen.getByTestId('card-grid');
        expect(grid).toHaveStyle('display: grid');
        expect(grid).toHaveStyle('width: 100%');
    });
    
    it('applies equal-width class when equalWidth is true', () => {
        render(
            <CardGrid equalWidth={true}>
                <div>カード</div>
            </CardGrid>
        );
        
        const grid = screen.getByTestId('card-grid');
        expect(grid).toHaveClass('equal-width');
    });
    
    it('does not apply equal-width class when equalWidth is false', () => {
        render(
            <CardGrid equalWidth={false}>
                <div>カード</div>
            </CardGrid>
        );
        
        const grid = screen.getByTestId('card-grid');
        expect(grid).not.toHaveClass('equal-width');
    });
    
    it('applies equal-height class when equalHeight is true', () => {
        render(
            <CardGrid equalHeight={true}>
                <div>カード</div>
            </CardGrid>
        );
        
        const grid = screen.getByTestId('card-grid');
        expect(grid).toHaveClass('equal-height');
    });
    
    it('does not apply equal-height class when equalHeight is false', () => {
        render(
            <CardGrid equalHeight={false}>
                <div>カード</div>
            </CardGrid>
        );
        
        const grid = screen.getByTestId('card-grid');
        expect(grid).not.toHaveClass('equal-height');
    });
    
    it('applies correct height to card items based on equalHeight prop', () => {
        // equalHeight=trueの場合
        const { rerender } = render(
            <CardGrid equalHeight={true}>
                <div>カード1</div>
                <div>カード2</div>
            </CardGrid>
        );
        
        // 各カードアイテムが100%の高さになっていることを確認
        let cardItems = screen.getAllByTestId(/card-item-\d+/);
        cardItems.forEach(item => {
            expect(item).toHaveStyle('height: 100%');
        });
        
        // equalHeight=falseの場合に再レンダリング
        rerender(
            <CardGrid equalHeight={false}>
                <div>カード1</div>
                <div>カード2</div>
            </CardGrid>
        );
        
        // 各カードアイテムがautoの高さになっていることを確認
        cardItems = screen.getAllByTestId(/card-item-\d+/);
        cardItems.forEach(item => {
            expect(item).toHaveStyle('height: auto');
        });
    });
    
    it('applies correct gap when provided as a number', () => {
        render(
            <CardGrid gap={6}>
                <div>カード</div>
            </CardGrid>
        );
        
        const grid = screen.getByTestId('card-grid');
        expect(grid).toHaveStyle('gap: var(--chakra-space-6)');
    });
    
    it('applies correct gap when provided as an object', () => {
        render(
            <CardGrid gap={{ x: 4, y: 8 }}>
                <div>カード</div>
            </CardGrid>
        );
        
        const grid = screen.getByTestId('card-grid');
        expect(grid).toHaveStyle('gap: var(--chakra-space-8) var(--chakra-space-4)');
    });
    
    it('applies minCardWidth correctly', () => {
        // 数値として指定
        const { rerender } = render(
            <CardGrid minCardWidth={300}>
                <div>カード</div>
            </CardGrid>
        );
        
        let grid = screen.getByTestId('card-grid');
        expect(grid.style.gridTemplateColumns).toContain('minmax(300px,');
        
        // 文字列として指定（単位付き）
        rerender(
            <CardGrid minCardWidth="200px">
                <div>カード</div>
            </CardGrid>
        );
        
        grid = screen.getByTestId('card-grid');
        expect(grid.style.gridTemplateColumns).toContain('minmax(200px,');
    });
    
    it('applies custom className when provided', () => {
        render(
            <CardGrid className="custom-grid">
                <div>カード</div>
            </CardGrid>
        );
        
        const grid = screen.getByTestId('card-grid');
        expect(grid).toHaveClass('custom-grid');
    });
});