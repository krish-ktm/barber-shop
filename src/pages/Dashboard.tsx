import React from 'react';
import { Calendar, DollarSign, Users } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { AppointmentList } from '@/components/dashboard/AppointmentList';
import { PerformanceTable } from '@/components/dashboard/PerformanceTable';
import { PageHeader } from '@/components/layout';
import { formatCurrency } from '@/utils';

import { 
  appointmentData, 
  dashboardStatsData, 
  revenueData, 
  servicePerformanceData, 
  staffPerformanceData
} from '@/mocks';

export const Dashboard: React.FC = () => {
  // Get today's date as string in format 'yyyy-MM-dd'
  const todayDateString = new Date().toISOString().split('T')[0];
  
  // Get today's appointments
  const todayAppointments = appointmentData.filter(
    appointment => appointment.date === todayDateString
  );

  // Upcoming appointments: future appointments sorted by date and time (excluding today)
  const upcomingAppointments = appointmentData
    .filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check that date is future (not today) and not completed/cancelled
      return appointmentDate > today && 
             appointment.status !== 'completed' && 
             appointment.status !== 'cancelled';
    })
    .sort((a, b) => {
      // First sort by date
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }
      
      // Then by time
      const [hoursA, minutesA] = a.time.split(':').map(Number);
      const [hoursB, minutesB] = b.time.split(':').map(Number);
      const timeA = hoursA * 60 + minutesA;
      const timeB = hoursB * 60 + minutesB;
      return timeA - timeB;
    })
    .slice(0, 5); // Reduced to show fewer appointments

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
          value={formatCurrency(dashboardStatsData.dailyRevenue)}
          icon={<DollarSign className="h-4 w-4" />}
          description="vs. yesterday"
          trend={{ value: 12, positive: true }}
        />
        <StatsCard
          title="Weekly Revenue"
          value={formatCurrency(dashboardStatsData.weeklyRevenue)}
          icon={<DollarSign className="h-4 w-4" />}
          description="vs. last week"
          trend={{ value: 5, positive: true }}
        />
        <StatsCard
          title="Appointments Today"
          value={dashboardStatsData.appointmentsToday}
          icon={<Calendar className="h-4 w-4" />}
          description="vs. yesterday"
          trend={{ value: 8, positive: false }}
        />
        <StatsCard
          title="Total Customers"
          value={dashboardStatsData.totalCustomers}
          icon={<Users className="h-4 w-4" />}
          description="vs. last month"
          trend={{ value: 3, positive: true }}
        />
      </div>
      
      {/* Appointments Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AppointmentList 
          title="Today's Appointments" 
          appointments={todayAppointments}
        />
        <AppointmentList
          title="Upcoming Appointments"
          appointments={upcomingAppointments}
        />
      </div>
      
      {/* Charts and Performance Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <RevenueChart 
          title="Revenue (Last 14 Days)" 
          data={revenueData} 
          className="lg:col-span-6"
        />
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