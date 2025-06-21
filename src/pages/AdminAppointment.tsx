import React, { useState, useEffect } from 'react';
import { format, parse, startOfDay, endOfDay, isWithinInterval, isAfter, addDays, startOfWeek, endOfWeek } from 'date-fns';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Loader2,
  Clock,
  Scissors,
  User
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { AppointmentList } from '@/features/appointments/AppointmentList';
import { AppointmentDetailsDialog } from '@/features/appointments/AppointmentDetailsDialog';
import { RescheduleAppointmentDialog } from '@/features/appointments/RescheduleAppointmentDialog';
import { CancelAppointmentDialog } from '@/features/appointments/CancelAppointmentDialog';
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
  SheetClose,
} from '@/components/ui/sheet';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { DateRange } from 'react-day-picker';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Sliders } from 'lucide-react';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';

// API imports
import { useApi } from '@/hooks/useApi';
import { 
  getAdminAppointments,
  updateAppointmentStatus,
  updateAppointmentStatusDirect,
  Appointment as ApiAppointment 
} from '@/api/services/appointmentService';
import { useToast } from '@/hooks/use-toast';
import { Appointment as UIAppointment } from '@/types';

// Date range options
type DateRangeType = 'today' | 'tomorrow' | 'thisWeek' | 'nextWeek' | 'custom';

const DATE_RANGE_OPTIONS: Record<DateRangeType, string> = {
  today: 'Today',
  tomorrow: 'Tomorrow',
  thisWeek: 'This Week',
  nextWeek: 'Next Week',
  custom: 'Custom Range'
};

