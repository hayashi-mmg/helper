
import { render, screen } from '@testing-library/react';
import Grid from './Grid';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

// テスト用のテーマを作成
const theme = createTheme();

describe('Grid', () => {
    // 基本的なレンダリングテスト
    it('renders children correctly', () => {
        render(
            <ThemeProvider theme={theme}>
                <Grid container>
                    <Grid item data-testid="grid-item">
                        Grid Item
                    </Grid>
                </Grid>
            </ThemeProvider>
        );
        
        const gridContainer = screen.getByTestId('grid');
        const gridItem = screen.getByTestId('grid-item');
        
        expect(gridContainer).toBeInTheDocument();
        expect(gridItem).toBeInTheDocument();
        expect(gridItem).toHaveTextContent('Grid Item');
    });
    
    // コンテナプロパティのテスト
    it('applies container property correctly', () => {
        render(
            <ThemeProvider theme={theme}>
                <Grid container>
                    <div>Grid Item</div>
                </Grid>
            </ThemeProvider>
        );
        
        const grid = screen.getByTestId('grid');
        expect(grid).toHaveClass('MuiGrid-container');
    });
    
    // アイテムプロパティのテスト
    it('applies item property correctly', () => {
        render(
            <ThemeProvider theme={theme}>
                <Grid item>
                    <div>Grid Item</div>
                </Grid>
            </ThemeProvider>
        );
        
        const grid = screen.getByTestId('grid');
        expect(grid).toHaveClass('MuiGrid-item');
    });
    
    // スペーシングプロパティのテスト
    it('applies spacing property correctly', () => {
        render(
            <ThemeProvider theme={theme}>
                <Grid container spacing={4}>
                    <Grid item>Item 1</Grid>
                    <Grid item>Item 2</Grid>
                </Grid>
            </ThemeProvider>
        );
        
        const grid = screen.getByTestId('grid');
        expect(grid).toHaveClass('MuiGrid-spacing-xs-4');
    });
    
    // レスポンシブプロパティのテスト
    it('applies responsive properties correctly', () => {
        render(
            <ThemeProvider theme={theme}>
                <Grid container>
                    <Grid item xs={12} sm={6} md={4} data-testid="responsive-item">
                        Responsive Item
                    </Grid>
                </Grid>
            </ThemeProvider>
        );
        
        const gridItem = screen.getByTestId('responsive-item');
        expect(gridItem).toHaveClass('MuiGrid-grid-xs-12');
        expect(gridItem).toHaveClass('MuiGrid-grid-sm-6');
        expect(gridItem).toHaveClass('MuiGrid-grid-md-4');
    });
    
    // 配置プロパティのテスト
    it('applies alignment properties correctly', () => {
        render(
            <ThemeProvider theme={theme}>
                <Grid 
                    container 
                    alignItems="center" 
                    justifyContent="center"
                >
                    <Grid item>Centered Item</Grid>
                </Grid>
            </ThemeProvider>
        );
        
        const grid = screen.getByTestId('grid');
        expect(grid).toHaveClass('MuiGrid-container');
        expect(grid).toHaveClass('MuiGrid-alignItems-center');
        expect(grid).toHaveClass('MuiGrid-justifyContent-center');
    });
    
    // 方向プロパティのテスト
    it('applies direction property correctly', () => {
        render(
            <ThemeProvider theme={theme}>
                <Grid container direction="column">
                    <Grid item>Item 1</Grid>
                    <Grid item>Item 2</Grid>
                </Grid>
            </ThemeProvider>
        );
        
        const grid = screen.getByTestId('grid');
        expect(grid).toHaveClass('MuiGrid-direction-xs-column');
    });
    
    // ラッププロパティのテスト
    it('applies wrap property correctly', () => {
        render(
            <ThemeProvider theme={theme}>
                <Grid container wrap="nowrap">
                    <Grid item>Item 1</Grid>
                    <Grid item>Item 2</Grid>
                </Grid>
            </ThemeProvider>
        );
        
        const grid = screen.getByTestId('grid');
        expect(grid).toHaveClass('MuiGrid-wrap-xs-nowrap');
    });
    
    // カスタムのdata-testidのテスト
    it('applies custom data-testid', () => {
        render(
            <ThemeProvider theme={theme}>
                <Grid data-testid="custom-grid">
                    <div>Grid Content</div>
                </Grid>
            </ThemeProvider>
        );
        
        const grid = screen.getByTestId('custom-grid');
        expect(grid).toBeInTheDocument();
        expect(grid).toHaveTextContent('Grid Content');
    });
});