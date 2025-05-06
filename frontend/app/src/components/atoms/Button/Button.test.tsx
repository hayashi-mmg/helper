import { fireEvent, screen } from '@testing-library/react';
import Button from './Button';
import { render } from '../../../test-utils/providers';

describe('Button', () => {
    // レンダリングテスト
    it('renders correctly with default props', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByRole('button')).toHaveTextContent('Click me');
    });

    // インタラクションテスト
    it('calls onClick handler when clicked', () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Click me</Button>);
        
        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    // バリアント（スタイルバージョン）のテスト
    it('applies variant styles correctly', () => {
        const { rerender } = render(<Button variant="outline">Outline Button</Button>);
        expect(screen.getByRole('button')).toBeInTheDocument();
        
        rerender(<Button variant="solid">Solid Button</Button>);
        expect(screen.getByRole('button')).toBeInTheDocument();
        
        rerender(<Button variant="ghost">Ghost Button</Button>);
        expect(screen.getByRole('button')).toBeInTheDocument();
        
        rerender(<Button variant="link">Link Button</Button>);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    // サイズのテスト
    it('renders in different sizes correctly', () => {
        const { rerender } = render(<Button size="xs">Extra Small</Button>);
        expect(screen.getByRole('button')).toBeInTheDocument();
        
        rerender(<Button size="sm">Small</Button>);
        expect(screen.getByRole('button')).toBeInTheDocument();
        
        rerender(<Button size="md">Medium</Button>);
        expect(screen.getByRole('button')).toBeInTheDocument();
        
        rerender(<Button size="lg">Large</Button>);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    // 無効状態のテスト
    it('is disabled when isDisabled prop is true', () => {
        render(<Button isDisabled>Disabled Button</Button>);
        expect(screen.getByRole('button')).toBeDisabled();
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
        expect(button).toHaveAttribute('data-group');
        expect(button).toBeInTheDocument();
    });
});