import apiClient from './client';
import { ApiResponse, User } from '../types';

export interface LoginResponse {
    id: string;
    email: string;
    username: string;
    role: 'user' | 'admin';
    token: string;
    expiresIn: number;
}

export interface SignupResponse {
    id: string;
    email: string;
    username: string;
    token: string;
    expiresIn: number;
}

export const authApi = {
    signup: async (email: string, username: string, password: string): Promise<ApiResponse<SignupResponse>> => {
        const { data } = await apiClient.post('/auth/signup', { email, username, password });
        return data;
    },

    login: async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
        const { data } = await apiClient.post('/auth/login', { email, password });
        return data;
    },

    logout: async (): Promise<void> => {
        await apiClient.post('/auth/logout');
    },

    refresh: async (): Promise<ApiResponse<{ token: string; expiresIn: number }>> => {
        const { data } = await apiClient.post('/auth/refresh');
        return data;
    },

    me: async (): Promise<ApiResponse<User>> => {
        const { data } = await apiClient.get('/auth/me');
        return data;
    },
};
