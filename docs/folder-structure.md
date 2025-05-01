# マークダウンCMSプロジェクトのフォルダ構成

## プロジェクト構造概要

```
C:\work\mcp\cms\
├── .env                           # 環境変数設定ファイル
├── .git/                          # Gitリポジトリ
├── .github/                       # GitHub関連設定
├── .gitignore                     # Git除外ファイル設定
├── backend/                       # バックエンド（FastAPI）
├── build_and_push.sh              # ビルドとプッシュのスクリプト
├── deploy/                        # デプロイメント関連ファイル
├── docker-compose-wsl.yml         # WSL用Docker Compose設定
├── docker-compose.override.yml    # Docker Compose上書き設定
├── docker-compose.yml             # Docker Compose基本設定
├── docs/                          # プロジェクトドキュメント
│   ├── api/                       # API仕様ドキュメント
│   ├── deployment/                # デプロイメント関連ドキュメント
│   ├── dev-logs/                  # 開発ログ
│   ├── frontend/                  # フロントエンド関連ドキュメント
│   │   ├── components/            # コンポーネント仕様書
│   │   ├── frontend-checklist.md  # レビューチェックリスト
│   │   ├── frontend-coding-rules.md # コーディングルール
│   │   ├── frontend-development-workflow.md # 開発→承認ワークフロー
│   │   ├── frontend-testing-guidelines.md # テストガイドライン
│   │   └── setup-guide.md         # セットアップガイド
│   ├── manual/                    # ユーザーマニュアル
│   └── Markdown-cms-spec.md       # プロジェクト仕様書
│   └── database_design.md         #データベース設計書
├── frontend/                      # フロントエンド（React）
└── README.md                      # プロジェクト概要
```

## フロントエンド (React)

```
frontend/
├── app/                           # Reactアプリケーション
│   ├── .env.production            # 本番環境設定
│   ├── .eslintrc-base.js          # ESLint基本設定
│   ├── .prettierrc.json           # Prettier設定
│   ├── eslint.config.js           # ESLint設定
│   ├── jest.config.ts             # Jest設定
│   ├── package.json               # パッケージ依存関係
│   ├── src/                       # ソースコード
│   │   ├── App.tsx                # アプリルートコンポーネント
│   │   ├── assets/                # 静的アセット
│   │   ├── components/            # 共通UIコンポーネント
│   │   │   ├── atoms/             # 最小単位のUI要素
│   │   │   │   ├── Avatar/        # アバターコンポーネント
│   │   │   │   ├── Badge/         # バッジコンポーネント
│   │   │   │   ├── Button/        # ボタンコンポーネント
│   │   │   │   ├── Checkbox/      # チェックボックスコンポーネント
│   │   │   │   ├── Chip/          # チップコンポーネント
│   │   │   │   ├── DatePicker/    # 日付選択コンポーネント
│   │   │   │   ├── FileUpload/    # ファイルアップロードコンポーネント
│   │   │   │   ├── Icon/          # アイコンコンポーネント
│   │   │   │   ├── Input/         # 入力フィールドコンポーネント
│   │   │   │   ├── Radio/         # ラジオボタンコンポーネント
│   │   │   │   ├── Select/        # セレクトコンポーネント
│   │   │   │   └── TextArea/      # テキストエリアコンポーネント
│   │   │   ├── molecules/         # 小さな機能単位
│   │   │   │   ├── AddressForm/   # 住所フォームコンポーネント
│   │   │   │   ├── Card/          # カードコンポーネント
│   │   │   │   ├── ConfirmDialog/ # 確認ダイアログコンポーネント
│   │   │   │   ├── Form/          # フォームコンポーネント
│   │   │   │   ├── FormField/     # フォームフィールドコンポーネント
│   │   │   │   ├── ImageGallery/  # 画像ギャラリーコンポーネント
│   │   │   │   ├── InfoCard/      # 情報カードコンポーネント
│   │   │   │   ├── Notification/  # 通知コンポーネント
│   │   │   │   ├── PageNavigation/ # ページナビゲーションコンポーネント
│   │   │   │   ├── SearchInput/   # 検索入力コンポーネント
│   │   │   │   ├── StatusIndicator/ # ステータスインジケーターコンポーネント
│   │   │   │   ├── TabPanel/      # タブパネルコンポーネント
│   │   │   │   └── Tooltip/       # ツールチップコンポーネント
│   │   │   ├── organisms/         # 大きな機能単位
│   │   │   │   ├── DocumentUploader/ # ドキュメントアップローダーコンポーネント
│   │   │   │   └── LoginForm/     # ログインフォームコンポーネント
│   │   │   ├── pages/             # ページコンポーネント
│   │   │   └── templates/         # テンプレートコンポーネント
│   │   ├── contexts/              # Reactコンテキスト
│   │   ├── features/              # 機能ごとのモジュール
│   │   │   ├── auth/              # 認証機能
│   │   │   ├── content/           # コンテンツ管理機能
│   │   │   └── user/              # ユーザー管理機能
│   │   ├── hooks/                 # カスタムフック
│   │   ├── mocks/                 # モックデータ
│   │   ├── services/              # APIサービス
│   │   ├── styles/                # グローバルスタイル
│   │   ├── test-utils/            # テスト用ユーティリティ
│   │   ├── types/                 # 型定義
│   │   └── utils/                 # ユーティリティ関数
│   ├── tsconfig.json              # TypeScript設定
│   └── vite.config.ts             # Vite設定
├── Dockerfile                     # Docker設定
├── nginx.conf                     # Nginx設定
└── ssl/                           # SSL証明書
```

## バックエンド (FastAPI)

```
backend/
├── app/                           # Pythonアプリケーション
│   ├── database.py                # データベース設定
│   ├── main.py                    # アプリケーションエントリポイント
│   ├── models.py                  # データモデル
│   ├── routes/                    # APIルート
│   │   └── __init__.py            # ルート初期化
│   └── schemas.py                 # データスキーマ
├── Dockerfile                     # Docker設定
└── requirements.txt               # Python依存関係
```

## デプロイメント構成

```
deploy/
└── [デプロイメント関連ファイル]

.github/
└── [GitHub Actions等のCI/CD設定]
```

このフォルダ構成は、仕様書に記載されたアーキテクチャに基づいており、フロントエンドにReact、バックエンドにFastAPIを採用した個人向けマークダウンCMSの基盤を示しています。コンポーネント設計は、Atomic Designパターンに基づいて atoms, molecules, organisms の階層で構成されています。
