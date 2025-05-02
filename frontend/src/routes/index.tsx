import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Box, CircularProgress } from '@mui/material';

// レイアウトコンポーネント（後で実装）
const MainLayout = lazy(() => import('@components/organisms/MainLayout'));
const AuthLayout = lazy(() => import('@components/organisms/AuthLayout'));

// ページコンポーネント（後で実装）
const HomePage = lazy(() => import('@features/home/HomePage'));
const LoginPage = lazy(() => import('@features/auth/LoginPage'));
const RegisterPage = lazy(() => import('@features/auth/RegisterPage'));
const NotFoundPage = lazy(() => import('@features/errors/NotFoundPage'));

// ローディングコンポーネント
const LoadingComponent = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
    <CircularProgress />
  </Box>
);

// アプリケーションのルート設定
const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <Routes>
        {/* 認証ルート */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="" element={<Navigate to="/auth/login" replace />} />
        </Route>

        {/* メインアプリケーションルート */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          {/* その他のルートは後で実装 */}
        </Route>

        {/* 404ページ */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;