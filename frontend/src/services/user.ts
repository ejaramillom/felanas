import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface User {
    id: string;
    username: string;
    role: 'ADMIN' | 'MANAGER' | 'VIEWER';
    companyId: string;
}

export interface CreateUserDto {
    username: string;
    password: string;
    role: 'ADMIN' | 'MANAGER' | 'VIEWER';
}

export const userService = {
    async list(): Promise<User[]> {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    async create(data: CreateUserDto): Promise<User> {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/users`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};
