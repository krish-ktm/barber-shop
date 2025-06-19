import { getToken, removeToken } from './auth';
import { getApiBaseUrl } from '@/hooks/useApiConfig';

const API_BASE_URL = 'https://barber-shop-api-eight.vercel.app/api';

// Create a custom event for token expiration
export const TOKEN_EXPIRED_EVENT = 'token_expired';

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
  
  const url = `${baseUrl}${endpoint}`;
  console.log(`API Request: ${method} ${url}`, body);
  
  try {
    // Add timeout to fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    // Clear the timeout
    clearTimeout(timeoutId);
    
    // Log detailed response information for debugging
    console.log(`API Response Status: ${response.status} ${response.statusText}`);
    console.log(`API Response Headers:`, Object.fromEntries([...response.headers.entries()]));
    
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('Error parsing JSON response:', jsonError);
      throw new Error('Invalid response format from server');
    }
    
    if (!response.ok) {
      // Handle unauthorized error (expired token)
      if (response.status === 401) {
        console.error('Authentication error: Token expired or invalid');
        removeToken();
        
        // Dispatch a global event for token expiration
        window.dispatchEvent(new CustomEvent(TOKEN_EXPIRED_EVENT));
        
        // Throw an error that can be handled by the calling code
        throw new Error('Authentication failed. Please log in again.');
      }
      
      console.error(`API Error: ${response.status}`, data);
      throw new Error(data.message || 'Something went wrong');
    }
    
    console.log(`API Response Data: ${method} ${url}`, data);
    return data;
  } catch (error: unknown) {
    console.error(`Error fetching ${endpoint}:`, error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('NetworkError')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
    }
    
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

// Helper to handle API responses
const handleResponse = async (response: Response) => {
  const data = await response.json();
  
  if (!response.ok) {
    // Handle unauthorized error (expired token)
    if (response.status === 401) {
      console.error('Authentication error: Token expired or invalid');
      removeToken();
      
      // Dispatch a global event for token expiration
      window.dispatchEvent(new CustomEvent(TOKEN_EXPIRED_EVENT));
      
      throw new Error('Authentication failed. Please log in again.');
    }
    
    const error = data.message || response.statusText;
    throw new Error(error);
  }
  
  return data;
};

// Generic GET request
export const getGeneric = async <T>(endpoint: string): Promise<T> => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers
  });
  
  return handleResponse(response);
};

// Generic POST request
export const postGeneric = async <T, D = Record<string, unknown>>(endpoint: string, data: D): Promise<T> => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });
  
  return handleResponse(response);
};

// Generic PUT request
export const putGeneric = async <T, D = Record<string, unknown>>(endpoint: string, data: D): Promise<T> => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data)
  });
  
  return handleResponse(response);
};

// Generic DELETE request
export const delGeneric = async <T>(endpoint: string): Promise<T> => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers
  });
  
  return handleResponse(response);
}; 