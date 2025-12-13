import api from './client';

export interface Service {
    _id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    deliveryTime: number;
    images: string[];
    providerId: string;
    providerName: string;
    providerAvatar?: string;
    rating: number;
    reviewCount: number;
    tags: string[];
    status: 'active' | 'paused' | 'draft';
    createdAt: string;
}

export interface Order {
    _id: string;
    serviceId: string;
    serviceTitle: string;
    buyerId: string;
    sellerId: string;
    status: 'pending' | 'in_progress' | 'delivered' | 'completed' | 'cancelled' | 'disputed';
    price: number;
    requirements?: string;
    deliveryDate?: string;
    createdAt: string;
    updatedAt: string;
}

// Services API
export const servicesApi = {
    // Get all services
    getAll: async (params?: { category?: string; search?: string; page?: number; limit?: number }) => {
        const response = await api.get('/services', { params });
        return response.data;
    },

    // Get service by ID
    getById: async (id: string) => {
        const response = await api.get(`/services/${id}`);
        return response.data;
    },

    // Create service
    create: async (data: Partial<Service>) => {
        const response = await api.post('/services', data);
        return response.data;
    },

    // Update service
    update: async (id: string, data: Partial<Service>) => {
        const response = await api.patch(`/services/${id}`, data);
        return response.data;
    },

    // Delete service
    delete: async (id: string) => {
        const response = await api.delete(`/services/${id}`);
        return response.data;
    },

    // Get my services
    getMy: async () => {
        const response = await api.get('/services/my');
        return response.data;
    },

    // Pause/Activate service
    toggleStatus: async (id: string, status: 'active' | 'paused') => {
        const response = await api.patch(`/services/${id}/status`, { status });
        return response.data;
    },
};

// Orders API
export const ordersApi = {
    // Get all orders
    getAll: async (params?: { status?: string; type?: 'buying' | 'selling' }) => {
        const response = await api.get('/orders', { params });
        return response.data;
    },

    // Get order by ID
    getById: async (id: string) => {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    },

    // Create order
    create: async (data: { serviceId: string; requirements?: string }) => {
        const response = await api.post('/orders', data);
        return response.data;
    },

    // Update order status
    updateStatus: async (id: string, status: Order['status']) => {
        const response = await api.patch(`/orders/${id}/status`, { status });
        return response.data;
    },

    // Deliver order
    deliver: async (id: string, deliveryNote?: string, attachments?: string[]) => {
        const response = await api.post(`/orders/${id}/deliver`, {
            deliveryNote,
            attachments,
        });
        return response.data;
    },

    // Accept delivery
    acceptDelivery: async (id: string, rating?: number, review?: string) => {
        const response = await api.post(`/orders/${id}/accept`, {
            rating,
            review,
        });
        return response.data;
    },

    // Request revision
    requestRevision: async (id: string, revisionNote: string) => {
        const response = await api.post(`/orders/${id}/revision`, {
            revisionNote,
        });
        return response.data;
    },

    // Cancel order
    cancel: async (id: string, reason: string) => {
        const response = await api.post(`/orders/${id}/cancel`, { reason });
        return response.data;
    },

    // Get order messages
    getMessages: async (id: string) => {
        const response = await api.get(`/orders/${id}/messages`);
        return response.data;
    },

    // Send message
    sendMessage: async (id: string, message: string, attachments?: string[]) => {
        const response = await api.post(`/orders/${id}/messages`, {
            message,
            attachments,
        });
        return response.data;
    },
};

// Reviews API
export const reviewsApi = {
    // Get service reviews
    getByService: async (serviceId: string) => {
        const response = await api.get(`/services/${serviceId}/reviews`);
        return response.data;
    },

    // Create review
    create: async (orderId: string, data: { rating: number; comment: string }) => {
        const response = await api.post(`/orders/${orderId}/review`, data);
        return response.data;
    },
};
