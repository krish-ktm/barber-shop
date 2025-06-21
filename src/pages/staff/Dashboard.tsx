import React, { useEffect, useState } from 'react';
import { Calendar, Clock, DollarSign, Users } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils';
import { getStaffDashboardData, StaffDashboardData, UpcomingAppointment } from '@/api/services/dashboardService';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { AppointmentList, SimpleAppointment } from '@/components/dashboard/AppointmentList';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export const StaffDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<StaffDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getStaffDashboardData(period);
      if (response.success && response.data) {
        setDashboardData(response.data);
      } else {
        setError(response.message || 'Failed to load dashboard data');
        toast({
          title: "Error",
          description: response.message || "Failed to load dashboard data",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      console.error('Error fetching dashboard data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard data. Please try again later.';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Loading dashboard..."
          description="Please wait while we load your dashboard data"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-1/2 mb-2" />
                <Skeleton className="h-6 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Dashboard Error"
          description="There was a problem loading your dashboard data"
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            {error === 'Staff ID not found for current user' && (
              <>
                <br />
                <br />
                This could be because your user account is not properly linked to a staff profile.
                Please contact an administrator to fix this issue.
              </>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Dashboard Error"
          description="Could not load dashboard data. Please try again later."
        />
      </div>
    );
  }

  const { staffInfo, performanceSummary } = dashboardData;
  
  // Get today's appointments count for stats card
  const todayAppointmentsCount = dashboardData.todayAppointments ? dashboardData.todayAppointments.length : 0;

  // Convert API appointments to the format expected by AppointmentList component
  const convertToSimpleAppointment = (appointment: UpcomingAppointment): SimpleAppointment => {
    return {
      id: appointment.id,
      customerId: appointment.customer.id,
      customerName: appointment.customer.name,
      customerPhone: appointment.customer.phone || '',
      customerEmail: appointment.customer.email || '',
      staffId: staffInfo.id,
      staffName: staffInfo.name,
      date: appointment.date,
      time: appointment.time,
      endTime: appointment.time, // Using time as endTime if not available
      status: appointment.status as 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show',
      services: appointment.appointmentServices.map(service => ({
        serviceId: service.service_id,
        serviceName: service.service_name,
        price: service.price,
        duration: service.duration
      })),
      totalAmount: appointment.appointmentServices.reduce((sum, service) => sum + service.price, 0),
      notes: ''
    };
  };

  // Convert todayAppointments for the AppointmentList
  const todayAppointments = dashboardData.todayAppointments 
    ? dashboardData.todayAppointments.map(convertToSimpleAppointment)
    : [];
    
  // Filter upcoming appointments to exclude today's appointments
  const today = format(new Date(), 'yyyy-MM-dd');
  const upcomingAppointments = dashboardData.upcomingAppointments
    ? dashboardData.upcomingAppointments
        .filter(appointment => appointment.date !== today)
        .map(convertToSimpleAppointment)
    : [];

  const handleViewAllAppointments = () => {
    navigate('/staff/appointments');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader 
          title={`Welcome, ${staffInfo.name}`}
          description="Overview of your performance"
        />
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Period:</span>
          <Select
            value={period}
            onValueChange={(value) => setPeriod(value as 'weekly' | 'monthly' | 'yearly')}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Today's Appointments"
          value={todayAppointmentsCount.toString()}
          icon={<Calendar className="h-4 w-4" />}
          description="Scheduled for today"
        />
        <StatsCard
          title="Total Appointments"
          value={performanceSummary.totalAppointments.toString()}
          icon={<Users className="h-4 w-4" />}
          description={`For ${period} period`}
        />
        <StatsCard
          title="Commission Rate"
          value={`${staffInfo.commissionPercentage}%`}
          icon={<Clock className="h-4 w-4" />}
          description="Current rate"
        />
        <StatsCard
          title="Total Earnings"
          value={formatCurrency(performanceSummary.totalCommission)}
          icon={<DollarSign className="h-4 w-4" />}
          description={`For ${period} period`}
        />
      </div>

      {/* Appointments Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div>
          <AppointmentList 
            title="Today's Appointments"
            appointments={todayAppointments}
            className=""
            showActions={true}
            onRefresh={fetchDashboardData}
            onReschedule={handleViewAllAppointments}
          />
        </div>
        
        {/* Upcoming Appointments */}
        <div>
          <AppointmentList 
            title="Upcoming Appointments"
            appointments={upcomingAppointments}
            className=""
            showActions={true}
            onRefresh={fetchDashboardData}
            onReschedule={handleViewAllAppointments}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Services</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.serviceBreakdown.length > 0 ? (
              <ul className="space-y-4">
                {dashboardData.serviceBreakdown.map((service) => (
                  <li key={service.service_id} className="flex justify-between items-center border-b pb-2">
                    <span className="font-medium">{service.service_name}</span>
                    <div className="flex gap-4">
                      <span className="text-muted-foreground">{service.bookings} bookings</span>
                      <span className="font-semibold">{formatCurrency(service.revenue)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No service data available
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.staffReviews.length > 0 ? (
              <ul className="space-y-4">
                {dashboardData.staffReviews.map((review) => (
                  <li key={review.id} className="border-b pb-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{review.customer.name}</span>
                      <div className="flex items-center">
                        <span className="font-bold mr-1">{review.rating}</span>
                        <span className="text-yellow-500">★</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No reviews available
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffDashboard;