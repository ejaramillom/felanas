import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface User {
    id: string;
    username: string;
    role: string;
    companyId: string;
}

export interface CreateUserDto {
    username: string;
    password: string;
    role: string;
}

function authHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export const userService = {
    async list(): Promise<User[]> {
        const res = await axios.get(`${API_URL}/users`, { headers: authHeader() });
        return res.data;
    },
    async create(data: CreateUserDto): Promise<User> {
        const res = await axios.post(`${API_URL}/users`, data, { headers: authHeader() });
        return res.data;
    },
};