export const AdminAppointment: React.FC = () => {
  const { toast } = useToast();

  // API data loading hook - using the new endpoint
  const {
    data: adminData,
    loading: isLoading,
    error: apiError,
    execute: fetchAdminData,
    setData: setAdminData
  } = useApi(getAdminAppointments);

  // API hook for updating appointment status
  const {
    loading: isUpdatingStatus,
    error: updateStatusError
  } = useApi(updateAppointmentStatus);

  // Track loading state per appointment ID
  const [loadingAppointmentIds, setLoadingAppointmentIds] = useState<Record<string, boolean>>({});

  // Basic filters
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>('today');
  const [dateRange, setDateRange] = useState<{start: Date, end: Date}>({
    start: new Date(),
    end: new Date()
  });
  // Temporary date range for custom selection before applying
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date()
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [timeOfDayFilter, setTimeOfDayFilter] = useState<string>('all');
  const [multiServiceFilter, setMultiServiceFilter] = useState<string[]>([]);
  
  // Advanced filters
  const [useAdvancedFilters, setUseAdvancedFilters] = useState(false);
  const [timeRange, setTimeRange] = useState<[string, string] | null>(['09:00', '18:00']);
  const [priceRange, setPriceRange] = useState<[number, number] | null>([0, 100]);
  const [durationRange, setDurationRange] = useState<[number, number] | null>([15, 120]);
  
  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Appointment details state
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  
  // Reschedule appointment state
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState<UIAppointment | null>(null);

  // Add state for cancel dialog
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<UIAppointment | null>(null);

  // Fetch data only when necessary - this one is needed for initial data loading
  useEffect(() => {
    if (!useAdvancedFilters) {
      const startDateString = format(dateRange.start, 'yyyy-MM-dd');
      const endDateString = format(dateRange.end, 'yyyy-MM-dd');
      
      fetchAdminData(
        1, 
        100, 
        'time_asc', 
        startDateString,
        endDateString,
        staffFilter !== 'all' ? staffFilter : undefined, 
        undefined, 
        statusFilter !== 'all' ? statusFilter : undefined,
        undefined,
        timeOfDayFilter !== 'all' ? timeOfDayFilter : undefined,
        multiServiceFilter.length > 0 ? multiServiceFilter : undefined
      );
    }
  }, [fetchAdminData, dateRange, staffFilter, statusFilter, useAdvancedFilters, timeOfDayFilter, multiServiceFilter]);

  // Handle errors
  useEffect(() => {
    if (apiError) {
      toast({
        title: 'Error',
        description: `Failed to load data: ${apiError.message}`,
        variant: 'destructive',
      });
    }
  }, [apiError, toast]);

  useEffect(() => {
    if (updateStatusError) {
      toast({
        title: 'Error',
        description: `Failed to update appointment status: ${updateStatusError.message}`,
        variant: 'destructive',
      });
    }
  }, [updateStatusError, toast]);

  // Handle date range selection
  useEffect(() => {
    let start = new Date();
    let end = new Date();
    
    switch (dateRangeType) {
      case 'today':
        // Keep start and end as today
        break;
      case 'tomorrow':
        start = addDays(new Date(), 1);
        end = addDays(new Date(), 1);
        break;
      case 'thisWeek':
        start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Start from Monday
        end = endOfWeek(new Date(), { weekStartsOn: 1 }); // End on Sunday
        break;
      case 'nextWeek':
        start = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 7);
        end = addDays(endOfWeek(new Date(), { weekStartsOn: 1 }), 7);
        break;
      case 'custom':
        // Don't update dateRange for custom - it will be updated when Apply is clicked
        return;
      default:
        break;
    }
    
    if (dateRangeType !== 'custom') {
      setDateRange({ start, end });
      setSelectedDate(start);
      
      // Also update tempDateRange to keep them in sync
      setTempDateRange({ from: start, to: end });
    }
  }, [dateRangeType]);

  // Handle appointment status change
  const handleStatusChange = async (appointmentId: string, newStatus: UIAppointment['status']) => {
    try {
      // If status is cancelled, show confirmation dialog instead of immediate action
      if (newStatus === 'cancelled') {
        const appointmentToCancel = uiAppointments.find(app => app.id === appointmentId);
        if (appointmentToCancel) {
          setAppointmentToCancel(appointmentToCancel);
          setShowCancelDialog(true);
        }
        return;
      }
      
      // Set loading state for this specific appointment
      setLoadingAppointmentIds(prev => ({ ...prev, [appointmentId]: true }));
      
      // Optimistically update the UI first
      const updatedAppointments = appointments.map(app => {
        if (app.id === appointmentId) {
          return { ...app, status: newStatus };
        }
        return app;
      });
      
      // Update the UI immediately
      if (adminData) {
        const updatedAdminData = {
          ...adminData,
          appointments: updatedAppointments
        };
        setAdminData(updatedAdminData);
      }
      
      // Then make the API call
      await updateAppointmentStatusDirect(appointmentId, newStatus);
      
      toast({
        title: 'Status Updated',
        description: `Appointment status changed to ${newStatus}`,
      });
      
      // Clear loading state
      setLoadingAppointmentIds(prev => ({ ...prev, [appointmentId]: false }));
    } catch (error) {
      console.error('Error updating appointment status:', error);
      
      // Clear loading state
      setLoadingAppointmentIds(prev => ({ ...prev, [appointmentId]: false }));
      
      // If there was an error, refresh the data to get back to a consistent state
      const startDateString = format(dateRange.start, 'yyyy-MM-dd');
      const endDateString = format(dateRange.end, 'yyyy-MM-dd');
      
      fetchAdminData(
        1, 
        100, 
        'time_asc', 
        startDateString,
        endDateString,
        staffFilter !== 'all' ? staffFilter : undefined, 
        undefined, 
        statusFilter !== 'all' ? statusFilter : undefined,
        undefined,
        timeOfDayFilter !== 'all' ? timeOfDayFilter : undefined,
        multiServiceFilter.length > 0 ? multiServiceFilter : undefined
      );
      
      toast({
        title: 'Error',
        description: 'Failed to update appointment status. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  // Handle viewing appointment details
  const handleViewAppointment = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setShowAppointmentDetails(true);
  };
  
  // Handle reschedule appointment
  const handleRescheduleAppointment = (appointment: UIAppointment) => {
    // Prevent details dialog from opening when rescheduling
    setSelectedAppointmentId(null);
    setShowAppointmentDetails(false);
    
    // Don't set loading state yet - wait until user confirms rescheduling
    // setLoadingAppointmentIds(prev => ({ ...prev, [appointment.id]: true }));
    
    // Open reschedule dialog
    setAppointmentToReschedule(appointment);
    setShowRescheduleDialog(true);
  };
  
  // Handle cancel appointment
  const handleCancelAppointment = (appointment: UIAppointment) => {
    // Prevent details dialog from opening when cancelling
    setSelectedAppointmentId(null);
    setShowAppointmentDetails(false);
    
    // Don't set loading state yet - wait until user confirms cancellation
    // setLoadingAppointmentIds(prev => ({ ...prev, [appointment.id]: true }));
    
    // Open cancel dialog
    setAppointmentToCancel(appointment);
    setShowCancelDialog(true);
  };
  
  // Handle reschedule complete
  const handleRescheduleComplete = (updatedAppointment: ApiAppointment) => {
    if (!adminData) return;
    
    // Update the appointment in the local state
    const updatedAppointments = adminData.appointments.map(app => {
      if (app.id === updatedAppointment.id) {
        return updatedAppointment;
      }
      return app;
    });
    
    // Update the UI immediately
    const updatedAdminData = {
      ...adminData,
      appointments: updatedAppointments
    };
    setAdminData(updatedAdminData);
    
    // No need to clear loading state as it's handled in the dialog component
    
    // Close the dialog
    setShowRescheduleDialog(false);
    setAppointmentToReschedule(null);
    
    toast({
      title: 'Appointment Rescheduled',
      description: 'The appointment has been successfully rescheduled.',
    });
  };
  
  // Handle cancel complete
  const handleCancelComplete = (appointmentId: string) => {
    if (!adminData) return;
    
    // No need to set loading state as it's handled in the dialog component
    
    // Update the appointment in the local state
    const updatedAppointments = adminData.appointments.map(app => {
      if (app.id === appointmentId) {
        return { ...app, status: 'cancelled' as const };
      }
      return app;
    });
    
    // Update the UI immediately
    const updatedAdminData = {
      ...adminData,
      appointments: updatedAppointments
    };
    setAdminData(updatedAdminData);
    
    // No need to clear loading state as it's handled in the dialog component
    
    // Close the dialog
    setShowCancelDialog(false);
    setAppointmentToCancel(null);
    
    toast({
      title: 'Appointment Cancelled',
      description: 'The appointment has been successfully cancelled.',
    });
  };

  // Get the actual data from API or use empty arrays if not loaded
  const appointments = adminData?.appointments || [];
  const staff = adminData?.staff || [];
  const services = adminData?.services || [];

  // Helpers for managing time
  const formatTimeForFilter = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const isTimeInRange = (time: string, range: [string, string] | null) => {
    if (!range) return true;
    const timeMinutes = formatTimeForFilter(time);
    const startMinutes = formatTimeForFilter(range[0]);
    const endMinutes = formatTimeForFilter(range[1]);
    return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
  };
  
  // Helper for price range check
  const isPriceInRange = (price: number, range: [number, number] | null) => {
    if (!range) return true;
    return price >= range[0] && price <= range[1];
  };
  
  // Helper for duration range check
  const isDurationInRange = (duration: number, range: [number, number] | null) => {
    if (!range) return true;
    return duration >= range[0] && duration <= range[1];
  };

  // Filter appointments
  const filteredAppointments = appointments
    .filter(appointment => {
      // Basic filtering
      const searchLower = searchQuery.toLowerCase();
      const isSearchMatch = searchQuery === '' || 
        appointment.customer_name.toLowerCase().includes(searchLower) ||
        appointment.staff_name.toLowerCase().includes(searchLower) ||
        appointment.customer_phone.includes(searchQuery) ||
        (appointment.customer_email?.toLowerCase().includes(searchLower) || false);
      
      const isStatusMatch = statusFilter === 'all' || appointment.status === statusFilter;
      const isStaffMatch = staffFilter === 'all' || appointment.staff_id === staffFilter;
      
      // Get services from either appointmentServices or services
      const appointmentServices = appointment.appointmentServices || appointment.services || [];
      
      const isServiceMatch = serviceFilter === 'all' || 
        appointmentServices.some(service => service.service_id === serviceFilter);
      
      // Basic date filtering (if not using advanced filters)
      let isDateMatch = true;
      if (!useAdvancedFilters) {
        isDateMatch = appointment.date === format(selectedDate, 'yyyy-MM-dd');
      }
      
      // Advanced filtering
      if (useAdvancedFilters) {
        // Date range filtering
        if (dateRange?.from) {
          const appointmentDate = parse(appointment.date, 'yyyy-MM-dd', new Date());
          
          if (dateRange.to) {
            // We have both from and to dates
            isDateMatch = isWithinInterval(appointmentDate, {
              start: startOfDay(dateRange.from),
              end: endOfDay(dateRange.to)
            });
          } else {
            // We only have the from date
            isDateMatch = isAfter(appointmentDate, startOfDay(dateRange.from)) || 
                          format(appointmentDate, 'yyyy-MM-dd') === format(dateRange.from, 'yyyy-MM-dd');
          }
        }
        
        // Time range filtering
        const isTimeMatch = isTimeInRange(appointment.time, timeRange);
        
        // Price range filtering
        const isPriceMatch = isPriceInRange(appointment.total_amount, priceRange);
        
        // Duration range filtering
        const totalDuration = appointmentServices.reduce((sum, service) => sum + service.duration, 0);
        const isDurationMatch = isDurationInRange(totalDuration, durationRange);
        
        return isSearchMatch && isStatusMatch && isStaffMatch && 
               isServiceMatch && isDateMatch && isTimeMatch && 
               isPriceMatch && isDurationMatch;
      }
      
      return isSearchMatch && isStatusMatch && isStaffMatch && isServiceMatch && isDateMatch;
    })
    .sort((a, b) => {
      const timeA = a.time.split(':').map(Number);
      const timeB = b.time.split(':').map(Number);
      return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
    });

  // Convert API appointments to UI format for the appointment list
  const convertApiToUIAppointment = (apiAppointment: ApiAppointment): UIAppointment => {
    return {
      id: apiAppointment.id,
      customerId: apiAppointment.customer_id,
      customerName: apiAppointment.customer_name,
      customerPhone: apiAppointment.customer_phone,
      customerEmail: apiAppointment.customer_email,
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
    // Simple implementation - can be improved with proper time calculation
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
  
  // Find the selected appointment using the most up-to-date appointments list
  const selectedAppointment = selectedAppointmentId
    ? uiAppointments.find(app => app.id === selectedAppointmentId)
    : null;

  // Navigation helpers
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
    setStaffFilter('all');
    setServiceFilter('all');
    setTimeOfDayFilter('all');
    setMultiServiceFilter([]);
    setDateRangeType('today');
    
    const today = new Date();
    setDateRange({ start: today, end: today });
    setTempDateRange({ from: today, to: today });
    
    if (useAdvancedFilters) {
      setTimeRange(['09:00', '18:00']);
      setPriceRange([0, 100]);
      setDurationRange([15, 120]);
    }
  };
  
  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (statusFilter !== 'all') count++;
    if (staffFilter !== 'all') count++;
    if (serviceFilter !== 'all') count++;
    
    if (useAdvancedFilters) {
      if (dateRange?.from) count++;
      if (timeRange && (timeRange[0] !== '09:00' || timeRange[1] !== '18:00')) count++;
      if (priceRange && (priceRange[0] > 0 || priceRange[1] < 100)) count++;
      if (durationRange && (durationRange[0] > 15 || durationRange[1] < 120)) count++;
    }
    
    return count;
  };

  // Search is now performed via API instead of locally filtering
  const handleSearch = () => {
    const startDateString = format(dateRange.start, 'yyyy-MM-dd');
    const endDateString = format(dateRange.end, 'yyyy-MM-dd');
    
    fetchAdminData(
      1,
      100,
      'time_asc',
      startDateString,
      endDateString,
      staffFilter !== 'all' ? staffFilter : undefined,
      undefined,
      statusFilter !== 'all' ? statusFilter : undefined,
      searchQuery.trim() !== '' ? searchQuery : undefined,
      timeOfDayFilter !== 'all' ? timeOfDayFilter : undefined,
      multiServiceFilter.length > 0 ? multiServiceFilter : undefined
    );
  };

  // Format date range for display
  const formatDateRange = () => {
    if (dateRange.start.toDateString() === dateRange.end.toDateString()) {
      return format(dateRange.start, 'MMM d, yyyy');
    }
    return `${format(dateRange.start, 'MMM d')} - ${format(dateRange.end, 'MMM d, yyyy')}`;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title="Appointments"
        description="Manage and track all appointments"
      />
      
      <div className="bg-card border rounded-lg">
        <div className="p-4 border-b">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
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
                      'w-[200px] sm:w-[240px] justify-start text-left font-normal',
                      !selectedDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateRange()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 min-w-[300px]" align="start">
                  <Tabs defaultValue="preset" className="w-full">
                    <TabsList className="grid grid-cols-2 w-full">
                      <TabsTrigger value="preset">Presets</TabsTrigger>
                      <TabsTrigger value="custom">Custom</TabsTrigger>
                    </TabsList>
                    <TabsContent value="preset" className="p-4 space-y-4">
                      <RadioGroup 
                        value={dateRangeType} 
                        onValueChange={(value: string) => {
                          setDateRangeType(value as DateRangeType);
                          // Close the popover after selecting a preset
                          const popoverTrigger = document.querySelector('[aria-expanded="true"]');
                          if (popoverTrigger instanceof HTMLElement) {
                            popoverTrigger.click();
                          }
                        }}
                      >
                        {Object.entries(DATE_RANGE_OPTIONS).map(([value, label]) => (
                          <div className="flex items-center space-x-2" key={value}>
                            <RadioGroupItem value={value} id={`date-range-${value}`} />
                            <Label htmlFor={`date-range-${value}`}>{label}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </TabsContent>
                    <TabsContent value="custom" className="p-4 space-y-2">
                      <p className="text-sm text-muted-foreground mb-2">Select a date range</p>
                  <Calendar
                        mode="range"
                        selected={{
                          from: tempDateRange?.from,
                          to: tempDateRange?.to
                        }}
                        onSelect={(range) => {
                          if (range?.from) {
                            setTempDateRange(range);
                            setDateRangeType('custom');
                          }
                        }}
                    initialFocus
                        numberOfMonths={2}
                      />
                      <Button 
                        className="w-full mt-4" 
                        onClick={() => {
                          // Only update dateRange and make API call if we have a valid range
                          if (tempDateRange?.from) {
                            // Update the actual dateRange that triggers API calls
                            setDateRange({
                              start: tempDateRange.from,
                              end: tempDateRange.to || tempDateRange.from
                            });
                            
                            // Fetch appointments with the custom date range
                            const startDateString = format(tempDateRange.from, 'yyyy-MM-dd');
                            const endDateString = tempDateRange.to 
                              ? format(tempDateRange.to, 'yyyy-MM-dd')
                              : format(tempDateRange.from, 'yyyy-MM-dd');
                            
                            fetchAdminData(
                              1, 
                              100, 
                              'time_asc', 
                              startDateString,
                              endDateString,
                              staffFilter !== 'all' ? staffFilter : undefined,
                              undefined,
                              statusFilter !== 'all' ? statusFilter : undefined,
                              searchQuery.trim() !== '' ? searchQuery : undefined,
                              timeOfDayFilter !== 'all' ? timeOfDayFilter : undefined,
                              multiServiceFilter.length > 0 ? multiServiceFilter : undefined
                            );
                          }
                          
                          // Close the popover
                          const popoverTrigger = document.querySelector('[aria-expanded="true"]');
                          if (popoverTrigger instanceof HTMLElement) {
                            popoverTrigger.click();
                          }
                        }}
                      >
                        Apply
                      </Button>
                    </TabsContent>
                  </Tabs>
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
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="h-9"
                onClick={clearFilters}
              >
                Clear Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
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
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <Button 
            variant="secondary" 
            onClick={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
            Search
          </Button>
          
          <div className="hidden lg:flex items-center gap-3 flex-wrap">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
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
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Staff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                {staff.map((staffMember) => (
                  <SelectItem key={staffMember.id} value={staffMember.id}>
                    {staffMember.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={timeOfDayFilter} onValueChange={setTimeOfDayFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Time of Day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Times</SelectItem>
                <SelectItem value="morning">Morning</SelectItem>
                <SelectItem value="afternoon">Afternoon</SelectItem>
                <SelectItem value="evening">Evening</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Show active filters as badges */}
          <div className="flex flex-wrap gap-2 mt-3">
            {statusFilter !== 'all' && (
              <Badge variant="secondary" className="flex gap-1 items-center">
                Status: {statusFilter}
              </Badge>
            )}
            
            {staffFilter !== 'all' && (
              <Badge variant="secondary" className="flex gap-1 items-center">
                Staff: {staff.find(s => s.id === staffFilter)?.name || staffFilter}
              </Badge>
            )}
            
            {timeOfDayFilter !== 'all' && (
              <Badge variant="secondary" className="flex gap-1 items-center">
                Time: {timeOfDayFilter}
              </Badge>
            )}

            {searchQuery.trim() !== '' && (
              <Badge variant="secondary" className="flex gap-1 items-center">
                Search: {searchQuery}
              </Badge>
            )}
            
            {/* Clear all filters button */}
            {(statusFilter !== 'all' || 
              staffFilter !== 'all' || 
              timeOfDayFilter !== 'all' || 
              searchQuery.trim() !== '' ||
              dateRangeType !== 'today') && (
                      <Button
                variant="ghost" 
                size="sm" 
                onClick={clearFilters} 
                className="h-6 px-2">
                Clear all
                      </Button>
            )}
          </div>
        </div>
        
        <div className="p-4">
          {isLoading ? (
            <div className="text-center py-10">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">
                Loading appointments...
              </p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No appointments found for the selected criteria.
            </div>
          ) : (
            <div className="relative">
              {isUpdatingStatus && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                  <div className="bg-background p-4 rounded-lg shadow-lg flex items-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <p>Updating status...</p>
                  </div>
                </div>
              )}
              <AppointmentList 
                appointments={uiAppointments}
                showActions={true}
                isStaffView={false}
                staffList={staff}
                onStatusChange={handleStatusChange}
                onViewAppointment={handleViewAppointment}
                onRescheduleAppointment={handleRescheduleAppointment}
                onCancelAppointment={handleCancelAppointment}
                loadingAppointmentIds={loadingAppointmentIds}
              />
            </div>
          )}
        </div>
      </div>
      
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="sm:hidden"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[90vh]">
          <SheetHeader className="mb-6">
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          
          <Tabs defaultValue={useAdvancedFilters ? "advanced" : "basic"}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger 
                value="basic" 
                onClick={() => {
                  setUseAdvancedFilters(false);
                  // We'll fetch data via the useEffect hook
                }}
              >
                Basic
              </TabsTrigger>
              <TabsTrigger 
                value="advanced" 
                onClick={() => setUseAdvancedFilters(true)}
              >
                Advanced
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                    }
                  }}
                  className="rounded-md border"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                <label className="text-sm font-medium">Staff Member</label>
                <Select value={staffFilter} onValueChange={(value) => {
                  setStaffFilter(value);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by staff" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Staff</SelectItem>
                    {staff.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Service</label>
                <Select value={serviceFilter} onValueChange={(value) => {
                  setServiceFilter(value);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  className="rounded-md border"
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-medium">Time Range</label>
                <div className="flex gap-2 items-center">
                  <Select
                    value={timeRange?.[0] || '09:00'}
                    onValueChange={(value) => setTimeRange([value, timeRange?.[1] || '18:00'])}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Start" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 13 }, (_, i) => i + 9).map(hour => (
                        <SelectItem key={`start-${hour}`} value={`${hour.toString().padStart(2, '0')}:00`}>
                          {`${hour.toString().padStart(2, '0')}:00`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span>to</span>
                  <Select
                    value={timeRange?.[1] || '18:00'}
                    onValueChange={(value) => setTimeRange([timeRange?.[0] || '09:00', value])}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="End" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 13 }, (_, i) => i + 9).map(hour => (
                        <SelectItem key={`end-${hour}`} value={`${hour.toString().padStart(2, '0')}:00`}>
                          {`${hour.toString().padStart(2, '0')}:00`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Price Range (${priceRange?.[0]} - ${priceRange?.[1]})</label>
                <Slider
                  value={priceRange || [0, 100]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration Range ({durationRange?.[0]} - {durationRange?.[1]} mins)</label>
                <Slider
                  value={durationRange || [15, 120]}
                  min={15}
                  max={120}
                  step={15}
                  onValueChange={(value) => setDurationRange(value as [number, number])}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                <label className="text-sm font-medium">Staff Member</label>
                <Select value={staffFilter} onValueChange={setStaffFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by staff" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Staff</SelectItem>
                    {staff.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Service</label>
                <Select value={serviceFilter} onValueChange={setServiceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex items-center justify-between pt-6 border-t mt-6">
            <Button variant="outline" onClick={() => {
              clearFilters();
              setShowFilters(false);
            }}>
              Reset filters
            </Button>
            <SheetClose asChild>
              <Button>Apply filters</Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Appointment Details Dialog */}
      {selectedAppointment && (
        <AppointmentDetailsDialog 
          appointment={selectedAppointment}
          open={showAppointmentDetails}
          onOpenChange={setShowAppointmentDetails}
          onStatusChange={handleStatusChange}
        />
      )}
      
      {/* Reschedule Appointment Dialog */}
      {appointmentToReschedule && (
        <RescheduleAppointmentDialog
          appointment={appointmentToReschedule}
          open={showRescheduleDialog}
          onOpenChange={setShowRescheduleDialog}
          onRescheduleComplete={handleRescheduleComplete}
        />
      )}
      
      {/* Cancel Appointment Dialog */}
      {appointmentToCancel && (
        <CancelAppointmentDialog
          appointment={appointmentToCancel}
          open={showCancelDialog}
          onOpenChange={setShowCancelDialog}
          onCancelComplete={handleCancelComplete}
        />
      )}
    </div>
  );
};