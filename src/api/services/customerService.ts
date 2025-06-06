import { get, post, put } from '../apiClient';
import { Appointment } from './appointmentService';
import { Invoice } from './invoiceService';

// Type definitions
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  visit_count?: number;
  total_spent?: number;
  last_visit?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Response interfaces
interface CustomerListResponse {
  success: boolean;
  customers: Customer[];
  totalCount: number;
  pages: number;
}

interface CustomerResponse {
  success: boolean;
  customer: Customer;
}

interface AppointmentListResponse {
  success: boolean;
  appointments: Appointment[];
}

interface InvoiceListResponse {
  success: boolean;
  invoices: Invoice[];
}

/**
 * Get all customers
 */
export const getAllCustomers = async (
  page = 1,
  limit = 10,
  sort = 'name_asc',
  search?: string
): Promise<CustomerListResponse> => {
  let url = `/customers?page=${page}&limit=${limit}&sort=${sort}`;
  
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  
  return get<CustomerListResponse>(url);
};

/**
 * Get customer by ID
 */
export const getCustomerById = async (id: string): Promise<CustomerResponse> => {
  return get<CustomerResponse>(`/customers/${id}`);
};

/**
 * Create new customer
 */
export const createCustomer = async (customerData: Partial<Customer>): Promise<CustomerResponse> => {
  return post<CustomerResponse>('/customers', customerData);
};

/**
 * Update customer
 */
export const updateCustomer = async (
  id: string,
  customerData: Partial<Customer>
): Promise<CustomerResponse> => {
  return put<CustomerResponse>(`/customers/${id}`, customerData);
};

/**
 * Get customer appointments
 */
export const getCustomerAppointments = async (id: string): Promise<AppointmentListResponse> => {
  return get<AppointmentListResponse>(`/customers/${id}/appointments`);
};

/**
 * Get customer invoices
 */
export const getCustomerInvoices = async (id: string): Promise<InvoiceListResponse> => {
  return get<InvoiceListResponse>(`/customers/${id}/invoices`);
}; 