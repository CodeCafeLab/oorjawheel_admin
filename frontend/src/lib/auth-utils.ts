'use client';

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  status: string;
  last_login?: string;
  created_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';

export class AuthManager {
  private static instance: AuthManager;
  
  private constructor() {}
  
  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  // Get auth state from localStorage
  public getAuthState(): AuthState {
    if (typeof window === 'undefined') {
      return { user: null, token: null, isAuthenticated: false };
    }

    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const userStr = localStorage.getItem(AUTH_USER_KEY);
      const user = userStr ? JSON.parse(userStr) : null;
      
      return {
        user,
        token,
        isAuthenticated: !!(token && user)
      };
    } catch (error) {
      console.error('Error reading auth state:', error);
      return { user: null, token: null, isAuthenticated: false };
    }
  }

  // Set auth state in localStorage
  public setAuthState(user: User, token: string): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error setting auth state:', error);
    }
  }

  // Clear auth state
  public clearAuthState(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    } catch (error) {
      console.error('Error clearing auth state:', error);
    }
  }

  // Get auth headers for API requests
  public getAuthHeaders(): Record<string, string> {
    const { token } = this.getAuthState();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Check if token is expired (basic check)
  public isTokenExpired(): boolean {
    const { token } = this.getAuthState();
    if (!token) return true;

    try {
      // Decode JWT token (basic check)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  // Validate token with server
  public async validateToken(): Promise<boolean> {
    const { token } = this.getAuthState();
    if (!token) return false;

    try {
      const response = await fetch('http://localhost:4000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Update user data if needed
        if (data.data?.user) {
          this.setAuthState(data.data.user, token);
        }
        return true;
      } else {
        this.clearAuthState();
        return false;
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      this.clearAuthState();
      return false;
    }
  }
}

// Export singleton instance
export const authManager = AuthManager.getInstance();
