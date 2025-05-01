# Docker環境構築ガイド

このドキュメントでは、マークダウンCMSプロジェクトのDocker環境の構築方法について説明します。

## 前提条件

- Docker Desktop（Windows/Mac）またはDocker Engine（Linux）がインストールされていること
- Docker Composeがインストールされていること

## ディレクトリ構造

```
./
├── backend/           # FastAPIバックエンド
├── frontend/          # Reactフロントエンド
├── docker/            # Docker関連ファイル
│   ├── backend/       # バックエンドのDockerファイル
│   ├── frontend/      # フロントエンドのDockerファイル
│   └── nginx/         # Nginxの設定ファイル
├── docker-compose.yml # 開発環境用Compose設定
└── docker-compose.prod.yml # 本番環境用Compose設定
```

## 開発環境のセットアップ

1. 環境変数ファイルの準備

   ```bash
   cp .env.example .env
   ```

2. Docker Composeで開発環境を起動

   ```bash
   docker-compose up -d
   ```

3. ブラウザで確認
   - フロントエンド: http://localhost:8080
   - API: http://localhost:8080/api
   - API ドキュメント: http://localhost:8080/docs
   - Mailhog (メールキャッチャー): http://localhost:8025

## 本番環境のセットアップ

1. 本番環境用の環境変数ファイルを準備

   ```bash
   cp .env.prod.example .env.prod
   # .env.prodファイルを編集して適切な値を設定
   ```

2. SSL証明書の準備（HTTPS使用時）
   
   ```bash
   mkdir -p docker/nginx/ssl
   # SSL証明書をdocker/nginx/ssl/に配置
   # - fullchain.pem: 証明書チェーン
   # - privkey.pem: 秘密鍵
   ```

3. 本番環境の起動

   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
   ```

## よくある問題と解決方法

### バックエンドのマイグレーションが失敗する場合

```bash
docker-compose exec backend alembic upgrade head
```

### フロントエンドの依存関係に問題がある場合

```bash
docker-compose exec frontend npm install
```

### ログの確認方法

```bash
# すべてのサービスのログを表示
docker-compose logs

# 特定のサービスのログを表示
docker-compose logs backend
docker-compose logs frontend
```

## バックアップとリストア

### データベースのバックアップ

```bash
docker-compose exec db pg_dump -U postgres markdown_cms > backup.sql
```

### データベースのリストア

```bash
cat backup.sql | docker-compose exec -T db psql -U postgres -d markdown_cms
```

## 本番環境の更新

1. コードを最新の状態に更新

   ```bash
   git pull
   ```

2. コンテナを再ビルドして起動

   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
   ```

## 貢献方法

1. Dockerファイルに変更を加える場合は、まずローカルでテストしてください
2. 問題があれば、issueを作成するか、Pull Requestを送ってください