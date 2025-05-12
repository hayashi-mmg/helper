import axios from 'axios';
import { getEnv } from '../utils/env';

// APIのベースURL
const baseURL = getEnv('VITE_API_BASE_URL', 'http://localhost:5173/api/v1');

// axiosインスタンスの作成
const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// リクエストインターセプター
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth-storage');
        if (token) {
            try {
                const { state } = JSON.parse(token);
                if (state.token) {
                    config.headers['Authorization'] = `Bearer ${state.token}`;
                }
            } catch (error) {
                console.error('Failed to parse auth token:', error);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;
