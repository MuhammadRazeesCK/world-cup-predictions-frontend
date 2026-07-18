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
        penalty_enabled?: boolean;
        api_fixture_id?: number | null;
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

    uploadPoster: async (fixtureId: string, file: File): Promise<ApiResponse<{ poster_url: string }>> => {
        const formData = new FormData();
        formData.append('poster', file);
        const { data } = await apiClient.post(`/admin/fixtures/${fixtureId}/poster`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },

    deletePoster: async (fixtureId: string): Promise<ApiResponse<null>> => {
        const { data } = await apiClient.delete(`/admin/fixtures/${fixtureId}/poster`);
        return data;
    },

    setStreamUrl: async (fixtureId: string, stream_url: string | null): Promise<void> => {
        await apiClient.put(`/admin/fixtures/${fixtureId}/stream`, { stream_url });
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
            penalty_home_score: number | null;
            penalty_away_score: number | null;
        };
        predictions: Array<{
            id: string;
            username: string;
            home_goals: number;
            away_goals: number;
            pen_home_goals: number | null;
            pen_away_goals: number | null;
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

    setAnnouncement: async (file: File | null, message: string): Promise<any> => {
        const form = new FormData();
        if (file) form.append('image', file);
        if (message.trim()) form.append('message', message.trim());
        const { data } = await apiClient.post('/admin/announcement', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },

    clearAnnouncement: async (): Promise<any> => {
        const { data } = await apiClient.delete('/admin/announcement');
        return data;
    },

    getMonitoring: async (): Promise<any> => {
        const { data } = await apiClient.get('/admin/monitoring');
        return data;
    },

    getPlayerPhotos: async (): Promise<{ id: number; player_name: string; photo_url: string }[]> => {
        const { data } = await apiClient.get('/admin/player-photos');
        return data.data;
    },

    setPlayerPhoto: async (player_name: string, photo_url: string): Promise<void> => {
        await apiClient.put('/admin/player-photos', { player_name, photo_url });
    },

    deletePlayerPhoto: async (player_name: string): Promise<void> => {
        await apiClient.delete(`/admin/player-photos/${encodeURIComponent(player_name)}`);
    },
};
