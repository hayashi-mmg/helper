import { AppLogPayload, LogLevel, LogType } from './types';
import { LogTransport } from './LogTransport';
import { getClientInfo, getSessionId } from './utils';

export class AppLogger {
  private transport: LogTransport;
  private source: string;

  constructor(transport: LogTransport, source: string = 'APP') {
    this.transport = transport;
    this.source = source;
  }

  // ログレベルに応じたメソッド
  public debug(message: string, additionalData?: any): void {
    this.log('DEBUG', message, additionalData);
  }

  public info(message: string, additionalData?: any): void {
    this.log('INFO', message, additionalData);
  }

  public warning(message: string, additionalData?: any): void {
    this.log('WARNING', message, additionalData);
  }

  public error(message: string, error?: Error, additionalData?: any): void {
    this.log('ERROR', message, additionalData, error);
  }

  public critical(message: string, error?: Error, additionalData?: any): void {
    this.log('CRITICAL', message, additionalData, error);
  }

  // 内部ログメソッド
  private log(level: LogLevel, message: string, additionalData?: any, error?: Error): void {
    const userId = this.getUserId();
    const sessionId = getSessionId();
    
    const payload: AppLogPayload = {
      level,
      source: this.source,
      message,
      timestamp: new Date().toISOString(),
      sessionId,
      userId,
      location: window.location.href,
      userAgent: navigator.userAgent,
      clientInfo: getClientInfo(),
      additionalData
    };
    
    // エラーがある場合はスタックトレースを追加
    if (error && error.stack) {
      payload.stack = error.stack;
    }
    
    // ログトランスポートに送信（優先度はレベルに応じて設定）
    this.transport.addLog({
      type: LogType.APP,
      payload,
      timestamp: Date.now(),
      priority: this.getPriorityFromLevel(level)
    });
    
    // コンソールにも出力（開発環境のみ）
    if (process.env.NODE_ENV === 'development') {
      const method = level.toLowerCase() as keyof Console;
      if (typeof console[method] === 'function') {
        console[method](`[${level}][${this.source}] ${message}`, additionalData, error);
      } else {
        console.log(`[${level}][${this.source}] ${message}`, additionalData, error);
      }
    }
  }

  // ログレベルから優先度を取得
  private getPriorityFromLevel(level: LogLevel): number {
    switch (level) {
      case 'CRITICAL': return 100;
      case 'ERROR': return 80;
      case 'WARNING': return 60;
      case 'INFO': return 40;
      case 'DEBUG': return 20;
      default: return 0;
    }
  }

  // ユーザーIDを取得（認証情報から）
  private getUserId(): number | undefined {
    try {
      // ローカルストレージやステートから認証情報を取得
      const authData = JSON.parse(localStorage.getItem('auth') || '{}');
      return authData.user?.id;
    } catch (e) {
      return undefined;
    }
  }

  // ソース（コンポーネント名など）を設定
  public setSource(source: string): void {
    this.source = source;
  }
}