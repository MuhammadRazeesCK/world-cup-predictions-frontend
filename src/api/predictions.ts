import apiClient from './client';
import { ApiResponse, Prediction, PredictionHistoryItem } from '../types';
import type { FixtureGroup } from '../components/export/ExportComponents';

export const predictionsApi = {
    submit: async (
        fixture_id: string,
        predicted_home_goals: number,
        predicted_away_goals: number,
        penalty_home_goals?: number,
        penalty_away_goals?: number,
    ): Promise<ApiResponse<Prediction>> => {
        const { data } = await apiClient.post('/predictions', {
            fixture_id,
            predicted_home_goals,
            predicted_away_goals,
            ...(penalty_home_goals !== undefined && { penalty_home_goals }),
            ...(penalty_away_goals !== undefined && { penalty_away_goals }),
        });
        return data;
    },

    getHistory: async (params?: {
        result?: string;
        limit?: number;
        offset?: number;
    }): Promise<ApiResponse<{ total: number; predictions: PredictionHistoryItem[] }>> => {
        const { data } = await apiClient.get('/predictions/history', { params });
        return data;
    },

    getUserHistory: async (username: string): Promise<ApiResponse<{ total: number; predictions: PredictionHistoryItem[] }>> => {
        const { data } = await apiClient.get(`/predictions/history/user/${encodeURIComponent(username)}`);
        return data;
    },

    getForFixture: async (fixture_id: string): Promise<ApiResponse<Prediction> | null> => {
        try {
            const { data } = await apiClient.get(`/predictions/${fixture_id}`);
            return data;
        } catch (err: any) {
            if (err.response?.status === 204) return null;
            throw err;
        }
    },

    getLockedFixtures: async (): Promise<ApiResponse<FixtureGroup[]>> => {
        const { data } = await apiClient.get('/predictions/locked-fixtures');
        return data;
    },
};
