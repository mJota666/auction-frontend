import api from './api';

export interface AdminStats {
    totalUsers: number;
    totalRevenue: number;
    activeAuctions: number;
}

export interface User {
    id: number;
    fullName: string;
    email: string;
    role: string;
    locked: boolean;
}

export interface Category {
    id: number;
    name: string;
    description?: string;
}

export const adminService = {
    getDashboardStats: async () => {
        const response = await api.get('/admin/dashboard');
        return response.data;
    },

    getUsers: async () => {
        const response = await api.get('/admin/users');
        return response.data; // Expecting User[]
    },

    toggleUserLock: async (userId: number) => {
        const response = await api.put(`/admin/users/${userId}/ban`);
        return response.data;
    },

    getCategories: async () => {
        const response = await api.get('/admin/categories');
        return response.data; // Expecting Category[]
    },

    createCategory: async (category: Omit<Category, 'id'>) => {
        const response = await api.post('/admin/categories', category);
        return response.data;
    },

    updateCategory: async (id: number, category: Omit<Category, 'id'>) => {
        const response = await api.put(`/admin/categories/${id}`, category);
        return response.data;
    },

    deleteCategory: async (id: number) => {
        const response = await api.delete(`/admin/categories/${id}`);
        return response.data;
    }
};
