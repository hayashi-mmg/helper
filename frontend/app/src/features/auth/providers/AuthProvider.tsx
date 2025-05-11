import { ReactNode } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';

interface AuthProviderProps {
    children: ReactNode;
}

/**
 * 認証状態を提供するプロバイダーコンポーネント
 * 認証状態をアプリケーション全体で共有するためのコンテキストを提供する
 * 
 * @param {AuthProviderProps} props コンポーネントのプロパティ
 * @returns {JSX.Element} 認証プロバイダーのコンポーネント
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
    // 認証ストアの状態を取得（ここではストアを初期化するだけ）
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    
    // 実際のロジックはZustandストアで管理されているため、
    // このコンポーネントは主に認証状態の初期化とラッピングを担当する

    return <>{children}</>;
};

export default AuthProvider;
