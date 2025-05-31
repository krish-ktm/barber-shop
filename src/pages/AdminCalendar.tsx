import React, { useState } from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { appointmentData } from '@/mocks';
import { NewAppointmentDialog } from '@/features/appointments/NewAppointmentDialog';
import { AppointmentDetailsDialog } from '@/features/appointments/AppointmentDetailsDialog';
import { CalendarView } from '@/features/appointments/CalendarView';

export const AdminCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);

  const handleViewAppointment = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setShowAppointmentDetails(true);
  };

  return (
    <div className="h-[calc(100vh-theme(spacing.16))] flex flex-col">
      <PageHeader
        title="Calendar"
        description="View and manage all appointments"
        action={{
          label: "New Appointment",
          onClick: () => setShowNewAppointment(true),
          icon: <Plus className="h-4 w-4 mr-2" />,
        }}
      />

      <div className="flex-1 overflow-hidden border rounded-lg bg-background">
        <CalendarView
          appointments={appointmentData}
          onViewAppointment={handleViewAppointment}
          onAddAppointment={() => setShowNewAppointment(true)}
        />
      </div>

      <NewAppointmentDialog
        open={showNewAppointment}
        onOpenChange={setShowNewAppointment}
        selectedDate={selectedDate}
      />

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