FROM python:3.10-slim

WORKDIR /app/

# 必要なパッケージをインストール
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 依存関係をコピーしてインストール
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションコードをコピー
COPY . /app/

# 起動スクリプトをコピーして実行権限を付与
COPY ./docker/backend/start.sh /start.sh
RUN chmod +x /start.sh

# 起動
CMD ["/start.sh"]