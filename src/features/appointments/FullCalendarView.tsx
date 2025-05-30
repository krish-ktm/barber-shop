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
  eachDayOfInterval,
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  isWithinInterval,
  parseISO
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CalendarDays, 
  CalendarIcon,
  LayoutGrid, 
  LayoutList
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Appointment } from '@/types';
import { theme } from '@/theme/theme';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type CalendarView = 'month' | 'week' | 'day' | 'list';

interface FullCalendarViewProps {
  appointments: Appointment[];
  onSelectDate: (date: Date) => void;
  onViewAppointment: (appointmentId: string) => void;
}

export const FullCalendarView = ({
  appointments,
  onSelectDate,
  onViewAppointment,
}: FullCalendarViewProps): JSX.Element => {
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

  // Get appointments for a specific time in day view
  const getAppointmentsForTimeSlot = (date: Date, hour: number) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const startTime = setHours(setMinutes(new Date(), 0), hour);
    const endTime = setHours(setMinutes(new Date(), 59), hour);
    
    return appointments.filter(appointment => {
      if (appointment.date !== dateStr) return false;
      
      const [appointmentHours, appointmentMinutes] = appointment.time.split(':').map(Number);
      const appointmentTime = setHours(setMinutes(new Date(), appointmentMinutes), appointmentHours);
      
      return isWithinInterval(appointmentTime, { start: startTime, end: endTime });
    });
  };

  // Header with navigation and view controls
  const renderHeader = () => {
    return (
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-wrap justify-between items-center">
          <h2 className="text-lg sm:text-xl font-bold truncate max-w-[200px] sm:max-w-none">
            {getViewTitle()}
          </h2>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="outline" size="icon" onClick={goToPrevious} className="h-7 w-7 sm:h-8 sm:w-8">
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday} className="text-xs sm:text-sm px-2 py-1 h-7 sm:h-8">
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={goToNext} className="h-7 w-7 sm:h-8 sm:w-8">
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Month View
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const startDate = getDay(monthStart);
    const daysInMonth = getDaysInMonth(currentDate);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const renderDays = () => (
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center text-xs sm:text-sm font-medium text-muted-foreground"
          >
            <span className="hidden xs:inline">{day}</span>
            <span className="xs:hidden">{day.charAt(0)}</span>
          </div>
        ))}
      </div>
    );

    const renderCells = () => {
      const rows = [];
      let cells = [];
      let day = 1;

      // Create blank cells for days before the first of the month
      for (let i = 0; i < startDate; i++) {
        cells.push(
          <div
            key={`empty-${i}`}
            className="border h-16 xs:h-20 sm:h-28 p-1 bg-background-alt rounded-md opacity-40"
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
              'border h-16 xs:h-20 sm:h-28 p-1 rounded-md transition-colors cursor-pointer hover:bg-background-alt',
              isToday && 'border-primary',
              isSelected && 'bg-background-alt border-primary-light',
            )}
            onClick={() => handleDateClick(date)}
          >
            <div className="flex justify-between items-center mb-1">
              <span
                className={cn(
                  'text-xs font-semibold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center',
                  isToday && 'bg-primary text-white'
                )}
              >
                {i}
              </span>
              {dateAppointments.length > 0 && (
                <Badge variant="outline" className="text-[10px] sm:text-xs px-1 py-0 h-4 sm:h-5">
                  {dateAppointments.length}
                </Badge>
              )}
            </div>
            
            <ScrollArea className="h-10 xs:h-14 sm:h-20 pr-1">
              <div className="space-y-1">
                {dateAppointments.slice(0, 3).map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onClick={() => onViewAppointment(appointment.id)}
                  />
                ))}
                {dateAppointments.length > 3 && (
                  <div className="text-[10px] text-muted-foreground text-center mt-1">
                    +{dateAppointments.length - 3} more
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        );

        // Start a new row after 7 days
        if ((startDate + day) % 7 === 0) {
          rows.push(
            <div key={`row-${day}`} className="grid grid-cols-7 gap-1 mb-1">
              {cells}
            </div>
          );
          cells = [];
        }
        day++;
      }

      // Add any remaining days
      if (cells.length > 0) {
        // Fill in any remaining cells
        while (cells.length < 7) {
          cells.push(
            <div
              key={`empty-end-${cells.length}`}
              className="border h-16 xs:h-20 sm:h-28 p-1 bg-background-alt rounded-md opacity-40"
            />
          );
        }
        
        rows.push(
          <div key={`row-end`} className="grid grid-cols-7 gap-1 mb-1">
            {cells}
          </div>
        );
      }

      return <div className="mb-4">{rows}</div>;
    };

    return (
      <div className="overflow-x-auto">
        {renderDays()}
        {renderCells()}
      </div>
    );
  };

  // Week View
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekDays = eachDayOfInterval({
      start: weekStart,
      end: endOfWeek(currentDate)
    });

    const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8); // 8am to 8pm

    return (
      <div className="overflow-auto">
        <div className="min-w-[640px] grid grid-cols-8 gap-1 mb-1">
          {/* Time column */}
          <div className="border-r pr-2">
            <div className="h-12 sm:h-16 flex items-end justify-end">
              <span className="text-xs text-muted-foreground font-medium"></span>
            </div>
            {timeSlots.map(hour => (
              <div key={`time-${hour}`} className="h-16 sm:h-20 md:h-24 flex items-start justify-end pr-2 pt-1">
                <span className="text-xs text-muted-foreground font-medium">
                  {hour}:00
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, index) => {
            const isToday = isSameDay(day, new Date());
            return (
              <div key={index} className="flex flex-col flex-1">
                <div 
                  className={cn(
                    "h-12 sm:h-16 border-b flex flex-col items-center justify-center cursor-pointer hover:bg-background-alt transition-colors",
                    isToday && "border-primary bg-background-alt"
                  )}
                  onClick={() => {
                    setCurrentDate(day);
                    setView('day');
                  }}
                >
                  <div className="text-xs sm:text-sm font-medium">
                    {format(day, 'EEE')}
                  </div>
                  <div 
                    className={cn(
                      "flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-semibold",
                      isToday && "bg-primary text-white"
                    )}
                  >
                    {format(day, 'd')}
                  </div>
                </div>

                {/* Time slots */}
                {timeSlots.map(hour => {
                  const dateAppointments = getAppointmentsForTimeSlot(day, hour);
                  
                  // Group appointments by their exact start time
                  const appointmentsByTime: Record<string, Appointment[]> = {};
                  dateAppointments.forEach(appointment => {
                    if (!appointmentsByTime[appointment.time]) {
                      appointmentsByTime[appointment.time] = [];
                    }
                    appointmentsByTime[appointment.time].push(appointment);
                  });
                  
                  return (
                    <div key={`slot-${hour}-${index}`} className="h-16 sm:h-20 md:h-24 border-b border-r p-1 relative">
                      {Object.entries(appointmentsByTime).map(([time, appts]) => (
                        <div key={time} className="mb-1 last:mb-0">
                          {appts.length > 1 ? (
                            <div className={cn(
                              "grid gap-1",
                              appts.length === 2 ? "grid-cols-2" : 
                              appts.length === 3 ? "grid-cols-3" : 
                              "grid-cols-4"
                            )}>
                              {appts.map(appointment => (
                                <AppointmentCard
                                  key={appointment.id}
                                  appointment={appointment}
                                  onClick={() => onViewAppointment(appointment.id)}
                                  isLarge={false}
                                  isWeekView={true}
                                />
                              ))}
                            </div>
                          ) : (
                            <AppointmentCard
                              key={appts[0].id}
                              appointment={appts[0]}
                              onClick={() => onViewAppointment(appts[0].id)}
                              isWeekView={true}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Day View
  const renderDayView = () => {
    const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8); // 8am to 8pm
    const dayAppointments = getAppointmentsForDate(currentDate);
    const isToday = isSameDay(currentDate, new Date());

    // Sort appointments by time
    dayAppointments.sort((a, b) => {
      const [hoursA, minutesA] = a.time.split(':').map(Number);
      const [hoursB, minutesB] = b.time.split(':').map(Number);
      return (hoursA * 60 + minutesA) - (hoursB * 60 + minutesB);
    });

    return (
      <div className="overflow-auto">
        <div className="mb-4">
          <h3 className={cn(
            "text-base sm:text-xl font-semibold mb-2 sm:mb-4 py-1 sm:py-2 px-2 sm:px-4 rounded-md",
            isToday && "border-l-4 border-primary pl-3 sm:pl-4"
          )}>
            {format(currentDate, 'EEEE')}
          </h3>
        </div>
        <div className="min-w-[320px] grid grid-cols-1 md:grid-cols-[80px_1fr] gap-2">
          {/* Time slots */}
          <div className="hidden md:flex flex-col border-r">
            {timeSlots.map(hour => (
              <div key={`time-${hour}`} className="h-16 sm:h-20 md:h-24 flex items-start justify-end pr-2 pt-1">
                <span className="text-xs text-muted-foreground font-medium">
                  {hour}:00
                </span>
              </div>
            ))}
          </div>

          {/* Appointment slots */}
          <div className="flex flex-col">
            {timeSlots.map(hour => {
              // Get appointments that fall within this hour
              const slotAppointments = dayAppointments.filter(appointment => {
                const [appointmentHours] = appointment.time.split(':').map(Number);
                return appointmentHours === hour;
              });

              // Group appointments by their exact start time
              const appointmentsByTime: Record<string, Appointment[]> = {};
              slotAppointments.forEach(appointment => {
                if (!appointmentsByTime[appointment.time]) {
                  appointmentsByTime[appointment.time] = [];
                }
                appointmentsByTime[appointment.time].push(appointment);
              });

              return (
                <div key={`day-slot-${hour}`} className="h-16 sm:h-20 md:h-24 border-b p-2 relative">
                  <div className="md:hidden text-xs text-muted-foreground font-medium mb-1">
                    {hour}:00
                  </div>
                  {slotAppointments.length > 0 ? (
                    <div className="space-y-1">
                      {/* Render appointments grouped by start time */}
                      {Object.entries(appointmentsByTime).map(([time, appts]) => (
                        <div key={time} className="grid grid-cols-1 gap-1">
                          {/* If multiple appointments at same time, show them side by side */}
                          {appts.length > 1 ? (
                            <div className={cn(
                              "grid gap-1",
                              appts.length === 2 ? "grid-cols-2" : 
                              appts.length === 3 ? "grid-cols-3" : 
                              "grid-cols-4"
                            )}>
                              {appts.map(appointment => (
                                <AppointmentCard
                                  key={appointment.id}
                                  appointment={appointment}
                                  onClick={() => onViewAppointment(appointment.id)}
                                  isLarge={false}
                                />
                              ))}
                            </div>
                          ) : (
                            // Single appointment at this time
                            <AppointmentCard
                              key={appts[0].id}
                              appointment={appts[0]}
                              onClick={() => onViewAppointment(appts[0].id)}
                              isLarge
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full border border-dashed rounded-md flex items-center justify-center text-xs text-muted-foreground">
                      No appointments
                    </div>
                  )}
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
    // Show appointments for the next 2 weeks
    const startDateObj = startOfDay(currentDate);
    const endDateObj = endOfDay(addDays(currentDate, 14));
    
    // Group appointments by date
    const appointmentsByDate: Record<string, Appointment[]> = {};
    
    appointments.forEach(appointment => {
      const appointmentDate = parseISO(`${appointment.date}T00:00:00`);
      
      if (isWithinInterval(appointmentDate, { start: startDateObj, end: endDateObj })) {
        if (!appointmentsByDate[appointment.date]) {
          appointmentsByDate[appointment.date] = [];
        }
        appointmentsByDate[appointment.date].push(appointment);
      }
    });
    
    // Sort dates
    const sortedDates = Object.keys(appointmentsByDate).sort();
    
    if (sortedDates.length === 0) {
      return (
        <div className="p-4 sm:p-8 text-center">
          <p className="text-muted-foreground">No appointments found for this time period.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4 sm:space-y-6">
        {sortedDates.map(dateStr => {
          const date = parseISO(`${dateStr}T00:00:00`);
          const isToday = isSameDay(date, new Date());
          const dateAppointments = appointmentsByDate[dateStr];
          
          // Sort appointments by time
          dateAppointments.sort((a, b) => {
            const timeA = a.time.split(':').map(Number);
            const timeB = b.time.split(':').map(Number);
            return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
          });
          
          return (
            <div key={dateStr} className="border rounded-md overflow-hidden">
              <div className={cn(
                "p-2 sm:p-3 font-medium flex items-center justify-between border-b text-sm sm:text-base",
                isToday && "bg-background-alt"
              )}>
                <div className="flex items-center gap-1 sm:gap-2">
                  <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  <span className="truncate">{format(date, 'EEEE, MMMM d, yyyy')}</span>
                </div>
                {isToday && <Badge className="text-xs">Today</Badge>}
              </div>
              
              <div className="divide-y">
                {dateAppointments.map(appointment => (
                  <div 
                    key={appointment.id} 
                    className="p-2 sm:p-3 hover:bg-background-alt cursor-pointer transition-colors"
                    onClick={() => onViewAppointment(appointment.id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="text-center w-12 sm:w-16 shrink-0">
                          <div className="text-xs sm:text-sm font-semibold">{appointment.time}</div>
                          <div className="text-[10px] sm:text-xs text-muted-foreground">{appointment.endTime}</div>
                        </div>
                        <div>
                          <div className="text-sm sm:text-base font-medium">{appointment.customerName}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground truncate max-w-[200px] sm:max-w-none">
                            {appointment.services.map(s => s.serviceName).join(', ')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-center mt-1 sm:mt-0">
                        <div className="text-xs sm:text-sm text-muted-foreground">{appointment.staffName.split(' ')[0]}</div>
                        <StatusBadge status={appointment.status} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-2 sm:p-4">
      {renderHeader()}
      <Tabs value={view} onValueChange={(value) => setView(value as CalendarView)} className="w-full">
        <TabsList className="w-full grid grid-cols-4 mb-2">
          <TabsTrigger value="month" className="text-xs sm:text-sm">
            <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Month</span>
          </TabsTrigger>
          <TabsTrigger value="week" className="text-xs sm:text-sm">
            <LayoutGrid className="h-3 w-3 sm:h-4 sm:w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Week</span>
          </TabsTrigger>
          <TabsTrigger value="day" className="text-xs sm:text-sm">
            <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Day</span>
          </TabsTrigger>
          <TabsTrigger value="list" className="text-xs sm:text-sm">
            <LayoutList className="h-3 w-3 sm:h-4 sm:w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">List</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="month" className="mt-2">
          {renderMonthView()}
        </TabsContent>
        <TabsContent value="week" className="mt-2">
          <div className="overflow-x-auto">
            {renderWeekView()}
          </div>
        </TabsContent>
        <TabsContent value="day" className="mt-2">
          {renderDayView()}
        </TabsContent>
        <TabsContent value="list" className="mt-2">
          {renderListView()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Component to display a single appointment in a calendar cell
const AppointmentCard: React.FC<{
  appointment: Appointment;
  onClick: () => void;
  isLarge?: boolean;
  isWeekView?: boolean;
}> = ({ appointment, onClick, isLarge = false, isWeekView = false }) => {
  const statusColors = {
    scheduled: theme.colors.primary,
    confirmed: theme.colors.success,
    completed: theme.colors.accent,
    cancelled: theme.colors.error,
    'no-show': theme.colors.warning,
  };

  const statusColor = statusColors[appointment.status] || theme.colors.primary;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            onClick={onClick}
            className={cn(
              "px-1 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] xs:text-xs truncate cursor-pointer hover:bg-card",
              isLarge ? "sm:text-sm py-0.5 sm:py-2" : "text-[10px] xs:text-xs py-0.5 sm:py-1 border-l",
              isWeekView && "min-h-[20px] sm:min-h-[24px]"
            )}
            style={{ borderLeftColor: statusColor, borderLeftWidth: isLarge ? '3px' : '2px' }}
          >
            <div className="flex items-center gap-1">
              <Clock className="h-2 w-2 sm:h-3 sm:w-3" />
              <span>{appointment.time}</span>
              <span className="hidden sm:inline">({appointment.staffName.split(' ')[0]})</span>
            </div>
            <div className="truncate font-medium">{appointment.customerName}</div>
            {isLarge && (
              <div className="text-[9px] xs:text-xs text-muted-foreground truncate mt-0.5 sm:mt-1">
                {appointment.services.map(s => s.serviceName).join(', ')}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">
          <div className="space-y-1">
            <div className="font-semibold">{appointment.customerName}</div>
            <div className="text-xs">{appointment.time} - {appointment.endTime}</div>
            <div className="text-xs">
              Staff: {appointment.staffName}
            </div>
            <div className="text-xs">
              Services: {appointment.services.map(s => s.serviceName).join(', ')}
            </div>
            <div className="text-xs capitalize">Status: {appointment.status}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Status Badge component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { label: 'Confirmed', variant: 'secondary' };
      case 'scheduled':
        return { label: 'Scheduled', variant: 'default' };
      case 'completed':
        return { label: 'Completed', variant: 'secondary' };
      case 'cancelled':
        return { label: 'Cancelled', variant: 'destructive' };
      case 'no-show':
        return { label: 'No Show', variant: 'outline' };
      default:
        return { label: status, variant: 'default' };
    }
  };

  const { label, variant } = getStatusDetails(status);

  return (
    <Badge variant={variant as 'default' | 'secondary' | 'destructive' | 'outline'} className="capitalize">
      {label}
    </Badge>
  );
}; 