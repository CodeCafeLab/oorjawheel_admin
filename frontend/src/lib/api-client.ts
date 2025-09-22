import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:4000/api",
  withCredentials: true,
  timeout: 15000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      try {
        const { authManager } = await import('@/lib/auth-utils');
        const authHeaders = authManager.getAuthHeaders();
        Object.assign(config.headers, authHeaders);
      } catch (error) {
        console.error('Error getting auth headers:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      // Token expired or invalid, clear auth state
      if (typeof window !== 'undefined') {
        try {
          const { authManager } = await import('@/lib/auth-utils');
          authManager.clearAuthState();
          window.location.href = '/login';
        } catch (error) {
          console.error('Error clearing auth state:', error);
        }
      }
    }
    
    const msg = err?.response?.data?.error || err?.response?.data?.message || err.message || "Request failed";
    return Promise.reject(new Error(msg));
  }
);
