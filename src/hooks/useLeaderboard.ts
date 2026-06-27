import { useQuery } from '@tanstack/react-query';
import { leaderboardApi } from '../api/leaderboard';
import { useAuth } from '../context/AuthContext';

export function useLeaderboard(params?: { limit?: number; offset?: number; stage_group?: 'all' | 'group' | 'knockout' }) {
    return useQuery({
        queryKey: ['leaderboard', params],
        queryFn: () => leaderboardApi.getLeaderboard(params).then((r) => r.data),
        refetchInterval: 30 * 1000,
        staleTime: 15 * 1000,
    });
}

export function useUserStats() {
    const { token } = useAuth();

    return useQuery({
        queryKey: ['leaderboard', 'stats'],
        queryFn: () => leaderboardApi.getStats().then((r) => r.data),
        refetchInterval: 30 * 1000,
        enabled: !!token,
    });
}
