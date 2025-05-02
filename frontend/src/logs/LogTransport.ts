import { LogEntry, LogTransportConfig, LogType } from './types';

const DEFAULT_CONFIG: LogTransportConfig = {
  batchSize: 20,
  maxBufferSize: 100,
  flushInterval: 30000, // 30秒
  retryLimit: 3,
  retryInterval: 5000, // 5秒
  endpoint: '/api/logs/client'
};

export class LogTransport {
  private buffer: LogEntry[] = [];
  private config: LogTransportConfig;
  private flushTimerId: any = null;
  private isSending: boolean = false;
  private isPageUnloading: boolean = false;

  constructor(config: Partial<LogTransportConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // フラッシュタイマーの開始
    this.startFlushTimer();
    
    // ページアンロード時の処理
    window.addEventListener('beforeunload', this.handleBeforeUnload);
    
    // オフライン/オンライン検出
    window.addEventListener('online', this.handleOnline);
  }

  public addLog(entry: LogEntry): void {
    // タイムスタンプの設定
    if (!entry.timestamp) {
      entry.timestamp = Date.now();
    }
    
    // 送信試行回数の初期化
    if (entry.sendAttempts === undefined) {
      entry.sendAttempts = 0;
    }
    
    this.buffer.push(entry);
    
    // バッファがしきい値を超えた場合、フラッシュ
    if (this.buffer.length >= this.config.batchSize) {
      this.flush();
    }
    
    // クリティカルなエラーは即時送信
    if (
      entry.type === LogType.APP && 
      'level' in entry.payload && 
      entry.payload.level === 'CRITICAL'
    ) {
      this.flush();
    }
  }

  public async flush(): Promise<void> {
    if (this.isSending || this.buffer.length === 0) {
      return;
    }
    
    this.isSending = true;
    
    try {
      // バッファからログを取得（優先度順）
      const sortedBuffer = [...this.buffer].sort((a, b) => b.priority - a.priority);
      const logsToSend = sortedBuffer.slice(0, this.config.batchSize);
      
      // カテゴリごとにログを分類
      const logsByType: Record<LogType, any[]> = {
        [LogType.APP]: [],
        [LogType.USER_ACTION]: [],
        [LogType.PERFORMANCE]: []
      };
      
      logsToSend.forEach(entry => {
        logsByType[entry.type].push(entry.payload);
      });
      
      // 非同期送信（ページアンロード時はbeacon APIを使用）
      if (this.isPageUnloading) {
        const blob = new Blob([JSON.stringify(logsByType)], { type: 'application/json' });
        navigator.sendBeacon(this.config.endpoint, blob);
        
        // ページアンロード時は送信成功と見なし、バッファをクリア
        this.buffer = this.buffer.filter(entry => !logsToSend.includes(entry));
      } else {
        // 通常の非同期リクエスト
        const response = await fetch(this.config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(logsByType)
        });
        
        if (response.ok) {
          // 送信成功したログをバッファから削除
          this.buffer = this.buffer.filter(entry => !logsToSend.includes(entry));
        } else {
          // 送信失敗時の再試行カウント更新
          logsToSend.forEach(entry => {
            if (entry.sendAttempts !== undefined) {
              entry.sendAttempts++;
            }
          });
          
          // 再試行上限に達したログは削除
          this.buffer = this.buffer.filter(entry => 
            entry.sendAttempts === undefined || entry.sendAttempts < this.config.retryLimit
          );
        }
      }
    } catch (error) {
      console.error('ログの送信に失敗しました', error);
    } finally {
      this.isSending = false;
    }
  }

  private startFlushTimer(): void {
    this.flushTimerId = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  private stopFlushTimer(): void {
    if (this.flushTimerId) {
      clearInterval(this.flushTimerId);
      this.flushTimerId = null;
    }
  }

  private handleBeforeUnload = (): void => {
    this.isPageUnloading = true;
    this.stopFlushTimer();
    this.flush();
  }

  private handleOnline = (): void => {
    // オンラインに戻った時、保留中のログを送信
    this.flush();
  }

  // クリーンアップ
  public destroy(): void {
    this.stopFlushTimer();
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    window.removeEventListener('online', this.handleOnline);
  }
}