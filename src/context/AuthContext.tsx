import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { User } from '../types';

interface AuthContextValue {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem('authToken');
                localStorage.removeItem('authUser');
            }
        }
        setIsLoading(false);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const response = await authApi.login(email, password);
        const { token: newToken, id, username, role, email: userEmail } = response.data;

        const userData: User = { id, email: userEmail, username, role };
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('authUser', JSON.stringify(userData));
        queryClient.clear();
    }, [queryClient]);

    const signup = useCallback(async (email: string, username: string, password: string) => {
        const response = await authApi.signup(email, username, password);
        const { token: newToken, id } = response.data;

        const userData: User = { id, email, username, role: 'user' };
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('authUser', JSON.stringify(userData));
        queryClient.clear();
    }, [queryClient]);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } catch {
            // Ignore errors on logout (token may already be expired)
        }
        setUser(null);
        setToken(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                login,
                signup,
                logout,
                isAdmin: user?.role === 'admin',
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
