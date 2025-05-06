import { fireEvent, screen } from '@testing-library/react';
import Input from './Input';
import { render } from '../../../test-utils/providers';

describe('Input', () => {
    // レンダリングテスト
    it('renders correctly with required props', () => {
        render(<Input id="test-input" />);
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    // ラベル表示のテスト
    it('displays label when provided', () => {
        render(<Input id="name" label="Full Name" />);
        expect(screen.getByText('Full Name')).toBeInTheDocument();
    });

    // 必須入力のテスト
    it('shows required indicator when isRequired is true', () => {
        render(<Input id="email" label="Email" isRequired />);
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toBeRequired();
    });

    // 値の入力テスト
    it('updates value when user types', () => {
        render(<Input id="username" />);
        const input = screen.getByRole('textbox');
        
        fireEvent.change(input, { target: { value: 'testuser' } });
        expect(input).toHaveValue('testuser');
    });

    // ヘルパーテキストのテスト
    it('displays helper text when provided', () => {
        render(<Input id="password" helperText="Must be at least 8 characters" />);
        expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument();
    });

    // エラーメッセージのテスト
    it('displays error message instead of helper text when provided', () => {
        render(
            <Input 
                id="password" 
                helperText="Must be at least 8 characters" 
                errorMessage="Password is too short"
            />
        );
        
        expect(screen.getByText('Password is too short')).toBeInTheDocument();
        expect(screen.queryByText('Must be at least 8 characters')).not.toBeInTheDocument();
    });

    // 無効状態のテスト
    it('is disabled when isDisabled prop is true', () => {
        render(<Input id="readonly-field" isDisabled />);
        expect(screen.getByRole('textbox')).toBeDisabled();
    });
});