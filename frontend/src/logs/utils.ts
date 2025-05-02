// ログユーティリティ関数
import { v4 as uuidv4 } from 'uuid';

// セッションIDの取得（または生成）
export function getSessionId(): string {
  let sessionId = sessionStorage.getItem('log_session_id');
  
  if (!sessionId) {
    sessionId = uuidv4();
    sessionStorage.setItem('log_session_id', sessionId);
  }
  
  return sessionId;
}

// クライアント情報の取得
export function getClientInfo() {
  // ブラウザとOSの検出
  const userAgent = navigator.userAgent;
  let browser = 'unknown';
  let browserVersion = 'unknown';
  let os = 'unknown';
  
  // ブラウザの判定
  if (userAgent.indexOf('Firefox') > -1) {
    browser = 'Firefox';
    browserVersion = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || 'unknown';
  } else if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Edg') === -1 && userAgent.indexOf('OPR') === -1) {
    browser = 'Chrome';
    browserVersion = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || 'unknown';
  } else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
    browser = 'Safari';
    browserVersion = userAgent.match(/Version\/([0-9.]+)/)?.[1] || 'unknown';
  } else if (userAgent.indexOf('Edg') > -1) {
    browser = 'Edge';
    browserVersion = userAgent.match(/Edg\/([0-9.]+)/)?.[1] || 'unknown';
  } else if (userAgent.indexOf('OPR') > -1 || userAgent.indexOf('Opera') > -1) {
    browser = 'Opera';
    browserVersion = userAgent.match(/OPR\/([0-9.]+)/)?.[1] || 
                    userAgent.match(/Opera\/([0-9.]+)/)?.[1] || 'unknown';
  } else if (userAgent.indexOf('Trident') > -1) {
    browser = 'Internet Explorer';
    browserVersion = userAgent.match(/rv:([0-9.]+)/)?.[1] || 'unknown';
  }
  
  // OSの判定
  if (userAgent.indexOf('Windows') > -1) {
    os = 'Windows';
  } else if (userAgent.indexOf('Mac') > -1) {
    os = 'macOS';
  } else if (userAgent.indexOf('Linux') > -1) {
    os = 'Linux';
  } else if (userAgent.indexOf('Android') > -1) {
    os = 'Android';
  } else if (userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1 || userAgent.indexOf('iPod') > -1) {
    os = 'iOS';
  }
  
  // デバイスタイプの判定
  let deviceType = 'desktop';
  if (/Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    deviceType = /iPad|tablet|Tablet/i.test(userAgent) ? 'tablet' : 'mobile';
  }
  
  // 画面サイズ
  const screenSize = `${window.screen.width}x${window.screen.height}`;
  
  return {
    browser,
    browserVersion,
    os,
    deviceType,
    screenSize
  };
}

// リソースURLから識別子を取得
export function getResourceName(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // 主要なリソースタイプを識別
    if (pathname.match(/\.(js|jsx)(\?|$)/)) {
      return `JS: ${pathname.split('/').pop()}`;
    } else if (pathname.match(/\.(css)(\?|$)/)) {
      return `CSS: ${pathname.split('/').pop()}`;
    } else if (pathname.match(/\.(png|jpg|jpeg|gif|svg|webp)(\?|$)/)) {
      return `IMG: ${pathname.split('/').pop()}`;
    } else if (pathname.match(/\.(woff|woff2|ttf|otf|eot)(\?|$)/)) {
      return `FONT: ${pathname.split('/').pop()}`;
    } else if (urlObj.pathname.startsWith('/api/')) {
      return `API: ${urlObj.pathname}`;
    }
    
    // その他のリソース
    return pathname;
  } catch (e) {
    return url.substring(0, 100);
  }
}