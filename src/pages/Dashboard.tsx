import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Loader2, BarChart } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { AppointmentList } from '@/components/dashboard/AppointmentList';
import { PerformanceTable } from '@/components/dashboard/PerformanceTable';
import { PageHeader } from '@/components/layout';
import { formatCurrency } from '@/utils';
import { useToast } from '@/hooks/use-toast';
import { ServicePerformance, StaffPerformance, RevenueData, Appointment } from '@/types';
import { useDashboard, DashboardPeriod } from '@/hooks/useDashboard';

export const Dashboard: React.FC = () => {
  const { toast } = useToast();
  const [period, setPeriod] = useState<DashboardPeriod>('weekly');
  const { dashboardData, isLoading, error, refetch } = useDashboard(period);
  
  // Handle error
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: `Failed to load dashboard data: ${error.message}`,
        variant: 'destructive',
      });
    }
  }, [error, toast]);
  
  // Handle period change
  const handlePeriodChange = (newPeriod: DashboardPeriod) => {
    setPeriod(newPeriod);
  };

  // If data is loading, show a loading indicator
  if (isLoading && !dashboardData) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3">Loading dashboard data...</span>
      </div>
    );
  }

  // Debug logging
  if (dashboardData?.summary) {
    console.log('avgTipPercentage type:', typeof dashboardData.summary.avgTipPercentage);
    console.log('avgTipPercentage value:', dashboardData.summary.avgTipPercentage);
  }

  // Map the appointment stats for the chart
  const appointmentChartData: RevenueData[] = dashboardData?.appointmentStats.map(stat => ({
    date: stat.date,
    revenue: stat.count // Using revenue field to store appointment count
  })) || [];

  // Map the revenue stats for the chart
  const revenueChartData: RevenueData[] = dashboardData?.revenueStats.map(stat => ({
    date: stat.date,
    revenue: parseFloat(stat.revenue || '0')
  })) || [];

  // Map top services for the performance table
  const servicePerformanceData: ServicePerformance[] = dashboardData?.topServices.map(service => ({
    id: service.service_id || `service-${service.service_name}`,
    name: service.service_name,
    bookings: service.bookings,
    revenue: parseFloat(service.revenue || '0')
  })) || [];

  // Map top staff for the performance table
  const staffPerformanceData: StaffPerformance[] = dashboardData?.topStaff.map(staff => ({
    id: staff.staff_id || `staff-${staff.staff_name}`,
    name: staff.staff_name,
    appointments: staff.appointments,
    revenue: parseFloat(staff.revenue || '0'),
    commissionEarned: 0 // Not provided in API, could be calculated if needed
  })) || [];

  // Convert API appointments to the format expected by AppointmentList
  const mappedAppointments: Appointment[] = dashboardData?.upcomingAppointments.map(apt => ({
    id: apt.id,
    customerId: apt.customer?.id || '',
    customerName: apt.customer?.name || 'Unknown Customer',
    customerPhone: apt.customer?.phone || '',
    customerEmail: apt.customer?.email || undefined,
    staffId: apt.staff?.id || '',
    staffName: apt.staff?.user?.name || 'Unknown Staff',
    date: apt.date,
    time: apt.time,
    endTime: apt.end_time || '',
    services: apt.appointmentServices?.map(s => ({
      serviceId: s.service?.id || '',
      serviceName: s.service?.name || '',
      price: s.price || 0,
      duration: s.duration || 0
    })) || [],
    status: (apt.status || 'scheduled') as Appointment['status'],
    totalAmount: apt.total_amount || 0,
    notes: apt.notes,
    createdAt: apt.createdAt || new Date().toISOString(),
    updatedAt: apt.updatedAt || apt.createdAt || new Date().toISOString()
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader 
          title="Dashboard" 
          description="Overview of your barber shop business"
        />
        <div className="flex gap-2">
          <select 
            value={period} 
            onChange={(e) => handlePeriodChange(e.target.value as DashboardPeriod)}
            className="border rounded p-2"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button 
            onClick={() => refetch()} 
            className="bg-primary text-white px-4 py-2 rounded"
          >
            Refresh
          </button>
        </div>
      </div>
      
      {dashboardData && (
        <>
          {/* Calculate tip percentage with proper type handling */}
          {(() => {
            const tipPercentage = dashboardData.summary?.avgTipPercentage;
            const formattedTipPercentage = typeof tipPercentage === 'number' 
              ? tipPercentage.toFixed(1) 
              : typeof tipPercentage === 'string' 
                ? Number(parseFloat(tipPercentage)).toFixed(1) 
                : '0.0';
            
            return (
              /* Stats Cards Row */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                  title="Total Revenue"
                  value={formatCurrency(parseFloat(dashboardData.summary.totalRevenue || '0'))}
                  icon={<DollarSign className="h-4 w-4" />}
                  description="period revenue"
                  trend={{ value: 0, positive: true }}
                />
                <StatsCard
                  title="Appointments"
                  value={(dashboardData.summary.appointmentCount || 0).toString()}
                  icon={<Calendar className="h-4 w-4" />}
                  description="total appointments"
                  trend={{ value: 0, positive: true }}
                />
                <StatsCard
                  title="Customers"
                  value={(dashboardData.summary.customerCount || 0).toString()}
                  icon={<DollarSign className="h-4 w-4" />}
                  description="total customers"
                  trend={{ value: 0, positive: true }}
                />
                <StatsCard
                  title="Tips Received"
                  value={formatCurrency(parseFloat(dashboardData.summary.totalTips || '0'))}
                  icon={<DollarSign className="h-4 w-4" />}
                  description={`${formattedTipPercentage}% average`}
                  trend={{ value: 0, positive: true }}
                />
              </div>
            );
          })()}
          
          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <RevenueChart 
              title="Appointments Over Time" 
              data={appointmentChartData} 
              className="col-span-1"
            />
            <RevenueChart 
              title="Revenue Over Time" 
              data={revenueChartData} 
              className="col-span-1"
            />
          </div>
          
          {/* Appointments Row */}
          <div className="mt-6">
            <AppointmentList 
              title="Upcoming Appointments" 
              appointments={mappedAppointments}
            />
          </div>
          
          {/* Performance Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
            <PerformanceTable
              title="Top Services"
              data={servicePerformanceData.slice(0, 5)}
              type="service"
              className="lg:col-span-6"
            />
            <PerformanceTable
              title="Top Staff"
              data={staffPerformanceData.slice(0, 5)}
              type="staff"
              className="lg:col-span-6"
            />
          </div>
          
          {/* Status Distribution */}
          <div className="mt-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Appointment Status Distribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {dashboardData.appointmentStatusDistribution.map((status) => (
                  <StatsCard
                    key={status.status}
                    title={status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                    value={status.count.toString()}
                    icon={<BarChart className="h-4 w-4" />}
                    description="appointments"
                    trend={{ value: 0, positive: true }}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};