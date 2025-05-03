## 2. システムアーキテクチャ

### 2.1 全体構成

- **言語/フレームワーク**: Python + FastAPI
- **データベース**: PostgreSQL + SQLAlchemy (ORM)
- **認証**: JWT + OAuth2
- **API仕様**: OpenAPI (Swagger)

### 2.2 システム構成図

```
クライアント (ブラウザ/モバイル) ←→ Nginx (リバースプロキシ) ←→ FastAPI アプリケーション ←→ PostgreSQL
                                                               ↕
                                                            Redis キャッシュ
```

### 2.3 ディレクトリ構造

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPIのエントリーポイント
│   ├── config.py                   # 設定管理
│   ├── database.py                 # データベース接続設定
│   ├── dependencies.py             # 共通依存性
│   ├── exceptions.py               # カスタム例外クラス
│   ├── api/
│   │   ├── __init__.py
│   │   ├── v1/                     # APIバージョン1
│   │   │   ├── __init__.py
│   │   │   ├── endpoints/          # エンドポイント定義
│   │   │   ├── dependencies.py     # API v1固有の依存性
│   │   │   └── router.py           # v1ルーター集約
│   ├── core/                       # コアモジュール
│   │   ├── __init__.py
│   │   ├── auth.py                 # 認証ロジック
│   │   ├── security.py             # セキュリティ機能
│   │   └── errors.py               # エラーハンドリング
│   ├── crud/                       # データアクセス層
│   │   ├── __init__.py
│   │   ├── base.py                 # 基本CRUD操作
│   │   ├── users.py                # ユーザー関連CRUD
│   │   ├── helpers.py              # ヘルパー関連CRUD
│   │   ├── recipes.py              # レシピ関連CRUD
│   │   ├── requests.py             # リクエスト関連CRUD
│   │   └── feedback.py             # フィードバック関連CRUD
│   ├── db/                         # データベースモデル
│   │   ├── __init__.py
│   │   ├── base.py                 # 基本モデル
│   │   └── models/                 # SQLAlchemyモデル
│   ├── logs/                       # ログ関連モジュール
│   │   ├── __init__.py
│   │   ├── app_logger.py           # アプリケーションログ
│   │   ├── audit_logger.py         # 監査ログ
│   │   └── performance_logger.py   # パフォーマンスログ
│   ├── schemas/                    # Pydanticスキーマ
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── helper.py
│   │   ├── recipe.py
│   │   ├── request.py
│   │   └── feedback.py
│   ├── services/                   # ビジネスロジック
│   │   ├── __init__.py
│   │   ├── user_service.py
│   │   ├── helper_service.py
│   │   ├── recipe_service.py
│   │   ├── request_service.py
│   │   ├── feedback_service.py
│   │   └── qrcode_service.py
│   └── utils/                      # ユーティリティ関数
│       ├── __init__.py
│       ├── recipe_parser.py        # レシピ情報の解析
│       ├── qrcode_generator.py     # QRコード生成
│       └── i18n.py                 # 多言語対応
├── alembic/                        # マイグレーション
├── tests/                          # テスト
│   ├── __init__.py
│   ├── conftest.py                 # テスト設定
│   ├── api/                        # APIテスト
│   └── ...
├── .env                            # 環境変数（バージョン管理外）
├── requirements.txt                # 依存パッケージ
├── Dockerfile                      # Dockerビルド定義
└── docker-compose.yml              # Dockerコンポーズ定義
```

