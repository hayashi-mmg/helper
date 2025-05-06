/**
 * QueryProviderコンポーネントのテスト
 */
import { render } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import QueryProvider from '../QueryProvider';
import { queryClient } from '../../services/api';

// ReactQueryのプロバイダーのモック
jest.mock('@tanstack/react-query', () => ({
    QueryClientProvider: jest.fn(({ children }) => <div data-testid="query-provider">{children}</div>),
}));

// queryClientのモック
jest.mock('../../services/api', () => ({
    queryClient: { test: 'mock-query-client' },
}));

describe('QueryProvider', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    it('QueryClientProviderを正しく設定する', () => {
        const { getByTestId } = render(
            <QueryProvider>
                <div data-testid="test-child">テスト子要素</div>
            </QueryProvider>
        );
        
        // QueryClientProviderが適切なクライアントで呼び出されることを確認
        expect(QueryClientProvider).toHaveBeenCalledWith(
            expect.objectContaining({
                client: queryClient,
            }),
            expect.anything()
        );
        
        // 子要素が正しくレンダリングされることを確認
        expect(getByTestId('query-provider')).toBeInTheDocument();
        expect(getByTestId('test-child')).toBeInTheDocument();
        expect(getByTestId('test-child')).toHaveTextContent('テスト子要素');
    });
});