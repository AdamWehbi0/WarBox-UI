import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your computer's IP address where Spring Boot is running
const BASE_URL = 'http://192.168.1.241:8080';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include JWT token
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('jwt_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Token management functions
export const storeToken = async (token: string) => {
    await AsyncStorage.setItem('jwt_token', token);
};

export const getToken = async (): Promise<string | null> => {
    return await AsyncStorage.getItem('jwt_token');
};

export const removeToken = async () => {
    await AsyncStorage.removeItem('jwt_token');
};

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    handle: string;
    displayName: string;
}

export interface AuthResponse {
    token: string;
    email: string;
    handle: string;
    displayName: string;
}

// Login API call
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
};

// Register API call
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
};

// Like a post
export const likePost = async (postId: string): Promise<{ message: string; likeCount: number }> => {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
};

// Unlike a post
export const unlikePost = async (postId: string): Promise<{ message: string; likeCount: number }> => {
    const response = await api.delete(`/posts/${postId}/like`);
    return response.data;
};

// Comment on a post
export const addComment = async (postId: string, content: string): Promise<void> => {
    await api.post(`/posts/${postId}/comments`, { content });
};

// Get comments for a post
export const getComments = async (postId: string): Promise<any[]> => {
    const response = await api.get(`/posts/${postId}/comments`);
    return response.data;
};

export default api;