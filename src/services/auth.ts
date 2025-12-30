import api from './api';

export interface RegisterData {
    fullName: string;
    email: string;
    password: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    data: {
        token: string;
        user: {
            id: number;
            email: string;
            fullName: string;
            role: string;
        };
    };
    message?: string;
}

export const authService = {
    register: async (data: RegisterData) => {
        const payload = {
            fullname: data.fullName,
            email: data.email,
            password: data.password
        };
        const response = await api.post<AuthResponse>('/auth/register', payload);
        return response.data;
    },

    login: async (data: LoginData) => {
        const response = await api.post<AuthResponse>('/auth/login', data);
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get('/users/profile');
        return response.data;
    },

    updateProfile: async (data: any) => {
        const response = await api.put('/users/profile', data);
        return response.data;
    },

    getFavorites: async () => {
        const response = await api.get('/users/favorites');
        return response.data; // Expecting Product[]
    }
};
