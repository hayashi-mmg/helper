import { type Dict, type StyleFunctionProps } from '@chakra-ui/react';

/**
 * Chakra UIにグローバルに適用されるスタイル定義
 * アプリ全体に一貫したスタイルを適用するために使用
 */
const globalStyles = {
  global: (props: StyleFunctionProps) => {
    const { colorMode } = props;
    return {
    // HTMLとbodyのスタイル
    'html, body': {
      fontSize: 'md',
      fontFamily: 'body',
      lineHeight: 'tall',
      color: colorMode === 'light' ? 'gray.800' : 'whiteAlpha.900',
      bg: colorMode === 'light' ? 'gray.50' : 'gray.900',
      minHeight: '100vh',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    },
    
    // フォーカス状態のスタイル（アクセシビリティ対応）
    '*:focus, *[data-focus]': {
      outlineColor: colorMode === 'light' ? 'brand.500' : 'brand.300',
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
      bg: colorMode === 'light' ? 'gray.100' : 'gray.700',
    },
    '::-webkit-scrollbar-thumb': {
      bg: colorMode === 'light' ? 'gray.300' : 'gray.600',
      borderRadius: '5px',
      
      '&:hover': {
        bg: colorMode === 'light' ? 'gray.400' : 'gray.500',
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
      color: colorMode === 'light' ? 'brand.600' : 'brand.300',
      textDecoration: 'none',
      
      '&:hover': {
        textDecoration: 'underline',
      },
    },
    
    // その他のリセットとデフォルトスタイル
    'ul, ol': {
      paddingLeft: '1.5rem',
    },
    };
  },
} as Dict<any>;

export default globalStyles;