import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
};

export interface CVData {
    _id?: string;
    title: string;
    templateId: string;
    content: any;
    lastExportDate?: string;
    createdAt?: string;
    updatedAt?: string;
}

export const cvApi = {
    getAll: async () => {
        const response = await axios.get<CVData[]>(`${API_URL}/cv`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    getOne: async (id: string) => {
        const response = await axios.get<CVData>(`${API_URL}/cv/${id}`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    create: async (data: Omit<CVData, '_id' | 'createdAt' | 'updatedAt'>) => {
        const response = await axios.post<CVData>(`${API_URL}/cv`, data, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    update: async (id: string, data: Partial<CVData>) => {
        const response = await axios.put<CVData>(`${API_URL}/cv/${id}`, data, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    delete: async (id: string) => {
        await axios.delete(`${API_URL}/cv/${id}`, {
            headers: getAuthHeader(),
        });
    },
};
