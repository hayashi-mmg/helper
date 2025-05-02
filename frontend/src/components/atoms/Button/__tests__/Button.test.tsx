import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

// テスト用のテーマプロバイダー
const TestThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const theme = createTheme();
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

// テストのためのレンダーヘルパー
const renderWithTheme = (ui: React.ReactElement) => {
    return render(<TestThemeProvider>{ui}</TestThemeProvider>);
};

describe('Button component', () => {
    // 1. 正しいテキストでレンダリングされるか
    test('renders with correct text', () => {
        renderWithTheme(<Button>クリックしてください</Button>);
        expect(screen.getByText('クリックしてください')).toBeInTheDocument();
    });

    // 2. 各バリエーションが正しく適用されるか
    test('applies correct variant styles', () => {
        const { rerender } = renderWithTheme(<Button variant="primary">Primary Button</Button>);
        const primaryButton = screen.getByRole('button');
        expect(primaryButton).toHaveClass('MuiButton-contained');
        expect(primaryButton).toHaveClass('MuiButton-containedPrimary');

        rerender(<TestThemeProvider><Button variant="secondary">Secondary Button</Button></TestThemeProvider>);
        const secondaryButton = screen.getByRole('button');
        expect(secondaryButton).toHaveClass('MuiButton-contained');
        expect(secondaryButton).toHaveClass('MuiButton-containedSecondary');

        rerender(<TestThemeProvider><Button variant="outline">Outline Button</Button></TestThemeProvider>);
        expect(screen.getByRole('button')).toHaveClass('MuiButton-outlined');

        rerender(<TestThemeProvider><Button variant="text">Text Button</Button></TestThemeProvider>);
        expect(screen.getByRole('button')).toHaveClass('MuiButton-text');
    });

    // 3. 各サイズが正しく適用されるか
    test('applies correct size styles', () => {
        const { rerender } = renderWithTheme(<Button size="small">Small Button</Button>);
        expect(screen.getByRole('button')).toHaveClass('MuiButton-sizeSmall');

        rerender(<TestThemeProvider><Button size="medium">Medium Button</Button></TestThemeProvider>);
        expect(screen.getByRole('button')).toHaveClass('MuiButton-sizeMedium');

        rerender(<TestThemeProvider><Button size="large">Large Button</Button></TestThemeProvider>);
        expect(screen.getByRole('button')).toHaveClass('MuiButton-sizeLarge');
    });

    // 4. アイコンが正しく表示されるか
    test('renders start and end icons correctly', () => {
        const StartIcon = () => <span data-testid="start-icon">Start</span>;
        const EndIcon = () => <span data-testid="end-icon">End</span>;

        renderWithTheme(
            <Button startIcon={<StartIcon />} endIcon={<EndIcon />}>
                Icon Button
            </Button>
        );

        expect(screen.getByTestId('start-icon')).toBeInTheDocument();
        expect(screen.getByTestId('end-icon')).toBeInTheDocument();
    });

    // 5. ローディング状態が正しく表示されるか
    test('displays loading state correctly', () => {
        renderWithTheme(<Button loading>Loading Button</Button>);
        
        expect(screen.getByRole('button')).toBeDisabled();
        expect(screen.getByText('Loading Button')).toBeInTheDocument();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    // 6. 無効状態が正しく機能するか
    test('applies disabled state correctly', () => {
        renderWithTheme(<Button disabled>Disabled Button</Button>);
        
        expect(screen.getByRole('button')).toBeDisabled();
        expect(screen.getByRole('button')).toHaveClass('Mui-disabled');
    });

    // 7. クリックイベントが正しく発火するか
    test('handles click events', () => {
        const handleClick = jest.fn();
        renderWithTheme(<Button onClick={handleClick}>Click Me</Button>);
        
        fireEvent.click(screen.getByText('Click Me'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    // 8. 無効状態でクリックイベントが発火しないか
    test('does not fire click events when disabled', () => {
        const handleClick = jest.fn();
        renderWithTheme(<Button onClick={handleClick} disabled>Click Me</Button>);
        
        fireEvent.click(screen.getByText('Click Me'));
        expect(handleClick).not.toHaveBeenCalled();
    });

    // 9. ローディング状態でクリックイベントが発火しないか
    test('does not fire click events when loading', () => {
        const handleClick = jest.fn();
        renderWithTheme(<Button onClick={handleClick} loading>Click Me</Button>);
        
        fireEvent.click(screen.getByText('Click Me'));
        expect(handleClick).not.toHaveBeenCalled();
    });

    // 10. 追加のクラス名が適用されるか
    test('applies additional class names', () => {
        renderWithTheme(<Button className="custom-class">Custom Button</Button>);
        expect(screen.getByRole('button')).toHaveClass('custom-class');
    });
});