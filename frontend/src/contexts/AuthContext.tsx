'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authManager, User, AuthState } from '@/lib/auth-utils';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, redirectUrl?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check if user is authenticated
  const isAuthenticated = !!user && !!token;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const authState = authManager.getAuthState();
        
        if (authState.isAuthenticated) {
          setToken(authState.token);
          setUser(authState.user);
          
          // Verify token is still valid
          const isValid = await authManager.validateToken();
          if (!isValid) {
            clearAuthState();
          } else {
            // Update with fresh user data
            const updatedState = authManager.getAuthState();
            setUser(updatedState.user);
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        clearAuthState();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Redirect to login if not authenticated and not on login page
  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== '/login') {
      const currentPath = pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  const clearAuthState = () => {
    setUser(null);
    setToken(null);
    authManager.clearAuthState();
  };

  const login = async (email: string, password: string, redirectUrl?: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, redirectUrl }),
      });

      const data = await response.json();

      if (data.success) {
        const { user: userData, token: userToken } = data.data;
        
        // Use auth manager to set auth state
        authManager.setAuthState(userData, userToken);
        setUser(userData);
        setToken(userToken);

        // Redirect to the intended page or dashboard
        const redirectTo = redirectUrl || data.data.redirectUrl || '/';
        router.push(redirectTo);
        
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const logout = () => {
    clearAuthState();
    router.push('/login');
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
