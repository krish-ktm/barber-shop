import React from 'react';
import { Calendar, DollarSign, Users, Scissors } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { AppointmentList } from '@/components/dashboard/AppointmentList';
import { PerformanceTable } from '@/components/dashboard/PerformanceTable';
import { RecentActivityList } from '@/components/dashboard/RecentActivityList';
import { PageHeader } from '@/components/layout';
import { formatCurrency } from '@/utils';

import { 
  appointmentData, 
  dashboardStatsData, 
  revenueData, 
  servicePerformanceData, 
  staffPerformanceData,
  logsData
} from '@/mocks';

export const Dashboard: React.FC = () => {
  // Get today's appointments
  const todayAppointments = appointmentData.filter(
    appointment => appointment.date === new Date().toISOString().split('T')[0]
  );

  // Upcoming appointments: future appointments sorted by date and time
  const upcomingAppointments = appointmentData
    .filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return appointmentDate >= today && appointment.status !== 'completed' && appointment.status !== 'cancelled';
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
    .slice(0, 5);

  // Recent activity logs
  const recentLogs = [...logsData]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <div>
      <PageHeader 
        title="Dashboard" 
        description="Overview of your barber shop business"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <RevenueChart 
          title="Revenue (Last 14 Days)" 
          data={revenueData} 
          className="lg:col-span-2"
        />
        <AppointmentList 
          title="Today's Appointments" 
          appointments={todayAppointments}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1">
          <AppointmentList
            title="Upcoming Appointments"
            appointments={upcomingAppointments}
          />
        </div>
        <div className="lg:col-span-2">
          <RecentActivityList
            title="Recent Activity"
            logs={recentLogs}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceTable
          title="Top Services"
          data={servicePerformanceData.slice(0, 5)}
          type="service"
        />
        <PerformanceTable
          title="Staff Performance"
          data={staffPerformanceData}
          type="staff"
        />
      </div>
    </div>
  );
};