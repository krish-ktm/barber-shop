import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, DollarSign, Users } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { AppointmentList } from '@/components/dashboard/AppointmentList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { appointmentData, staffData } from '@/mocks';
import { formatCurrency } from '@/utils';

export const StaffDashboard: React.FC = () => {
  // Mock staff ID - in real app would come from auth context
  const staffId = 'staff-1';
  const staff = staffData.find(s => s.id === staffId);

  if (!staff) return null;

  // Get today's appointments for this staff member
  const todayAppointments = appointmentData.filter(
    appointment => 
      appointment.staffId === staffId && 
      appointment.date === format(new Date(), 'yyyy-MM-dd')
  );

  // Get upcoming appointments
  const upcomingAppointments = appointmentData
    .filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return (
        appointment.staffId === staffId &&
        appointmentDate >= today && 
        appointment.status !== 'completed' && 
        appointment.status !== 'cancelled'
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }
      const [hoursA, minutesA] = a.time.split(':').map(Number);
      const [hoursB, minutesB] = b.time.split(':').map(Number);
      return (hoursA * 60 + minutesA) - (hoursB * 60 + minutesB);
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader 
        title={`Welcome, ${staff.name}`}
        description="Overview of your appointments and performance"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Today's Appointments"
          value={todayAppointments.length.toString()}
          icon={<Calendar className="h-4 w-4" />}
          description="Scheduled for today"
        />
        <StatsCard
          title="Total Appointments"
          value={staff.totalAppointments.toString()}
          icon={<Users className="h-4 w-4" />}
          description="All time"
        />
        <StatsCard
          title="Commission Rate"
          value={`${staff.commissionPercentage}%`}
          icon={<Clock className="h-4 w-4" />}
          description="Current rate"
        />
        <StatsCard
          title="Total Earnings"
          value={formatCurrency(staff.totalEarnings)}
          icon={<DollarSign className="h-4 w-4" />}
          description="All time"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <AppointmentList
              title=""
              appointments={todayAppointments}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <AppointmentList
              title=""
              appointments={upcomingAppointments}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};