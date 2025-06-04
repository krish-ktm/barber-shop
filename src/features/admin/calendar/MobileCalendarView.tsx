import React, { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  getDay, 
  getDaysInMonth, 
  isSameDay, 
  startOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CalendarDays, 
  LayoutGrid, 
  LayoutList
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Appointment } from '@/types';
import { theme } from '@/theme/theme';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppointmentDetailsModalMobile } from '@/features/appointments/AppointmentDetailsModalMobile';

type CalendarView = 'month' | 'week' | 'day' | 'list';

interface MobileCalendarViewProps {
  appointments: Appointment[];
  onSelectDate: (date: Date) => void;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onViewAppointment: (appointmentId: string) => void;
}

/**
 * Mobile Calendar View Component
 * 
 * Note: We receive onViewAppointment from props but intentionally don't use it
 * to avoid showing duplicate modals (parent already shows appointment details).
 * Instead, we manage our own modal state internally.
 */
export const MobileCalendarView = ({
  appointments,
  onSelectDate,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onViewAppointment,
}: MobileCalendarViewProps): JSX.Element => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);

  const selectedAppointment = selectedAppointmentId 
    ? appointments.find(app => app.id === selectedAppointmentId) ?? null
    : null;

  // Function to handle opening the appointment details modal
  const handleViewAppointment = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setShowAppointmentDetails(true);
    // Don't call the original handler to avoid showing two modals
  };

  // Navigation functions
  const goToPrevious = () => {
    switch (view) {
      case 'month':
        setCurrentDate(subMonths(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case 'day':
        setCurrentDate(subDays(currentDate, 1));
        break;
      case 'list':
        setCurrentDate(subWeeks(currentDate, 2));
        break;
    }
  };

  const goToNext = () => {
    switch (view) {
      case 'month':
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case 'day':
        setCurrentDate(addDays(currentDate, 1));
        break;
      case 'list':
        setCurrentDate(addWeeks(currentDate, 2));
        break;
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setCurrentDate(date);
    onSelectDate(date);
    setView('day');
  };

  // Get title based on current view
  const getViewTitle = () => {
    let title = '';
    switch (view) {
      case 'month':
        title = format(currentDate, 'MMM yyyy');
        break;
      case 'week': {
        const weekStart = startOfWeek(currentDate);
        const weekEnd = endOfWeek(currentDate);
        title = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`;
        break;
      }
      case 'day':
        title = format(currentDate, 'MMM d, yyyy');
        break;
      case 'list': {
        const listStart = startOfDay(currentDate);
        const listEnd = endOfDay(addDays(currentDate, 14));
        title = `${format(listStart, 'MMM d')} - ${format(listEnd, 'MMM d')}`;
        break;
      }
    }
    return title;
  };

  // Appointment filtering helpers
  const getAppointmentsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(
      (appointment) => appointment.date === dateStr
    );
  };
  
  // Get appointments for a specific time in day/week view
  const getAppointmentsForTimeSlot = (date: Date, hour: number) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(appointment => {
      if (appointment.date !== dateStr) return false;
      
      const appointmentHour = parseInt(appointment.time.split(':')[0], 10);
      return appointmentHour === hour;
    });
  };

  // Header with navigation and view controls - Mobile optimized with minimal layout
  const renderHeader = () => {
    return (
      <div className="flex flex-col gap-2 mb-2">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold truncate max-w-[150px]">
            {getViewTitle()}
          </h2>
          
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={goToPrevious} className="h-7 w-7">
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday} className="text-xs px-2 py-0 h-7">
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={goToNext} className="h-7 w-7">
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Tabs 
            value={view} 
            onValueChange={(value) => setView(value as CalendarView)} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="month" className="text-xs px-0">
                <CalendarDays className="h-3 w-3 sm:mr-1" />
                <span className="hidden xs:inline">Month</span>
              </TabsTrigger>
              <TabsTrigger value="week" className="text-xs px-0">
                <LayoutGrid className="h-3 w-3 sm:mr-1" />
                <span className="hidden xs:inline">Week</span>
              </TabsTrigger>
              <TabsTrigger value="day" className="text-xs px-0">
                <Clock className="h-3 w-3 sm:mr-1" />
                <span className="hidden xs:inline">Day</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="text-xs px-0">
                <LayoutList className="h-3 w-3 sm:mr-1" />
                <span className="hidden xs:inline">List</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    );
  };

  // Month View - Mobile optimized with minimal information
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const startDate = getDay(monthStart);
    const daysInMonth = getDaysInMonth(currentDate);
    
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    
    const renderDays = () => (
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map((day, index) => (
          <div
            key={index}
            className="h-6 flex items-center justify-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>
    );

    const renderCells = () => {
      const rows = [];
      const cells = [];

      // Create blank cells for days before the first of the month
      for (let i = 0; i < startDate; i++) {
        cells.push(
          <div
            key={`empty-${i}`}
            className="border h-12 p-1 bg-background-alt rounded-md opacity-40"
          />
        );
      }

      // Fill in the days of the month
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
        const dateAppointments = getAppointmentsForDate(date);
        const isToday = isSameDay(date, new Date());
        const isSelected = isSameDay(date, selectedDate);

        cells.push(
          <div
            key={i}
            className={cn(
              'border h-12 p-1 rounded-md transition-colors cursor-pointer hover:bg-background-alt relative',
              isToday && 'border-primary',
              isSelected && 'bg-background-alt border-primary-light',
            )}
            onClick={() => handleDateClick(date)}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    'text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center',
                    isToday && 'bg-primary text-white'
                  )}
                >
                  {i}
                </span>
                {dateAppointments.length > 0 && (
                  <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 min-w-[1rem] flex items-center justify-center">
                    {dateAppointments.length}
                  </Badge>
                )}
              </div>
              
              {/* Simplified indicator dots for appointments */}
              {dateAppointments.length > 0 && (
                <div className="flex justify-center mt-auto gap-0.5">
                  {dateAppointments.length > 0 && (
                    <div 
                      className="w-1 h-1 rounded-full" 
                      style={{ backgroundColor: getStatusColor(dateAppointments[0].status) }}
                    />
                  )}
                  {dateAppointments.length > 1 && (
                    <div 
                      className="w-1 h-1 rounded-full" 
                      style={{ backgroundColor: getStatusColor(dateAppointments[1].status) }}
                    />
                  )}
                  {dateAppointments.length > 2 && (
                    <div className="w-1 h-1 rounded-full bg-gray-400" />
                  )}
                </div>
              )}
            </div>
          </div>
        );

        // Push the row once we've added 7 cells
        if ((i + startDate) % 7 === 0) {
          rows.push(
            <div key={`row-${i}`} className="grid grid-cols-7 gap-1 mb-1">
              {cells.splice(0, 7)}
            </div>
          );
        }
      }

      // Add any remaining cells
      if (cells.length > 0) {
        // Add empty cells to complete the row
        for (let i = cells.length; i < 7; i++) {
          cells.push(
            <div
              key={`empty-end-${i}`}
              className="border h-12 p-1 bg-background-alt rounded-md opacity-40"
            />
          );
        }

        rows.push(
          <div key="row-end" className="grid grid-cols-7 gap-1 mb-1">
            {cells}
          </div>
        );
      }

      return rows;
    };

    return (
      <div>
        {renderDays()}
        {renderCells()}
      </div>
    );
  };
  
  // Week View - Mobile optimized with compact layout
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const hours = Array.from({ length: 10 }, (_, i) => i + 9); // 9 AM to 6 PM

    return (
      <div className="flex flex-col">
        {/* Day headers */}
        <div className="grid grid-cols-8 mb-1 border-b">
          <div className="h-10 flex items-end justify-center p-1 font-medium text-muted-foreground">
            <span className="text-[8px]">Hr</span>
          </div>
          {weekDays.map((day) => {
            const isToday = isSameDay(day, new Date());
            const dayNum = format(day, 'd');
            const dayOfWeek = format(day, 'E')[0]; // First letter of day
            
            return (
              <div 
                key={format(day, 'yyyy-MM-dd')} 
                className={cn(
                  "h-10 flex flex-col items-center justify-center border-l p-0.5 cursor-pointer hover:bg-background-alt",
                  isToday && "bg-primary/5 border-primary"
                )}
                onClick={() => {
                  handleDateClick(day);
                  setView('day');
                }}
              >
                <span className={cn("text-[9px] font-medium", isToday && "text-primary")}>{dayOfWeek}</span>
                <span className={cn("text-xs font-semibold", isToday && "text-primary")}>{dayNum}</span>
              </div>
            );
          })}
        </div>
        
        {/* Time slots */}
        <div className="grid grid-cols-8 gap-0">
          {hours.map((hour) => (
            <React.Fragment key={hour}>
              {/* Hour column */}
              <div className="py-0.5 px-1 border-r text-[8px] text-muted-foreground h-8 flex items-start justify-end">
                {hour}
              </div>
              
              {/* Day columns */}
              {weekDays.map((day) => {
                const dayAppointments = getAppointmentsForTimeSlot(day, hour);
                const hasAppointments = dayAppointments.length > 0;
                
                return (
                  <div 
                    key={`${format(day, 'yyyy-MM-dd')}-${hour}`}
                    className={cn(
                      "border-t border-l h-8 relative",
                      hasAppointments && "bg-primary/5"
                    )}
                    onClick={() => {
                      if (hasAppointments) {
                        setCurrentDate(day);
                        setSelectedDate(day);
                        setView('day');
                      }
                    }}
                  >
                    {hasAppointments && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: getStatusColor(dayAppointments[0].status) }}
                        />
                        {dayAppointments.length > 1 && (
                          <span className="absolute text-[7px] font-bold -mt-3 ml-2">
                            {dayAppointments.length}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // Day View - Mobile optimized
  const renderDayView = () => {
    const dayAppointments = getAppointmentsForDate(currentDate);

    return (
      <div className="flex flex-col">
        <div className="text-center mb-3">
          <div className="text-sm font-medium">{format(currentDate, 'EEEE')}</div>
          <div className="text-base font-bold">{format(currentDate, 'MMMM d, yyyy')}</div>
        </div>
        
        {dayAppointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No appointments scheduled for this day
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <div className="divide-y">
              {dayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-2 hover:bg-muted/10 cursor-pointer"
                  onClick={() => handleViewAppointment(appointment.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getStatusColor(appointment.status) }}
                      />
                      <span className="font-medium text-xs">{appointment.time}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {getTotalServiceDuration(appointment)} min
                    </span>
                  </div>
                  <div className="mt-1 text-xs">{appointment.customerName}</div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground">{getServiceNames(appointment)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // List view - more suitable for mobile than day/week views
  const renderListView = () => {
    // Get appointments for the next 14 days
    const getAppointmentsForPeriod = () => {
      const appointments14Days = [];
      for (let i = 0; i < 14; i++) {
        const date = addDays(currentDate, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const dateAppointments = appointments.filter(
          (appointment) => appointment.date === dateStr
        );
        
        if (dateAppointments.length > 0) {
          appointments14Days.push({
            date,
            appointments: dateAppointments,
          });
        }
      }
      return appointments14Days;
    };

    const periodAppointments = getAppointmentsForPeriod();

    return (
      <div className="space-y-3">
        {periodAppointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No appointments scheduled for this period
          </div>
        ) : (
          periodAppointments.map(({ date, appointments }) => (
            <div key={format(date, 'yyyy-MM-dd')} className="border rounded-md overflow-hidden">
              <div className={cn(
                "bg-muted/30 px-2 py-1 text-xs font-medium flex justify-between items-center",
                isSameDay(date, new Date()) && "bg-primary/10"
              )}>
                <span>{format(date, 'EEEE, MMM d')}</span>
                <Badge variant="outline" className="text-[9px] h-4">
                  {appointments.length}
                </Badge>
              </div>
              <div className="divide-y">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-2 hover:bg-muted/10 cursor-pointer"
                    onClick={() => handleViewAppointment(appointment.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getStatusColor(appointment.status) }}
                        />
                        <span className="font-medium text-xs">{appointment.time}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {getTotalServiceDuration(appointment)} min
                      </span>
                    </div>
                    <div className="mt-1 text-xs">{appointment.customerName}</div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">{getServiceNames(appointment)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  // Helper function to get total duration of all services
  const getTotalServiceDuration = (appointment: Appointment) => {
    return appointment.services.reduce((total, service) => total + service.duration, 0);
  };

  // Helper function to get service names
  const getServiceNames = (appointment: Appointment) => {
    return appointment.services.map(service => service.serviceName).join(', ');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return theme.colors.success;
      case 'scheduled':
        return theme.colors.warning;
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  return (
    <div className="p-2 bg-card rounded-lg">
      {renderHeader()}
      <div className="mt-2">
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
        {view === 'list' && renderListView()}
      </div>
      
      <AppointmentDetailsModalMobile
        appointment={selectedAppointment}
        open={showAppointmentDetails}
        onOpenChange={setShowAppointmentDetails}
      />
    </div>
  );
}; 