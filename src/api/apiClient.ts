import { getToken, removeToken } from './auth';
import { getApiBaseUrl } from '@/hooks/useApiConfig';

/**
 * Core API client for making authenticated requests to the backend
 */
export const apiClient = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: unknown
): Promise<T> => {
  const token = getToken();
  const baseUrl = getApiBaseUrl();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options: RequestInit = {
    method,
    headers,
  };
  
  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, options);
    const data = await response.json();
    
    if (!response.ok) {
      // Handle unauthorized error (expired token)
      if (response.status === 401) {
        removeToken();
        window.location.href = '/login';
      }
      
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Convenience methods for different HTTP verbs
 */
export const get = <T>(endpoint: string) => apiClient<T>(endpoint, 'GET');

export const post = <T>(endpoint: string, body: unknown) => 
  apiClient<T>(endpoint, 'POST', body);

export const put = <T>(endpoint: string, body: unknown) => 
  apiClient<T>(endpoint, 'PUT', body);

export const del = <T>(endpoint: string) => 
  apiClient<T>(endpoint, 'DELETE'); 