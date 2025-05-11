import { createBrowserRouter, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Spinner, Center } from '@chakra-ui/react';

// レイアウトコンポーネント
import MainLayout from '../layouts/MainLayout';

// ページコンポーネントの遅延ロード
const HomePage = lazy(() => import('../pages/Home'));
const AuthPage = lazy(() => import('../pages/Auth'));
const NotFoundPage = lazy(() => import('../pages/NotFound'));

/**
 * Suspenseによるローディングコンポーネント
 * 遅延ロード中に表示される
 */
const SuspenseLoader = () => (
    <Center h="100vh">
        <Spinner size="xl" color="blue.500" />
    </Center>
);

/**
 * サスペンス対応のルート要素を作成する関数
 * @param Component - レンダリングするコンポーネント
 * @returns サスペンス対応のコンポーネント
 */
const withSuspense = (Component: React.ComponentType) => (
    <Suspense fallback={<SuspenseLoader />}>
        <Component />
    </Suspense>
);

/**
 * アプリケーションのメインルーター
 * すべてのルート定義を含む
 */
export const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout><Outlet /></MainLayout>,
        errorElement: withSuspense(NotFoundPage),
        children: [
            {
                index: true,
                element: withSuspense(HomePage)
            },
            {
                path: 'dashboard',
                element: withSuspense(HomePage)  // ダッシュボードページは将来実装予定
            },
        ]
    },
    {
        path: '/auth',
        element: withSuspense(AuthPage)
    },
    {
        path: '*',
        element: withSuspense(NotFoundPage)
    }
]);