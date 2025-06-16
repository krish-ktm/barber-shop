import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout';
import { FullCalendarView } from '@/features/appointments/FullCalendarView';
import { AppointmentDetailsDialog } from '@/features/appointments/AppointmentDetailsDialog';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getStaffAppointments, updateAppointmentStatus } from '@/api/services/appointmentService';
import { Appointment as ApiAppointment, Service } from '@/api/services/appointmentService';
import { Appointment as UIAppointment } from '@/types';
import { Loader2 } from 'lucide-react';

export const StaffCalendar: React.FC = () => {
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [staffData, setStaffData] = useState<{
    appointments: ApiAppointment[];
    services: Service[];
    totalCount: number;
  } | null>(null);
  const { toast } = useToast();

  // Fetch all appointments for the staff member
  const fetchStaffAppointments = async () => {
    try {
      setIsLoading(true);
      const response = await getStaffAppointments(1, 1000, 'date_asc'); // Get all appointments
      
      if (response.success) {
        setStaffData({
          appointments: response.appointments,
          services: response.services,
          totalCount: response.totalCount
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load appointments',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching staff appointments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load appointments. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchStaffAppointments();
  }, []);

  const handleViewAppointment = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setIsDetailsOpen(true);
  };

  const handleSelectDate = (date: Date) => {
    // In a real app, this could be used to pre-fill a date for a new appointment
    console.log('Selected date:', date);
  };

  // Handle appointment status change
  const handleStatusChange = async (appointmentId: string, newStatus: UIAppointment['status']) => {
    try {
      // Optimistically update the UI first
      if (staffData) {
        const updatedAppointments = staffData.appointments.map(app => {
          if (app.id === appointmentId) {
            return { ...app, status: newStatus };
          }
          return app;
        });
        
        // Update the UI immediately
        setStaffData({
          ...staffData,
          appointments: updatedAppointments
        });
      }
      
      // Then make the API call
      await updateAppointmentStatus(appointmentId, newStatus);
      
      toast({
        title: 'Status Updated',
        description: `Appointment status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      
      // If there was an error, refresh the data to get back to a consistent state
      fetchStaffAppointments();
      
      toast({
        title: 'Error',
        description: 'Failed to update appointment status. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Convert API appointments to UI format for the appointment list
  const convertApiToUIAppointment = (apiAppointment: ApiAppointment): UIAppointment => {
    return {
      id: apiAppointment.id,
      customerId: apiAppointment.customer_id,
      customerName: apiAppointment.customer_name,
      customerPhone: apiAppointment.customer_phone,
      customerEmail: apiAppointment.customer_email || '',
      staffId: apiAppointment.staff_id,
      staffName: apiAppointment.staff_name,
      date: apiAppointment.date,
      time: apiAppointment.time,
      endTime: apiAppointment.end_time || calculateEndTime(apiAppointment),
      status: apiAppointment.status,
      services: apiAppointment.appointmentServices ? apiAppointment.appointmentServices.map(service => ({
        serviceId: service.service_id,
        serviceName: service.service_name,
        price: service.price,
        duration: service.duration
      })) : [],
      totalAmount: apiAppointment.total_amount,
      notes: apiAppointment.notes || '',
      createdAt: apiAppointment.created_at || new Date().toISOString(),
      updatedAt: apiAppointment.updated_at || new Date().toISOString()
    };
  };

  // Helper to calculate end time if not provided by API
  const calculateEndTime = (appointment: ApiAppointment): string => {
    const services = appointment.appointmentServices || appointment.services || [];
    const totalDuration = services.reduce((sum, service) => sum + service.duration, 0);
    const [hours, minutes] = appointment.time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + totalDuration;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  };

  // Get UI appointments
  const staffAppointments = (staffData?.appointments || []).map(convertApiToUIAppointment);

  const selectedAppointment = selectedAppointmentId 
    ? staffAppointments.find(app => app.id === selectedAppointmentId) 
    : null;

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title="My Calendar"
        description="View and manage your schedule"
      />

      <Card className="p-0">
        {isLoading ? (
          <div className="text-center py-10">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">
              Loading calendar...
            </p>
          </div>
        ) : (
          <FullCalendarView
            appointments={staffAppointments}
            onSelectDate={handleSelectDate}
            onViewAppointment={handleViewAppointment}
          />
        )}
      </Card>

      {selectedAppointment && (
        <AppointmentDetailsDialog
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          appointment={selectedAppointment}
          isStaffView={true}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}; 