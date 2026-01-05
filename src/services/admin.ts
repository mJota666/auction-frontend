import api from './api';
import type { Product } from './product';

export interface AdminStats {
    totalUsers: number;
    totalRevenue: number;
    activeAuctions: number;
    newAuctionsLast7Days?: number[]; // New for charts
    revenueTrend?: number[]; // New for charts
}

export interface User {
    id: number;
    fullName: string;
    email: string;
    role: string;
    locked: boolean;
    isUpgradeRequested?: boolean; // New field
}

export interface Category {
    id: number;
    name: string;
    description: string;
    parentId?: number;
    children?: Category[];
}

export const adminService = {
    // User Management
    getUsers: async () => {
        const response = await api.get<User[]>('/admin/users');
        return response.data;
    },
    toggleUserLock: async (userId: number) => {
        const response = await api.put(`/admin/users/${userId}/lock`);
        return response.data;
    },
    getUpgradeRequests: async () => {
        const response = await api.get<User[]>('/admin/upgrade-requests');
        return response.data;
    },
    approveUpgradeRequest: async (userId: number) => {
        const response = await api.post(`/admin/upgrade-requests/${userId}/approve`);
        return response.data;
    },
    rejectUpgradeRequest: async (userId: number, reason: string = 'Rejected by Admin') => {
        // Using query param for reason as per guide: ?reason=...
        const response = await api.post(`/admin/upgrade-requests/${userId}/reject`, {}, {
            params: { reason }
        });
        return response.data;
    },

    // Category Management
    getCategories: async () => {
        const response = await api.get<any>('/categories');
        const rawData = response.data && response.data.data ? response.data.data : response.data;

        // Map snake_case to camelCase if necessary
        return Array.isArray(rawData) ? rawData.map((cat: any) => ({
            ...cat,
            parentId: cat.parentId || cat.parent_id || null // Handle both
        })) : [];
    },
    createCategory: async (data: { name: string, description: string, parentId?: number | null }) => {
        const payload = {
            ...data,
            parent_id: data.parentId // Send as snake_case if backend expects it
        };
        const response = await api.post('/admin/categories', payload);
        const rawData = response.data && response.data.data ? response.data.data : response.data;
        return {
            ...rawData,
            parentId: rawData.parentId || rawData.parent_id || null
        };
    },
    updateCategory: async (id: number, data: { name: string, description: string, parentId?: number | null }) => {
        const payload = {
            ...data,
            parent_id: data.parentId
        };
        const response = await api.put(`/admin/categories/${id}`, payload);
        const rawData = response.data && response.data.data ? response.data.data : response.data;
        return {
            ...rawData,
            parentId: rawData.parentId || rawData.parent_id || null
        };
    },
    deleteCategory: async (id: number) => {
        const response = await api.delete(`/admin/categories/${id}`);
        return response.data;
    },

    // Product Management
    getProducts: async () => {
        // Assuming admin can view all products
        const response = await api.get<Product[]>('/products');
        return response.data;
    },
    deleteProduct: async (id: number) => {
        const response = await api.delete(`/products/admin/products/${id}`);
        return response.data;
    },

    // Stats
    getDashboardStats: async () => {
        const response = await api.get<AdminStats>('/admin/stats');
        return response.data;
    }
};
