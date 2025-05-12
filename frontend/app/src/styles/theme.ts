import { createSystem, defaultConfig } from '@chakra-ui/react';

/**
 * Chakra UIのテーマを拡張して独自のスタイルを設定
 * プロジェクト全体で一貫したデザインを提供するために使用
 */
export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: '#e6f6ff' },
          100: { value: '#cceaff' },
          200: { value: '#99d4ff' },
          300: { value: '#66beff' },
          400: { value: '#33a8ff' },
          500: { value: '#0092ff' }, // メインカラー
          600: { value: '#0074cc' },
          700: { value: '#005799' },
          800: { value: '#003b66' },
          900: { value: '#001e33' },
          950: { value: '#000e19' },
        },
        // 意味を持つ色の定義
        semantic: {
          success: { value: '#38A169' },
          error: { value: '#E53E3E' },
          warning: { value: '#DD6B20' },
          info: { value: '#3182CE' },
        }
      },
      fonts: {
        heading: { value: '"Noto Sans JP", sans-serif' },
        body: { value: '"Noto Sans JP", sans-serif' },
      },
      breakpoints: {
        sm: { value: '30em' }, // 480px
        md: { value: '48em' }, // 768px
        lg: { value: '62em' }, // 992px
        xl: { value: '80em' }, // 1280px
        '2xl': { value: '96em' }, // 1536px
      }
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: '{colors.brand.500}' },
          contrast: { value: '{colors.brand.100}' },
          fg: { value: '{colors.brand.700}' },
          muted: { value: '{colors.brand.100}' },
          subtle: { value: '{colors.brand.200}' },
          emphasized: { value: '{colors.brand.300}' },
          focusRing: { value: '{colors.brand.500}' },
        },
      }
    },
    recipes: {
      button: {
        base: {
          fontWeight: 'medium',
          borderRadius: 'md',
        },
        variants: {
          solid: {
            bg: 'colorPalette.500',
            color: 'white',
            _hover: {
              bg: 'colorPalette.600',
            },
          },
          outline: {
            border: '1px solid',
            borderColor: 'colorPalette.500',
            color: 'colorPalette.500',
            _hover: {
              bg: 'colorPalette.50',
            },
          },
        },
        defaultProps: {
          colorPalette: 'brand',
          variant: 'solid',
        }
      }
    },
    globalStyles: {
      body: {
        fontSize: 'md',
        fontFamily: 'body',
        lineHeight: 'tall',
        color: 'gray.800',
        bg: 'gray.50',
        minHeight: '100vh',
      },
      'h1, h2, h3, h4, h5, h6': {
        fontWeight: 'bold',
        lineHeight: 'shorter',
        margin: 0,
      },
      a: {
        color: 'brand.600',
        textDecoration: 'none',
        _hover: {
          textDecoration: 'underline',
        },
      },
      'ul, ol': {
        paddingLeft: '1.5rem',
      },
    }
  }
});
// export default theme;
// systemは既にエクスポート済み