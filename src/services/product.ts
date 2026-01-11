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
    buyPrice?: number; // Added for Buy Now functionality
    buyNowPrice?: number; // Keep for compatibility if needed
    autoExtendEnabled?: boolean;
    createdAt?: string;
    createAt?: string; // Add this for compatibility
    bidCount?: number; // Added based on BE feedback
    currentWinnerName?: string; // Added based on BE feedback
    sellerRatingPositive?: number; // Added based on BE feedback
    sellerRatingNegative?: number; // Added based on BE feedback
    allowUnratedBidder?: boolean; // Updated based on Backend Guide
    status: 'ACTIVE' | 'SOLD' | 'EXPIRED' | 'DRAFT' | 'REMOVED' | 'UNSOLD';
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
    bidderId: number;
    bidTime?: string; // Legacy?
    time?: string; // Actual API field
    ratingPositive?: number;
    ratingNegative?: number;
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

    getTopMostBids: async () => {
        const response = await api.get('/products/top/most-bids');
        return response.data && response.data.data ? response.data.data : response.data;
    },

    getTopHighestPrice: async () => {
        const response = await api.get('/products/top/highest-price');
        return response.data && response.data.data ? response.data.data : response.data;
    },

    getTopEndingSoon: async () => {
        const response = await api.get('/products/top/ending-soon');
        return response.data && response.data.data ? response.data.data : response.data;
    },

    getBids: async (productId: number | string) => {
        const response = await api.get(`/bids/product/${productId}`);
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

    answerQuestion: async (questionId: number, answer: string) => {
        const response = await api.put(`/products/qa/${questionId}/answer`, { answer });
        return response.data;
    },

    getCategories: async () => {
        const response = await api.get('/categories'); // Changed from /admin/categories
        return response.data;
    },

    getCategoryChildren: async (parentId: number | string) => {
        const response = await api.get(`/categories/${parentId}/children`);
        return response.data && response.data.data ? response.data.data : response.data;
    },

    // New Profile Features
    getMyProducts: async () => {
        const response = await api.get('/products/seller/me');
        return response.data && response.data.data ? response.data.data : response.data;
    },

    getMyBids: async () => {
        const response = await api.get('/bids/me'); // Assuming endpoint
        return response.data && response.data.data ? response.data.data : response.data;
    },

    appendDescription: async (productId: number | string, description: string) => {
        const response = await api.put(`/products/${productId}/description`, { content: description });
        return response.data;
    },

    denyBidder: async (productId: number | string, bidderId: number) => {
        // Updated path based on backend requirements: /bids/{productId}/block/{userId}
        const response = await api.post(`/bids/${productId}/block/${bidderId}`);
        return response.data;
    }
};
