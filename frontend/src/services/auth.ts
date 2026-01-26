import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface AuthResponse {
    token: string;
    user: {
        id: string;
        username: string;
        role: string;
        companyId: string;
    };
    company: {
        id: string;
        name: string;
        trialEndsAt?: string;
    };
}

export const authService = {
    async register(data: any): Promise<AuthResponse> {
        const response = await axios.post(`${API_URL}/auth/register`, data);
        return response.data;
    },

    async login(data: any): Promise<AuthResponse> {
        const response = await axios.post(`${API_URL}/auth/login`, data);
        return response.data;
    },

    async getMe(token: string): Promise<AuthResponse> {
        const response = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};
