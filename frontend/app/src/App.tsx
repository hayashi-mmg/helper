import { useEffect } from 'react';

import './App.css';
import { AuthProvider } from './features/auth/providers/AuthProvider';
import { AppRouter } from './features/common/routes/AppRouter';
import { CustomChakraProvider } from './providers/ChakraProvider';
import { QueryProvider } from './providers/QueryProvider';
import { setupCspViolationReporting } from './utils/security';
import ErrorBoundary from './components/common/ErrorBoundary';

/**
 * アプリケーションのルートコンポーネント
 * セキュリティ設定とルーティング設定を提供
 * 
 * @returns {JSX.Element} アプリケーションのルートコンポーネント
 */
function App() {
    // CSP違反レポートの設定
    useEffect(() => {
        setupCspViolationReporting();
        
        // CSRF保護のためのメタタグを追加
        const csrfMeta = document.createElement('meta');
        csrfMeta.setAttribute('name', 'csrf-token');
        csrfMeta.setAttribute('content', crypto.randomUUID());
        document.head.appendChild(csrfMeta);
        
        return () => {
            // クリーンアップ時にメタタグを削除
            document.head.removeChild(csrfMeta);
        };
    }, []);

    return (
        <ErrorBoundary>
            <QueryProvider>
                <CustomChakraProvider>
                    <AuthProvider>
                        <AppRouter />
                    </AuthProvider>
                </CustomChakraProvider>
            </QueryProvider>
        </ErrorBoundary>
    );
}

export default App;
