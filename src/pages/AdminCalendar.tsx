import React, { useState } from 'react';
import { format } from 'date-fns';
import { PageHeader } from '@/components/layout';
import { FullCalendarView } from '@/features/appointments/FullCalendarView';
import { appointmentData } from '@/mocks';
import { AppointmentDetailsDialog } from '@/features/appointments/AppointmentDetailsDialog';

export const AdminCalendar: React.FC = () => {
  // State for appointment details dialog
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);

  const handleViewAppointment = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setShowAppointmentDetails(true);
  };

  const handleSelectDate = (date: Date) => {
    // This could be used to focus the calendar on this date
    console.log('Selected date:', format(date, 'yyyy-MM-dd'));
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title="Calendar"
        description="View and manage all appointments in a calendar view"
      />
      
      <div className="bg-card border rounded-lg">
        <FullCalendarView 
          appointments={appointmentData}
          onSelectDate={handleSelectDate}
          onViewAppointment={handleViewAppointment}
        />
      </div>
      
      {showAppointmentDetails && selectedAppointmentId && (
        <AppointmentDetailsDialog 
          appointmentId={selectedAppointmentId}
          open={showAppointmentDetails}
          onOpenChange={setShowAppointmentDetails}
        />
      )}
    </div>
  );
}; 