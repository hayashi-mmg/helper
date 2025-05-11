import React from 'react';
import type { ReactNode, HTMLAttributes } from 'react';
import styled, { css } from 'styled-components';

export type TypographyVariant = 
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'subtitle1' | 'subtitle2'
  | 'body1' | 'body2'
  | 'caption' | 'overline';

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  /**
   * テキストコンテンツ
   */
  children: ReactNode;
  
  /**
   * タイポグラフィのスタイルバリエーション
   * @default 'body1'
   */
  variant?: TypographyVariant;
  
  /**
   * テキストの色
   */
  color?: string;
  
  /**
   * テキスト配置
   */
  align?: 'left' | 'center' | 'right' | 'justify';
  
  /**
   * フォントウェイト
   */
  fontWeight?: 'normal' | 'medium' | 'bold';
  
  /**
   * 省略記号で切り詰める（単一行）
   */
  noWrap?: boolean;
  
  /**
   * 指定した行数を超えた場合に省略記号で切り詰める
   */
  lineClamp?: number;
  
  /**
   * カスタムコンポーネントを使用
   * @default 'p' for body1, 'h1' through 'h6' for respective variants
   */
  component?: React.ElementType;
}

const variantStyles = {
  h1: css`
    font-size: 2.5rem;
    line-height: 1.2;
    font-weight: 700;
  `,
  h2: css`
    font-size: 2rem;
    line-height: 1.2;
    font-weight: 700;
  `,
  h3: css`
    font-size: 1.75rem;
    line-height: 1.3;
    font-weight: 600;
  `,
  h4: css`
    font-size: 1.5rem;
    line-height: 1.35;
    font-weight: 600;
  `,
  h5: css`
    font-size: 1.25rem;
    line-height: 1.4;
    font-weight: 600;
  `,
  h6: css`
    font-size: 1.125rem;
    line-height: 1.45;
    font-weight: 600;
  `,
  subtitle1: css`
    font-size: 1rem;
    line-height: 1.5;
    font-weight: 500;
  `,
  subtitle2: css`
    font-size: 0.875rem;
    line-height: 1.5;
    font-weight: 500;
  `,
  body1: css`
    font-size: 1rem;
    line-height: 1.5;
    font-weight: 400;
  `,
  body2: css`
    font-size: 0.875rem;
    line-height: 1.5;
    font-weight: 400;
  `,
  caption: css`
    font-size: 0.75rem;
    line-height: 1.5;
    font-weight: 400;
  `,
  overline: css`
    font-size: 0.75rem;
    line-height: 1.5;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  `,
};

const weightStyles = {
  normal: css`
    font-weight: 400;
  `,
  medium: css`
    font-weight: 500;
  `,
  bold: css`
    font-weight: 700;
  `,
};

const StyledTypography = styled.p<{
  $variant: TypographyVariant;
  $color?: string;
  $align?: string;
  $fontWeight?: 'normal' | 'medium' | 'bold';
  $noWrap?: boolean;
  $lineClamp?: number;
}>`
  margin: 0;
  padding: 0;
  ${props => variantStyles[props.$variant]}
  ${props => props.$color && `color: ${props.$color};`}
  ${props => props.$align && `text-align: ${props.$align};`}
  ${props => props.$fontWeight && weightStyles[props.$fontWeight]}
  
  ${props => props.$noWrap && css`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `}
  
  ${props => props.$lineClamp && css`
    display: -webkit-box;
    -webkit-line-clamp: ${props.$lineClamp};
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  `}
`;

/**
 * タイポグラフィコンポーネント
 * 様々なテキスト表示のためのスタイリングを提供します
 */
export const Typography = ({
  children,
  variant = 'body1',
  color,
  align,
  fontWeight,
  noWrap,
  lineClamp,
  component,
  ...rest
}: TypographyProps) => {
  // variant に基づいてデフォルトのコンポーネントを選択
  const defaultComponent = 
    variant.startsWith('h') ? variant as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' : 'p';
  
  return (
    <StyledTypography
      as={component || defaultComponent}
      $variant={variant}
      $color={color}
      $align={align}
      $fontWeight={fontWeight}
      $noWrap={noWrap}
      $lineClamp={lineClamp}
      {...rest}
    >
      {children}
    </StyledTypography>
  );
};

export default Typography;
