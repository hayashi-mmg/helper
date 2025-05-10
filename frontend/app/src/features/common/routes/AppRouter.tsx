import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Box, Center, Spinner } from '@chakra-ui/react';
import { useAuthState } from '../hooks/useAuth';

// ページコンポーネントのレイジーロード
const LoginPage = lazy(() => import('../auth/pages/LoginPage').then(module => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('../auth/pages/RegisterPage').then(module => ({ default: module.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('../auth/pages/ForgotPasswordPage').then(module => ({ default: module.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('../auth/pages/ResetPasswordPage').then(module => ({ default: module.ResetPasswordPage })));

// ユーザー関連ページ
const DashboardPage = lazy(() => import('../user/pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const RequestsPage = lazy(() => import('../user/pages/RequestsPage').then(module => ({ default: module.RequestsPage })));
const RequestDetailPage = lazy(() => import('../user/pages/RequestDetailPage').then(module => ({ default: module.RequestDetailPage })));
const NewRequestPage = lazy(() => import('../user/pages/NewRequestPage').then(module => ({ default: module.NewRequestPage })));
const EditRequestPage = lazy(() => import('../user/pages/EditRequestPage').then(module => ({ default: module.EditRequestPage })));
const HelpersPage = lazy(() => import('../user/pages/HelpersPage').then(module => ({ default: module.HelpersPage })));
const HelperDetailPage = lazy(() => import('../user/pages/HelperDetailPage').then(module => ({ default: module.HelperDetailPage })));

// エラーページ
const NotFoundPage = lazy(() => import('../common/pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })));

/**
 * ロード中表示のコンポーネント
 */
const LoadingFallback = () => (
  <Center h="100vh">
    <Spinner 
      size="xl" 
      thickness="4px" 
      color="blue.500" 
      emptyColor="gray.200" 
      speed="0.65s"
    />
  </Center>
);

/**
 * 認証が必要なルートのラッパーコンポーネント
 */
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuthState();
  
  if (isLoading) {
    return <LoadingFallback />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

/**
 * 未認証ユーザー専用ルートのラッパーコンポーネント
 */
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuthState();
  
  if (isLoading) {
    return <LoadingFallback />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

/**
 * アプリケーションのメインルーティングコンポーネント
 */
export const AppRouter = () => {
  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* 認証関連ルート（未ログインユーザー向け） */}
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } />
          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          } />
          <Route path="/reset-password" element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          } />
          
          {/* ユーザー認証が必要なルート */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          
          {/* リクエスト関連ルート */}
          <Route path="/requests" element={
            <ProtectedRoute>
              <RequestsPage />
            </ProtectedRoute>
          } />
          <Route path="/requests/new" element={
            <ProtectedRoute>
              <NewRequestPage />
            </ProtectedRoute>
          } />
          <Route path="/requests/:requestId" element={
            <ProtectedRoute>
              <RequestDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/requests/:requestId/edit" element={
            <ProtectedRoute>
              <EditRequestPage />
            </ProtectedRoute>
          } />
            {/* ヘルパー関連ルート */}
          <Route path="/helpers" element={
            <ProtectedRoute>
              <HelpersPage />
            </ProtectedRoute>
          } />
          <Route path="/helpers/:helperId" element={
            <ProtectedRoute>
              <HelperDetailPage />
            </ProtectedRoute>
          } />
          
          {/* リダイレクト */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404ページ */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
};
