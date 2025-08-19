import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api',
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err?.response?.data?.error || err.message || 'Request failed';
    return Promise.reject(new Error(msg));
  }
);
