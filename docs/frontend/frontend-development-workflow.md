# 開発→承認ワークフロー

このドキュメントでは、本プロジェクトで採用している開発から承認までの標準的なワークフローについて説明します。

## 開発→承認のフロー概要

1. **タスク作成フェーズ**
   - 機能要件の特定
   - タスク記録の作成（`dev-logs/tasks/task-XXX.md`）
   - 開発ブランチの作成（`feature/task-XXX`）

2. **開発フェーズ**
   - 実装作業
   - ユニットテストの作成
   - ストーリーブックファイル作成
   - テスト実行結果の確認（`npx jest 作成したコンポーネント名 --json`）
   - エラーがある場合は修正
   - コードのセルフレビュー
   - コミットとプッシュ
   - タスク記録の変更、ファイル名変更
3. **レビュー依頼フェーズ**
   - 開発完了のマーク
   - レビュー依頼の記録
   - プルリクエスト作成

4. **レビューフェーズ**
   - レビュー担当者によるコードレビュー
   - フィードバックの提供とタスク記録への追記
   - 必要に応じて修正

5. **承認フェーズ**
   - 承認者による最終確認
   - タスク状態の「承認済み」への更新
   - developブランチへのマージ

6. **記録・履歴管理**
   - STATUS.mdの更新
   - タスク履歴の整理
   - バージョン記録の更新

## Gitを活用した開発フロー

### ブランチ戦略

```
main        # 承認済みコード（本番環境）
  |
develop     # 開発コードの統合ブランチ（テスト環境）
  |
feature/*   # 個別機能開発用ブランチ
```

### 開発開始時

タスクの開発を開始する際は、以下の手順に従います：

```bash
# developブランチから最新コードを取得
git checkout develop
git pull origin develop

# 新機能開発用ブランチを作成
git checkout -b feature/task-001

# タスク記録ファイルを作成
mkdir -p dev-logs/tasks
touch dev-logs/tasks/task-001.md

# タスク記録の初期化
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

# タスク記録をコミット
git add dev-logs/tasks/task-001.md
git commit -m "タスク001: 開発開始"
```

### 開発中

開発作業中は、以下のようにテストを実行し、コミットを行います：

```bash
# テスト実行と結果確認
npx jest 作成したコンポーネント名 --json

# エラーがある場合は修正して再テスト

# 作業後にコミット
git add .
git commit -m "タスク001: [変更内容の説明]"

# コミットハッシュをタスク記録に追加
COMMIT_HASH=$(git rev-parse --short HEAD)
COMMIT_MSG=$(git log -1 --pretty=%B)
echo "- ${COMMIT_HASH}: ${COMMIT_MSG}" >> dev-logs/tasks/task-001.md
```

### レビュー依頼時

開発が完了し、レビューを依頼する際は以下の手順に従います：

```bash
# タスク状態の更新
sed -i 's/- \[ \] 開発完了/- \[x\] 開発完了: '"$(date +%Y-%m-%d)"'/' dev-logs/tasks/task-001.md
sed -i 's/- \[ \] レビュー依頼/- \[x\] レビュー依頼: '"$(date +%Y-%m-%d)"'/' dev-logs/tasks/task-001.md

# レビュー依頼としてコミット
git add dev-logs/tasks/task-001.md
git commit -m "タスク001: レビュー依頼"
git push origin feature/task-001

# プルリクエスト作成（GUIまたはCLIツール使用）
```

### レビュアーの作業

レビュアーは以下の手順でレビューを行います：

```bash
# レビュー対象ブランチの取得
git fetch origin
git checkout feature/task-001

# コードレビュー実施
# レビューコメントの追加
echo "
## レビューコメント ($(date +%Y-%m-%d))
1. [コメント1]
2. [コメント2]
3. [コメント3]
" >> dev-logs/tasks/task-001.md

# レビューコメントをコミット
git add dev-logs/tasks/task-001.md
git commit -m "タスク001: レビューコメント追加"
git push origin feature/task-001
```

### 承認プロセス

