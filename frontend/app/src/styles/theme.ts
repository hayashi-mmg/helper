import { extendTheme } from '@chakra-ui/react';
import globalStyles from './globalStyles';

/**
 * Chakra UIのテーマを拡張して独自のスタイルを設定
 * プロジェクト全体で一貫したデザインを提供するために使用
 */
const theme = extendTheme({
  // カラーパレット定義
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
    // その他のコンポーネントスタイルをここに追加
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
  styles: globalStyles,
});

export default theme;