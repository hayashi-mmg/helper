import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

/**
 * カスタムレンダー関数のオプション
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    // 将来的に拡張できるようにインターフェースを準備
}

/**
 * アプリケーション全体のプロバイダーでラップするためのラッパー
 * プロジェクトにプロバイダーを追加したら、このラッパーにも追加する
 * 
 * @param children - レンダリングする子要素
 * @returns ラップされた要素
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <>
            {/* ここに他のプロバイダーを追加（ThemeProvider, AuthProvider など） */}
            {children}
        </>
    );
}

/**
 * テスト用のカスタムレンダー関数
 * テスト時にはこの関数を使用してコンポーネントをレンダリングする
 * 
 * @param ui - レンダリングするReact要素
 * @param options - レンダリングオプション
 * @returns レンダリング結果
 */
function customRender(
    ui: ReactElement,
    options?: CustomRenderOptions
) {
    return render(ui, { wrapper: AppProviders, ...options });
}

// testing-libraryのユーティリティを再エクスポート
export * from '@testing-library/react';
export { customRender as render };