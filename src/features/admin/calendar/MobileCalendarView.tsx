import React, { useState, useEffect } from 'react';
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
  onViewAppointment: parentOnViewAppointment,
}: MobileCalendarViewProps): JSX.Element => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);

  // Add CSS for custom scrollbar when component mounts
  useEffect(() => {
    // Create style element
    const style = document.createElement('style');
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 3px;
        height: 3px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #ddd;
        border-radius: 10px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #ccc;
      }
      
      .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #ddd transparent;
      }
    `;
    
    // Add it to the document
    document.head.appendChild(style);
    
    // Clean up
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const selectedAppointment = selectedAppointmentId 
    ? appointments.find(app => app.id === selectedAppointmentId) ?? null
    : null;

  // Function to handle opening the appointment details modal
  const handleViewAppointment = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setShowAppointmentDetails(true);
    // Also call the parent handler to maintain compatibility
    parentOnViewAppointment(appointmentId);
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

  // Header with navigation and view controls - Mobile optimized with minimal layout
  const renderHeader = () => {
    return (
      <div className="flex flex-col gap-3 mb-3">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold truncate max-w-[150px]">
            {getViewTitle()}
          </h2>
          
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="icon" onClick={goToPrevious} className="h-7 w-7 rounded-full shadow-sm">
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday} className="text-xs px-2 py-0 h-7 rounded-md shadow-sm">
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={goToNext} className="h-7 w-7 rounded-full shadow-sm">
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
            <TabsList className="grid w-full grid-cols-4 shadow-sm">
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
      <div className="grid grid-cols-7 gap-1.5 mb-2">
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
            className="border h-12 p-1 bg-background-alt rounded-md opacity-40 shadow-sm"
          />
        );
      }

      // Create cells for days in the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateStr = format(date, 'yyyy-MM-dd');
        const isToday = isSameDay(date, new Date());
        const dayAppointments = getAppointmentsForDate(date);

        cells.push(
          <div
            key={dateStr}
            className={cn(
              "border h-12 p-1.5 relative transition-all duration-200 hover:bg-muted/20",
              isToday && "bg-primary/5 border-primary",
              // Add rounded corners and additional styling
              "rounded-md active:scale-95 shadow-sm"
            )}
            onClick={() => handleDateClick(date)}
          >
            <div className="flex justify-between items-center mb-1">
                <span
                  className={cn(
                  "text-xs font-medium h-5 w-5 flex items-center justify-center",
                  isToday && "rounded-full text-primary bg-primary/10 font-bold"
                  )}
                >
                {day}
                </span>
              {dayAppointments.length > 0 && (
                <Badge variant="outline" className="h-4 text-[10px] px-1 py-0 rounded-full">
                  {dayAppointments.length}
                  </Badge>
                )}
              </div>
              
            {/* Show a small indicator if there are appointments */}
            {dayAppointments.length > 0 && (
              <div className="absolute bottom-1 left-0 right-0 flex justify-center">
                <div className="flex gap-0.5">
                  {Array.from({ length: Math.min(dayAppointments.length, 3) }).map((_, i) => (
                    <div 
                      key={i} 
                      className="h-1.5 w-1.5 rounded-full bg-primary/50"
                    />
                  ))}
                </div>
                </div>
              )}
          </div>
        );

        // Start a new row after every 7 cells
        if ((startDate + day) % 7 === 0 || day === daysInMonth) {
          const row = [...cells];
          rows.push(
            <div className="grid grid-cols-7 gap-1.5 mb-1.5" key={`row-${day}`}>
              {row}
            </div>
          );
          cells.length = 0;
        }
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
  
  // Week View - Mobile optimized
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <div className="space-y-3">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {weekDays.map((day) => {
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, selectedDate);
            
            return (
              <div 
                key={format(day, 'yyyy-MM-dd')} 
                className={cn(
                  "flex flex-col items-center justify-center py-1 rounded-md cursor-pointer transition-all duration-200",
                  isToday && "bg-primary/10",
                  isSelected && "ring-1 ring-primary",
                  "hover:bg-muted/20 active:scale-95"
                )}
                onClick={() => handleDateClick(day)}
              >
                <span className="text-xs text-muted-foreground">{format(day, 'EEE')}</span>
                <span className={cn(
                  "text-xs font-medium mt-1 h-5 w-5 flex items-center justify-center",
                  isToday && "rounded-full bg-primary/20 text-primary"
                )}>
                  {format(day, 'd')}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Appointments for selected date */}
        <div className="space-y-1 mt-2">
          <h3 className="text-sm font-medium px-1">
            {format(selectedDate, 'EEEE, MMMM d')}
          </h3>
          
          <div className="border rounded-lg overflow-hidden shadow-sm divide-y">
            {getAppointmentsForDate(selectedDate).length === 0 ? (
              <div className="py-4 text-center text-muted-foreground text-xs">
                No appointments for this day
              </div>
            ) : (
              getAppointmentsForDate(selectedDate).map((appointment) => (
                <div 
                  key={appointment.id}
                  className="p-2 hover:bg-muted/10 transition-colors active:bg-muted/20"
                  onClick={() => handleViewAppointment(appointment.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <div 
                          className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: getStatusColor(appointment.status) }}
                      />
                      <span className="text-xs font-medium">{appointment.time}</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[10px] h-4 px-1 py-0 rounded-full",
                        appointment.status === 'confirmed' && "bg-success/10 text-success border-success/30",
                        appointment.status === 'cancelled' && "bg-error/10 text-error border-error/30",
                        appointment.status === 'scheduled' && "bg-warning/10 text-warning border-warning/30"
                      )}
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                  <div className="ml-3 mt-1">
                    <div className="text-xs font-medium">{appointment.customerName}</div>
                    <div className="text-[10px] text-muted-foreground truncate max-w-[90%]">
                      {appointment.services.map(s => s.serviceName).join(', ')}
                      </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // Day View - Mobile optimized with single day focus
  const renderDayView = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM
    const dayAppointments = getAppointmentsForDate(currentDate);

    return (
      <div>
        <div className="text-center mb-3 bg-muted/10 py-2 rounded-lg shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">{format(currentDate, 'EEEE')}</div>
          <div className="text-base font-bold">{format(currentDate, 'MMMM d, yyyy')}</div>
        </div>
        
        <div className="border rounded-lg shadow-sm divide-y overflow-hidden custom-scrollbar overflow-y-auto max-h-[70vh]">
          {hours.map((hour) => {
            const hourAppointments = dayAppointments.filter(appointment => {
              const appointmentHour = parseInt(appointment.time.split(':')[0], 10);
              return appointmentHour === hour;
            });
            
            return (
              <div key={hour} className="flex items-start">
                <div className="p-2 text-xs text-muted-foreground w-10 flex-shrink-0">
                  {hour}:00
          </div>
                <div className="flex-1 min-h-[50px] p-1 hover:bg-muted/5">
                  {hourAppointments.length === 0 ? (
                    <div className="h-full"></div>
        ) : (
                    <div className="space-y-1">
                      {hourAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                          className="p-1.5 rounded-md bg-primary/10 border border-primary/20 text-xs cursor-pointer hover:bg-primary/20 transition-colors active:bg-primary/30 shadow-sm"
                  onClick={() => handleViewAppointment(appointment.id)}
                >
                  <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getStatusColor(appointment.status) }}
                      />
                              <span className="font-medium">{appointment.time}</span>
                            </div>
                            <Badge 
                              variant="outline" 
                              className="text-[9px] h-4 px-1 py-0 rounded-full"
                            >
                              {getTotalServiceDuration(appointment)} min
                            </Badge>
                          </div>
                          <div className="font-medium mt-1 truncate">
                            {appointment.customerName}
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            {getServiceNames(appointment)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
            </div>
            );
          })}
          </div>
      </div>
    );
  };

  // List View - Mobile optimized with simplified layout
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
      <div className="space-y-4 custom-scrollbar overflow-y-auto max-h-[70vh]">
        {periodAppointments.length === 0 ? (
          <div className="border rounded-lg p-4 text-center text-sm text-muted-foreground">
            No appointments scheduled
          </div>
        ) : (
          periodAppointments.map(({ date, appointments }) => (
            <div key={format(date, 'yyyy-MM-dd')} className="border rounded-lg overflow-hidden shadow-sm">
              <div className={cn(
                "px-3 py-2 font-medium text-sm border-b",
                isSameDay(date, new Date()) && "bg-primary/10"
              )}>
                {format(date, 'EEE, MMM d')}
                <Badge variant="outline" className="ml-2 text-[10px] rounded-full">
                  {appointments.length}
                </Badge>
              </div>
              <div className="divide-y">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-2 hover:bg-muted/10 transition-colors active:bg-muted/20"
                    onClick={() => handleViewAppointment(appointment.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-xs">{appointment.time}</div>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px] h-4 px-1 py-0 rounded-full",
                          appointment.status === 'confirmed' && "bg-success/10 text-success border-success/30",
                          appointment.status === 'cancelled' && "bg-error/10 text-error border-error/30",
                          appointment.status === 'scheduled' && "bg-warning/10 text-warning border-warning/30"
                        )}
                      >
                        {appointment.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div 
                        className="w-1.5 h-1.5 rounded-full" 
                          style={{ backgroundColor: getStatusColor(appointment.status) }}
                        />
                      <div className="text-xs">{appointment.customerName}</div>
                      </div>
                    <div className="text-[10px] text-muted-foreground ml-3 truncate">
                      {getServiceNames(appointment)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  // Helper functions
  const getTotalServiceDuration = (appointment: Appointment) => {
    return appointment.services.reduce((total, service) => total + service.duration, 0);
  };

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
    <div className="p-3 bg-card rounded-lg shadow-sm border">
      {renderHeader()}
      <div className="mt-3">
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
        {view === 'list' && renderListView()}
      </div>
      
      {/* Mobile appointment details modal */}
      {selectedAppointment && (
      <AppointmentDetailsModalMobile
        appointment={selectedAppointment}
        open={showAppointmentDetails}
        onOpenChange={setShowAppointmentDetails}
      />
      )}
    </div>
  );
}; 