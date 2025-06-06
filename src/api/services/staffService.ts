import { get, post, put, del } from '../apiClient';

// Type definitions
export interface Staff {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  bio?: string;
  commission_percentage: number;
  is_available: boolean;
  image?: string;
  services?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface WorkingHour {
  id?: string;
  staff_id?: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_break: boolean;
}

// Response interfaces
interface StaffListResponse {
  success: boolean;
  staff: Staff[];
  totalCount: number;
  pages: number;
}

interface StaffResponse {
  success: boolean;
  staff: Staff;
}

interface WorkingHoursResponse {
  success: boolean;
  workingHours: WorkingHour[];
}

/**
 * Get all staff members
 */
export const getAllStaff = async (
  page = 1,
  limit = 10,
  sort = 'name_asc'
): Promise<StaffListResponse> => {
  return get<StaffListResponse>(`/staff?page=${page}&limit=${limit}&sort=${sort}`);
};

/**
 * Get staff member by ID
 */
export const getStaffById = async (id: string): Promise<StaffResponse> => {
  return get<StaffResponse>(`/staff/${id}`);
};

/**
 * Create new staff member
 */
export const createStaff = async (staffData: Partial<Staff>): Promise<StaffResponse> => {
  return post<StaffResponse>('/staff', staffData);
};

/**
 * Update staff member
 */
export const updateStaff = async (id: string, staffData: Partial<Staff>): Promise<StaffResponse> => {
  return put<StaffResponse>(`/staff/${id}`, staffData);
};

/**
 * Delete staff member
 */
export const deleteStaff = async (id: string): Promise<{ success: boolean; message: string }> => {
  return del<{ success: boolean; message: string }>(`/staff/${id}`);
};

/**
 * Update staff availability (working hours)
 */
export const updateStaffAvailability = async (
  id: string,
  workingHours: WorkingHour[]
): Promise<WorkingHoursResponse> => {
  return put<WorkingHoursResponse>(`/staff/${id}/availability`, { workingHours });
}; 