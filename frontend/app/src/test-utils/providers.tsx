import { ChakraProvider } from '@chakra-ui/react';
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import theme from '../styles/theme';

/**
 * テスト用の全プロバイダーでラップするためのコンポーネント
 * @param {ReactNode} children - ラップする子コンポーネント
 * @returns {ReactElement} プロバイダーでラップされたコンポーネント
 */
export const AllProviders = ({ children }: { children: ReactNode }): ReactElement => {
    return (
        <ChakraProvider theme={theme}>
            {children}
        </ChakraProvider>
    );
};

/**
 * カスタムレンダー関数
 * テスト対象のコンポーネントを必要なプロバイダーでラップして描画
 * 
 * @param {ReactElement} ui - テストするReactコンポーネント
 * @param {RenderOptions} options - レンダリングオプション
 * @returns テスト用のレンダリング結果
 */
const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

// Testing Libraryのrenderをエクスポート
export * from '@testing-library/react';

// カスタムレンダー関数をデフォルトでエクスポート
export { customRender as render };