import React from 'react';
import './Button.css';

/**
 * ボタンコンポーネントのProps型定義
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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

/**
 * ユーザーのアクションを促すための汎用的なボタンUIを提供するコンポーネント
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
     * バリアントに基づいたクラス名を生成する
     * @returns {string} - バリアントに対応するクラス名
     */
    const getVariantClass = (): string => {
        switch (variant) {
            case 'primary':
                return 'btn-primary';
            case 'secondary':
                return 'btn-secondary';
            case 'outline':
                return 'btn-outline';
            case 'text':
                return 'btn-text';
            default:
                return 'btn-primary';
        }
    };

    /**
     * サイズに基づいたクラス名を生成する
     * @returns {string} - サイズに対応するクラス名
     */
    const getSizeClass = (): string => {
        switch (size) {
            case 'small':
                return 'btn-small';
            case 'medium':
                return 'btn-medium';
            case 'large':
                return 'btn-large';
            default:
                return 'btn-medium';
        }
    };

    /**
     * 状態に基づいたクラス名を生成する
     * @returns {string} - 状態に対応するクラス名
     */
    const getStateClass = (): string => {
        return [
            loading ? 'btn-loading' : '',
            disabled ? 'btn-disabled' : '',
        ].filter(Boolean).join(' ');
    };

    // 最終的なクラス名の組み立て
    const buttonClasses = [
        'btn',
        getVariantClass(),
        getSizeClass(),
        getStateClass(),
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            className={buttonClasses}
            disabled={disabled || loading}
            aria-busy={loading}
            {...props}
        >
            {startIcon && <span className="btn-icon btn-icon-start">{startIcon}</span>}
            {loading ? (
                <>
                    <span className="btn-loading-spinner" />
                    {children}
                </>
            ) : (
                children
            )}
            {endIcon && <span className="btn-icon btn-icon-end">{endIcon}</span>}
        </button>
    );
};

export default Button;
