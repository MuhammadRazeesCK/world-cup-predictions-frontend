import apiClient from './client';
import { ApiResponse, LeaderboardData, UserStats } from '../types';

export const leaderboardApi = {
    getLeaderboard: async (params?: {
        limit?: number;
        offset?: number;
    }): Promise<ApiResponse<LeaderboardData>> => {
        const { data } = await apiClient.get('/leaderboard', { params });
        return data;
    },

    getStats: async (): Promise<ApiResponse<UserStats>> => {
        const { data } = await apiClient.get('/leaderboard/stats');
        return data;
    },
};
