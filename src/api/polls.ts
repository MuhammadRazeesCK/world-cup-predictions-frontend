import apiClient from './client';

export interface PollOption {
    index: number;
    label: string;
    image: string | null;
    votes: number;
    pct: number;
}

export interface Poll {
    id: string;
    question: string;
    emoji: string | null;
    options: PollOption[];
    totalVotes: number;
    userVote: number | null;
    closesAt: string | null;
    isClosed: boolean;
    createdAt: string;
}

export const pollsApi = {
    getPolls: async (): Promise<Poll[]> => {
        const { data } = await apiClient.get('/polls');
        return data.data;
    },

    vote: async (pollId: string, optionIndex: number): Promise<void> => {
        await apiClient.post(`/polls/${pollId}/vote`, { option_index: optionIndex });
    },

    // Admin
    adminGetPolls: async (): Promise<any[]> => {
        const { data } = await apiClient.get('/admin/polls');
        return data.data;
    },

    adminCreatePoll: async (payload: {
        question: string;
        options: string[];
        option_images?: (string | null)[];
        emoji?: string;
        closes_at?: string;
    }): Promise<any> => {
        const { data } = await apiClient.post('/admin/polls', payload);
        return data.data;
    },

    adminPatchPoll: async (id: string, updates: {
        is_active?: boolean;
        closes_at?: string | null;
        option_images?: (string | null)[];
    }): Promise<void> => {
        await apiClient.patch(`/admin/polls/${id}`, updates);
    },

    adminDeletePoll: async (id: string): Promise<void> => {
        await apiClient.delete(`/admin/polls/${id}`);
    },

    adminGetPollVotes: async (id: string): Promise<{ byOption: { index: number; label: string; voters: string[] }[] }> => {
        const { data } = await apiClient.get(`/admin/polls/${id}/votes`);
        return data.data;
    },
};
