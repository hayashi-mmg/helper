import { render, screen, fireEvent } from '../../../test-utils/providers';
import Button from './Button';

describe('Button', () => {
    // 基本的なレンダリングテスト
    it('renders correctly with default props', () => {
        render(<Button>テストボタン</Button>);
        expect(screen.getByText('テストボタン')).toBeInTheDocument();
    });
    
    // クリックイベントのテスト
    it('calls onClick handler when clicked', () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>クリックテスト</Button>);
        
        fireEvent.click(screen.getByText('クリックテスト'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });
    
    // バリアントスタイルのテスト
    it('applies variant styles correctly', () => {
        const { rerender } = render(<Button>デフォルトボタン</Button>);
        expect(screen.getByRole('button')).toHaveAttribute('variant', 'solid');
        
        rerender(<Button variant="outline">アウトラインボタン</Button>);
        expect(screen.getByRole('button')).toHaveAttribute('variant', 'outline');
        
        rerender(<Button variant="ghost">ゴーストボタン</Button>);
        expect(screen.getByRole('button')).toHaveAttribute('variant', 'ghost');
        
        rerender(<Button variant="link">リンクボタン</Button>);
        expect(screen.getByRole('button')).toHaveAttribute('variant', 'link');
    });
    
    // サイズのテスト
    it('renders in different sizes correctly', () => {
        // sizeプロパティをdata属性としてテスト
        const { rerender } = render(<Button size="xs">極小ボタン</Button>);
        expect(screen.getByRole('button')).toHaveAttribute('data-size', 'xs');
        
        rerender(<Button size="sm">小ボタン</Button>);
        expect(screen.getByRole('button')).toHaveAttribute('data-size', 'sm');
        
        rerender(<Button size="md">中ボタン</Button>);
        expect(screen.getByRole('button')).toHaveAttribute('data-size', 'md');
        
        rerender(<Button size="lg">大ボタン</Button>);
        expect(screen.getByRole('button')).toHaveAttribute('data-size', 'lg');
    });
    
    // 無効化状態のテスト
    it('is disabled when isDisabled prop is true', () => {
        render(<Button isDisabled>Disabled Button</Button>);
        expect(screen.getByRole('button')).toHaveAttribute('disabled');
    });
    
    // ローディング状態のテスト
    it('shows loading state when isLoading prop is true', () => {
        render(<Button isLoading>Loading Button</Button>);
        expect(screen.getByRole('button')).toHaveAttribute('data-loading');
    });
    
    // カラースキームのテスト
    it('applies custom color scheme when provided', () => {
        render(<Button colorScheme="blue">Blue Button</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('colorscheme', 'blue');
        expect(button).toBeInTheDocument();
    });
});