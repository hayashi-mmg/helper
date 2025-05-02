import { useRef, useEffect } from 'react';
import logManager from '@logs/LogManager';
import { AppLogger } from '@logs/AppLogger';
import { UserActionLogger } from '@logs/UserActionLogger';
import { PerformanceLogger } from '@logs/PerformanceLogger';

/**
 * ログを記録するためのカスタムフック
 * @param componentName ログ元のコンポーネント名
 * @returns ロガーオブジェクト
 */
export function useLogger(componentName: string) {
  // コンポーネント名をソースとしたアプリケーションロガーを作成
  const appLogger = useRef<AppLogger>(logManager.getAppLogger(componentName));
  
  // 他のロガーも取得
  const userActionLogger = useRef<UserActionLogger>(logManager.getUserActionLogger());
  const performanceLogger = useRef<PerformanceLogger>(logManager.getPerformanceLogger());
  
  // コンポーネントマウント時にログを記録（開発環境のみ）
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      appLogger.current.debug(`${componentName} マウント`);
      
      return () => {
        appLogger.current.debug(`${componentName} アンマウント`);
      };
    }
  }, [componentName]);
  
  return {
    log: appLogger.current,
    action: userActionLogger.current,
    performance: performanceLogger.current
  };
}