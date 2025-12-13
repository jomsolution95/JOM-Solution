import api from './client';

// Jobs API
export const jobsApi = {
    // Get all jobs with pagination
    getJobs: async (params?: { page?: number; limit?: number; status?: string }) => {
        const response = await api.get('/jobs', { params });
        return response.data;
    },

    // Get single job
    getJob: async (id: string) => {
        const response = await api.get(`/jobs/${id}`);
        return response.data;
    },

    // Create job
    createJob: async (data: any) => {
        const response = await api.post('/jobs', data);
        return response.data;
    },

    // Update job
    updateJob: async (id: string, data: any) => {
        const response = await api.patch(`/jobs/${id}`, data);
        return response.data;
    },

    // Delete job
    deleteJob: async (id: string) => {
        const response = await api.delete(`/jobs/${id}`);
        return response.data;
    },

    // Get applications for a job
    getJobApplications: async (jobId: string) => {
        const response = await api.get(`/jobs/${jobId}/applications`);
        return response.data;
    },
};

// Services API
export const servicesApi = {
    // Get all services
    getServices: async (params?: { page?: number; limit?: number }) => {
        const response = await api.get('/services', { params });
        return response.data;
    },

    // Get single service
    getService: async (id: string) => {
        const response = await api.get(`/services/${id}`);
        return response.data;
    },

    // Create service
    createService: async (data: any) => {
        const response = await api.post('/services', data);
        return response.data;
    },

    // Update service
    updateService: async (id: string, data: any) => {
        const response = await api.patch(`/services/${id}`, data);
        return response.data;
    },

    // Delete service
    deleteService: async (id: string) => {
        const response = await api.delete(`/services/${id}`);
        return response.data;
    },
};

// Profiles API
export const profilesApi = {
    // Get all profiles
    getProfiles: async (params?: { page?: number; limit?: number; role?: string }) => {
        const response = await api.get('/profiles', { params });
        return response.data;
    },

    // Get single profile
    getProfile: async (id: string) => {
        const response = await api.get(`/profiles/${id}`);
        return response.data;
    },

    // Get profile by user ID
    getProfileByUserId: async (userId: string) => {
        const response = await api.get(`/profiles/user/${userId}`);
        return response.data;
    },

    // Create profile
    createProfile: async (data: any) => {
        const response = await api.post('/profiles', data);
        return response.data;
    },

    // Update profile
    updateProfile: async (id: string, data: any) => {
        const response = await api.patch(`/profiles/${id}`, data);
        return response.data;
    },

    // Search profiles
    searchProfiles: async (query: string) => {
        const response = await api.get('/profiles/search', { params: { q: query } });
        return response.data;
    },
};

// Applications API
export const applicationsApi = {
    // Get all applications
    getApplications: async (params?: { page?: number; limit?: number }) => {
        const response = await api.get('/applications', { params });
        return response.data;
    },

    // Get single application
    getApplication: async (id: string) => {
        const response = await api.get(`/applications/${id}`);
        return response.data;
    },

    // Create application
    createApplication: async (data: any) => {
        const response = await api.post('/applications', data);
        return response.data;
    },

    // Update application status
    updateApplicationStatus: async (id: string, status: string) => {
        const response = await api.patch(`/applications/${id}/status`, { status });
        return response.data;
    },
};

// Orders API
export const ordersApi = {
    // Get all orders
    getOrders: async (params?: { page?: number; limit?: number }) => {
        const response = await api.get('/orders', { params });
        return response.data;
    },

    // Get single order
    getOrder: async (id: string) => {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    },

    // Create order
    createOrder: async (data: any) => {
        const response = await api.post('/orders', data);
        return response.data;
    },

    // Update order status
    updateOrderStatus: async (id: string, status: string) => {
        const response = await api.patch(`/orders/${id}/status`, { status });
        return response.data;
    },

    // Cancel order
    cancelOrder: async (id: string) => {
        const response = await api.patch(`/orders/${id}/cancel`);
        return response.data;
    },
};

// Messaging API
export const messagingApi = {
    // Get all conversations
    getConversations: async () => {
        const response = await api.get('/messaging/conversations');
        return response.data;
    },

    // Get single conversation
    getConversation: async (id: string) => {
        const response = await api.get(`/messaging/conversations/${id}`);
        return response.data;
    },

    // Create conversation
    createConversation: async (data: { participantId: string }) => {
        const response = await api.post('/messaging/conversations', data);
        return response.data;
    },

    // Get messages for a conversation
    getMessages: async (conversationId: string, params?: { page?: number; limit?: number }) => {
        const response = await api.get(`/messaging/conversations/${conversationId}/messages`, { params });
        return response.data;
    },

    // Send message
    sendMessage: async (conversationId: string, data: { content: string }) => {
        const response = await api.post(`/messaging/conversations/${conversationId}/messages`, data);
        return response.data;
    },

    // Mark messages as read
    markAsRead: async (conversationId: string) => {
        const response = await api.patch(`/messaging/conversations/${conversationId}/read`);
        return response.data;
    },
};

// Notifications API
export const notificationsApi = {
    // Get all notifications
    getNotifications: async () => {
        const response = await api.get('/notifications');
        return response.data;
    },

    // Get unread count
    getUnreadCount: async () => {
        const response = await api.get('/notifications/unread-count');
        return response.data;
    },

    // Mark notification as read
    markAsRead: async (id: string) => {
        const response = await api.patch(`/notifications/${id}/read`);
        return response.data;
    },
};

// Users API
export const usersApi = {
    // Get current user
    getMe: async () => {
        const response = await api.get('/users/me');
        return response.data;
    },

    // Update current user
    updateMe: async (data: any) => {
        const response = await api.patch('/users/me', data);
        return response.data;
    },
};
