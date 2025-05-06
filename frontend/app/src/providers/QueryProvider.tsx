/**
 * React Queryプロバイダーコンポーネント
 * アプリケーション全体にReact Query機能を提供します
 */
import { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../services/api';

interface QueryProviderProps {
    children: ReactNode;
}

/**
 * React Queryの機能をアプリケーション全体に提供するプロバイダーコンポーネント
 *
 * @param {QueryProviderProps} props コンポーネントのプロパティ
 * @returns {JSX.Element} React Queryプロバイダーでラップされた子コンポーネント
 */
export const QueryProvider = ({ children }: QueryProviderProps): JSX.Element => {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

export default QueryProvider;