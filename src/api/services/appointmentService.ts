import { get, post, put, del } from '../apiClient';

// Type definitions
export interface AppointmentService {
  service_id: string;
  service_name: string;
  price: number;
  duration: number;
}

export interface Appointment {
  id: string;
  customer_id: string;
  staff_id: string;
  date: string;
  time: string;
  end_time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  total_amount: number;
  notes?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  staff_name: string;
  services: AppointmentService[];
  created_at?: string;
  updated_at?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

// Response interfaces
interface AppointmentListResponse {
  success: boolean;
  appointments: Appointment[];
  totalCount: number;
  pages: number;
}

interface AppointmentResponse {
  success: boolean;
  appointment: Appointment;
}

interface AvailableSlotsResponse {
  success: boolean;
  slots: TimeSlot[];
}

/**
 * Get all appointments
 */
export const getAllAppointments = async (
  page = 1,
  limit = 10,
  sort = 'date_desc',
  date?: string,
  staffId?: string,
  customerId?: string,
  status?: string
): Promise<AppointmentListResponse> => {
  let url = `/appointments?page=${page}&limit=${limit}&sort=${sort}`;
  
  if (date) url += `&date=${date}`;
  if (staffId) url += `&staffId=${staffId}`;
  if (customerId) url += `&customerId=${customerId}`;
  if (status) url += `&status=${status}`;
  
  return get<AppointmentListResponse>(url);
};

/**
 * Get appointment by ID
 */
export const getAppointmentById = async (id: string): Promise<AppointmentResponse> => {
  return get<AppointmentResponse>(`/appointments/${id}`);
};

/**
 * Create new appointment
 */
export const createAppointment = async (appointmentData: Partial<Appointment>): Promise<AppointmentResponse> => {
  return post<AppointmentResponse>('/appointments', appointmentData);
};

/**
 * Update appointment
 */
export const updateAppointment = async (
  id: string,
  appointmentData: Partial<Appointment>
): Promise<AppointmentResponse> => {
  return put<AppointmentResponse>(`/appointments/${id}`, appointmentData);
};

/**
 * Cancel appointment
 */
export const cancelAppointment = async (id: string): Promise<{ success: boolean; message: string }> => {
  return del<{ success: boolean; message: string }>(`/appointments/${id}`);
};

/**
 * Reschedule appointment
 */
export const rescheduleAppointment = async (
  id: string,
  date: string,
  time: string
): Promise<AppointmentResponse> => {
  return post<AppointmentResponse>(`/appointments/${id}/reschedule`, { date, time });
};

/**
 * Get available time slots
 */
export const getAvailableSlots = async (
  date: string,
  staffId: string,
  serviceId: string
): Promise<AvailableSlotsResponse> => {
  return get<AvailableSlotsResponse>(
    `/appointments/available-slots?date=${date}&staffId=${staffId}&serviceId=${serviceId}`
  );
}; 