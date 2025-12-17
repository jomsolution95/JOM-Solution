import api from './client';
import { Job } from '../types';

export interface CreateJobData {
    title: string;
    description: string;
    type: string;
    location: string;
    salary?: string;
    requirements?: string[];
    isRemote?: boolean;
    autoBroadcast?: boolean;
}

export const jobsApi = {
    getAll: async (params?: any) => {
        const response = await api.get('/jobs', { params });
        return response.data;
    },

    getOne: async (id: string) => {
        const response = await api.get(`/jobs/${id}`);
        return response.data;
    },

    create: async (data: CreateJobData) => {
        const response = await api.post('/jobs', data);
        return response.data;
    },

    update: async (id: string, data: Partial<CreateJobData>) => {
        const response = await api.patch(`/jobs/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/jobs/${id}`);
        return response.data;
    },

    search: async (query: string) => {
        const response = await api.get('/jobs/search', { params: { q: query } });
        return response.data;
    },

    apply: async (jobId: string, data: { cvId: string; coverLetter?: string }) => {
        const response = await api.post(`/applications/${jobId}`, data);
        return response.data;
    }
};
