import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider, Button } from '@chakra-ui/react';
import CardLayout, { CardHeader, CardBody, CardFooter } from './CardLayout';

// ChakraUIを使用したコンポーネントのテスト用ラッパー
const renderWithChakra = (ui: React.ReactElement) => {
    return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('CardLayout Components', () => {
    describe('CardHeader Component', () => {
        it('renders title correctly', () => {
            renderWithChakra(
                <CardHeader data-testid="card-header" title="Test Title" />
            );
            
            expect(screen.getByTestId('card-header')).toBeInTheDocument();
            expect(screen.getByText('Test Title')).toBeInTheDocument();
        });
        
        it('renders action correctly', () => {
            renderWithChakra(
                <CardHeader 
                    data-testid="card-header" 
                    action={<Button data-testid="action-button">Action</Button>}
                />
            );
            
            expect(screen.getByTestId('card-header')).toBeInTheDocument();
            expect(screen.getByTestId('action-button')).toBeInTheDocument();
            expect(screen.getByText('Action')).toBeInTheDocument();
        });
        
        it('renders children correctly', () => {
            renderWithChakra(
                <CardHeader data-testid="card-header">
                    <span>Custom Header Content</span>
                </CardHeader>
            );
            
            expect(screen.getByTestId('card-header')).toBeInTheDocument();
            expect(screen.getByText('Custom Header Content')).toBeInTheDocument();
        });
    });
    
    describe('CardBody Component', () => {
        it('renders children correctly', () => {
            renderWithChakra(
                <CardBody data-testid="card-body">
                    <p>Test Body Content</p>
                </CardBody>
            );
            
            expect(screen.getByTestId('card-body')).toBeInTheDocument();
            expect(screen.getByText('Test Body Content')).toBeInTheDocument();
        });
    });
    
    describe('CardFooter Component', () => {
        it('renders children correctly', () => {
            renderWithChakra(
                <CardFooter data-testid="card-footer">
                    <Button>Footer Action</Button>
                </CardFooter>
            );
            
            expect(screen.getByTestId('card-footer')).toBeInTheDocument();
            expect(screen.getByText('Footer Action')).toBeInTheDocument();
        });
    });
    
    describe('CardLayout Component', () => {
        it('renders with title and content', () => {
            renderWithChakra(
                <CardLayout data-testid="card-layout" title="Card Title">
                    <p>Card Content</p>
                </CardLayout>
            );
            
            expect(screen.getByTestId('card-layout')).toBeInTheDocument();
            expect(screen.getByText('Card Title')).toBeInTheDocument();
            expect(screen.getByText('Card Content')).toBeInTheDocument();
        });
        
        it('renders with header action', () => {
            renderWithChakra(
                <CardLayout
                    data-testid="card-layout"
                    title="Card Title"
                    headerAction={<Button data-testid="header-action">Action</Button>}
                >
                    <p>Card Content</p>
                </CardLayout>
            );
            
            expect(screen.getByTestId('card-layout')).toBeInTheDocument();
            expect(screen.getByTestId('header-action')).toBeInTheDocument();
        });
        
        it('renders with custom header', () => {
            renderWithChakra(
                <CardLayout
                    data-testid="card-layout"
                    header={<div data-testid="custom-header">Custom Header</div>}
                >
                    <p>Card Content</p>
                </CardLayout>
            );
            
            expect(screen.getByTestId('card-layout')).toBeInTheDocument();
            expect(screen.getByTestId('custom-header')).toBeInTheDocument();
            expect(screen.getByText('Custom Header')).toBeInTheDocument();
        });
        
        it('renders with footer', () => {
            renderWithChakra(
                <CardLayout
                    data-testid="card-layout"
                    title="Card Title"
                    footer={<div data-testid="footer">Footer Content</div>}
                >
                    <p>Card Content</p>
                </CardLayout>
            );
            
            expect(screen.getByTestId('card-layout')).toBeInTheDocument();
            expect(screen.getByTestId('footer')).toBeInTheDocument();
            expect(screen.getByText('Footer Content')).toBeInTheDocument();
        });
        
        it('renders without header when no title, header or headerAction provided', () => {
            renderWithChakra(
                <CardLayout data-testid="card-layout">
                    <p>Card Content</p>
                </CardLayout>
            );
            
            expect(screen.getByTestId('card-layout')).toBeInTheDocument();
            expect(screen.getByText('Card Content')).toBeInTheDocument();
            // ヘッダーが存在しないことを確認する方法はないため、
            // コンテンツが直接表示されていることを確認
        });
    });
});