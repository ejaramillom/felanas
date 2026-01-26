import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/auth';
import type { AuthResponse } from '../services/auth';

interface AuthContextType {
    user: AuthResponse['user'] | null;
    company: AuthResponse['company'] | null;
    token: string | null;
    login: (data: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthResponse['user'] | null>(null);
    const [company, setCompany] = useState<AuthResponse['company'] | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    const data = await authService.getMe(token);
                    setUser(data.user);
                    setCompany(data.company);
                } catch (err) {
                    logout();
                }
            }
            setLoading(false);
        };
        initAuth();
    }, [token]);

    const login = async (data: any) => {
        const response = await authService.login(data);
        setUser(response.user);
        setCompany(response.company);
        setToken(response.token);
        localStorage.setItem('token', response.token);
    };

    const register = async (data: any) => {
        const response = await authService.register(data);
        setUser(response.user);
        setCompany(response.company);
        setToken(response.token);
        localStorage.setItem('token', response.token);
    };

    const logout = () => {
        setUser(null);
        setCompany(null);
        setToken(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, company, token, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};