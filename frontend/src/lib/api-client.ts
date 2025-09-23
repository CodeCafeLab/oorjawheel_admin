import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (typeof window !== 'undefined' ? 
    (window.location.hostname === 'ow.codecafelab.in' ? 'https://ow.codecafelab.in/api' : `${window.location.origin}/api`) 
    : 'http://localhost:4000/api');

export const api = axios.create({
  baseURL,
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
