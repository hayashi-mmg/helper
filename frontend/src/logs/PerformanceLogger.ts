import { PerformancePayload, LogType } from './types';
import { LogTransport } from './LogTransport';
import { getClientInfo, getSessionId, getResourceName } from './utils';

interface ApiCallTiming {
  endpoint: string;
  method: string;
  startTime: number;
  endTime?: number;
  status?: number;
}

export class PerformanceLogger {
  private transport: LogTransport;
  private navigationStartTime: number;
  private apiCalls: Map<string, ApiCallTiming> = new Map();
  private isInitialized: boolean = false;
  
  // Web Vitalsメトリクス
  private metrics: {
    firstPaint?: number;
    firstContentfulPaint?: number;
    largestContentfulPaint?: number;
    firstInputDelay?: number;
    cumulativeLayoutShift?: number;
  } = {};

  constructor(transport: LogTransport) {
    this.transport = transport;
    this.navigationStartTime = performance.now();
    
    // 初期化
    this.initialize();
  }

  private initialize(): void {
    if (this.isInitialized) return;
    
    // パフォーマンスオブザーバーの設定（モダンブラウザのみ）
    if ('PerformanceObserver' in window) {
      this.setupPerformanceObservers();
    }
    
    // ページロード完了時のメトリクス記録
    window.addEventListener('load', this.handlePageLoad);
    
    this.isInitialized = true;
  }

  // パフォーマンスオブザーバーを設定
  private setupPerformanceObservers(): void {
    // 初回描画と初回コンテンツ描画の監視
    const paintObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-paint') {
          this.metrics.firstPaint = entry.startTime;
        } else if (entry.name === 'first-contentful-paint') {
          this.metrics.firstContentfulPaint = entry.startTime;
        }
      }
    });
    
    paintObserver.observe({ type: 'paint', buffered: true });
    
    // 最大コンテンツ描画の監視（Core Web Vitals）
    if (PerformanceObserver.supportedEntryTypes.includes('largest-contentful-paint')) {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.metrics.largestContentfulPaint = lastEntry.startTime;
        }
      });
      
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    }
    
    // 初回入力遅延の監視（Core Web Vitals）
    if (PerformanceObserver.supportedEntryTypes.includes('first-input')) {
      const fidObserver = new PerformanceObserver((entryList) => {
        const firstInput = entryList.getEntries()[0];
        if (firstInput) {
          this.metrics.firstInputDelay = firstInput.processingStart - firstInput.startTime;
        }
      });
      
      fidObserver.observe({ type: 'first-input', buffered: true });
    }
    
    // 累積レイアウトシフトの監視（Core Web Vitals）
    if (PerformanceObserver.supportedEntryTypes.includes('layout-shift')) {
      let cumulativeScore = 0;
      
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          // 予期しないレイアウトシフトのみ加算
          if (!(entry as any).hadRecentInput) {
            cumulativeScore += (entry as any).value;
          }
        }
        
        this.metrics.cumulativeLayoutShift = cumulativeScore;
      });
      
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    }
  }

  // API呼び出しの開始を記録
  public startApiCall(endpoint: string, method: string): string {
    const callId = `${method}:${endpoint}:${Date.now()}`;
    this.apiCalls.set(callId, {
      endpoint,
      method,
      startTime: performance.now()
    });
    
    return callId;
  }

  // API呼び出しの終了を記録
  public endApiCall(callId: string, status: number): void {
    const call = this.apiCalls.get(callId);
    if (call) {
      call.endTime = performance.now();
      call.status = status;
    }
  }

  // ページロード時のパフォーマンスメトリクスを記録
  private handlePageLoad = (): void => {
    setTimeout(() => {
      this.logPageLoad();
    }, 0);
  }

  // パフォーマンスメトリクスを収集して送信
  private logPageLoad(): void {
    // 基本的なタイミング情報を取得
    const performanceEntries = performance.getEntriesByType('navigation');
    let loadTime = 0;
    let domContentLoaded = 0;
    
    if (performanceEntries.length > 0 && 'domComplete' in performanceEntries[0]) {
      const navigationEntry = performanceEntries[0] as PerformanceNavigationTiming;
      loadTime = navigationEntry.loadEventEnd - navigationEntry.startTime;
      domContentLoaded = navigationEntry.domContentLoadedEventEnd - navigationEntry.startTime;
    } else {
      // フォールバック: 従来のAPIを使用
      const timings = performance.timing;
      loadTime = timings.loadEventEnd - timings.navigationStart;
      domContentLoaded = timings.domContentLoadedEventEnd - timings.navigationStart;
    }
    
    // リソース読み込み時間の収集
    const resourceLoadTimes: Record<string, number> = {};
    const resources = performance.getEntriesByType('resource');
    resources.forEach(resource => {
      const name = getResourceName(resource.name);
      resourceLoadTimes[name] = resource.duration;
    });
    
    // メモリ使用量（Chrome系ブラウザのみ）
    let memoryUsage: number | undefined;
    if ((performance as any).memory) {
      memoryUsage = Math.round((performance as any).memory.usedJSHeapSize / (1024 * 1024));
    }
    
    // API呼び出し時間の収集
    const apiCallTimes = Array.from(this.apiCalls.values())
      .filter(call => call.endTime !== undefined)
      .map(call => ({
        endpoint: call.endpoint,
        method: call.method,
        duration: (call.endTime as number) - call.startTime,
        status: call.status as number
      }));
    
    // ペイロードの作成
    const userId = this.getUserId();
    const sessionId = getSessionId();
    
    const payload: PerformancePayload = {
      pageUrl: window.location.href,
      loadTime,
      domContentLoaded,
      timestamp: new Date().toISOString(),
      sessionId,
      userId,
      location: window.location.href,
      userAgent: navigator.userAgent,
      clientInfo: getClientInfo(),
      firstPaint: this.metrics.firstPaint,
      firstContentfulPaint: this.metrics.firstContentfulPaint,
      largestContentfulPaint: this.metrics.largestContentfulPaint,
      firstInputDelay: this.metrics.firstInputDelay,
      cumulativeLayoutShift: this.metrics.cumulativeLayoutShift,
      resourceLoadTimes,
      apiCallTimes,
      memoryUsage
    };
    
    // ログの送信
    this.transport.addLog({
      type: LogType.PERFORMANCE,
      payload,
      timestamp: Date.now(),
      priority: 40 // パフォーマンスログの標準優先度
    });
    
    // APIコール履歴をリセット
    this.apiCalls.clear();
  }
  
  // ユーザーIDを取得（認証情報から）
  private getUserId(): number | undefined {
    try {
      const authData = JSON.parse(localStorage.getItem('auth') || '{}');
      return authData.user?.id;
    } catch (e) {
      return undefined;
    }
  }
  
  // クリーンアップ
  public destroy(): void {
    window.removeEventListener('load', this.handlePageLoad);
  }
}