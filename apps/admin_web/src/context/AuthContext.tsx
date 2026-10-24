'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface AdminUser {
  id: string;
  email: string;
  display_name: string;
  role: string;
}

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check stored session
    try {
      const storedToken = localStorage.getItem('likora_admin_token');
      const storedUser = localStorage.getItem('likora_admin_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Error recovering session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('http://localhost:3000/api/v1/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.message || 'Error en las credenciales de acceso';
        return { success: false, error: Array.isArray(errorMsg) ? errorMsg[0] : errorMsg };
      }

      const receivedToken = data.access_token;
      const receivedUser: AdminUser = {
        id: data.user.id,
        email: data.user.email,
        display_name: data.user.display_name,
        role: data.user.role,
      };

      setToken(receivedToken);
      setUser(receivedUser);

      localStorage.setItem('likora_admin_token', receivedToken);
      if (data.refresh_token) {
        localStorage.setItem('likora_admin_refresh_token', data.refresh_token);
      }
      localStorage.setItem('likora_admin_user', JSON.stringify(receivedUser));

      return { success: true };
    } catch (err: any) {
      console.error('Login error:', err);
      return { success: false, error: 'No fue posible conectar con el servidor de autenticación' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem('likora_admin_token');
      localStorage.removeItem('likora_admin_refresh_token');
      localStorage.removeItem('likora_admin_user');
    } catch (e) {}
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
