import apiClient from './client';
import { ApiResponse, Fixture, AvailableFixture } from '../types';

export const fixturesApi = {
    getAll: async (params?: { status?: string; stage?: string }): Promise<ApiResponse<Fixture[]>> => {
        const { data } = await apiClient.get('/fixtures', { params });
        return data;
    },

    getAvailable: async (): Promise<ApiResponse<AvailableFixture[]>> => {
        const { data } = await apiClient.get('/fixtures/available');
        return data;
    },

    getById: async (id: string): Promise<ApiResponse<Fixture>> => {
        const { data } = await apiClient.get(`/fixtures/${id}`);
        return data;
    },
};
