import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

/**
 * ボタンコンポーネントのProps型定義
 */
export interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
    /** ボタンの見た目のバリエーション */
    variant?: 'primary' | 'secondary' | 'outline' | 'text';
    /** ボタンのサイズ */
    size?: 'small' | 'medium' | 'large';
    /** ボタンの先頭に表示するアイコン */
    startIcon?: React.ReactNode;
    /** ボタンの末尾に表示するアイコン */
    endIcon?: React.ReactNode;
    /** ローディング状態の表示 */
    loading?: boolean;
    /** ボタンの内容（テキストやコンポーネント） */
    children: React.ReactNode;
    /** 追加のCSSクラス名 */
    className?: string;
}

// カスタムスタイル付きのMUIボタン
const StyledButton = styled(MuiButton, {
    shouldForwardProp: (prop: string) => prop !== 'loading',
})<{ loading?: boolean }>(({ loading }) => ({
    position: 'relative',
    '& .MuiCircularProgress-root': {
        marginRight: '8px',
    },
}));

/**
 * MUIを活用した、ユーザーのアクションを促すための汎用的なボタンUIを提供するコンポーネント
 * 
 * @param {ButtonProps} props - ボタンコンポーネントのプロパティ
 * @returns {JSX.Element} - ボタンコンポーネント
 */
export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'medium',
    startIcon,
    endIcon,
    loading = false,
    disabled,
    className = '',
    children,
    ...props
}) => {
    /**
     * カスタムバリアントをMUI用のバリアントにマッピングする
     * @returns {MuiButtonProps['variant']} - MUIのバリアント
     */
    const getMuiVariant = (): MuiButtonProps['variant'] => {
        switch (variant) {
            case 'primary':
                return 'contained';
            case 'secondary':
                return 'contained';
            case 'outline':
                return 'outlined';
            case 'text':
                return 'text';
            default:
                return 'contained';
        }
    };

    /**
     * カスタムバリアントをMUI用のカラーにマッピングする
     * @returns {MuiButtonProps['color']} - MUIのカラー
     */
    const getMuiColor = (): MuiButtonProps['color'] => {
        switch (variant) {
            case 'primary':
                return 'primary';
            case 'secondary':
                return 'secondary';
            default:
                return 'primary';
        }
    };

    /**
     * カスタムサイズをMUI用のサイズにマッピングする
     * @returns {MuiButtonProps['size']} - MUIのサイズ
     */
    const getMuiSize = (): MuiButtonProps['size'] => {
        switch (size) {
            case 'small':
                return 'small';
            case 'medium':
                return 'medium';
            case 'large':
                return 'large';
            default:
                return 'medium';
        }
    };    return (
        <StyledButton
            variant={getMuiVariant()}
            color={getMuiColor()}
            size={getMuiSize()}
            disabled={disabled || loading}
            startIcon={!loading && startIcon}
            endIcon={!loading && endIcon}
            className={className}
            loading={loading}
            aria-busy={loading}
            {...props}
        >
            {loading && <CircularProgress size={20} color="inherit" />}
            {children}
        </StyledButton>
    );
};

export default Button;

export default Button;
