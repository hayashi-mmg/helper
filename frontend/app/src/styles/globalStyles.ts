import { mode } from '@chakra-ui/theme';
import { type Dict, type StyleFunctionProps } from '@chakra-ui/react';

/**
 * Chakra UIにグローバルに適用されるスタイル定義
 * アプリ全体に一貫したスタイルを適用するために使用
 */
const globalStyles = {
  global: (props: StyleFunctionProps) => ({
    // HTMLとbodyのスタイル
    'html, body': {
      fontSize: 'md',
      fontFamily: 'body',
      lineHeight: 'tall',
      color: mode('gray.800', 'whiteAlpha.900')(props),
      bg: mode('gray.50', 'gray.900')(props),
      minHeight: '100vh',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    },
    
    // フォーカス状態のスタイル（アクセシビリティ対応）
    '*:focus, *[data-focus]': {
      outlineColor: mode('brand.500', 'brand.300')(props),
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineOffset: '2px',
    },
    
    // スクロールバーカスタマイズ
    '::-webkit-scrollbar': {
      width: '10px',
      height: '10px',
    },
    '::-webkit-scrollbar-track': {
      bg: mode('gray.100', 'gray.700')(props),
    },
    '::-webkit-scrollbar-thumb': {
      bg: mode('gray.300', 'gray.600')(props),
      borderRadius: '5px',
      
      '&:hover': {
        bg: mode('gray.400', 'gray.500')(props),
      },
    },
    
    // ヘッダースタイル
    'h1, h2, h3, h4, h5, h6': {
      fontWeight: 'bold',
      lineHeight: 'shorter',
      margin: 0,
    },
    
    // リンクスタイル
    a: {
      color: mode('brand.600', 'brand.300')(props),
      textDecoration: 'none',
      
      '&:hover': {
        textDecoration: 'underline',
      },
    },
    
    // その他のリセットとデフォルトスタイル
    'ul, ol': {
      paddingLeft: '1.5rem',
    },
  }),
} as Dict<any>;

export default globalStyles;