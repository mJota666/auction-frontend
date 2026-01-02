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
    thumbnailUrl?: string; // Add this
    categoryName?: string; // Add this
    categoryId?: number;
    sellerId?: number;
    sellerName?: string; // Add this
    buyNowPrice?: number;
    autoExtend?: boolean;
    createdAt?: string;
    bidCount?: number; // Added based on BE feedback
    currentWinnerName?: string; // Added based on BE feedback
    sellerRatingPositive?: number; // Added based on BE feedback
    sellerRatingNegative?: number; // Added based on BE feedback
    allowUnratedBidder?: boolean; // Updated based on Backend Guide
    status: 'ACTIVE' | 'SOLD' | 'EXPIRED';
}

export interface Question {
    id: number;
    userId: number;
    userName: string;
    question: string;
    answer?: string;
    createAt: string;
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
        // Unwrap API standard response if needed ({ data: { content: [] }, ... })
        return response.data && response.data.data ? response.data.data : response.data;
    },

    getProduct: async (id: number | string) => {
        const response = await api.get(`/products/${id}`);
        // Unwrap standard API response structure
        return response.data && response.data.data ? response.data.data : response.data;
    },

    createProduct: async (data: any) => {
        const response = await api.post('/products', data);
        return response.data;
    },

    getBids: async (productId: number | string) => {
        const response = await api.get(`/products/${productId}/bids`);
        return response.data && response.data.data ? response.data.data : response.data;
    },

    placeBid: async (productId: number, amount: number) => {
        const response = await api.post('/bids', { productId, amount });
        return response.data;
    },

    getProductQA: async (productId: number | string) => {
        const response = await api.get(`/products/${productId}/qa`);
        return response.data && response.data.data ? response.data.data : response.data;
    },

    askQuestion: async (productId: number | string, question: string) => {
        const response = await api.post(`/products/qa`, { productId, question });
        return response.data;
    },

    getCategories: async () => {
        const response = await api.get('/categories'); // Changed from /admin/categories
        return response.data;
    },

    getCategoryChildren: async (parentId: number | string) => {
        const response = await api.get(`/categories/${parentId}/children`);
        return response.data && response.data.data ? response.data.data : response.data;
    }
};
