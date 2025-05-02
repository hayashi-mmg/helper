import { AppLogger } from './AppLogger';
import { UserActionLogger } from './UserActionLogger';
import { PerformanceLogger } from './PerformanceLogger';
import { LogTransport } from './LogTransport';

export class LogManager {
  private transport: LogTransport;
  private appLogger: AppLogger;
  private userActionLogger: UserActionLogger;
  private performanceLogger: PerformanceLogger;
  private isInitialized: boolean = false;
  
  constructor(config?: any) {
    this.transport = new LogTransport(config);
    this.appLogger = new AppLogger(this.transport);
    this.userActionLogger = new UserActionLogger(this.transport);
    this.performanceLogger = new PerformanceLogger(this.transport);
    
    // グローバルエラーハンドラーの設定
    this.setupGlobalErrorHandling();
    this.isInitialized = true;
  }
  
  // グローバルエラーハンドラーの設定
  private setupGlobalErrorHandling(): void {
    // 未処理のエラーをキャッチ
    window.addEventListener('error', (event) => {
      this.appLogger.error(
        `未処理のエラー: ${event.message}`,
        event.error,
        { filename: event.filename, lineno: event.lineno, colno: event.colno }
      );
    });
    
    // 未処理のPromise例外をキャッチ
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      this.appLogger.error('未処理のPromise例外', error);
    });
  }
  
  // ロガーインスタンスを取得
  public getAppLogger(source: string = 'APP'): AppLogger {
    const logger = new AppLogger(this.transport, source);
    return logger;
  }
  
  public getUserActionLogger(): UserActionLogger {
    return this.userActionLogger;
  }
  
  public getPerformanceLogger(): PerformanceLogger {
    return this.performanceLogger;
  }
  
  // 直接アクセス用の便利メソッド
  public logInfo(message: string, source: string = 'APP', additionalData?: any): void {
    this.appLogger.setSource(source);
    this.appLogger.info(message, additionalData);
  }
  
  public logWarning(message: string, source: string = 'APP', additionalData?: any): void {
    this.appLogger.setSource(source);
    this.appLogger.warning(message, additionalData);
  }
  
  public logError(message: string, error?: Error, source: string = 'APP', additionalData?: any): void {
    this.appLogger.setSource(source);
    this.appLogger.error(message, error, additionalData);
  }
  
  public logUserAction(
    action: string,
    element?: string,
    elementId?: string,
    resourceType?: string,
    resourceId?: string,
    previousState?: any,
    newState?: any,
    metadata?: any
  ): void {
    this.userActionLogger.logAction(
      action, element, elementId, resourceType, resourceId, previousState, newState, metadata
    );
  }
  
  // APIインターセプターの設定
  public setupApiInterceptors(axiosInstance: any): void {
    // リクエスト送信前
    axiosInstance.interceptors.request.use((config: any) => {
      const callId = this.performanceLogger.startApiCall(
        config.url || '', 
        config.method?.toUpperCase() || 'GET'
      );
      
      // リクエスト設定にcallIdを追加
      config.metadata = {
        ...config.metadata,
        logCallId: callId
      };
      
      return config;
    });
    
    // レスポンス受信時
    axiosInstance.interceptors.response.use(
      (response: any) => {
        // 成功レスポンス
        const callId = response.config.metadata?.logCallId;
        if (callId) {
          this.performanceLogger.endApiCall(callId, response.status);
        }
        return response;
      },
      (error: any) => {
        // エラーレスポンス
        const callId = error.config?.metadata?.logCallId;
        if (callId) {
          this.performanceLogger.endApiCall(
            callId, 
            error.response?.status || 0
          );
        }
        return Promise.reject(error);
      }
    );
  }
  
  // クリーンアップ
  public destroy(): void {
    this.transport.destroy();
    this.performanceLogger.destroy();
  }
}

// シングルトンインスタンスを作成
const logManager = new LogManager({
  batchSize: 10,
  flushInterval: 15000,
  endpoint: '/api/logs/client'
});

export default logManager;