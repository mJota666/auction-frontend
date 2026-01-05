import axios from 'axios';

const api = axios.create({
    baseURL: '/api/v1', // Using proxy to avoid CORS
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet
        // SKIP if it's a login request (let the page handle the error)
        if (error.response && error.response.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/login')) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                // Call refresh token API
                // We use a fresh axios call to avoid interceptor loops or issues
                const response = await axios.post('/api/v1/auth/refresh-token', {
                    refreshToken: refreshToken
                });

                const { token, refreshToken: newRefreshToken } = response.data.data;

                // Update storage
                localStorage.setItem('token', token);
                if (newRefreshToken) {
                    localStorage.setItem('refreshToken', newRefreshToken);
                }

                // Update defaults and original request
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                originalRequest.headers['Authorization'] = `Bearer ${token}`;

                // Retry original request
                return api(originalRequest);

            } catch (refreshError) {
                // Refresh failed - Logout user
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
