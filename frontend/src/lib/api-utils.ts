import { api } from './api-client';

// Utility function to make authenticated API calls
export async function authenticatedRequest<T>(
  endpoint: string,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: any;
    params?: any;
  }
): Promise<T> {
  try {
    let response;
    
    if (options?.method === 'GET' || !options?.method) {
      response = await api.get(endpoint, { params: options?.params });
    } else if (options?.method === 'POST') {
      response = await api.post(endpoint, options.data, { params: options?.params });
    } else if (options?.method === 'PUT') {
      response = await api.put(endpoint, options.data, { params: options?.params });
    } else if (options?.method === 'DELETE') {
      response = await api.delete(endpoint, { params: options?.params });
    } else {
      throw new Error(`Unsupported HTTP method: ${options?.method}`);
    }
    
    return response.data;
  } catch (error: any) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

// Helper function to get data from API endpoints
export async function fetchData<T>(endpoint: string, params?: any): Promise<T> {
  return authenticatedRequest<T>(endpoint, { method: 'GET', params });
}

// Helper function to post data to API endpoints
export async function postData<T>(endpoint: string, data: any, params?: any): Promise<T> {
  return authenticatedRequest<T>(endpoint, { method: 'POST', data, params });
}

// Helper function to update data via API endpoints
export async function updateData<T>(endpoint: string, data: any, params?: any): Promise<T> {
  return authenticatedRequest<T>(endpoint, { method: 'PUT', data, params });
}

// Helper function to delete data via API endpoints
export async function deleteData<T>(endpoint: string, params?: any): Promise<T> {
  return authenticatedRequest<T>(endpoint, { method: 'DELETE', params });
}
