
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import Card from './Card';
import { Component } from 'react';

// ChakraUIを使用したコンポーネントのテスト用ラッパー
const renderWithChakra = (ui: React.ReactElement) => {
    return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('Card Component', () => {
    it('renders children correctly', () => {
        renderWithChakra(
            <Card data-testid="test-card">
                <p>Test Content</p>
            </Card>
        );
        
        const card = screen.getByTestId('test-card');
        expect(card).toBeInTheDocument();
        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
    
    it('applies shadow based on shadowSize prop', () => {
        const { rerender } = renderWithChakra(
            <Card data-testid="test-card" shadowSize="xl">
                <p>Test Content</p>
            </Card>
        );
        
        let card = screen.getByTestId('test-card');
        // シャドウプロパティの値を直接テストするのは難しいので、
        // style属性にbox-shadowが含まれていることを確認
        expect(card).toHaveStyle('box-shadow: var(--chakra-shadows-xl)');
        
        // shadowSizeが'none'の場合、boxShadowは適用されない
        rerender(
            <ChakraProvider>
                <Card data-testid="test-card" shadowSize="none">
                    <p>Test Content</p>
                </Card>
            </ChakraProvider>
        );
        
        card = screen.getByTestId('test-card');
        expect(card).not.toHaveStyle('box-shadow: var(--chakra-shadows-xl)');
    });
    
    it('applies border when withBorder is true', () => {
        renderWithChakra(
            <Card data-testid="test-card" withBorder>
                <p>Test Content</p>
            </Card>
        );
        
        const card = screen.getByTestId('test-card');
        expect(card).toHaveStyle('border-width: 1px');
    });
    
    it('applies custom background color when bgColor is provided', () => {
        renderWithChakra(
            <Card data-testid="test-card" bgColor="blue.100">
                <p>Test Content</p>
            </Card>
        );
        
        const card = screen.getByTestId('test-card');
        expect(card).toHaveStyle('background: var(--chakra-colors-blue-100)');
    });
    
    it('applies hover effect styles when withHoverEffect is true', () => {
        renderWithChakra(
            <Card data-testid="test-card" withHoverEffect>
                <p>Test Content</p>
            </Card>
        );
        
        const card = screen.getByTestId('test-card');
        expect(card).toHaveStyle('transition: all 0.3s ease');
    });
    
    it('passes additional props to the Box component', () => {
        renderWithChakra(
            <Card 
                data-testid="test-card"
                padding="4"
                margin="2"
                width="300px"
            >
                <p>Test Content</p>
            </Card>
        );
        
        const card = screen.getByTestId('test-card');
        expect(card).toHaveStyle('padding: var(--chakra-space-4)');
        expect(card).toHaveStyle('margin: var(--chakra-space-2)');
        expect(card).toHaveStyle('width: 300px');
    });
});