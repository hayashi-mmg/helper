# 開発環境セットアップガイド

このガイドでは、開発→承認ワークフローに必要な環境設定と初期セットアップの手順を説明します。

## 前提条件

- Git がインストールされていること
- Node.js と npm がインストールされていること
- コードエディタ（VSCode推奨）がインストールされていること

## 初期セットアップ手順

### 1. リポジトリのクローン

```bash
# リポジトリをクローン
git clone https://github.com/your-organization/your-repo.git
cd your-repo

# developブランチに切り替え
git checkout develop
```

### 2. 開発ツールのセットアップ

```bash
# 依存パッケージのインストール
npm install

# Gitフックのセットアップ
setup_git_hooks.bat
```

### 3. フォルダ構造の確認

```bash
# プロジェクトのフォルダ構造を確認
|- application/       # ソースコード
|- docs/              # ドキュメント
|- dev-logs/          # 開発ログ
   |- tasks/          # タスク別ステータスファイル
   |- STATUS.md       # 現在の開発状況一覧
|- README.md          # プロジェクト概要
```

### 4. 開発ドキュメントの確認

必ず以下のドキュメントを確認してください：

1. [開発ワークフロー](./development-workflow.md) - 開発から承認までの詳細なフロー
2. [コーディングルール](./coding-rules.md) - 守るべきコーディング規約
3. [テストガイドライン](./testing-guidelines.md) - テスト実装の方法
4. [レビューチェックリスト](./review-checklist.md) - レビュー時の確認項目

## 新しいタスクの開始方法

新しいタスクを開始する場合は、以下の手順に従います：

### 1. 最新のdevelopブランチを取得

```bash
git checkout develop
git pull origin develop
```

### 2. 機能ブランチの作成

```bash
# タスク001の例
git checkout -b feature/task-001
```

### 3. タスク記録ファイルの作成

```bash
# タスク記録ディレクトリの作成（初回のみ）
mkdir -p dev-logs/tasks

# タスク記録ファイルの作成
echo "# タスク001: [タスク名]

## 概要
[タスクの説明]

## ステータス
- [x] 開発開始: $(date +%Y-%m-%d)
- [ ] 開発完了
- [ ] レビュー依頼
- [ ] レビュー完了
- [ ] 承認済み

## コミット履歴
- なし
" > dev-logs/tasks/task-001.md

# 初期タスク記録をコミット
git add dev-logs/tasks/task-001.md
git commit -m "タスク001: 開発開始"
```

### 4. 開発作業

コーディングルールに従って開発を進めます。コミットする際は、以下のようにタスクID付きのメッセージを使用します：

```bash
git commit -m "タスク001: [変更内容の説明]"
```

## 補助ツールの使用方法

### README.md確認チェック

```bash
# README.mdの確認状態をチェック
check_readme.bat
```

### README.md確認済み設定

```bash
# Claudeによる確認後、確認済み状態に更新
claude_confirm.bat
```

### タスク記録の更新

レビュー依頼時：

```bash
# タスク状態の更新（PowerShellの例）
(Get-Content dev-logs/tasks/task-001.md) -replace '- \[ \] 開発完了', '- [x] 開発完了: 2025-04-12' | Set-Content dev-logs/tasks/task-001.md
(Get-Content dev-logs/tasks/task-001.md) -replace '- \[ \] レビュー依頼', '- [x] レビュー依頼: 2025-04-12' | Set-Content dev-logs/tasks/task-001.md

# 変更をコミット
git add dev-logs/tasks/task-001.md
git commit -m "タスク001: レビュー依頼"
git push origin feature/task-001
```

## トラブルシューティング

### Gitフックが動作しない場合

```bash
# Gitフックの再設定
setup_git_hooks.bat

# 権限確認
ls -la .git/hooks/
chmod +x .git/hooks/pre-commit
```

### タスク記録の不整合

```bash
# STATUS.mdの更新
git checkout develop
# STATUS.md手動更新
git add dev-logs/STATUS.md
git commit -m "STATUS更新: タスク状態の同期"
git push origin develop
```

## ヘルプとサポート

問題やご不明点がある場合は、以下の方法でサポートを受けることができます：

1. ドキュメントの確認（`docs/`ディレクトリ）
2. チームメンバーへの質問
3. GitHub Issuesでの課題報告

---

最終更新日: 2025-04-11
