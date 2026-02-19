import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Attach token automatically
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Auth
export const registerUser = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

export const loginUser = async (data) => {
    const response = await api.post('/auth/login', data);
    return response.data;
};

// Favorites
export const addToFavorites = async (movieData) => {
    const response = await api.post('/favorites', movieData);
    return response.data;
};

export const getFavorites = async () => {
    const response = await api.get('/favorites');
    return response.data;
};

export const removeFromFavorites = async (movieId) => {
    const response = await api.delete(`/favorites/${movieId}`);
    return response.data;
};

export default api;
