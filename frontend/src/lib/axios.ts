// APIのベースURL
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5173/api';

// Axiosインスタンスの作成
const axiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // クレデンシャルを有効化
});