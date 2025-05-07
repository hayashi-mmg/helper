import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Box from './Box';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

// テスト用のテーマを作成
const theme = createTheme();

describe('Box', () => {
    // 基本的なレンダリングテスト
    it('renders children correctly', () => {
        render(
            <ThemeProvider theme={theme}>
                <Box>
                    <div data-testid="child">Test Content</div>
                </Box>
            </ThemeProvider>
        );
        
        const box = screen.getByTestId('box');
        const child = screen.getByTestId('child');
        
        expect(box).toBeInTheDocument();
        expect(child).toBeInTheDocument();
        expect(child).toHaveTextContent('Test Content');
    });
    
    // スタイルプロパティのテスト
    it('applies style properties correctly', () => {
        render(
            <ThemeProvider theme={theme}>
                <Box
                    padding="16px"
                    margin="8px"
                    width="300px"
                    height="200px"
                    backgroundColor="#f5f5f5"
                    border="1px solid #ccc"
                    borderRadius="4px"
                    boxShadow="0 1px 3px rgba(0,0,0,0.12)"
                    data-testid="styled-box"
                >
                    Styled Box
                </Box>
            </ThemeProvider>
        );
        
        const box = screen.getByTestId('styled-box');
        
        expect(box).toHaveStyle({
            padding: '16px',
            margin: '8px',
            width: '300px',
            height: '200px',
            backgroundColor: '#f5f5f5',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        });
    });
    
    // 表示プロパティのテスト
    it('applies display property correctly', () => {
        render(
            <ThemeProvider theme={theme}>
                <Box display="flex">Flex Box</Box>
            </ThemeProvider>
        );
        
        const box = screen.getByTestId('box');
        expect(box).toHaveStyle('display: flex');
    });
    
    // クリックイベントのテスト
    it('handles click events', () => {
        const handleClick = jest.fn();
        
        render(
            <ThemeProvider theme={theme}>
                <Box onClick={handleClick}>Clickable Box</Box>
            </ThemeProvider>
        );
        
        const box = screen.getByTestId('box');
        fireEvent.click(box);
        
        expect(handleClick).toHaveBeenCalledTimes(1);
    });
    
    // カスタムのdata-testidのテスト
    it('applies custom data-testid', () => {
        render(
            <ThemeProvider theme={theme}>
                <Box data-testid="custom-box">Custom Box</Box>
            </ThemeProvider>
        );
        
        const box = screen.getByTestId('custom-box');
        expect(box).toBeInTheDocument();
        expect(box).toHaveTextContent('Custom Box');
    });
});