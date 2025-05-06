import { Button as ChakraButton, ButtonProps as ChakraButtonProps } from '@chakra-ui/react';
import { FC, ReactNode } from 'react';

/**
 * Buttonコンポーネントのプロパティ
 * @interface ButtonProps
 * @extends {ChakraButtonProps} - Chakra UIのButtonコンポーネントのプロパティを継承
 */
export interface ButtonProps extends ChakraButtonProps {
    /**
     * ボタンのラベルテキストまたは子要素
     */
    children: ReactNode;
    
    /**
     * ボタンのバリアント（見た目のスタイル）
     * @default 'solid'
     */
    variant?: 'solid' | 'outline' | 'ghost' | 'link';
    
    /**
     * ボタンのサイズ
     * @default 'md'
     */
    size?: 'xs' | 'sm' | 'md' | 'lg';
    
    /**
     * ボタンの色スキーム
     * @default 'brand'
     */
    colorScheme?: string;
    
    /**
     * ボタンの無効状態
     * @default false
     */
    isDisabled?: boolean;
    
    /**
     * ボタンの読み込み状態
     * @default false
     */
    isLoading?: boolean;
}

/**
 * アプリケーション全体で使用される標準的なボタンコンポーネント
 * Chakra UIのボタンをラップし、アプリケーション固有のスタイルを適用
 * 
 * @param {ButtonProps} props - ボタンのプロパティ
 * @returns {JSX.Element} スタイル適用済みのボタンコンポーネント
 */
const Button: FC<ButtonProps> = ({
    children,
    variant = 'solid',
    size = 'md',
    colorScheme = 'brand',
    isDisabled = false,
    isLoading = false,
    ...props
}) => {
    return (
        <ChakraButton
            variant={variant}
            size={size}
            colorScheme={colorScheme}
            isDisabled={isDisabled}
            isLoading={isLoading}
            {...props}
        >
            {children}
        </ChakraButton>
    );
};

export default Button;