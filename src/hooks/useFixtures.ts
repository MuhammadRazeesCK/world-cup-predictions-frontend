import { useQuery } from '@tanstack/react-query';
import { fixturesApi } from '../api/fixtures';
import { useAuth } from '../context/AuthContext';

export function useAvailableFixtures() {
    const { token } = useAuth();

    return useQuery({
        queryKey: ['fixtures', 'available'],
        queryFn: () => fixturesApi.getAvailable().then((r) => r.data),
        refetchInterval: 30 * 1000,
        refetchIntervalInBackground: true,
        enabled: !!token,
    });
}

export function useAllFixtures(params?: { status?: string; stage?: string }) {
    return useQuery({
        queryKey: ['fixtures', 'all', params],
        queryFn: () => fixturesApi.getAll(params).then((r) => r.data),
        staleTime: 60 * 1000,
    });
}
