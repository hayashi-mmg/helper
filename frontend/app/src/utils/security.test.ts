import { escapeHtml, safeUrl, sanitizeClassName, getCsrfToken } from './security';

describe('セキュリティユーティリティ', () => {
    describe('escapeHtml', () => {
        it('HTMLの特殊文字をエスケープする', () => {
            const input = '<script>alert("XSS");</script>';
            const expected = '&lt;script&gt;alert(&quot;XSS&quot;);&lt;/script&gt;';
            expect(escapeHtml(input)).toBe(expected);
        });

        it('HTMLエンティティをエスケープする', () => {
            const input = 'Tom & Jerry say "Hello!" to O\'Reilly';
            const expected = 'Tom &amp; Jerry say &quot;Hello!&quot; to O&#039;Reilly';
            expect(escapeHtml(input)).toBe(expected);
        });

        it('通常のテキストはそのまま返す', () => {
            const input = 'Just a normal text';
            expect(escapeHtml(input)).toBe(input);
        });
    });

    describe('safeUrl', () => {
        it('javascriptスキームのURLを安全に変換する', () => {
            const maliciousUrl = 'javascript:alert(document.cookie)';
            expect(safeUrl(maliciousUrl)).toBe('#');
        });

        it('大文字小文字混合のjavascriptスキームも検出する', () => {
            const maliciousUrl = 'JaVasCrIpT:alert(1)';
            expect(safeUrl(maliciousUrl)).toBe('#');
        });

        it('通常のURLはエンコードして返す', () => {
            const url = 'https://example.com/path?q=検索';
            expect(safeUrl(url)).toBe('https://example.com/path?q=%E6%A4%9C%E7%B4%A2');
        });

        it('不正なURLの場合は#を返す', () => {
            // URLエンコードに失敗する無限大の文字を含むケース
            const mockEncodeURI = jest.spyOn(global, 'encodeURI').mockImplementation(() => {
                throw new URIError('URI malformed');
            });
            
            expect(safeUrl('invalid url')).toBe('#');
            
            mockEncodeURI.mockRestore();
        });
    });

    describe('sanitizeClassName', () => {
        it('安全でない文字を除去する', () => {
            const input = 'user-input<script>';
            const expected = 'user-input';
            expect(sanitizeClassName(input)).toBe(expected);
        });

        it('許可された文字のみを残す', () => {
            const input = 'safe_class-name123';
            expect(sanitizeClassName(input)).toBe(input);
        });

        it('特殊文字と空白を除去する', () => {
            const input = 'class name!@#$%^&*(){}[]';
            const expected = 'classname';
            expect(sanitizeClassName(input)).toBe(expected);
        });
    });

    describe('getCsrfToken', () => {
        it('CSRFトークンを正しく取得する', () => {
            // DOMにCSRFトークンのメタタグを追加
            const metaTag = document.createElement('meta');
            metaTag.setAttribute('name', 'csrf-token');
            metaTag.setAttribute('content', 'test-csrf-token');
            document.head.appendChild(metaTag);

            expect(getCsrfToken()).toBe('test-csrf-token');

            // テスト後にメタタグを削除
            document.head.removeChild(metaTag);
        });

        it('CSRFトークンがない場合は空文字を返す', () => {
            // メタタグがない場合
            expect(getCsrfToken()).toBe('');
        });
    });
});