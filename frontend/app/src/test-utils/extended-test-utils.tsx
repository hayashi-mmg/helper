// テストユーティリティの拡張
import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AllProviders } from './providers';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  queryClient?: QueryClient;
}

/**
 * テスト用に拡張された全プロバイダーでラップするためのコンポーネント
 * ルーティングとReact Queryのプロバイダーを含む
 */
export function ExtendedProviders({
  children,
  initialEntries = ['/'],
  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  }),
}: {
  children: ReactNode;
  initialEntries?: string[];
  queryClient?: QueryClient;
}): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <AllProviders>{children}</AllProviders>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

/**
 * 拡張されたカスタムレンダー関数
 * テスト対象のコンポーネントを必要なすべてのプロバイダーでラップして描画
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    initialEntries = ['/'],
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    }),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <ExtendedProviders 
        initialEntries={initialEntries} 
        queryClient={queryClient}
      >
        {children}
      </ExtendedProviders>
    ),
    ...renderOptions,
  });
}

// テスト用のモックデータ生成関数をエクスポート
export * from './test-data';
