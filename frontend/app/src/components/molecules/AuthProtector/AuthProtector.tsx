import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';

export interface AuthProtectorProps {
    /**
     * 保護するコンテンツ
     */
    children: ReactNode;
    
    /**
     * 認証されていない場合のリダイレクト先
     * @default "/login"
     */
    redirectTo?: string;
    
    /**
     * リダイレクト後にログイン後の遷移先として現在のパスを保存するか
     * @default true
     */
    saveReturnPath?: boolean;
    
    /**
     * 要求される権限レベル（オプション）
     * 指定した場合、そのロールを持つユーザーのみアクセス可能
     */
    requiredRole?: 'admin' | 'helper' | 'user';
}

/**
 * 認証保護コンポーネント
 * 
 * 未認証ユーザーがアクセスした場合、指定されたパス（デフォルトは"/login"）にリダイレクトします。
 * オプションで権限レベルを指定することも可能です。
 */
const AuthProtector = ({
    children,
    redirectTo = '/login',
    saveReturnPath = true,
    requiredRole
}: AuthProtectorProps) => {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const user = useAuthStore(state => state.user);
    const location = useLocation();
    
    // 認証されていない場合、ログインページへリダイレクト
    if (!isAuthenticated) {
        // 現在のパスを保存して、ログイン後に戻れるようにする
        const returnPath = saveReturnPath ? location.pathname + location.search : '';
        const redirectPath = returnPath 
            ? `${redirectTo}?returnTo=${encodeURIComponent(returnPath)}` 
            : redirectTo;
            
        return <Navigate to={redirectPath} state={{ from: location }} replace />;
    }
    
    // 特定のロールが必要で、ユーザーがそのロールを持っていない場合
    if (requiredRole && user?.role !== requiredRole) {
        // 権限不足のページにリダイレクト
        return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }
    
    // 認証済みの場合は子コンポーネントを表示
    return <>{children}</>;
};

export default AuthProtector;
