FROM node:18-alpine

WORKDIR /app

# 依存関係をコピーしてインストール
COPY package.json package-lock.json* ./
RUN npm ci

# アプリケーションコードをコピー
COPY . .

# 開発モードでの起動
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]