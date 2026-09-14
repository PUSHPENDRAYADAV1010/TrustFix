import axios from 'axios';

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
    if (token) {
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
      console.warn('[TrustFix API] Session expired or unauthorized (401)');
      // If we got 401 on an authenticated endpoint (not during login/register attempts), clear session
      const isAuthEndpoint = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      if (!isAuthEndpoint) {
        localStorage.removeItem('trustfix_token');
        localStorage.removeItem('trustfix_user');
        localStorage.removeItem('trustfix_provider_profile');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
