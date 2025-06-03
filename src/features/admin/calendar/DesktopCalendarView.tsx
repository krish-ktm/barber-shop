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
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Appointment } from '@/types';
import { theme } from '@/theme/theme';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type CalendarView = 'month' | 'week' | 'day' | 'list';

interface DesktopCalendarViewProps {
  appointments: Appointment[];
  onSelectDate: (date: Date) => void;
  onViewAppointment: (appointmentId: string) => void;
}

export const DesktopCalendarView = ({
  appointments,
  onSelectDate,
  onViewAppointment,
}: DesktopCalendarViewProps): JSX.Element => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarView>('month');

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
    onSelectDate(date);
  };

  // Get title based on current view
  const getViewTitle = () => {
    let title = '';
    switch (view) {
      case 'month':
        title = format(currentDate, 'MMMM yyyy');
        break;
      case 'week': {
        const weekStart = startOfWeek(currentDate);
        const weekEnd = endOfWeek(currentDate);
        title = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
        break;
      }
      case 'day':
        title = format(currentDate, 'EEEE, MMMM d, yyyy');
        break;
      case 'list': {
        const listStart = startOfDay(currentDate);
        const listEnd = endOfDay(addDays(currentDate, 14));
        title = `${format(listStart, 'MMM d')} - ${format(listEnd, 'MMM d, yyyy')}`;
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

  // Header with navigation and view controls - Desktop optimized with all controls visible
  const renderHeader = () => {
    return (
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {getViewTitle()}
          </h2>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center mr-4">
              <Tabs defaultValue={view} onValueChange={(value) => setView(value as CalendarView)} className="w-auto">
                <TabsList>
                  <TabsTrigger value="month" className="flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" />
                    <span>Month</span>
                  </TabsTrigger>
                  <TabsTrigger value="week" className="flex items-center gap-1">
                    <LayoutGrid className="h-4 w-4" />
                    <span>Week</span>
                  </TabsTrigger>
                  <TabsTrigger value="day" className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Day</span>
                  </TabsTrigger>
                  <TabsTrigger value="list" className="flex items-center gap-1">
                    <LayoutList className="h-4 w-4" />
                    <span>List</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <Button variant="outline" size="icon" onClick={goToPrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={goToNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Month View - Desktop optimized with larger cells
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const startDate = getDay(monthStart);
    const daysInMonth = getDaysInMonth(currentDate);

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const renderDays = () => (
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map((day) => (
          <div
            key={day}
            className="h-10 flex items-center justify-center text-sm font-medium text-muted-foreground"
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
            className="border h-32 p-2 bg-background-alt rounded-md opacity-40"
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
              'border h-32 p-2 rounded-md transition-colors cursor-pointer hover:bg-background-alt relative',
              isToday && 'border-primary',
              isSelected && 'bg-background-alt border-primary-light',
            )}
            onClick={() => handleDateClick(date)}
          >
            <div className="flex justify-between items-center mb-2">
              <span
                className={cn(
                  'text-sm font-semibold rounded-full w-7 h-7 flex items-center justify-center',
                  isToday && 'bg-primary text-white'
                )}
              >
                {i}
              </span>
              {dateAppointments.length > 0 && (
                <Badge variant="outline">
                  {dateAppointments.length} appt{dateAppointments.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            
            <ScrollArea className="h-20 pr-1">
              <div className="space-y-1">
                {dateAppointments.slice(0, 4).map((appointment) => (
                  <div
                    key={appointment.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewAppointment(appointment.id);
                    }}
                    className="text-xs p-1 rounded bg-primary/10 border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors truncate flex items-center gap-1"
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getStatusColor(appointment.status) }} />
                    <span className="truncate">{appointment.time} - {appointment.customerName}</span>
                  </div>
                ))}
                {dateAppointments.length > 4 && (
                  <div className="text-xs text-center text-muted-foreground">
                    +{dateAppointments.length - 4} more
                  </div>
                )}
              </div>
            </ScrollArea>
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
              className="border h-32 p-2 bg-background-alt rounded-md opacity-40"
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

  // Week View
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

    return (
      <div className="flex flex-col">
        {/* Day headers */}
        <div className="grid grid-cols-8 mb-2 border-b">
          <div className="h-16 flex items-end justify-center p-2 font-medium text-muted-foreground">
            <span className="text-xs">Hour</span>
          </div>
          {weekDays.map((day) => {
            const isToday = isSameDay(day, new Date());
            return (
              <div 
                key={format(day, 'yyyy-MM-dd')} 
                className={cn(
                  "h-16 flex flex-col items-center justify-center border-l p-2 cursor-pointer hover:bg-background-alt",
                  isToday && "bg-primary/5 border-primary"
                )}
                onClick={() => handleDateClick(day)}
              >
                <span className="text-sm font-medium">{format(day, 'EEE')}</span>
                <span className={cn("text-lg font-semibold mt-1", isToday && "text-primary")}>{format(day, 'd')}</span>
              </div>
            );
          })}
        </div>
        
        {/* Time slots */}
        <div className="grid grid-cols-8 gap-0">
          {hours.map((hour) => (
            <React.Fragment key={hour}>
              {/* Hour column */}
              <div className="p-2 border-r text-xs text-muted-foreground h-20 flex items-start justify-end">
                {hour}:00
              </div>
              
              {/* Day columns */}
              {weekDays.map((day) => {
                const dayAppointments = getAppointmentsForTimeSlot(day, hour);
                return (
                  <div 
                    key={`${format(day, 'yyyy-MM-dd')}-${hour}`}
                    className="border-t border-l p-1 h-20 relative"
                  >
                    {dayAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="absolute inset-0 m-1 p-1 rounded bg-primary/10 border border-primary/20 
                                  text-xs cursor-pointer hover:bg-primary/20 transition-colors overflow-hidden"
                        onClick={() => onViewAppointment(appointment.id)}
                      >
                        <div className="flex items-center mb-1">
                          <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: getStatusColor(appointment.status) }} />
                          <span className="font-medium">{appointment.time}</span>
                        </div>
                        <div className="truncate">{appointment.customerName}</div>
                        <div className="truncate text-[10px] text-muted-foreground">
                          {appointment.services.map(s => s.serviceName).join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // Day View
  const renderDayView = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM
    const dayAppointments = getAppointmentsForDate(currentDate);

    return (
      <div className="flex flex-col">
        <div className="text-center mb-4">
          <div className="font-medium">{format(currentDate, 'EEEE')}</div>
          <div className="text-2xl font-bold">{format(currentDate, 'MMMM d, yyyy')}</div>
        </div>
        
        <div className="grid grid-cols-12 gap-4">
          {/* Time slots */}
          <div className="col-span-1">
            {hours.map((hour) => (
              <div 
                key={hour} 
                className="h-24 flex items-start justify-end pr-2 text-sm text-muted-foreground"
              >
                {hour}:00
              </div>
            ))}
          </div>
          
          {/* Appointments */}
          <div className="col-span-11 border-l">
            {hours.map((hour) => {
              const hourAppointments = dayAppointments.filter(appointment => {
                const appointmentHour = parseInt(appointment.time.split(':')[0], 10);
                return appointmentHour === hour;
              });
              
              return (
                <div key={hour} className="h-24 border-t relative">
                  {hourAppointments.map((appointment, idx) => (
                    <div
                      key={appointment.id}
                      className="absolute inset-y-0 p-2 m-1 rounded bg-primary/10 border border-primary/20 
                               cursor-pointer hover:bg-primary/20 transition-colors overflow-hidden"
                      style={{
                        left: `${idx * 25}%`,
                        width: 'calc(25% - 8px)',
                        maxWidth: '300px'
                      }}
                      onClick={() => onViewAppointment(appointment.id)}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getStatusColor(appointment.status) }} />
                        <span className="font-medium">{appointment.time}</span>
                      </div>
                      <div className="font-medium truncate">{appointment.customerName}</div>
                      <div className="text-xs truncate text-muted-foreground">{appointment.services.map(s => s.serviceName).join(', ')}</div>
                      <div className="text-xs mt-1">
                        Duration: {appointment.services.reduce((total, svc) => total + svc.duration, 0)} min
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // List View
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
      <div className="space-y-4">
        {periodAppointments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No appointments scheduled for this period
          </div>
        ) : (
          periodAppointments.map(({ date, appointments }) => (
            <div key={format(date, 'yyyy-MM-dd')} className="border rounded-md overflow-hidden">
              <div className={cn(
                "bg-muted/30 px-4 py-2 font-medium flex justify-between items-center border-b",
                isSameDay(date, new Date()) && "bg-primary/10"
              )}>
                <span className="text-lg">{format(date, 'EEEE, MMMM d')}</span>
                <Badge variant="outline">
                  {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <div className="divide-y">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-4 hover:bg-muted/10 cursor-pointer flex items-center gap-6"
                    onClick={() => onViewAppointment(appointment.id)}
                  >
                    <div className="flex-shrink-0 w-24">
                      <div className="text-lg font-semibold">{appointment.time}</div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.services.reduce((total, svc) => total + svc.duration, 0)} min
                      </div>
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getStatusColor(appointment.status) }} />
                        <span className="font-medium">{appointment.customerName}</span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {appointment.services.map(s => s.serviceName).join(', ')}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 text-sm">
                      <Badge variant="outline" className={cn(
                        appointment.status === 'confirmed' && "bg-success/10 text-success border-success/30",
                        appointment.status === 'cancelled' && "bg-error/10 text-error border-error/30",
                        appointment.status === 'scheduled' && "bg-warning/10 text-warning border-warning/30"
                      )}>
                        {appointment.status}
                      </Badge>
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
    <div className="p-4 bg-card rounded-lg">
      {renderHeader()}
      <div className="mt-4">
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
        {view === 'list' && renderListView()}
      </div>
    </div>
  );
}; 