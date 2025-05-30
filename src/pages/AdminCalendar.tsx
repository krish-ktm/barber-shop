import React, { useState } from 'react';
import { format } from 'date-fns';
import { Search, X } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { FullCalendarView } from '@/features/appointments/FullCalendarView';
import { appointmentData, staffData, serviceData } from '@/mocks';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AppointmentDetailsDialog } from '@/features/appointments/AppointmentDetailsDialog';

export const AdminCalendar: React.FC = () => {
  // State for filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  
  // State for appointment details dialog
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);

  // Filter appointments
  const filteredAppointments = appointmentData
    .filter(appointment => {
      // Basic filtering
      const searchLower = searchQuery.toLowerCase();
      const isSearchMatch = searchQuery === '' || 
        appointment.customerName.toLowerCase().includes(searchLower) ||
        appointment.staffName.toLowerCase().includes(searchLower) ||
        appointment.customerPhone.includes(searchQuery) ||
        (appointment.customerEmail?.toLowerCase().includes(searchLower) || false);
      
      const isStatusMatch = statusFilter === 'all' || appointment.status === statusFilter;
      const isStaffMatch = staffFilter === 'all' || appointment.staffId === staffFilter;
      const isServiceMatch = serviceFilter === 'all' || 
        appointment.services.some(service => service.serviceId === serviceFilter);
      
      return isSearchMatch && isStatusMatch && isStaffMatch && isServiceMatch;
    });

  const handleViewAppointment = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setShowAppointmentDetails(true);
  };

  const handleSelectDate = (date: Date) => {
    // This could be used to update a date filter or focus the calendar on this date
    console.log('Selected date:', format(date, 'yyyy-MM-dd'));
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title="Calendar"
        description="View and manage all appointments in a calendar view"
      />
      
      <div className="bg-card border rounded-lg p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-7 w-7"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no-show">No Show</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={staffFilter} onValueChange={setStaffFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by staff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff</SelectItem>
              {staffData.map((staff) => (
                <SelectItem key={staff.id} value={staff.id}>
                  {staff.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              {serviceData.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="bg-card border rounded-lg">
        <FullCalendarView 
          appointments={filteredAppointments}
          onSelectDate={handleSelectDate}
          onViewAppointment={handleViewAppointment}
        />
      </div>
      
      {/* This is a placeholder for the appointment details dialog */}
      {/* In a real app, you would implement this component */}
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