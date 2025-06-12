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

export interface TipsDiscountsData {
  summary: {
    totalTips: number;
    totalDiscounts: number;
    totalSubtotal: number;
    totalSales: number;
    avgTipPercentage: number;
    avgDiscountPercentage: number;
    totalInvoices: number;
    invoicesWithTip: number;
    invoicesWithDiscount: number;
  };
  timeSeriesData: Array<{
    date: string;
    tips: number;
    discounts: number;
    totalSales: number;
    tipPercentage: number;
    discountPercentage: number;
    invoiceCount: number;
  }>;
  staffBreakdown: Array<{
    staff_id: string;
    staff_name: string;
    totalTips: number;
    totalDiscounts: number;
    totalSales: number;
    tipPercentage: number;
    discountPercentage: number;
    invoiceCount: number;
  }>;
  discountTypeBreakdown: Array<{
    discount_type: string;
    totalDiscount: number;
    count: number;
    avgDiscountValue: number;
  }>;
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

interface TipsDiscountsResponse {
  success: boolean;
  data: TipsDiscountsData;
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

/**
 * Get tips and discounts report
 */
export const getTipsDiscountsReport = async (
  dateFrom: string,
  dateTo: string,
  groupBy = 'day',
  staffId?: string
): Promise<TipsDiscountsResponse> => {
  let url = `/reports/tips-discounts?dateFrom=${dateFrom}&dateTo=${dateTo}&groupBy=${groupBy}`;
  
  if (staffId) {
    url += `&staffId=${staffId}`;
  }
  
  return get<TipsDiscountsResponse>(url);
}; 