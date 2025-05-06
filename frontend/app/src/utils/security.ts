/**
 * セキュリティ関連のユーティリティ関数
 * クロスサイトスクリプティング(XSS)やCSRF攻撃などからアプリケーションを保護
 */

/**
 * XSSフィルタリングのためのテキストエスケープ関数
 * 
 * @param text - エスケープする文字列
 * @returns HTMLエスケープされた文字列
 */
export function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * URLのエンコード関数
 * 
 * @param url - エンコードするURL
 * @returns エンコードされたURL
 */
export function safeUrl(url: string): string {
    try {
        const encoded = encodeURI(url);
        // JavaScript URLスキームをブロック
        if (encoded.toLowerCase().startsWith('javascript:')) {
            return '#';
        }
        return encoded;
    } catch (e) {
        console.error('URL encoding error:', e);
        return '#';
    }
}

/**
 * CSRFトークンの取得関数
 * 
 * @returns CSRFトークン
 */
export function getCsrfToken(): string {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    return metaTag?.getAttribute('content') || '';
}

/**
 * 安全なクラス名を生成
 * ユーザー入力をCSSクラス名に使用する場合に使用
 * 
 * @param className - 元のクラス名
 * @returns 安全なクラス名
 */
export function sanitizeClassName(className: string): string {
    // HTMLタグを完全に削除
    const withoutTags = className.replace(/<[^>]*>/g, '');
    // アルファベット、数字、ハイフン、アンダースコアのみを許可
    return withoutTags.replace(/[^a-zA-Z0-9-_]/g, '');
}

/**
 * Content Security Policy違反イベントをレポートする
 */
export function setupCspViolationReporting(): void {
    document.addEventListener('securitypolicyviolation', (e) => {
        console.error('CSP Violation:', {
            blockedURI: e.blockedURI,
            violatedDirective: e.violatedDirective,
            originalPolicy: e.originalPolicy,
        });
        
        // 実際のアプリケーションでは、ここでサーバーにレポートを送信するとよい
    });
}