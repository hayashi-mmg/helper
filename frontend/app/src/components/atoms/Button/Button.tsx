import { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes, forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';
import { Component, forwardRef } from 'react';

/**
 * ボタンのサイズバリエーション
 */
export type ButtonSize = 'small' | 'medium' | 'large';

/**
 * ボタンのカラーバリエーション
 */
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'light' | 'dark' | 'link';

/**
 * ボタンの共通Props
 */
interface BaseButtonProps {
    /** ボタンのサイズ */
    size?: ButtonSize;
    /** ボタンのカラーバリエーション */
    variant?: ButtonVariant;
    /** アウトラインスタイルを適用するかどうか */
    outline?: boolean;
    /** ボタン内に表示するアイコン要素 */
    startIcon?: ReactNode;
    /** ボタン内に表示する末尾アイコン要素 */
    endIcon?: ReactNode;
    /** ボタンを全幅で表示するかどうか */
    fullWidth?: boolean;
    /** ボタンの無効状態 */
    disabled?: boolean;
    /** ボタンラベル（children） */
    children?: ReactNode;
}

/**
 * ネイティブボタン要素に対するProps
 */
export interface ButtonProps extends BaseButtonProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> {
    /** 
     * ボタンのタイプ
     * @default 'button'
     */
    type?: 'button' | 'submit' | 'reset';
    /** 
     * クリック時のコールバック関数 
     */
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    /** 
     * href属性が指定された場合はaタグとしてレンダリング 
     */
    href?: undefined;
    /** 
     * to属性が指定された場合はLinkコンポーネントとしてレンダリング 
     */
    to?: undefined;
}

/**
 * リンクボタン要素に対するProps
 */
export interface LinkButtonProps extends BaseButtonProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> {
    /** クリック時のコールバック関数 */
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
    /** href属性（aタグとしてレンダリング） */
    href: string;
    /** to属性は使用しない */
    to?: undefined;
    /** type属性は使用しない */
    type?: undefined;
}

/**
 * Routerのリンクボタン要素に対するProps
 */
export interface RouterLinkButtonProps extends BaseButtonProps, Omit<React.ComponentProps<typeof Link>, keyof BaseButtonProps> {
    /** クリック時のコールバック関数 */
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
    /** to属性（Linkコンポーネントとしてレンダリング） */
    to: string;
    /** href属性は使用しない */
    href?: undefined;
    /** type属性は使用しない */
    type?: undefined;
}

// Props型の合成
export type CombinedButtonProps = ButtonProps | LinkButtonProps | RouterLinkButtonProps;

// ボタンサイズに応じたスタイル
const getSizeStyles = (size?: ButtonSize) => {
    switch (size) {
        case 'small':
            return css`
                padding: 0.375rem 0.75rem;
                font-size: 0.875rem;
                border-radius: 0.25rem;
            `;
        case 'large':
            return css`
                padding: 0.75rem 1.5rem;
                font-size: 1.125rem;
                border-radius: 0.5rem;
            `;
        case 'medium':
        default:
            return css`
                padding: 0.625rem 1.25rem;
                font-size: 1rem;
                border-radius: 0.375rem;
            `;
    }
};

// ボタンバリエーションに応じたスタイル
const getVariantStyles = (variant?: ButtonVariant, outline?: boolean) => {
    const variants = {
        primary: css`
            ${outline ? css`
                color: #0275d8;
                background-color: transparent;
                border-color: #0275d8;
                &:hover:not(:disabled) {
                    color: #fff;
                    background-color: #0275d8;
                }
            ` : css`
                color: #fff;
                background-color: #0275d8;
                border-color: #0275d8;
                &:hover:not(:disabled) {
                    background-color: #025aa5;
                    border-color: #01549b;
                }
            `}
        `,
        secondary: css`
            ${outline ? css`
                color: #6c757d;
                background-color: transparent;
                border-color: #6c757d;
                &:hover:not(:disabled) {
                    color: #fff;
                    background-color: #6c757d;
                }
            ` : css`
                color: #fff;
                background-color: #6c757d;
                border-color: #6c757d;
                &:hover:not(:disabled) {
                    background-color: #5a6268;
                    border-color: #545b62;
                }
            `}
        `,
        success: css`
            ${outline ? css`
                color: #28a745;
                background-color: transparent;
                border-color: #28a745;
                &:hover:not(:disabled) {
                    color: #fff;
                    background-color: #28a745;
                }
            ` : css`
                color: #fff;
                background-color: #28a745;
                border-color: #28a745;
                &:hover:not(:disabled) {
                    background-color: #218838;
                    border-color: #1e7e34;
                }
            `}
        `,
        warning: css`
            ${outline ? css`
                color: #ffc107;
                background-color: transparent;
                border-color: #ffc107;
                &:hover:not(:disabled) {
                    color: #212529;
                    background-color: #ffc107;
                }
            ` : css`
                color: #212529;
                background-color: #ffc107;
                border-color: #ffc107;
                &:hover:not(:disabled) {
                    background-color: #e0a800;
                    border-color: #d39e00;
                }
            `}
        `,
        danger: css`
            ${outline ? css`
                color: #dc3545;
                background-color: transparent;
                border-color: #dc3545;
                &:hover:not(:disabled) {
                    color: #fff;
                    background-color: #dc3545;
                }
            ` : css`
                color: #fff;
                background-color: #dc3545;
                border-color: #dc3545;
                &:hover:not(:disabled) {
                    background-color: #c82333;
                    border-color: #bd2130;
                }
            `}
        `,
        info: css`
            ${outline ? css`
                color: #17a2b8;
                background-color: transparent;
                border-color: #17a2b8;
                &:hover:not(:disabled) {
                    color: #fff;
                    background-color: #17a2b8;
                }
            ` : css`
                color: #fff;
                background-color: #17a2b8;
                border-color: #17a2b8;
                &:hover:not(:disabled) {
                    background-color: #138496;
                    border-color: #117a8b;
                }
            `}
        `,
        light: css`
            ${outline ? css`
                color: #f8f9fa;
                background-color: transparent;
                border-color: #f8f9fa;
                &:hover:not(:disabled) {
                    color: #212529;
                    background-color: #f8f9fa;
                }
            ` : css`
                color: #212529;
                background-color: #f8f9fa;
                border-color: #f8f9fa;
                &:hover:not(:disabled) {
                    background-color: #e2e6ea;
                    border-color: #dae0e5;
                }
            `}
        `,
        dark: css`
            ${outline ? css`
                color: #343a40;
                background-color: transparent;
                border-color: #343a40;
                &:hover:not(:disabled) {
                    color: #fff;
                    background-color: #343a40;
                }
            ` : css`
                color: #fff;
                background-color: #343a40;
                border-color: #343a40;
                &:hover:not(:disabled) {
                    background-color: #23272b;
                    border-color: #1d2124;
                }
            `}
        `,
        link: css`
            color: #0275d8;
            background-color: transparent;
            border-color: transparent;
            text-decoration: ${outline ? 'underline' : 'none'};
            &:hover:not(:disabled) {
                color: #014c8c;
                text-decoration: underline;
            }
        `,
    };

    return variants[variant || 'primary'];
};

// ベーススタイル
const baseButtonStyles = css<BaseButtonProps>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-weight: 600;
    text-align: center;
    vertical-align: middle;
    user-select: none;
    border: 1px solid transparent;
    line-height: 1.5;
    transition: all 0.15s ease-in-out;
    cursor: pointer;
    
    &:focus {
        outline: 0;
        box-shadow: 0 0 0 0.2rem rgba(2, 117, 216, 0.25);
    }
    
    /* 無効状態のスタイル */
    &:disabled,
    &[aria-disabled="true"] {
        opacity: 0.65;
        cursor: not-allowed;
        pointer-events: none;
    }
    
    /* サイズスタイル適用 */
    ${({ size }) => getSizeStyles(size)};
    
    /* バリエーションスタイル適用 */
    ${({ variant, outline }) => getVariantStyles(variant, outline)};
    
    /* 幅設定 */
    ${({ fullWidth }) => fullWidth && css`
        display: flex;
        width: 100%;
    `};
`;

// スタイル適用済みのボタンコンポーネント
const StyledButton = styled.button`${baseButtonStyles}`;
const StyledAnchor = styled.a`
    ${baseButtonStyles}
    text-decoration: none;
`;
const StyledLink = styled(Link)`
    ${baseButtonStyles}
    text-decoration: none;
`;

/**
 * 汎用ボタンコンポーネント
 * href属性があればaタグ、to属性があればLinkコンポーネント、それ以外はbuttonタグとしてレンダリング
 */
const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, CombinedButtonProps>((props, ref) => {
    const {
        children,
        size = 'medium',
        variant = 'primary',
        outline = false,
        fullWidth = false,
        disabled = false,
        startIcon,
        endIcon,
        ...rest
    } = props;

    // 共通props
    const commonProps = {
        size,
        variant,
        outline,
        fullWidth,
        disabled,
        ref,
        ...rest,
    };

    // ボタンの内容
    const content = (
        <>
            {startIcon && <span className="button-start-icon">{startIcon}</span>}
            {children}
            {endIcon && <span className="button-end-icon">{endIcon}</span>}
        </>
    );

    // hrefプロパティが存在する場合はaタグを返す
    if ('href' in props && props.href !== undefined) {
        return (
            <StyledAnchor
                {...commonProps as React.AnchorHTMLAttributes<HTMLAnchorElement>}
                href={disabled ? undefined : props.href}
                ref={ref as React.Ref<HTMLAnchorElement>}
                aria-disabled={disabled ? "true" : undefined}
                role="link"
                tabIndex={disabled ? -1 : 0}
            >
                {content}
            </StyledAnchor>
        );
    }

    // toプロパティが存在する場合はLinkコンポーネントを返す
    if ('to' in props && props.to !== undefined) {
        return (
            <StyledLink
                {...commonProps as React.ComponentProps<typeof Link>}
                to={props.to}
                ref={ref as React.Ref<HTMLAnchorElement>}
                aria-disabled={disabled ? "true" : undefined}
                role="link"
                tabIndex={disabled ? -1 : 0}
            >
                {content}
            </StyledLink>
        );
    }

    // デフォルトはbuttonタグを返す
    return (
        <StyledButton
            {...commonProps as React.ButtonHTMLAttributes<HTMLButtonElement>}
            type={(props as ButtonProps).type || 'button'}
            ref={ref as React.Ref<HTMLButtonElement>}
            disabled={disabled}
        >
            {content}
        </StyledButton>
    );
});

Button.displayName = 'Button';

export default Button;