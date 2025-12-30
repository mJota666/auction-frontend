import api from './api';

export interface Product {
    id: number;
    title: string;
    description: string;
    startPrice: number;
    currentPrice?: number;
    stepPrice: number;
    endAt: string;
    imageUrls: string[];
    categoryId?: number;
    sellerId?: number;
    status: 'ACTIVE' | 'SOLD' | 'EXPIRED';
}

export interface Bid {
    id: number;
    amount: number;
    bidderName: string;
    bidTime: string;
}

export const productService = {
    searchProducts: async (params?: any) => {
        const response = await api.get('/products/search', { params });
        return response.data; // Expecting { content: Product[], totalPages, ... }
    },

    getProduct: async (id: number | string) => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    createProduct: async (data: any) => {
        const response = await api.post('/products', data);
        return response.data;
    },

    getBids: async (productId: number | string) => {
        const response = await api.get(`/products/${productId}/bids`);
        return response.data;
    },

    placeBid: async (productId: number, amount: number) => {
        const response = await api.post('/bids', { productId, amount });
        return response.data;
    }
};
