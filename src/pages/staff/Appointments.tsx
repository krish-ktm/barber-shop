import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  X,
  Loader2
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { AppointmentList } from '@/features/appointments/AppointmentList';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AppointmentDetailsDialog } from '@/features/appointments/AppointmentDetailsDialog';
import { useToast } from '@/hooks/use-toast';
import { getStaffAppointments, updateAppointmentStatus } from '@/api/services/appointmentService';
import { Appointment as ApiAppointment, Service } from '@/api/services/appointmentService';
import { Appointment as UIAppointment } from '@/types';

export const StaffAppointments: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [staffData, setStaffData] = useState<{
    appointments: ApiAppointment[];
    services: Service[];
    totalCount: number;
  } | null>(null);
  const { toast } = useToast();

  // Fetch appointments from API
  const fetchStaffData = async (
    page = 1,
    limit = 100,
    sort = 'time_asc',
    date?: string,
    customerId?: string,
    status?: string
  ) => {
    try {
      setIsLoading(true);
      const response = await getStaffAppointments(
        page,
        limit,
        sort,
        date,
        customerId,
        status
      );
      
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

  // Fetch data when component mounts or when date/filters change
  useEffect(() => {
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    fetchStaffData(
      1, 
      100, 
      'time_asc', 
      dateString, 
      undefined, 
      statusFilter !== 'all' ? statusFilter : undefined
    );
  }, [selectedDate, statusFilter]);

  // Filter appointments by search query
  const filteredAppointments = (staffData?.appointments || [])
    .filter(appointment => {
      const searchLower = searchQuery.toLowerCase();
      return searchQuery === '' || 
        appointment.customer_name.toLowerCase().includes(searchLower) ||
        appointment.customer_phone.includes(searchQuery);
    });

  const goToPreviousDay = () => setSelectedDate(prev => {
    const newDate = new Date(prev);
    newDate.setDate(prev.getDate() - 1);
    return newDate;
  });

  const goToNextDay = () => setSelectedDate(prev => {
    const newDate = new Date(prev);
    newDate.setDate(prev.getDate() + 1);
    return newDate;
  });

  const goToToday = () => setSelectedDate(new Date());

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  const handleViewAppointment = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setIsDetailsOpen(true);
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
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
      fetchStaffData(
        1, 
        100, 
        'time_asc', 
        selectedDateStr, 
        undefined, 
        statusFilter !== 'all' ? statusFilter : undefined
      );
      
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
  const uiAppointments = filteredAppointments.map(convertApiToUIAppointment);

  const selectedAppointment = selectedAppointmentId 
    ? uiAppointments.find(app => app.id === selectedAppointmentId) 
    : null;

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title="My Appointments"
        description="View and manage your appointments"
      />
      
      <div className="bg-card border rounded-lg">
        <div className="p-4 border-b">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPreviousDay}
                className="h-9 w-9"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-[140px] sm:w-[180px] justify-start text-left font-normal',
                      !selectedDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, 'MMM d, yyyy')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Button
                variant="outline"
                size="icon"
                onClick={goToNextDay}
                className="h-9 w-9"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                onClick={goToToday}
                className="hidden sm:inline-flex h-9"
              >
                Today
              </Button>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Badge variant="secondary" className="h-9 px-4">
                {uiAppointments.length} appointment{uiAppointments.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </div>

        <div className="p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search appointments..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="hidden sm:flex items-center gap-3 flex-wrap">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
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

            {(searchQuery || statusFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-9"
              >
                <X className="h-4 w-4 mr-2" />
                Clear filters
              </Button>
            )}
          </div>

          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="sm:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {(searchQuery || statusFilter !== 'all') && (
                  <Badge variant="secondary" className="ml-2">
                    {(searchQuery ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[90vh]">
              <SheetHeader className="mb-6">
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={(value) => {
                    setStatusFilter(value);
                    setShowFilters(false);
                  }}>
                    <SelectTrigger>
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
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                        setShowFilters(false);
                      }
                    }}
                    className="border rounded-md p-3"
                  />
                </div>
                
                <SheetClose asChild>
                  <Button className="w-full">Apply Filters</Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {isLoading ? (
          <div className="text-center py-10">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">
              Loading appointments...
            </p>
          </div>
        ) : uiAppointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground p-4">
            No appointments found for the selected criteria.
          </div>
        ) : (
          <AppointmentList 
            appointments={uiAppointments}
            isStaffView={true}
            showActions={true}
            onViewAppointment={handleViewAppointment}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>

      {selectedAppointment && (
        <AppointmentDetailsDialog 
          appointment={selectedAppointment}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          isStaffView={true}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default StaffAppointments;