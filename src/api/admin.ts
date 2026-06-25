import apiClient from './client';
import { ApiResponse, Fixture, AdminLog } from '../types';

export const adminApi = {
    bulkUpload: async (
        file: File
    ): Promise<ApiResponse<{ uploaded: number; total: number; errors: string[] }>> => {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await apiClient.post('/admin/fixtures/bulk-upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },

    createFixture: async (fixture: {
        match_number: number;
        home_team: string;
        away_team: string;
        kickoff_time: string;
        stage: string;
    }): Promise<ApiResponse<Fixture>> => {
        const { data } = await apiClient.post('/admin/fixtures', fixture);
        return data;
    },

    updateFixture: async (
        id: string,
        updates: Partial<{
            home_team: string;
            away_team: string;
            kickoff_time: string;
            stage: string;
            status: string;
            home_score: number;
            away_score: number;
        }>
    ): Promise<ApiResponse<Fixture>> => {
        const { data } = await apiClient.put(`/admin/fixtures/${id}`, updates);
        return data;
    },

    deleteFixture: async (id: string): Promise<ApiResponse<null>> => {
        const { data } = await apiClient.delete(`/admin/fixtures/${id}`);
        return data;
    },

    getFixtures: async (): Promise<ApiResponse<(Fixture & { prediction_count: number })[]>> => {
        const { data } = await apiClient.get('/admin/fixtures');
        return data;
    },

    getLogs: async (params?: {
        action?: string;
        admin_id?: string;
        startDate?: string;
        endDate?: string;
        limit?: number;
        offset?: number;
    }): Promise<ApiResponse<AdminLog[]>> => {
        const { data } = await apiClient.get('/admin/logs', { params });
        return data;
    },

    getUsers: async (): Promise<ApiResponse<any[]>> => {
        const { data } = await apiClient.get('/admin/users');
        return data;
    },

    createUser: async (payload: { email: string; username: string; password: string; role: string }): Promise<ApiResponse<any>> => {
        const { data } = await apiClient.post('/admin/users', payload);
        return data;
    },

    resetPassword: async (userId: string, password: string): Promise<ApiResponse<any>> => {
        const { data } = await apiClient.post(`/admin/users/${userId}/reset-password`, { password });
        return data;
    },

    getPredictions: async (): Promise<ApiResponse<Array<{
        fixture: {
            id: string;
            match_number: number;
            home_team: string;
            away_team: string;
            kickoff_time: string;
            stage: string;
            status: string;
            home_score: number | null;
            away_score: number | null;
        };
        predictions: Array<{
            id: string;
            username: string;
            home_goals: number;
            away_goals: number;
            result: string | null;
            points: number | null;
            predicted_at: string;
        }>;
        pending_users: string[];
    }>>> => {
        const { data } = await apiClient.get('/admin/predictions');
        return data;
    },

    rescore: async (id: string): Promise<{ success: boolean; data?: { updated: number } }> => {
        const { data } = await apiClient.post(`/admin/fixtures/${id}/rescore`);
        return data;
    },
};
