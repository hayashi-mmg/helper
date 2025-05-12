import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Center, Spinner } from '@chakra-ui/react';
import { useAuthStore } from '../../../hooks/useAuth';

// ページコンポーネントのレイジーロード
const LoginPage = lazy(() => import('../../../pages/Auth').then(module => ({ default: module.default })));
const RegisterPage = lazy(() => import('../../../pages/Auth/Register').then(module => ({ default: module.default })));
const ForgotPasswordPage = lazy(() => import('../../../pages/Auth/ForgotPassword').then(module => ({ default: module.default })));
const ResetPasswordPage = lazy(() => import('../../../pages/Auth/ResetPassword').then(module => ({ default: module.default })));

// ユーザー関連ページ
const DashboardPage = lazy(() => import('../../user/pages/Dashboard').then(module => ({ default: module.default })));
const RequestsPage = lazy(() => import('../../user/pages/Requests').then(module => ({ default: module.default })));
const RequestDetailPage = lazy(() => import('../../user/pages/RequestDetail').then(module => ({ default: module.default })));
const NewRequestPage = lazy(() => import('../../user/pages/NewRequest').then(module => ({ default: module.default })));
const EditRequestPage = lazy(() => import('../../user/pages/EditRequest').then(module => ({ default: module.default })));
const HelpersPage = lazy(() => import('../../user/pages/Helpers').then(module => ({ default: module.default })));
const HelperDetailPage = lazy(() => import('../../user/pages/HelperDetail').then(module => ({ default: module.default })));

// エラーページ
const NotFoundPage = lazy(() => import('../../../pages/NotFound').then(module => ({ default: module.default })));

/**
 * ロード中表示のコンポーネント
 */
const LoadingFallback = () => (  <Center h="100vh">    <Spinner 
      size="xl" 
      color="blue.500"
    />
  </Center>
);

/**
 * 認証が必要なルートのラッパーコンポーネント
 */
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, loading: isLoading } = useAuthStore();
  
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
const PublicRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, loading: isLoading } = useAuthStore();
  
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
