import apiClient from './client';

export const announcementsApi = {
    getCurrent: async (): Promise<{ id: number; image_url: string | null; message: string | null; created_at: string } | null> => {
        const { data } = await apiClient.get('/announcements/current');
        return data.data;
    },
};
