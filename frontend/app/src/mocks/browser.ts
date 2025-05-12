// ブラウザ環境でのMSW設定
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Service Workerの設定
export const worker = setupWorker(...handlers);

// 開発環境でのみモックを有効化する初期化関数
export async function initializeMocks() {
    if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK) {
        // Service Workerの起動
        await worker.start({
            onUnhandledRequest: 'bypass', // 未処理のリクエストは通常通り処理
            serviceWorker: {
                url: '/mockServiceWorker.js', // Service Workerのパス
            },
        });
        console.log('%c[MSW] モックサーバーが起動しました', 'color: #3f51b5; font-weight: bold;');
    }
}