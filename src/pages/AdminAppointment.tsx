import React, { useState } from 'react';
import { format, parse, startOfDay, endOfDay, isWithinInterval, isAfter } from 'date-fns';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Search,
  X,
  CalendarRange,
  Sliders
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { AppointmentList } from '@/features/appointments/AppointmentList';
import { NewAppointmentDialog } from '@/features/appointments/NewAppointmentDialog';
import { appointmentData, staffData, serviceData } from '@/mocks';
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
import { Switch } from '@/components/ui/switch';
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

export const AdminAppointment: React.FC = () => {
  // Basic filters
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  
  // Advanced filters
  const [useAdvancedFilters, setUseAdvancedFilters] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [timeRange, setTimeRange] = useState<[string, string] | null>(['09:00', '18:00']);
  const [priceRange, setPriceRange] = useState<[number, number] | null>([0, 100]);
  const [durationRange, setDurationRange] = useState<[number, number] | null>([15, 120]);
  
  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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
        const isPriceMatch = isPriceInRange(appointment.totalAmount, priceRange);
        
        // Duration range filtering
        const totalDuration = appointment.services.reduce((sum, service) => sum + service.duration, 0);
        const isDurationMatch = isDurationInRange(totalDuration, durationRange);
        
        return isSearchMatch && isStatusMatch && isStaffMatch && isServiceMatch && 
               isDateMatch && isTimeMatch && isPriceMatch && isDurationMatch;
      }
      
      return isDateMatch && isSearchMatch && isStatusMatch && isStaffMatch && isServiceMatch;
    })
    .sort((a, b) => {
      const timeA = a.time.split(':').map(Number);
      const timeB = b.time.split(':').map(Number);
      return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
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
    setStaffFilter('all');
    setServiceFilter('all');
    
    if (useAdvancedFilters) {
      setDateRange({ from: undefined, to: undefined });
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

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title="Appointments"
        description="Manage and track all appointments"
        action={{
          label: "New Appointment",
          onClick: () => setShowNewAppointment(true),
          icon: <Plus className="h-4 w-4 mr-2" />,
        }}
      />
      
      <div className="bg-card border rounded-lg">
        <div className="p-4 border-b">
          <div className="flex flex-col sm:flex-row gap-4">
            {!useAdvancedFilters && (
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
            )}
            
            {useAdvancedFilters && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal min-w-[220px]"
                    >
                      <CalendarRange className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, 'MMM d, yyyy')} -{' '}
                            {format(dateRange.to, 'MMM d, yyyy')}
                          </>
                        ) : (
                          format(dateRange.from, 'MMM d, yyyy')
                        )
                      ) : (
                        <span>Select date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <Badge variant="secondary" className="h-9 px-4">
                {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
              </Badge>
              
              <div className="flex items-center">
                <Label htmlFor="advancedFilters" className="mr-2 text-sm">Advanced</Label>
                <Switch
                  id="advancedFilters"
                  checked={useAdvancedFilters}
                  onCheckedChange={(checked) => {
                    setUseAdvancedFilters(checked);
                    if (!checked) {
                      // Reset advanced filters when switching to basic mode
                      setDateRange({ from: undefined, to: undefined });
                    }
                  }}
                />
              </div>
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

            <Select value={staffFilter} onValueChange={setStaffFilter}>
              <SelectTrigger className="w-[180px]">
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
              <SelectTrigger className="w-[180px]">
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

            {getActiveFiltersCount() > 0 && (
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
            
            {useAdvancedFilters && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(true)}
                  className="h-9"
                >
                  <Sliders className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
                
                <Dialog open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Advanced Filters</DialogTitle>
                      <DialogDescription>
                        Configure advanced filters for appointments
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Time Range</Label>
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
                          <div className="flex items-center justify-between">
                            <Label>Price Range (${priceRange?.[0]} - ${priceRange?.[1]})</Label>
                          </div>
                          <Slider
                            value={priceRange || [0, 100]}
                            min={0}
                            max={100}
                            step={5}
                            onValueChange={(value) => setPriceRange(value as [number, number])}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Duration Range ({durationRange?.[0]} - {durationRange?.[1]} mins)</Label>
                          </div>
                          <Slider
                            value={durationRange || [15, 120]}
                            min={15}
                            max={120}
                            step={15}
                            onValueChange={(value) => setDurationRange(value as [number, number])}
                          />
                        </div>
                      </div>
                      
                      <DialogFooter className="mt-6">
                        <div className="flex gap-2 ml-auto">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              clearFilters();
                              setShowAdvancedFilters(false);
                            }}
                          >
                            Reset
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setShowAdvancedFilters(false)}
                          >
                            Apply
                          </Button>
                        </div>
                      </DialogFooter>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
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
                    onClick={() => setUseAdvancedFilters(false)}
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
                        {staffData.map((staff) => (
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
                        {serviceData.map((service) => (
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
                        {staffData.map((staff) => (
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
                        {serviceData.map((service) => (
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
        </div>
      </div>

      <AppointmentList
        appointments={filteredAppointments}
        showActions
      />

      <NewAppointmentDialog
        open={showNewAppointment}
        onOpenChange={setShowNewAppointment}
        selectedDate={selectedDate}
      />
    </div>
  );
};