承認者は以下の手順で承認を行います：

```bash
# 最新のコードを取得
git checkout feature/task-001
git pull origin feature/task-001

# タスク状態の更新
sed -i 's/- \[ \] レビュー完了/- \[x\] レビュー完了: '"$(date +%Y-%m-%d)"'/' dev-logs/tasks/task-001.md
sed -i 's/- \[ \] 承認済み/- \[x\] 承認済み: '"$(date +%Y-%m-%d)"'/' dev-logs/tasks/task-001.md

# 承認記録をコミット
git add dev-logs/tasks/task-001.md
git commit -m "タスク001: 承認完了"
git push origin feature/task-001

# developブランチへのマージ
git checkout develop
git merge --no-ff feature/task-001 -m "タスク001: 承認済みマージ"
git push origin develop

# STATUS.mdの更新
# (ここでSed等を使ってSTATUS.mdを更新)
git add dev-logs/STATUS.md
git commit -m "STATUS更新: タスク001承認済み"
git push origin develop
```

## タスク記録のファイル命名規則

タスク記録のファイル名は以下の規則に従って命名します：

```
task-[タスク番号]-[実装段階]-[コンポーネントタイプ]-[コンポーネント名].md
```

例：
- `task-001-design-atom-textfield.md` - タスク番号001、設計フェーズ、atomタイプのtextfieldコンポーネント
- `task-002-design-atom-datepicker.md` - タスク番号002、設計フェーズ、atomタイプのdatepickerコンポーネント

各部分の説明：
- タスク番号：数字3桁のタスク識別番号（例：001, 002）
- 実装段階：現在の実装フェーズ（例：design, develop, test, review）
- コンポーネントタイプ：コンポーネントの分類（例：atom, molecule, organism）
- コンポーネント名：コンポーネントの具体的な名前（例：textfield, datepicker）

### 開発ブランチ命名との関連付け

タスク記録のファイル名と開発ブランチ名を連携させることで、トレーサビリティを向上させます：

```bash
# タスク001のブランチ作成例
git checkout -b feature/task-001-design-atom-textfield
```

### タスク状態とファイル名の更新

実装段階が進む場合は、ファイル名の実装段階部分を更新します：

```bash
# 設計フェーズから開発フェーズへの移行例
git mv dev-logs/tasks/task-001-design-atom-textfield.md dev-logs/tasks/task-001-develop-atom-textfield.md
```

## タスク記録のテンプレート

```markdown
# タスク[ID]: [タスク名]

## 概要
[タスクの説明]

## 要件
- [要件1]
- [要件2]
- [要件3]

## ステータス
- [x] 開発開始: YYYY-MM-DD
- [ ] 開発完了
- [ ] レビュー依頼
- [ ] レビュー完了
- [ ] 承認済み

## コミット履歴
- なし

## レビューコメント
(レビュー完了後に記入)

## 承認記録
(承認完了後に記入)
```

## ドキュメント一覧と参照

開発→承認ワークフローに関連する主要なドキュメントは以下の通りです：

1. [コーディングルール](./coding-rules.md) - 開発時に守るべきコーディング規約
2. [テストガイドライン](./testing-guidelines.md) - テスト実装のガイドライン
3. [レビューチェックリスト](./review-checklist.md) - コードレビュー時の確認項目

## README.md 確認プロセス

プロジェクトのREADME.mdには以下のClaudeによる確認プロセスが実装されています：

1. README.mdが変更されると、自動的に「確認待ち」状態になります
2. Claudeによる確認が行われた後、「確認済み」状態に更新されます
3. 確認の履歴は `dev-logs/readme-check.log` に記録されます

このプロセスにより、ドキュメントの品質と一貫性を維持します。

## 継続的改善

開発→承認ワークフローは、プロジェクトの進行に合わせて継続的に改善していきます。改善提案がある場合は、以下の手順で提案してください：

1. 改善提案を「タスク」として記録
2. 通常の開発→承認フローに従って処理
3. 承認された改善はワークフローに反映

---

最終更新日: 2025-04-11
