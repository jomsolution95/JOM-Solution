
import api from './client';
import { Certificate } from '../types';

export const certificatesApi = {
    // Generate a certificate for a completed course
    generate: async (courseId: string) => {
        const response = await api.post<{ certificate: Certificate }>(`/certificates/generate/${courseId}`);
        return response.data;
    },

    // Get all my certificates
    getMyCertificates: async () => {
        const response = await api.get<{ certificates: Certificate[] }>('/certificates/my-certificates');
        return response.data;
    },

    // Get a single certificate
    getOne: async (id: string) => {
        const response = await api.get<{ certificate: Certificate }>(`/certificates/${id}`);
        return response.data;
    },

    // Verify certificate (Public)
    verify: async (code: string) => {
        // Note: verification might be a public endpoint not requiring auth token
        // If api client adds token automatically, it's fine as long as endpoint allows it.
        // If endpoint is strictly public and fails with token, we might need a separate client or axios call.
        // Assuming backend allows auth or no-auth.
        const response = await api.get<{ valid: boolean; certificate: any; message?: string }>(`/certificates/verify/${code}`);
        return response.data;
    }
};
