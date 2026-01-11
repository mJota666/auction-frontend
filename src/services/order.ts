import api from './api';

export const OrderStatus = {
    PENDING_PAYMENT: 'PENDING_PAYMENT',
    PAID: 'PAID', // New status for Payment Proof
    PREPARING: 'PREPARING',
    SHIPPED: 'SHIPPED', // New status for Shipping Proof
    DELIVERING: 'DELIVERING',
    DELIVERED: 'DELIVERED', // New status requested by Backend
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
    paymentProof?: string;
    shippingProof?: string;
}

export const orderService = {
    getMyOrders: async () => {
        const response = await api.get('/orders/my-orders');
        const rawData = response.data?.data || response.data; // Handle wrapped response

        console.log('MyOrders Raw Data:', rawData); // Debug log

        if (!Array.isArray(rawData)) return [];

        return rawData.map((item: any) => ({
            id: item.id,
            productId: item.product?.id,
            productTitle: item.product?.title,
            productImage: item.product?.thumbnailUrl || item.product?.imageUrls?.[0],
            buyerId: item.winnerId,
            sellerId: item.sellerId,
            amount: item.finalPrice,
            status: item.status,
            createdAt: item.createdAt,
            shippingAddress: item.shippingAddress,
            paymentProof: item.paymentProof,
            shippingProof: item.shippingProof
        }));
    },

    getMySales: async () => {
        const response = await api.get('/orders/my-sales');
        const rawData = response.data?.data || response.data;

        console.log('MySales Raw Data:', rawData); // Debug log

        if (!Array.isArray(rawData)) return [];

        return rawData.map((item: any) => ({
            id: item.id,
            productId: item.product?.id,
            productTitle: item.product?.title,
            productImage: item.product?.thumbnailUrl || item.product?.imageUrls?.[0],
            buyerId: item.winnerId,
            sellerId: item.sellerId,
            amount: item.finalPrice,
            status: item.status,
            createdAt: item.createdAt,
            shippingAddress: item.shippingAddress,
            paymentProof: item.paymentProof,
            shippingProof: item.shippingProof
        }));
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
        const response = await api.post(`/payment/create-payment-intent/${orderId}`);
        return response.data; // Expecting { clientSecret: string }
    },

    updateOrderStatus: async (orderId: number, status: OrderStatus) => {
        const response = await api.put(`/orders/${orderId}/status`, {}, {
            params: { status }
        });
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
