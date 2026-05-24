'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '@/lib/api';

interface AuthUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
}

interface AuthCtx {
    user: AuthUser | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (body: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('auth_token');
            const storedUser = localStorage.getItem('auth_user');
            if (stored && storedUser) {
                setToken(stored);
                setUser(JSON.parse(storedUser));
            }
        } catch { /* ignore */ }
        setLoading(false);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const data = await authApi.login(email, password);
        setToken(data.accessToken);
        setUser(data.user);
        localStorage.setItem('auth_token', data.accessToken);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
    }, []);

    const register = useCallback(async (body: { email: string; password: string; firstName: string; lastName: string }) => {
        const data = await authApi.register(body);
        setToken(data.accessToken);
        setUser(data.user);
        localStorage.setItem('auth_token', data.accessToken);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    }, []);

    return <Ctx.Provider value={{ user, token, login, register, logout, loading }}>{children}</Ctx.Provider>;
}

export function useAuth() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
