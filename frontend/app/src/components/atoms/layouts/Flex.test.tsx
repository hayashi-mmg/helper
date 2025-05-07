import React from 'react';
import { render, screen } from '@testing-library/react';
import Flex from './Flex';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

// テスト用のテーマを作成
const theme = createTheme();

describe('Flex', () => {
    // 基本的なレンダリングテスト
    it('renders children correctly', () => {
        render(
            <ThemeProvider theme={theme}>
                <Flex>
                    <div data-testid="child1">Item 1</div>
                    <div data-testid="child2">Item 2</div>
                </Flex>
            </ThemeProvider>
        );
        
        const flex = screen.getByTestId('flex');
        const child1 = screen.getByTestId('child1');
        const child2 = screen.getByTestId('child2');
        
        expect(flex).toBeInTheDocument();
        expect(child1).toBeInTheDocument();
        expect(child2).toBeInTheDocument();
        expect(flex).toHaveStyle('display: flex');
    });
    
    // フレックス方向のテスト
    it('applies flex direction correctly', () => {
        render(
            <ThemeProvider theme={theme}>
                <Flex direction="column">
                    <div>Item 1</div>
                    <div>Item 2</div>
                </Flex>
            </ThemeProvider>
        );
        
        const flex = screen.getByTestId('flex');
        expect(flex).toHaveStyle('flex-direction: column');
    });
    
    // justifyContentのテスト
    it('applies justify content correctly', () => {
        render(
            <ThemeProvider theme={theme}>
                <Flex justifyContent="center">
                    <div>Item 1</div>
                    <div>Item 2</div>
                </Flex>
            </ThemeProvider>
        );
        
        const flex = screen.getByTestId('flex');
        expect(flex).toHaveStyle('justify-content: center');
    });
    
    // alignItemsのテスト
    it('applies align items correctly', () => {
        render(
            <ThemeProvider theme={theme}>
                <Flex alignItems="center">
                    <div>Item 1</div>
                    <div>Item 2</div>
                </Flex>
            </ThemeProvider>
        );
        
        const flex = screen.getByTestId('flex');
        expect(flex).toHaveStyle('align-items: center');
    });
    
    // gapのテスト
    it('applies gap correctly', () => {
        render(
            <ThemeProvider theme={theme}>
                <Flex gap="16px">
                    <div>Item 1</div>
                    <div>Item 2</div>
                </Flex>
            </ThemeProvider>
        );
        
        const flex = screen.getByTestId('flex');
        expect(flex).toHaveStyle('gap: 16px');
    });
    
    // wrapのテスト
    it('applies flex wrap correctly', () => {
        render(
            <ThemeProvider theme={theme}>
                <Flex wrap="wrap">
                    <div>Item 1</div>
                    <div>Item 2</div>
                </Flex>
            </ThemeProvider>
        );
        
        const flex = screen.getByTestId('flex');
        expect(flex).toHaveStyle('flex-wrap: wrap');
    });
    
    // カスタムスタイルのテスト
    it('applies custom styles correctly', () => {
        render(
            <ThemeProvider theme={theme}>
                <Flex
                    width="100%"
                    height="300px"
                    padding="16px"
                    margin="8px"
                    data-testid="styled-flex"
                >
                    <div>Item 1</div>
                </Flex>
            </ThemeProvider>
        );
        
        const flex = screen.getByTestId('styled-flex');
        expect(flex).toHaveStyle({
            width: '100%',
            height: '300px',
            padding: '16px',
            margin: '8px',
        });
    });
    
    // カスタムのdata-testidのテスト
    it('applies custom data-testid', () => {
        render(
            <ThemeProvider theme={theme}>
                <Flex data-testid="custom-flex">
                    <div>Item 1</div>
                </Flex>
            </ThemeProvider>
        );
        
        const flex = screen.getByTestId('custom-flex');
        expect(flex).toBeInTheDocument();
    });
});