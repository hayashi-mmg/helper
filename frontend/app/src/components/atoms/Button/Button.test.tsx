
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Button from './Button';
import 'jest-styled-components';

describe('Button', () => {
    // 基本的なレンダリングのテスト
    it('ボタンが正しくレンダリングされること', () => {
        render(<Button>ボタンテキスト</Button>);
        expect(screen.getByRole('button')).toHaveTextContent('ボタンテキスト');
    });

    // onClick イベントのテスト
    it('クリック時にonClickハンドラが呼ばれること', () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>クリック</Button>);
        
        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    // サイズバリエーションのテスト
    it('サイズプロパティに応じたスタイルが適用されること', () => {
        const { rerender } = render(<Button size="small">小さいボタン</Button>);
        let button = screen.getByRole('button');
        expect(button).toHaveStyleRule('font-size', '0.875rem');

        rerender(<Button size="medium">中サイズボタン</Button>);
        button = screen.getByRole('button');
        expect(button).toHaveStyleRule('font-size', '1rem');

        rerender(<Button size="large">大きいボタン</Button>);
        button = screen.getByRole('button');
        expect(button).toHaveStyleRule('font-size', '1.125rem');
    });

    // カラーバリエーションのテスト
    it('variantプロパティに応じたスタイルが適用されること', () => {
        const { rerender } = render(<Button variant="primary">プライマリボタン</Button>);
        let button = screen.getByRole('button');
        expect(button).toHaveStyleRule('background-color', '#0275d8');

        rerender(<Button variant="secondary">セカンダリボタン</Button>);
        button = screen.getByRole('button');
        expect(button).toHaveStyleRule('background-color', '#6c757d');

        rerender(<Button variant="success">成功ボタン</Button>);
        button = screen.getByRole('button');
        expect(button).toHaveStyleRule('background-color', '#28a745');
    });

    // アウトラインスタイルのテスト
    it('outlineプロパティが適用されること', () => {
        const { rerender } = render(<Button variant="primary" outline>アウトラインボタン</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveStyleRule('background-color', 'transparent');
        expect(button).toHaveStyleRule('color', '#0275d8');
        expect(button).toHaveStyleRule('border-color', '#0275d8');

        // ホバー時のスタイル確認
        expect(button).toHaveStyleRule('color', '#fff', {
            modifier: '&:hover:not(:disabled)'
        });
        expect(button).toHaveStyleRule('background-color', '#0275d8', {
            modifier: '&:hover:not(:disabled)'
        });
    });

    // 全幅スタイルのテスト
    it('fullWidthプロパティが適用されること', () => {
        render(<Button fullWidth>全幅ボタン</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveStyleRule('display', 'flex');
        expect(button).toHaveStyleRule('width', '100%');
    });

    // 無効状態のテスト
    it('disabledプロパティが適用されること', () => {
        render(<Button disabled>無効ボタン</Button>);
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        expect(button).toHaveStyleRule('opacity', '0.65', {
            modifier: '&:disabled'
        });
        expect(button).toHaveStyleRule('cursor', 'not-allowed', {
            modifier: '&:disabled'
        });
    });

    // アイコン付きボタンのテスト
    it('startIconとendIconが正しくレンダリングされること', () => {
        render(
            <Button 
                startIcon={<span data-testid="start-icon">開始</span>}
                endIcon={<span data-testid="end-icon">終了</span>}
            >
                アイコン付きボタン
            </Button>
        );
        
        expect(screen.getByTestId('start-icon')).toBeInTheDocument();
        expect(screen.getByTestId('end-icon')).toBeInTheDocument();
    });

    // a タグとしてレンダリングされるテスト
    it('href属性を指定するとaタグとしてレンダリングされること', () => {
        render(<Button href="https://example.com">リンクボタン</Button>);
        const link = screen.getByRole('link');
        
        expect(link).toHaveAttribute('href', 'https://example.com');
        expect(link).toHaveTextContent('リンクボタン');
    });

    // 無効状態のaタグのテスト
    it('無効状態のリンクボタンは適切にレンダリングされること', () => {
        render(<Button href="https://example.com" disabled>無効リンクボタン</Button>);
        const link = screen.getByRole('link');
        
        expect(link).not.toHaveAttribute('href');
        expect(link).toHaveAttribute('aria-disabled', 'true');
        expect(link).toHaveAttribute('tabIndex', '-1');
        
        // 無効状態のスタイルチェック
        expect(link).toHaveStyleRule('opacity', '0.65', {
            modifier: '&[aria-disabled="true"]'
        });
        expect(link).toHaveStyleRule('cursor', 'not-allowed', {
            modifier: '&[aria-disabled="true"]'
        });
    });

    // Link コンポーネントとしてレンダリングされるテスト
    it('to属性を指定するとLinkコンポーネントとしてレンダリングされること', () => {
        render(
            <BrowserRouter>
                <Button to="/dashboard">ルーターリンク</Button>
            </BrowserRouter>
        );
        
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/dashboard');
        expect(link).toHaveTextContent('ルーターリンク');
    });

    // ボタンタイプのテスト
    it('typeプロパティが適切に設定されること', () => {
        const { rerender } = render(<Button type="button">標準ボタン</Button>);
        expect(screen.getByRole('button')).toHaveAttribute('type', 'button');

        rerender(<Button type="submit">送信ボタン</Button>);
        expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');

        rerender(<Button type="reset">リセットボタン</Button>);
        expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');
    });

    // デフォルトのボタンタイプのテスト
    it('typeが指定されない場合はbuttonがデフォルト値となること', () => {
        render(<Button>デフォルトタイプボタン</Button>);
        expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });
});