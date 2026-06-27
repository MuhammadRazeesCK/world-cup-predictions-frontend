import apiClient from './client';
import { ApiResponse } from '../types';

export const usersApi = {
    getMe: async (): Promise<ApiResponse<{ id: string; username: string; email: string; role: string; avatar_url: string | null }>> => {
        const { data } = await apiClient.get('/users/me');
        return data;
    },

    uploadAvatar: async (file: File): Promise<ApiResponse<{ avatar_url: string }>> => {
        const form = new FormData();
        form.append('avatar', file);
        const { data } = await apiClient.post('/users/avatar', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },

    deleteAvatar: async (): Promise<ApiResponse<null>> => {
        const { data } = await apiClient.delete('/users/avatar');
        return data;
    },
};
