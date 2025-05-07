import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { QueryProvider } from './QueryProvider';

describe('QueryProvider', () => {
    it('正しく子コンポーネントをレンダリングすること', () => {
        // テスト用のダミー子コンポーネント
        const testText = 'テスト子コンポーネント';
        
        // QueryProviderをレンダリング
        render(
            <QueryProvider>
                <div data-testid="child-component">{testText}</div>
            </QueryProvider>
        );
        
        // 子コンポーネントが正しくレンダリングされたことを確認
        const childElement = screen.getByTestId('child-component');
        expect(childElement).toBeInTheDocument();
        expect(childElement).toHaveTextContent(testText);
    });
    
    it('カスタムQueryClientを受け入れること', () => {
        // カスタムQueryClientを作成
        const mockQueryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                    staleTime: 0,
                },
            },
        });
        
        // スパイを設定して、正しいQueryClientが使用されていることを確認
        const spy = jest.spyOn(mockQueryClient, 'getQueryCache');
        
        // コンポーネントをレンダリング
        render(
            <QueryProvider client={mockQueryClient}>
                <div>テスト</div>
            </QueryProvider>
        );
        
        // QueryClientのメソッドが呼び出されたことを確認
        expect(spy).toHaveBeenCalled();
        
        // スパイをリセット
        spy.mockRestore();
    });
});