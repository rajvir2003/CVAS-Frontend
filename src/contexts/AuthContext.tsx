import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import api from '../api';

export enum UserRoles  {
  WORKER = 'WORKER',
  CHECKPOINT_ADMIN = 'CHECKPOINT ADMIN',
  SUPER_ADMIN = 'SUPER ADMIN'
}

interface User {
  serviceNumber : string;
  name: string;
  rank: string;
  role: UserRoles;
  checkpoint?: string;
  checkpointName?: string;
}

interface LoginResult {
  success: boolean;
  message: string;
  user?: User;
}

interface AuthContextType {
  user: User | null;
  login: (serviceNumber: string, password: string) => Promise<LoginResult>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

interface RegisterData {
  serviceNumber: string;
  rank: string;
  name: string;
  password: string;
  role: 'WORKER' | 'CHECKPOINT ADMIN';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("cvas_user");

    if (userData) {
      try {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem("cvas_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (serviceNumber: string, password: string): Promise<LoginResult> => {
    try {
      const res = await api.post('/auth/login', { serviceNumber, password });

      if (res.data?.success === false) {
        return {
          success: false,
          message: res.data?.message || 'Login failed.',
        };
      }

      const user = res.data?.user as User | undefined;

      if (!user) {
        return {
          success: false,
          message: res.data?.message || 'Login failed.',
        };
      }

      setUser(user);
      setIsAuthenticated(true);
      localStorage.setItem("cvas_user", JSON.stringify(user));

      return {
        success: true,
        message: res.data?.message || 'Login successful.',
        user,
      };
    } catch (error: unknown) {
      let message = 'An error occurred. Please try again.';

      if (axios.isAxiosError(error)) {
        const data = error.response?.data as
          | { message?: string | string[]; error?: string }
          | undefined;

        if (typeof data?.message === 'string' && data.message.trim()) {
          message = data.message;
        } else if (Array.isArray(data?.message) && data.message.length > 0) {
          message = data.message.join(', ');
        } else if (typeof data?.error === 'string' && data.error.trim()) {
          message = data.error;
        } else if (error.message) {
          message = error.message;
        }
      }

      return {
        success: false,
        message,
      };
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      const res = await api.post('/auth/register', userData);

      if (res.data.success) {
        return true; 
      }

      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("cvas_user");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};