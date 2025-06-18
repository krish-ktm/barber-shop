import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { PageHeader } from '@/components/layout';
import { AppointmentDetailsDialog } from '@/features/appointments/AppointmentDetailsDialog';
import { CalendarLayout } from '@/features/admin/calendar/CalendarLayout';
import { getCalendarAppointments } from '@/api/services/appointmentService';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Appointment } from '@/types';
import { toast } from '@/hooks/use-toast';

export const AdminCalendar: React.FC = () => {
  // State for appointment details dialog
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch appointments for the current month
  const fetchAppointments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get date range for the current month
      const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');
      
      // Fetch appointments with date range filter using the new endpoint
      const response = await getCalendarAppointments(startDate, endDate);
      
      // Map the backend appointments to the frontend format
      const formattedAppointments: Appointment[] = response.appointments.map(appointment => ({
        id: appointment.id,
        customerId: appointment.customer_id,
        customerName: appointment.customer_name,
        customerPhone: appointment.customer_phone,
        customerEmail: appointment.customer_email,
        staffId: appointment.staff_id,
        staffName: appointment.staff_name,
        date: appointment.date,
        time: appointment.time,
        endTime: appointment.end_time,
        status: appointment.status,
        totalAmount: appointment.total_amount,
        notes: appointment.notes,
        createdAt: appointment.created_at || appointment.createdAt || '',
        updatedAt: appointment.updated_at || appointment.updatedAt || '',
        services: appointment.appointmentServices?.map(service => ({
          serviceId: service.service_id,
          serviceName: service.service_name,
          price: service.price,
          duration: service.duration
        })) || []
      }));
      
      setAppointments(formattedAppointments);
      
      toast({
        title: "Appointments loaded",
        description: `${formattedAppointments.length} appointments found for ${format(currentDate, 'MMMM yyyy')}`,
        variant: "default",
      });
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments. Please try again.');
      toast({
        title: "Error loading appointments",
        description: "Could not fetch appointments from the server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch appointments when the component mounts or when the month changes
  useEffect(() => {
    fetchAppointments();
  }, [currentDate]);

  const handleViewAppointment = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setShowAppointmentDetails(true);
  };

  const handleSelectDate = (date: Date) => {
    // Update the current date when a date is selected
    setCurrentDate(date);
    console.log('Selected date:', format(date, 'yyyy-MM-dd'));
  };

  // Handle appointment status changes
  const handleAppointmentStatusChange = (appointmentId: string, newStatus: Appointment['status']) => {
    // Update the local state to reflect the status change
    setAppointments(prevAppointments => 
      prevAppointments.map(appointment => 
        appointment.id === appointmentId 
          ? { ...appointment, status: newStatus } 
          : appointment
      )
    );
  };

  const selectedAppointment = selectedAppointmentId 
    ? appointments.find(app => app.id === selectedAppointmentId) 
    : null;

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title="Calendar"
        description="View and manage all appointments in a calendar view"
      />
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading appointments...</span>
        </div>
      ) : error ? (
        <div className="bg-destructive/10 p-4 rounded-md">
          <p className="text-destructive font-medium">{error}</p>
          <Button 
            variant="outline" 
            className="mt-2" 
            onClick={fetchAppointments}
          >
            Retry
          </Button>
        </div>
      ) : (
        <div className="bg-card border rounded-lg">
          <CalendarLayout 
            appointments={appointments}
            onSelectDate={handleSelectDate}
            onViewAppointment={handleViewAppointment}
          />
        </div>
      )}
      
      {selectedAppointment && (
        <AppointmentDetailsDialog 
          appointment={selectedAppointment}
          open={showAppointmentDetails}
          onOpenChange={setShowAppointmentDetails}
          onStatusChange={handleAppointmentStatusChange}
          onAppointmentUpdated={fetchAppointments}
        />
      )}
    </div>
  );
}; 