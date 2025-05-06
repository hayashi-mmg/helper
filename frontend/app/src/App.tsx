import { useEffect } from 'react'
import './App.css'
import { setupCspViolationReporting } from './utils/security'
import { getEnv } from './utils/env'

/**
 * アプリケーションのルートコンポーネント
 * セキュリティ設定と基本的なレイアウトを提供
 */
function App() {
  // アプリ名を環境変数から取得
  const appName = getEnv('VITE_APP_NAME', 'ヘルパーシステム')

  // CSP違反レポートの設定
  useEffect(() => {
    setupCspViolationReporting()
    
    // CSRF保護のためのメタタグを追加
    const csrfMeta = document.createElement('meta')
    csrfMeta.setAttribute('name', 'csrf-token')
    csrfMeta.setAttribute('content', crypto.randomUUID())
    document.head.appendChild(csrfMeta)
    
    return () => {
      // クリーンアップ時にメタタグを削除
      document.head.removeChild(csrfMeta)
    }
  }, [])

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>{appName}</h1>
      </header>
      
      <main className="app-main">
        <div className="content">
          <h2>プロジェクト初期化完了</h2>
          <p>
            以下の設定が完了しました：
          </p>
          <ul>
            <li>プロジェクト構造の最適化</li>
            <li>セキュリティ設定の強化</li>
            <li>環境変数の設定</li>
            <li>テスト環境の構築</li>
          </ul>
        </div>
      </main>
      
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} {appName}</p>
      </footer>
    </div>
  )
}

export default App
