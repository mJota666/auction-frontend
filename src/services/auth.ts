import api from './api';

export interface User {
    id: number;
    email: string;
    fullName: string;
    role: string;
    ratingPositive?: number;
    ratingNegative?: number;
}

export interface RegisterData {
    fullName: string;
    email: string;
    password: string;
    address?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    data: {
        token: string;
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
            address: data.address
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

    updateProfile: async (data: any) => {
        const response = await api.put('/users/me', data);
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
        // Backend Toggle Logic via POST /users/favorites/{productId}
        const response = await api.post(`/users/favorites/${productId}`);
        return response.data;
    },

    removeFromFavorites: async (productId: number) => {
        // Backend uses same Toggle logic
        const response = await api.post(`/users/favorites/${productId}`);
        return response.data;
    }
};
