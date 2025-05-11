import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeMocks } from './mocks/browser'
import { CustomChakraProvider } from './providers/ChakraProvider'

// 開発環境でモックサーバーを初期化
async function bootstrap() {
  // 環境変数VITE_ENABLE_MOCKがtrueの場合、モックサーバーを初期化
  await initializeMocks();
  
  // Reactアプリのレンダリング
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <CustomChakraProvider>
        <App />
      </CustomChakraProvider>
    </StrictMode>,
  );
}

// アプリケーションの起動
bootstrap().catch(console.error);
