import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest, RegisterRequest } from '../types/User';
import { api } from '../enum/api';
import { asyncPost, asyncGet } from '../utils/fetch';

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (credentials: LoginRequest) => Promise<boolean>;
    register: (userData: RegisterRequest) => Promise<boolean>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 檢查本地存儲的 token
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            // 驗證 token 並獲取用戶資訊
            validateToken(storedToken);
        } else {
            setLoading(false);
        }
    }, []);

    const validateToken = async (token: string) => {
        try {
            const response = await asyncGet(api.me, token);
            if (response.code === 200) {
                setUser(response.body);
            } else {
                // Token 無效，清除本地存儲
                localStorage.removeItem('token');
                setToken(null);
                setUser(null);
            }
        } catch (error) {
            console.error('Token validation failed:', error);
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials: LoginRequest): Promise<boolean> => {
        try {
            const response = await asyncPost(api.login, credentials);
            if (response.code === 200 && response.body && response.body.token) {
                setToken(response.body.token);
                setUser(response.body.user);
                localStorage.setItem('token', response.body.token);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    };

    const register = async (userData: RegisterRequest): Promise<boolean> => {
        try {
            const response = await asyncPost(api.register, userData);
            if (response.code === 200 && response.body && response.body.token) {
                setToken(response.body.token);
                setUser(response.body.user);
                localStorage.setItem('token', response.body.token);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Registration failed:', error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
    };

    const value: AuthContextType = {
        user,
        token,
        login,
        register,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
