import { createSystem, defaultConfig } from '@chakra-ui/react';

/**
 * Chakra UIのテーマを拡張して独自のスタイルを設定
 * プロジェクト全体で一貫したデザインを提供するために使用
 */
const theme = {
  // カラーモードの設定（Chakra UI v3でも利用するために保持）
  config: {
    initialColorMode: 'light',
    useSystemColorMode: true,
  },
  
  // カラーパレット定義 (Chakra UI v3形式に対応)
  colors: {
    brand: {
      50: '#e6f6ff',
      100: '#cceaff',
      200: '#99d4ff',
      300: '#66beff',
      400: '#33a8ff',
      500: '#0092ff', // メインカラー
      600: '#0074cc',
      700: '#005799',
      800: '#003b66',
      900: '#001e33',
    },
    // 意味を持つ色の定義
    semantic: {
      success: '#38A169',
      error: '#E53E3E',
      warning: '#DD6B20',
      info: '#3182CE',
    },
  },
  
  // フォント設定
  fonts: {
    heading: '"Noto Sans JP", sans-serif',
    body: '"Noto Sans JP", sans-serif',
  },
  
  // コンポーネント固有のスタイル設定
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'medium',
        borderRadius: 'md',
      },
      variants: {
        solid: (props: { colorScheme: string }) => ({
          bg: props.colorScheme === 'brand' ? 'brand.500' : undefined,
          color: 'white',
          _hover: {
            bg: props.colorScheme === 'brand' ? 'brand.600' : undefined,
          },
        }),
        outline: (props: { colorScheme: string }) => ({
          border: '1px solid',
          borderColor: props.colorScheme === 'brand' ? 'brand.500' : undefined,
          color: props.colorScheme === 'brand' ? 'brand.500' : undefined,
          _hover: {
            bg: props.colorScheme === 'brand' ? 'brand.50' : undefined,
          },
        }),
      },
      defaultProps: {
        colorScheme: 'brand',
      },
    },
  },
  
  // ブレイクポイント設定 (レスポンシブデザイン用)
  breakpoints: {
    sm: '30em', // 480px
    md: '48em', // 768px
    lg: '62em', // 992px
    xl: '80em', // 1280px
    '2xl': '96em', // 1536px
  },
  
  // グローバルスタイルの適用
  styles: {
    global: (props: any) => {
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
  },
};

// Chakra UI v3用のシステム設定
export const system = createSystem({
  ...defaultConfig,
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: theme.colors.brand[50] },
          100: { value: theme.colors.brand[100] },
          200: { value: theme.colors.brand[200] },
          300: { value: theme.colors.brand[300] },
          400: { value: theme.colors.brand[400] },
          500: { value: theme.colors.brand[500] },
          600: { value: theme.colors.brand[600] },
          700: { value: theme.colors.brand[700] },
          800: { value: theme.colors.brand[800] },
          900: { value: theme.colors.brand[900] },
        },
      },
      fonts: {
        heading: { value: theme.fonts.heading },
        body: { value: theme.fonts.body },
      }
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: "{colors.brand.500}" },
          contrast: { value: "{colors.brand.100}" },
          fg: { value: "{colors.brand.700}" }
        },
      }
    }
  }
});

export default theme;