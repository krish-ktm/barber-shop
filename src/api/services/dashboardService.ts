import { get } from '../apiClient';
import { Appointment } from './appointmentService';
import { Customer } from './customerService';
import { Review } from './reviewService';

// Type definitions for dashboard data
export interface DashboardSummary {
  customerCount: number;
  appointmentCount: number;
  staffCount: number;
  serviceCount: number;
  totalRevenue: string;
  totalTips: string;
  totalDiscounts: string;
  avgTipPercentage: number;
  paidInvoices: number;
  pendingInvoices: number;
}

export interface AppointmentStat {
  date: string;
  count: number;
}

export interface RevenueStat {
  date: string;
  revenue: string;
  tips: string;
  discounts: string;
}

export interface TopService {
  service_id: string;
  service_name: string;
  bookings: number;
  revenue: string;
}

export interface TopStaff {
  staff_id: string;
  staff_name: string;
  appointments: number;
  revenue: string;
}

export interface StatusDistribution {
  status: string;
  count: number;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
}

export interface AdminDashboardResponse {
  success: boolean;
  data: {
    appointmentStats: AppointmentStat[];
    revenueStats: RevenueStat[];
    summary: DashboardSummary;
    topServices: TopService[];
    topStaff: TopStaff[];
    upcomingAppointments: Appointment[];
    recentCustomers: Customer[];
    latestReviews: Review[];
    appointmentStatusDistribution: StatusDistribution[];
    recentActivity: ActivityLog[];
  };
}

// API function
export const getAdminDashboardData = async (
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'weekly'
): Promise<AdminDashboardResponse> => {
  return get<AdminDashboardResponse>(`/dashboard/admin?period=${period}`);
}; 