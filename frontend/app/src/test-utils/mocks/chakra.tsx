import React from 'react';

// ChakraProvider用のモック
export const ChakraProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

// ボタンコンポーネントのモック（属性を適切に変換）
export const Button = ({ children, isDisabled, isLoading, colorScheme, size, variant, ...props }: any) => (
    <button 
        data-testid="chakra-button" 
        disabled={isDisabled ? true : undefined} 
        data-loading={isLoading ? true : undefined}
        colorscheme={colorScheme}
        data-size={size}
        variant={variant}
        {...props}
    >
        {children}
    </button>
);

// Inputコンポーネントのモック（属性を適切に変換）
export const Input = ({ isRequired, isDisabled, isInvalid, ...props }: any) => (
    <input 
        data-testid="chakra-input" 
        aria-required={isRequired ? "true" : undefined}
        disabled={isDisabled ? true : undefined}
        aria-invalid={isInvalid ? "true" : undefined}
        {...props} 
    />
);

// FormControlコンポーネント関連のモック
export const FormLabel = ({ children, ...props }: any) => <label data-testid="chakra-form-label" {...props}>{children}</label>;
export const FormControl = ({ children, isRequired, isInvalid, isDisabled, ...props }: any) => (
    <div 
        data-testid="chakra-form-control" 
        aria-required={isRequired ? "true" : undefined}
        aria-invalid={isInvalid ? "true" : undefined}
        aria-disabled={isDisabled ? "true" : undefined}
        {...props}
    >
        {children}
    </div>
);
export const FormErrorMessage = ({ children, ...props }: any) => <div data-testid="chakra-form-error" {...props}>{children}</div>;
export const FormHelperText = ({ children, ...props }: any) => <div data-testid="chakra-form-helper" {...props}>{children}</div>;

// レイアウトコンポーネントのモック
export const Box = ({ children, ...props }: any) => <div data-testid="chakra-box" {...props}>{children}</div>;
export const Container = ({ children, ...props }: any) => <div data-testid="chakra-container" {...props}>{children}</div>;
export const Flex = ({ children, ...props }: any) => <div data-testid="chakra-flex" {...props}>{children}</div>;
export const Grid = ({ children, ...props }: any) => <div data-testid="chakra-grid" {...props}>{children}</div>;
export const VStack = ({ children, ...props }: any) => <div data-testid="chakra-vstack" {...props}>{children}</div>;
export const HStack = ({ children, ...props }: any) => <div data-testid="chakra-hstack" {...props}>{children}</div>;

// テキストコンポーネントのモック
export const Text = ({ children, ...props }: any) => <p data-testid="chakra-text" {...props}>{children}</p>;
export const Heading = ({ children, as = 'h2', ...props }: any) => React.createElement(as, { 'data-testid': 'chakra-heading', ...props }, children);

// リストコンポーネントのモック
export const List = ({ children, ...props }: any) => <ul data-testid="chakra-list" {...props}>{children}</ul>;
export const ListItem = ({ children, ...props }: any) => <li data-testid="chakra-list-item" {...props}>{children}</li>;
export const ListIcon = ({ as, ...props }: any) => {
    const IconComponent = as || (() => <span>●</span>);
    return <span data-testid="chakra-list-icon" {...props}><IconComponent /></span>;
};

// その他のコンポーネントモック
export const Divider = (props: any) => <hr data-testid="chakra-divider" {...props} />;
export const Spinner = (props: any) => <div data-testid="chakra-spinner" {...props}>Loading...</div>;
export const useDisclosure = () => ({ isOpen: false, onOpen: jest.fn(), onClose: jest.fn() });
export const useToast = () => jest.fn();
export const IconButton = ({ children, 'aria-label': ariaLabel, icon, ...props }: any) => (
    <button 
        data-testid="chakra-icon-button" 
        aria-label={ariaLabel} 
        {...props}
    >
        {icon || children}
    </button>
);

// テーマ関連
export const extendTheme = jest.fn((theme) => theme);
export const useColorMode = () => ({ 
    colorMode: 'light', 
    toggleColorMode: jest.fn() 
});

// ButtonPropsなどの型をモック
export type ButtonProps = {};
export type InputProps = {};
export type BoxProps = {};
export type FlexProps = {};
export type GridProps = {};
export type TextProps = {};
export type HeadingProps = {};
export type ContainerProps = {};
export type SpinnerProps = {};
export type DividerProps = {};
export type ThemeConfig = {};

// デフォルトエクスポート（未使用の場合）
export default {
    Button,
    Input,
    Box,
    Container,
    // その他のコンポーネント
};