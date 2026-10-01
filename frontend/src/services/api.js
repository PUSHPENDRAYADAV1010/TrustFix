import axios from 'axios';

const AUTH_STORAGE_KEYS = [
  'trustfix_token',
  'trustfix_user',
  'trustfix_provider_profile',
];

export const clearAuthStorage = () => {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
};

// Base Axios client ready for backend API integration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor: Attach JWT token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('trustfix_token');
    if (typeof token === 'string' && token.trim()) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Global error handler & session expiry handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const isAuthEndpoint = /\/auth\/(login|register)/.test(url);

      console.warn('[TrustFix API] Session expired or unauthorized (401)');
      if (!isAuthEndpoint) {
        clearAuthStorage();
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
