# コーディングルール

このドキュメントでは、本プロジェクトで採用しているコーディングルールについて説明します。既存の `frontend-coding.md` から必要な部分を抽出・再構成しています。

## 基本方針

- 保守性、再利用性、可読性を重視したコーディング
- タイプセーフな開発でバグを早期に発見
- 明確な役割分担と責任範囲
- コンポーネント開発時は、テストコードとStorybook作成が必須
- 充実したドキュメントによるチーム全体での知識共有

## コーディングスタイル

- インデントはスペース2つを使用
- 変数名・関数名はキャメルケースを使用
- 定数はすべて大文字でアンダースコア区切り
- JSX内の属性はダブルクォート使用
- ファイル名規則：
  - コンポーネント: PascalCase（例: `Button.tsx`）
  - その他のファイル: キャメルケース（例: `apiClient.ts`）

## コード品質管理

- Prettierによるコードフォーマット統一
  - 行の最大長: 100文字
  - セミコロン: 必須
  - 末尾カンマ: 複数行の場合は必須
- ESLintによるコーディング規約の遵守
  - `eslint-config-airbnb-typescript` ベース
- Git pre-commitフックでの自動チェック
- TypeScriptの厳格な型チェック（`strict: true`）

## コンポーネント設計

- 単一責任の原則に従い、1つのコンポーネントは1つの役割に限定
- コンポーネント分類:
  - `components/atoms/`: 最小単位のUI要素
  - `components/molecules/`: atomsを組み合わせた小さな機能単位
  - `components/organisms/`: 複数のmoleculesを含む大きな機能単位
  - `features/`: 特定の機能に紐づいたコンポーネント
- Props型定義の徹底
  - オプショナルなpropsにはデフォルト値設定
  - propsの過剰な受け渡しは避ける

## 状態管理

- 状態管理の種類と場所:
  - UI状態: React.useState または useReducer
  - 共有状態: Contextと専用フック
  - グローバル状態: React Query + Zustand
- イミュータブルな状態更新（直接変更せず、新しいオブジェクトを返す）
- 副作用はuseEffectまたはカスタムフックに集約

## 開発→承認フローとの関連

コーディングルールは開発→承認フローの各段階で以下のように適用されます：

1. **開発フェーズ**
   - 本ドキュメントに記載されたコーディングスタイルを遵守
   - コンポーネント設計原則に従ったコード実装
   - Prettier、ESLintによる自動チェック

2. **レビューフェーズ**
   - レビュアーはコーディングルールの遵守を確認
   - 状態管理の適切な実装をチェック
   - コンポーネント分類の適切さを評価

3. **承認フェーズ**
   - 承認者はコードの品質と規約準拠を最終確認
   - 必要に応じてリファクタリングを提案

## コードレビューのチェックポイント

コードレビュー時には、以下の点を特に注意してチェックします：

1. **コーディングスタイル**
   - 命名規則の遵守
   - インデントや行長の適切さ
   - コメントの質と量

2. **コンポーネント設計**
   - 単一責任の原則の遵守
   - 適切なコンポーネント分類
   - Props設計の適切さ

3. **状態管理**
   - 適切な状態管理方法の選択
   - イミュータブルな状態更新
   - 副作用の適切な処理

4. **型安全性**
   - TypeScriptの適切な使用
   - any型の不必要な使用回避
   - 適切なインターフェース設計

## フォルダ構成

基本的なフォルダ構成は以下の通りです：

```
src/
├── components/          # 共通UIコンポーネント
│   ├── atoms/           # 最小単位のUI要素
│   ├── molecules/       # 小さな機能単位
│   └── organisms/       # 大きな機能単位
├── config/              # 環境設定と定数
├── features/            # 機能ごとのモジュール
│   └── [feature]/       # 機能ディレクトリ
│       ├── api/         # API通信関連
│       ├── components/  # 機能固有コンポーネント
│       ├── hooks/       # カスタムフック
│       ├── types/       # 型定義
│       └── utils/       # ユーティリティ関数
├── hooks/               # グローバルカスタムフック
├── lib/                 # 外部ライブラリのラッパー
├── styles/              # グローバルスタイルとテーマ
├── utils/               # 汎用ユーティリティ関数
└── dev-logs/            # 開発ログとタスク記録
    ├── tasks/           # タスク別ステータスファイル
    └── STATUS.md        # 現在の開発状況一覧
```

## その他の重要な規約

- **コミットメッセージ**: タスクIDと変更内容を明記（例: `タスク001: ログイン機能の実装`）
- **ブランチ命名**: `feature/task-XXX` の形式
- **テスト**: コンポーネントと機能には必ずテストを作成
- **ドキュメント**: 複雑なロジックや設計判断には適切なコメントやドキュメントを追加

## 参考資料

詳細なコーディングルールについては、以下のドキュメントも参照してください：

- [テストガイドライン](./testing-guidelines.md)
- [レビューチェックリスト](./review-checklist.md)

---

最終更新日: 2025-04-11
