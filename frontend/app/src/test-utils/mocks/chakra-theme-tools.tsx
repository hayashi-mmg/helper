/**
 * @chakra-ui/theme-tools のモック
 */

// @chakra-ui/utilsモジュールへの依存を削除
// 必要なDict型を内部で定義
interface Dict<T = any> {
  [key: string]: T;
}

// mode関数のモック - テーマカラーの明暗モードに応じた値を返す関数
export const mode = jest.fn((lightValue: any, darkValue: any) => lightValue);

// transparentize関数のモック - 色の透明度を調整する関数
export const transparentize = jest.fn(
  (color: string, opacity: number) => `${color}${Math.round(opacity * 100)}`
);

// getColor関数のモック - テーマから色を取得する関数
export const getColor = jest.fn(
  (theme: Dict, color: string, fallback?: string) => fallback || color || ''
);

// darken関数のモック - 色を暗くする関数
export const darken = jest.fn(
  (color: string, amount: number) => `${color}-darker-${amount}`
);

// lighten関数のモック - 色を明るくする関数
export const lighten = jest.fn(
  (color: string, amount: number) => `${color}-lighter-${amount}`
);

// StyleFunctionPropsの型定義モック
export type StyleFunctionProps = {
  colorMode?: 'light' | 'dark';
  colorScheme?: string;
  theme?: any;
  [key: string]: any;
};