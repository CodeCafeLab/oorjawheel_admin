import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

// Use environment variable for API URL with fallback to localhost for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// Colors for console logging
const colors = {
  request: '#1E88E5',  // Blue
  success: '#43A047',  // Green
  error: '#E53935',    // Red
  warning: '#FB8C00',  // Orange
  reset: '%c',
};

// Log levels
const LOG_LEVELS = {
  NONE: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4,
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

// Current log level (set to DEBUG for maximum logging)
const LOG_LEVEL: LogLevel = 'DEBUG';

// Helper function to check if we should log at the given level
const shouldLog = (level: LogLevel): boolean => {
  return LOG_LEVELS[LOG_LEVEL] >= LOG_LEVELS[level];
};

// Format request/response data for logging
const formatRequest = (config: AxiosRequestConfig) => {
  return {
    url: `${config.baseURL}${config.url}`,
    method: config.method?.toUpperCase(),
    headers: config.headers,
    params: config.params,
    data: config.data,
  };
};

const formatResponse = (response: AxiosResponse) => ({
  status: response.status,
  statusText: response.statusText,
  data: response.data,
  headers: response.headers,
});

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging and auth
api.interceptors.request.use(
  (config) => {
    // Add request start time for performance measurement
    const requestStartTime = Date.now();
    (config as any).metadata = { startTime: requestStartTime };

    // Log request
    if (shouldLog('DEBUG')) {
      console.groupCollapsed(
        `%cAPI Request: %c${config.method?.toUpperCase()} ${config.url}`,
        `color: ${colors.request}; font-weight: bold;`,
        'color: inherit;'
      );
      console.log('Request Config:', formatRequest(config));
      console.groupEnd();
    }

    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    if (shouldLog('ERROR')) {
      console.group('%cAPI Request Error', `color: ${colors.error}; font-weight: bold;`);
      console.error('Request Error:', error);
      console.groupEnd();
    }
    return Promise.reject(error);
  }
);

// Response interceptor for logging and error handling
api.interceptors.response.use(
  (response) => {
    const endTime = Date.now();
    const startTime = (response.config as any).metadata?.startTime || endTime;
    const duration = endTime - startTime;

    if (shouldLog('DEBUG')) {
      console.groupCollapsed(
        `%cAPI Response: %c${response.config.method?.toUpperCase()} ${response.config.url} %c(${response.status} - ${duration}ms)`,
        `color: ${colors.success}; font-weight: bold;`,
        'color: inherit;',
        `color: ${duration > 1000 ? colors.warning : colors.success};`
      );
      console.log('Response:', formatResponse(response));
      console.groupEnd();
    }

    return response;
  },
  (error: AxiosError) => {
    const endTime = Date.now();
    const startTime = (error.config as any)?.metadata?.startTime || endTime;
    const duration = endTime - startTime;

    const errorResponse = {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      duration: `${duration}ms`,
      error: error.message,
      response: {
        headers: error.response?.headers,
        data: error.response?.data,
      },
    };

    if (shouldLog('ERROR')) {
      console.group('%cAPI Error', `color: ${colors.error}; font-weight: bold;`);
      console.error('Error Details:', errorResponse);
      
      if (error.response?.data) {
        console.error('Response Data:', error.response.data);
      }
      
      if (error.stack) {
        console.error('Error Stack:', error.stack);
      }
      
      console.groupEnd();
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      // Don't redirect if we're already on the login page
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    // Format error message
    const responseData = error.response?.data as Record<string, any>;
    const errorMessage = responseData?.error || 
                        responseData?.message || 
                        error.message || 
                        'Request failed';
    
    return Promise.reject(new Error(errorMessage, { cause: error }));
  }
);

// Add a utility function to log API errors in components
export const logApiError = (error: unknown, context: string = 'API Error') => {
  if (error instanceof Error) {
    console.group(`%c${context}`, `color: ${colors.error}; font-weight: bold;`);
    console.error('Message:', error.message);
    
    if ('cause' in error) {
      console.error('Cause:', (error as any).cause);
    }
    
    if ('response' in error) {
      const axiosError = error as any;
      console.error('Response:', {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
      });
    }
    
    console.error('Stack:', error.stack);
    console.groupEnd();
  } else {
    console.error(`${context}:`, error);
  }
  
  // You can integrate with an error tracking service here
  // e.g., Sentry.captureException(error);
};
