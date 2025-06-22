import { get } from '../apiClient';

// Type definitions
export interface DashboardStats {
  appointmentStats: Array<{
    date: string;
    count: number;
  }>;
  revenueStats: Array<{
    date: string;
    revenue: number;
    tips: number;
    discounts: number;
  }>;
  customerCount: number;
  topServices: Array<{
    service_id: string;
    service_name: string;
    bookings: number;
    revenue: number;
  }>;
  topStaff: Array<{
    staff_id: string;
    staff_name: string;
    appointments: number;
    revenue: number;
  }>;
  upcomingAppointments: any[]; // Simplified for brevity
  tipsDiscountsSummary: {
    totalTips: number;
    totalDiscounts: number;
    avgTipPercentage: number;
    invoicesWithTip: number;
    invoicesWithDiscount: number;
  };
}

export interface RevenueData {
  revenue: Array<{
    date: string;
    subtotal: string | number;
    discounts: string | number;
    taxes: string | number;
    tips: string | number;
    total: string | number;
  }>;
  paymentMethods: Array<{
    payment_method: string;
    amount: string | number;
    count: string | number;
  }>;
}

export interface ServicePerformance {
  service_id: string;
  service_name: string;
  bookings: string | number;
  revenue: string | number;
  avgPrice?: string | number;
}

export interface StaffPerformance {
  staff_id: string;
  staff_name: string;
  appointments: string | number;
  revenue: string | number;
  commission: string | number;
  commissionPercentage?: string | number;
}

export interface TipsDiscountsData {
  summary: {
    totalTips: string | number;
    totalDiscounts: string | number;
    totalSubtotal: string | number;
    totalSales: string | number;
    avgTipPercentage: string | number;
    avgDiscountPercentage: string | number;
    totalInvoices: string | number;
    invoicesWithTip: string | number;
    invoicesWithDiscount: string | number;
  };
  timeSeriesData: Array<{
    date: string;
    tips: string | number;
    discounts: string | number;
    totalSales: string | number;
    tipPercentage: string | number;
    discountPercentage: string | number;
    invoiceCount: string | number;
  }>;
  staffBreakdown: Array<{
    staff_id: string;
    staff_name: string;
    totalTips: string | number;
    totalDiscounts: string | number;
    totalSales: string | number;
    tipPercentage: string | number;
    discountPercentage: string | number;
    invoiceCount: string | number;
  }>;
  discountTypeBreakdown: Array<{
    discount_type: string;
    totalDiscount: string | number;
    count: string | number;
    avgDiscountValue: string | number;
  }>;
}

// Response interfaces
interface DashboardResponse {
  success: boolean;
  data: DashboardStats;
}

interface RevenueResponse {
  success: boolean;
  data: RevenueData;
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