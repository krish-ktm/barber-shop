import { get, post, put, del } from '../apiClient';

// Type definitions
export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  category: string;
  created_at?: string;
  updated_at?: string;
}

// Response interfaces
interface ServiceListResponse {
  success: boolean;
  services: Service[];
  totalCount: number;
  pages: number;
}

interface ServiceResponse {
  success: boolean;
  service: Service;
}

/**
 * Get all services
 */
export const getAllServices = async (
  page = 1,
  limit = 10,
  sort = 'name_asc',
  category?: string
): Promise<ServiceListResponse> => {
  let url = `/services?page=${page}&limit=${limit}&sort=${sort}`;
  
  if (category) {
    url += `&category=${category}`;
  }
  
  return get<ServiceListResponse>(url);
};

/**
 * Get service by ID
 */
export const getServiceById = async (id: string): Promise<ServiceResponse> => {
  return get<ServiceResponse>(`/services/${id}`);
};

/**
 * Create new service
 */
export const createService = async (serviceData: Partial<Service>): Promise<ServiceResponse> => {
  return post<ServiceResponse>('/services', serviceData);
};

/**
 * Update service
 */
export const updateService = async (id: string, serviceData: Partial<Service>): Promise<ServiceResponse> => {
  return put<ServiceResponse>(`/services/${id}`, serviceData);
};

/**
 * Delete service
 */
export const deleteService = async (id: string): Promise<{ success: boolean; message: string }> => {
  return del<{ success: boolean; message: string }>(`/services/${id}`);
}; 