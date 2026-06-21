/// <reference types="vite/client" />
import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL
        ? `${import.meta.env.VITE_API_URL}/api`
        : '/api',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: attach auth token
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor: handle 401 globally
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear local auth state and redirect to login
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
