import api from './client';

export interface PaymentMethod {
    type: 'wave' | 'orange_money' | 'card';
    phone?: string;
    cardLast4?: string;
}

export interface Payment {
    _id: string;
    amount: number;
    currency: string;
    status: 'pending' | 'success' | 'failed' | 'cancelled';
    method: PaymentMethod;
    description: string;
    invoiceUrl?: string;
    createdAt: string;
    updatedAt: string;
    metadata?: Record<string, any>;
}

export interface CheckoutSession {
    sessionId: string;
    paymentUrl: string;
    expiresAt: string;
}

/**
 * Create checkout session for premium subscription
 */
export const createPremiumCheckout = async (plan: 'monthly' | 'yearly') => {
    const response = await api.post('/payments/checkout/premium', { plan });
    return response.data as CheckoutSession;
};

/**
 * Create checkout session for service purchase
 */
export const createServiceCheckout = async (serviceId: string, quantity: number = 1) => {
    const response = await api.post('/payments/checkout/service', {
        serviceId,
        quantity,
    });
    return response.data as CheckoutSession;
};

/**
 * Initialize Wave payment
 */
export const initializeWavePayment = async (
    amount: number,
    phone: string,
    description: string
) => {
    const response = await api.post('/payments/wave/initialize', {
        amount,
        phone,
        description,
    });
    return response.data;
};

/**
 * Initialize Orange Money payment
 */
export const initializeOrangeMoneyPayment = async (
    amount: number,
    phone: string,
    description: string
) => {
    const response = await api.post('/payments/orange-money/initialize', {
        amount,
        phone,
        description,
    });
    return response.data;
};

/**
 * Check payment status
 */
export const checkPaymentStatus = async (paymentId: string) => {
    const response = await api.get(`/payments/${paymentId}/status`);
    return response.data;
};

/**
 * Get payment history
 */
export const getPaymentHistory = async (params?: {
    page?: number;
    limit?: number;
    status?: string;
}) => {
    const response = await api.get('/payments/history', { params });
    return response.data;
};

/**
 * Download invoice PDF
 */
export const downloadInvoice = async (paymentId: string) => {
    const response = await api.get(`/payments/${paymentId}/invoice`, {
        responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoice-${paymentId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

/**
 * Cancel pending payment
 */
export const cancelPayment = async (paymentId: string) => {
    const response = await api.post(`/payments/${paymentId}/cancel`);
    return response.data;
};

/**
 * Retry failed payment
 */
export const retryPayment = async (paymentId: string) => {
    const response = await api.post(`/payments/${paymentId}/retry`);
    return response.data;
};

/**
 * Get current subscription
 */
export const getCurrentSubscription = async () => {
    const response = await api.get('/payments/subscription');
    return response.data;
};

/**
 * Cancel subscription
 */
export const cancelSubscription = async () => {
    const response = await api.post('/payments/subscription/cancel');
    return response.data;
};
