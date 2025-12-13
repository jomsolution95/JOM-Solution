import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
};

export interface AISummaryRequest {
    experiences: any[];
    skills: any[];
    currentRole: string;
}

export const aiApi = {
    generateSummary: async (data: AISummaryRequest) => {
        const response = await axios.post<{ summary: string }>(`${API_URL}/ai/generate-summary`, data, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    analyzeCv: async (data: { jobTitle: string; cvContent: string; skills: string[] }) => {
        const response = await axios.post<{ score: number; missingKeywords: string[]; improvements: string[] }>(`${API_URL}/ai/analyze`, data, {
            headers: getAuthHeader(),
        });
        return response.data;
    },
};
