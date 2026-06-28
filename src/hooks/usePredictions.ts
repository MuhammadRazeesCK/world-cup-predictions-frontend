import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { predictionsApi } from '../api/predictions';

export function usePredictionHistory(params?: { result?: string; limit?: number; offset?: number }) {
    return useQuery({
        queryKey: ['predictions', 'history', params],
        queryFn: () => predictionsApi.getHistory(params).then((r) => r.data),
        staleTime: 30 * 1000,
    });
}

export function useSubmitPrediction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            fixture_id,
            home,
            away,
            pen_home,
            pen_away,
        }: {
            fixture_id: string;
            home: number;
            away: number;
            pen_home?: number;
            pen_away?: number;
        }) => predictionsApi.submit(fixture_id, home, away, pen_home, pen_away),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['predictions'] });
            queryClient.invalidateQueries({ queryKey: ['fixtures', 'available'] });
            queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
        },
    });
}
