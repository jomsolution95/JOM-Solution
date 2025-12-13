import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface ProfileDocument {
    name: string;
    url: string;
    type: string;
    date: Date;
}

export const profilesApi = {
    getMe: async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/profiles/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    addDocument: async (document: ProfileDocument) => {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/profiles/me/documents`, document, {
             headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};
