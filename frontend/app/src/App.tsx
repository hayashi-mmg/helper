import { useEffect } from 'react';
import './App.css';
import { setupCspViolationReporting } from './utils/security';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

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
        <RouterProvider router={router} />
    );
}

export default App;
