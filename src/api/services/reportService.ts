import { get } from '../apiClient';

// Type definitions
export interface DashboardStats {
  todaySales: number;
  todayAppointments: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  pendingAppointments: number;
  recentInvoices: any[]; // Simplified for brevity
  upcomingAppointments: any[]; // Simplified for brevity
  revenueByDay: { date: string; revenue: number }[];
  topServices: { name: string; count: number }[];
  topStaff: { name: string; revenue: number }[];
}

export interface RevenueData {
  date: string;
  revenue: number;
}

export interface ServicePerformance {
  serviceId: string;
  name: string;
  bookings: number;
  revenue: number;
}

export interface StaffPerformance {
  staffId: string;
  name: string;
  appointments: number;
  revenue: number;
  commission: number;
}

// Response interfaces
interface DashboardResponse {
  success: boolean;
  data: DashboardStats;
}

interface RevenueResponse {
  success: boolean;
  data: RevenueData[];
}

interface ServicesReportResponse {
  success: boolean;
  data: ServicePerformance[];
}

interface StaffReportResponse {
  success: boolean;
  data: StaffPerformance[];
}

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (period = 'weekly'): Promise<DashboardResponse> => {
  return get<DashboardResponse>(`/reports/dashboard?period=${period}`);
};

/**
 * Get revenue report
 */
export const getRevenueReport = async (
  dateFrom: string,
  dateTo: string,
  groupBy = 'day'
): Promise<RevenueResponse> => {
  return get<RevenueResponse>(
    `/reports/revenue?dateFrom=${dateFrom}&dateTo=${dateTo}&groupBy=${groupBy}`
  );
};

/**
 * Get services performance report
 */
export const getServicesReport = async (
  dateFrom: string,
  dateTo: string,
  sort = 'revenue_desc'
): Promise<ServicesReportResponse> => {
  return get<ServicesReportResponse>(
    `/reports/services?dateFrom=${dateFrom}&dateTo=${dateTo}&sort=${sort}`
  );
};

/**
 * Get staff performance report
 */
export const getStaffReport = async (
  dateFrom: string,
  dateTo: string,
  sort = 'revenue_desc'
): Promise<StaffReportResponse> => {
  return get<StaffReportResponse>(
    `/reports/staff?dateFrom=${dateFrom}&dateTo=${dateTo}&sort=${sort}`
  );
}; 