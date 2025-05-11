# ESLint設定の改善版適用手順

## 1. 必要な依存パッケージのインストール

```bash
# 新しく必要なプラグインをインストール
npm install --save-dev eslint-plugin-jsx-a11y eslint-plugin-import @typescript-eslint/eslint-plugin @typescript-eslint/parser

# TypeScriptの型チェック強化のためにTypeScriptが最新の安定版であることを確認
npm install --save-dev typescript@latest
```

## 2. 現在の設定ファイルのバックアップ

```bash
# 現在の設定をバックアップ
cp .eslintrc.cjs .eslintrc.cjs.backup
```

## 3. 改善版の設定ファイルの適用

```bash
# 改善版の設定を現在の設定ファイルに置き換える
cp eslintrc-improved.cjs .eslintrc.cjs
```

## 4. tsconfig.jsonの確認

新しい設定では `tsconfig.json` を参照するので、プロジェクトルートに存在することを確認してください。

## 5. ESLintの実行とエラー確認

```bash
# プロジェクト全体のリント
npm run lint

# 特定のファイルのリント
npm run lint src/components/Button.tsx

# 自動修正可能な問題を修正
npm run lint:fix
```

## 6. Visual Studio Code のESLint拡張機能設定

`.vscode/settings.json` に以下を追加することを推奨：

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

## 7. 段階的適用の提案

すべてのルールを一度に適用すると大量のエラーが発生する可能性があります。以下の順序で段階的に適用することを推奨：

1. まず `warn` レベルで適用
2. 主要なエラーを修正
3. 必要に応じてルールのレベルを `error` に変更

## 8. 現在の設定からの主な変更点

- TypeScript厳格型チェックの有効化
- アクセシビリティチェックの追加
- インポート管理の自動化
- 非同期処理エラーの検出強化
- テスト環境への最適化

## 9. 次のステップ

1. チーム全体で新しいルールに慣れる
2. エラーが多く発生する場合、一部のルールを緩和することを検討
3. 定期的にルールの有効性を見直す

## 10. トラブルシューティング

### よくある問題と解決策

1. **型チェックのパフォーマンス問題**
   ```javascript
   // parserOptions.project を無効化
   // project: undefined
   ```

2. **既存コードとの互換性問題**
   - 段階的に `warn` → `error` に変更
   - 一時的にルールを無効化する場合：
   ```javascript
   // eslint-disable-next-line rule-name
   ```

3. **インポート順序の自動整列が期待通りにならない**
   - `.eslintrc.cjs` の `settings.import.resolver` 設定を確認
   - TypeScript パスマップの設定を確認
