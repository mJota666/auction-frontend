import api from './api';

export interface User {
    id: number;
    email: string;
    fullName: string;
    role: string;
    ratingPositive?: number;
    ratingNegative?: number;
    address?: string;
    dob?: string;
}

export interface RegisterData {
    fullName: string;
    email: string;
    password: string;
    address?: string; // Optional but good to have
    dob?: string; // Date of Birth YYYY-MM-DD
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    data: {
        token: string;
        refreshToken: string;
        id: number;
        email: string;
        fullName: string;
        role: string;
        ratingPositive?: number;
        ratingNegative?: number;
    };
    message?: string;
    status?: number;
}

export const authService = {
    register: async (data: RegisterData) => {
        const payload = {
            fullname: data.fullName,
            email: data.email,
            password: data.password,
            address: data.address,
            dob: data.dob
        };
        const response = await api.post<AuthResponse>('/auth/register', payload);
        return response.data;
    },

    login: async (data: LoginData) => {
        const response = await api.post<AuthResponse>('/auth/login', data);
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get('/users/me');
        return response.data;
    },

    getUserPublicProfile: async (userId: number) => {
        const response = await api.get(`/users/${userId}`);
        return response.data && response.data.data ? response.data.data : response.data;
    },

    updateProfile: async (data: any) => {
        const response = await api.put('/users/me', data);
        return response.data;
    },

    changePassword: async (data: any) => {
        const response = await api.put('/users/me/password', data);
        return response.data;
    },

    verifyAccount: async (email: string, otp: string) => {
        const response = await api.post('/auth/verify', { email, otp });
        return response.data;
    },

    getFavorites: async () => {
        const response = await api.get('/users/favorites');
        let result = response.data;

        // 1. Unwrap standard { data: ... } wrapper if present
        if (result && result.data) {
            result = result.data;
        }

        // 2. Unwrap Spring Page { content: ... } if present
        if (result && Array.isArray(result.content)) {
            return result.content;
        }

        // 3. Return array or raw result
        return result;
    },

    addToFavorites: async (productId: number) => {
        const response = await api.post(`/users/favorites/${productId}`);
        return response.data;
    },
    removeFromFavorites: async (productId: number) => {
        const response = await api.delete(`/users/favorites/${productId}`);
        return response.data;
    },
    requestSellerUpgrade: async (reason: string) => {
        const response = await api.post('/users/upgrade-request', { reason });
        return response.data;
    },
    // Rating Features
    getRatings: async (userId?: number) => {
        // If userId is provided, get that user's ratings. Else get own via new API.
        const url = userId ? `/users/${userId}/ratings` : '/ratings/my-ratings';
        const response = await api.get(url);
        return response.data && response.data.data ? response.data.data : response.data;
    },

    rateUser: async (targetUserId: number, score: number, comment: string, orderId?: number) => {
        // POST /ratings
        const response = await api.post('/ratings', {
            targetUserId,
            score, // 1 or -1
            comment,
            orderId
        });
        return response.data;
    },

    forgotPassword: async (email: string) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (email: string, otp: string, newPassword: string) => {
        const response = await api.post('/auth/reset-password', {
            email,
            otp,
            newPassword,
            confirmPassword: newPassword // Backend requires this field
        });
        return response.data;
    }
};
