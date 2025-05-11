import { useEffect } from 'react';
import './App.css';
import { setupCspViolationReporting } from './utils/security';
import { CustomChakraProvider } from './providers/ChakraProvider';
import { QueryProvider } from './providers/QueryProvider';
import { AuthProvider } from './features/auth/providers/AuthProvider';
import { AppRouter } from './features/common/routes/AppRouter';

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
        <QueryProvider>
            <CustomChakraProvider>
                <AuthProvider>
                    <AppRouter />
                </AuthProvider>
            </CustomChakraProvider>
        </QueryProvider>
    );
}

export default App;
