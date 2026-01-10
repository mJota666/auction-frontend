import api from './api';

export const OrderStatus = {
    PENDING_PAYMENT: 'PENDING_PAYMENT',
    PAID: 'PAID', // New status for Payment Proof
    PREPARING: 'PREPARING',
    SHIPPED: 'SHIPPED', // New status for Shipping Proof
    DELIVERING: 'DELIVERING',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export interface Order {
    id: number;
    productId: number;
    productTitle: string;
    productImage?: string;
    buyerId: number;
    sellerId: number;
    amount: number;
    status: OrderStatus;
    createdAt: string;
    shippingAddress?: string;
}

export const orderService = {
    getMyOrders: async () => {
        const response = await api.get('/orders/my-orders');
        return response.data; // Expecting Order[]
    },

    getMySales: async () => {
        const response = await api.get('/orders/my-sales');
        return response.data; // Expecting Order[]
    },

    async uploadPaymentProof(orderId: number, proofUrl: string) {
        const response = await api.post(`/orders/${orderId}/payment-proof`, { proofUrl });
        return response.data;
    },

    async uploadShippingProof(orderId: number, proofUrl: string) {
        const response = await api.post(`/orders/${orderId}/shipping-proof`, { proofUrl });
        return response.data;
    },

    getOrder: async (id: number | string) => {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    },

    createPaymentIntent: async (orderId: number) => {
        const response = await api.post('/payment/create-payment-intent', { orderId });
        return response.data; // Expecting { clientSecret: string }
    },

    updateOrderStatus: async (orderId: number, status: OrderStatus) => {
        const response = await api.put(`/orders/${orderId}/status`, { status });
        return response.data;
    },

    cancelOrder: async (orderId: number) => {
        const response = await api.post(`/orders/${orderId}/cancel`);
        return response.data;
    },

    submitRating: async (orderId: number, rating: number, comment: string) => {
        const response = await api.post('/ratings', { orderId, rating, comment });
        return response.data;
    }
};
