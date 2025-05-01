#!/bin/bash
# docker/backend/start.sh

set -e

export PYTHONPATH=/app

# マイグレーションを実行
alembic upgrade head

# 環境変数によって実行モードを切り替え
if [ "$APP_ENV" = "development" ]; then
    # 開発モード - uvicornを直接実行（ホットリロード有効）
    exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
else
    # 本番モード - gunicornを使用
    exec gunicorn app.main:app \
        -k uvicorn.workers.UvicornWorker \
        -c app/core/gunicorn_conf.py
fi