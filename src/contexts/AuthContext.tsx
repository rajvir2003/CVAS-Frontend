import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

interface User {
  name: string;
  rank: string;
  role: 'WORKER' | 'CHECKPOINT ADMIN' | 'SUPER ADMIN';
  checkpoint?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
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

  useEffect(() => {
    const token = Cookies.get("cvas_token");
    const userData = localStorage.getItem("cvas_user");

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } catch {
        Cookies.remove("cvas_token");
        localStorage.removeItem("cvas_user");
      }
    }
  }, []);

  const login = async (serviceNumber: string, password: string): Promise<boolean> => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/login`,
        { serviceNumber, password },
        // { withCredentials: true }
      );

      const { token, user } = res.data;

      Cookies.set("cvas_token", token, { expires: 7, secure: true, sameSite: "strict" });
      setUser(user);
      setIsAuthenticated(true);
      localStorage.setItem("cvas_user", JSON.stringify(user));

      return true;
    } catch (error) {
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, userData);

      if (res.data.success) {
        return true; 
      }

      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    Cookies.remove("cvas_token");
    localStorage.removeItem("cvas_user");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};