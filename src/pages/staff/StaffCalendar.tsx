import React, { useState } from 'react';
import { PageHeader } from '@/components/layout';
import { FullCalendarView } from '@/features/appointments/FullCalendarView';
import { AppointmentDetailsDialog } from '@/features/appointments/AppointmentDetailsDialog';
import { appointmentData } from '@/mocks';
import { Card } from '@/components/ui/card';

export const StaffCalendar: React.FC = () => {
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Mock staff ID - in real app would come from auth context
  const staffId = 'staff-1';

  // Filter appointments for the current staff member
  const staffAppointments = appointmentData.filter(appointment => 
    appointment.staffId === staffId
  );

  const handleViewAppointment = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setIsDetailsOpen(true);
  };

  const handleSelectDate = (date: Date) => {
    // In a real app, this could be used to pre-fill a date for a new appointment
    console.log('Selected date:', date);
  };

  const selectedAppointment = selectedAppointmentId 
    ? appointmentData.find(app => app.id === selectedAppointmentId) 
    : null;

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title="My Calendar"
        description="View and manage your schedule"
      />

      <Card className="p-0">
        <FullCalendarView
          appointments={staffAppointments}
          onSelectDate={handleSelectDate}
          onViewAppointment={handleViewAppointment}
        />
      </Card>

      {selectedAppointment && (
        <AppointmentDetailsDialog
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          appointment={selectedAppointment}
          isStaffView={true}
        />
      )}
    </div>
  );
}; 