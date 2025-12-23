import apiClient from './client';

export interface ProfileDocument {
    name: string;
    url: string;
    type: string;
    date: Date;
}

export const profilesApi = {
    getMe: async () => {
        const response = await apiClient.get('/profiles/me');
        return response.data;
    },

    addDocument: async (document: ProfileDocument) => {
        const response = await apiClient.post('/profiles/me/documents', document);
        return response.data;
    },

    uploadAvatar: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post('/profiles/avatar', formData);
        return response.data;
    }
};
