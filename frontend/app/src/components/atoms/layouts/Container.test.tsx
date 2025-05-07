import React from 'react';
import { render, screen } from '@testing-library/react';
import Container from './Container';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

// テスト用のテーマを作成
const theme = createTheme();

describe('Container', () => {
    // 基本的なレンダリングテスト
    it('renders children correctly', () => {
        render(
            <ThemeProvider theme={theme}>
                <Container>
                    <div data-testid="child">Test Content</div>
                </Container>
            </ThemeProvider>
        );
        
        const container = screen.getByTestId('container');
        const child = screen.getByTestId('child');
        
        expect(container).toBeInTheDocument();
        expect(child).toBeInTheDocument();
        expect(child).toHaveTextContent('Test Content');
    });
    
    // カスタムのdata-testidを使用するテスト
    it('applies custom data-testid', () => {
        render(
            <ThemeProvider theme={theme}>
                <Container data-testid="custom-container">
                    <div>Test Content</div>
                </Container>
            </ThemeProvider>
        );
        
        const container = screen.getByTestId('custom-container');
        expect(container).toBeInTheDocument();
    });
    
    // maxWidthプロパティのテスト
    it('applies the correct maxWidth', () => {
        const { rerender } = render(
            <ThemeProvider theme={theme}>
                <Container maxWidth="xs">
                    <div>Test Content</div>
                </Container>
            </ThemeProvider>
        );
        
        // xs幅のコンテナがレンダリングされていることを確認
        let container = screen.getByTestId('container');
        expect(container).toHaveStyle(`max-width: ${theme.breakpoints.values.xs}px`);
        
        // カスタム幅のテスト
        rerender(
            <ThemeProvider theme={theme}>
                <Container maxWidth="500px">
                    <div>Test Content</div>
                </Container>
            </ThemeProvider>
        );
        
        container = screen.getByTestId('container');
        expect(container).toHaveStyle('max-width: 500px');
    });
    
    // paddingプロパティのテスト
    it('applies custom padding', () => {
        render(
            <ThemeProvider theme={theme}>
                <Container padding="30px">
                    <div>Test Content</div>
                </Container>
            </ThemeProvider>
        );
        
        const container = screen.getByTestId('container');
        expect(container).toHaveStyle('padding: 30px');
    });
});