import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:4000/api",
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API Error:', {
      status: err?.response?.status,
      statusText: err?.response?.statusText,
      data: err?.response?.data,
      message: err.message,
      url: err?.config?.url,
      method: err?.config?.method
    });
    
    const msg = err?.response?.data?.error || err?.response?.data?.message || err.message || "Request failed";
    return Promise.reject(new Error(msg));
  }
);
