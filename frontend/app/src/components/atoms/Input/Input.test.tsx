import { render, screen, fireEvent } from '../../../test-utils/providers';
import Input from './Input';

describe('Input', () => {
    // 基本的なレンダリングテスト
    it('renders correctly with required props', () => {
        render(<Input id="basic-input" />);
        const input = screen.getByTestId('chakra-input');
        expect(input).toBeInTheDocument();
    });

    // ラベルのテスト
    it('displays label when provided', () => {
        render(<Input id="labeled-input" label="Name" />);
        expect(screen.getByText('Name')).toBeInTheDocument();
    });

    // 必須フィールドのテスト
    it('shows required indicator when isRequired is true', () => {
        render(<Input id="email" label="Email" isRequired />);
        expect(screen.getByText('Email')).toBeInTheDocument();
        
        // FormControlがaria-requiredを設定する（inputではなく）
        const formControl = screen.getByTestId('chakra-form-control');
        expect(formControl).toHaveAttribute('aria-required', 'true');
    });

    // 値の入力テスト
    it('updates value when user types', () => {
        render(<Input id="name-input" />);
        const input = screen.getByTestId('chakra-input');
        
        fireEvent.change(input, { target: { value: 'John Doe' } });
        expect(input).toHaveValue('John Doe');
    });

    // ヘルパーテキストのテスト
    it('displays helper text when provided', () => {
        render(<Input id="helper-field" helperText="This is a helper text" />);
        expect(screen.getByText('This is a helper text')).toBeInTheDocument();
    });

    // エラーメッセージのテスト
    it('displays error message instead of helper text when provided', () => {
        render(<Input 
            id="error-field" 
            helperText="This is a helper text"
            errorMessage="This is an error message" 
        />);
        
        expect(screen.getByText('This is an error message')).toBeInTheDocument();
        expect(screen.queryByText('This is a helper text')).not.toBeInTheDocument();
    });

    // 無効化状態のテスト
    it('is disabled when isDisabled prop is true', () => {
        render(<Input id="readonly-field" isDisabled />);
        
        // FormControlがdisabled属性を設定する（inputではなく）
        const formControl = screen.getByTestId('chakra-form-control');
        expect(formControl).toHaveAttribute('aria-disabled', 'true');
    });
});