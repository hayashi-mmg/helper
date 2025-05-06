// MSW（Mock Service Worker）のサーバー設定
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// モックハンドラーをセットアップしてサーバーを作成
export const server = setupServer(...handlers);