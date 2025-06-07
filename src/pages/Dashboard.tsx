import React, { useEffect } from 'react';
import { Calendar, DollarSign, Loader2 } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { AppointmentList } from '@/components/dashboard/AppointmentList';
import { PerformanceTable } from '@/components/dashboard/PerformanceTable';
import { PageHeader } from '@/components/layout';
import { formatCurrency } from '@/utils';
import { useApi } from '@/hooks/useApi';
import { getDashboardStats, getRevenueReport } from '@/api/services/reportService';
import { useToast } from '@/hooks/use-toast';
import { ServicePerformance, StaffPerformance } from '@/types';

export const Dashboard: React.FC = () => {
  const { toast } = useToast();
  
  // API hooks for dashboard data
  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
    execute: fetchDashboardStats
  } = useApi(getDashboardStats);

  // API hook for revenue chart data
  const {
    data: revenueReportData,
    loading: revenueLoading,
    error: revenueError,
    execute: fetchRevenueReport
  } = useApi(getRevenueReport);

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardStats('weekly');
    
    // Get dates for last 14 days
    const today = new Date();
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(today.getDate() - 14);
    
    const fromDate = twoWeeksAgo.toISOString().split('T')[0];
    const toDate = today.toISOString().split('T')[0];
    
    fetchRevenueReport(fromDate, toDate, 'day');
  }, [fetchDashboardStats, fetchRevenueReport]);

  // Handle errors
  useEffect(() => {
    if (dashboardError) {
      toast({
        title: 'Error',
        description: `Failed to load dashboard data: ${dashboardError.message}`,
        variant: 'destructive',
      });
    }
    
    if (revenueError) {
      toast({
        title: 'Error',
        description: `Failed to load revenue data: ${revenueError.message}`,
        variant: 'destructive',
      });
    }
  }, [dashboardError, revenueError, toast]);

  // If data is loading, show a loading indicator
  if (dashboardLoading && !dashboardData) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3">Loading dashboard data...</span>
      </div>
    );
  }

  // Use API data or fallback to empty values if not available
  const stats = dashboardData?.data || {
    todaySales: 0,
    todayAppointments: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    upcomingAppointments: [],
    recentInvoices: [],
    revenueByDay: [],
    topServices: [],
    topStaff: []
  };

  // Extract revenue data from API response
  const revenueData = revenueReportData?.data || [];
  
  // Map top services data to ServicePerformance format
  const servicePerformanceData: ServicePerformance[] = stats.topServices.map(service => ({
    id: service.name,
    name: service.name,
    bookings: service.count,
    revenue: 0
  }));

  // Map top staff data to StaffPerformance format
  const staffPerformanceData: StaffPerformance[] = stats.topStaff.map(staff => ({
    id: staff.name,
    name: staff.name,
    appointments: 0,
    revenue: staff.revenue,
    commissionEarned: 0
  }));

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        description="Overview of your barber shop business"
      />
      
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Daily Revenue"
          value={formatCurrency(stats.todaySales)}
          icon={<DollarSign className="h-4 w-4" />}
          description="today's sales"
          trend={{ value: 0, positive: true }}
        />
        <StatsCard
          title="Weekly Revenue"
          value={formatCurrency(stats.weeklyRevenue)}
          icon={<DollarSign className="h-4 w-4" />}
          description="this week"
          trend={{ value: 0, positive: true }}
        />
        <StatsCard
          title="Appointments Today"
          value={stats.todayAppointments}
          icon={<Calendar className="h-4 w-4" />}
          description="today's bookings"
          trend={{ value: 0, positive: true }}
        />
        <StatsCard
          title="Monthly Revenue"
          value={formatCurrency(stats.monthlyRevenue)}
          icon={<DollarSign className="h-4 w-4" />}
          description="this month"
          trend={{ value: 0, positive: true }}
        />
      </div>
      
      {/* Appointments Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {revenueLoading && !revenueData.length ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-3">Loading appointments...</span>
          </div>
        ) : (
          <>
            <AppointmentList 
              title="Today's Appointments" 
              appointments={stats.upcomingAppointments.filter(
                appointment => appointment.date === new Date().toISOString().split('T')[0]
              )}
            />
            <AppointmentList
              title="Upcoming Appointments"
              appointments={stats.upcomingAppointments.filter(
                appointment => {
                  const appointmentDate = new Date(appointment.date);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return appointmentDate > today;
                }
              ).slice(0, 5)}
            />
          </>
        )}
      </div>
      
      {/* Charts and Performance Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {revenueLoading && !revenueData.length ? (
          <div className="flex justify-center items-center p-12 lg:col-span-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-3">Loading revenue data...</span>
          </div>
        ) : (
          <RevenueChart 
            title="Revenue (Last 14 Days)" 
            data={revenueData.map(item => ({
              date: item.date,
              revenue: item.revenue
            }))} 
            className="lg:col-span-6"
          />
        )}
        <PerformanceTable
          title="Top Services"
          data={servicePerformanceData.slice(0, 5)}
          type="service"
          className="lg:col-span-3"
        />
        <PerformanceTable
          title="Staff Performance"
          data={staffPerformanceData.slice(0, 3)}
          type="staff"
          className="lg:col-span-3"
        />
      </div>
    </div>
  );
};