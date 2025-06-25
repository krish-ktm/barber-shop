import React, { useState, useEffect } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  addWeeks,
  subWeeks,
  addDays,
  subDays,
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
  LayoutList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Appointment } from '@/types';
import { theme } from '@/theme/theme';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type CalendarView = 'month' | 'week' | 'day' | 'list';

interface DesktopCalendarViewProps {
  appointments: Appointment[];
  onSelectDate?: (date: Date) => void;
  onViewAppointment: (appointmentId: string) => void;
}

export const DesktopCalendarView = ({
  appointments,
  onSelectDate,
  onViewAppointment,
}: DesktopCalendarViewProps): JSX.Element => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarView>('month');
  
  // Add CSS for custom scrollbar when component mounts
  useEffect(() => {
    // Create style element
    const style = document.createElement('style');
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
        height: 4px;
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
  
  // Navigation functions
  const goToPrevious = () => {
    let newDate: Date;
    if (view === 'month') {
      newDate = subMonths(currentDate, 1);
    } else if (view === 'week') {
      newDate = subWeeks(currentDate, 1);
    } else {
      newDate = subDays(currentDate, 1);
    }
    setCurrentDate(newDate);
    onSelectDate?.(newDate);
  };
  
  const goToNext = () => {
    let newDate: Date;
    if (view === 'month') {
      newDate = addMonths(currentDate, 1);
    } else if (view === 'week') {
      newDate = addWeeks(currentDate, 1);
    } else {
      newDate = addDays(currentDate, 1);
    }
    setCurrentDate(newDate);
    onSelectDate?.(newDate);
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
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
      <div className="flex flex-col gap-4 mb-5">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {getViewTitle()}
          </h2>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center mr-4">
              <Tabs value={view} onValueChange={(value) => setView(value as CalendarView)} className="w-auto">
                <TabsList className="shadow-sm">
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
            
            <Button variant="outline" size="icon" onClick={goToPrevious} className="rounded-full shadow-sm hover:shadow">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={goToToday} className="rounded-lg shadow-sm hover:shadow">
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={goToNext} className="rounded-full shadow-sm hover:shadow">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Month View - Desktop optimized with larger cells
  const renderMonthView = () => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const renderDays = () => (
      <div className="grid grid-cols-7 gap-2 mb-2">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="h-10 flex items-center justify-center font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>
    );

    const renderCells = () => {
      const monthStart = startOfMonth(currentDate);
      const startDate = startOfWeek(monthStart);
      const endDate = endOfWeek(addDays(monthStart, getDaysInMonth(monthStart) - 1));

      const rows = [];
      let days = [];
      let day = startDate;

      // Generate the calendar cells
      while (day <= endDate) {
        for (let i = 0; i < 7; i++) {
          const cloneDay = day;
          const formattedDate = format(cloneDay, 'yyyy-MM-dd');
          const dayAppointments = getAppointmentsForDate(cloneDay);
          const isCurrentMonth = format(currentDate, 'M') === format(cloneDay, 'M');
          const isToday = isSameDay(cloneDay, new Date());
          
          days.push(
            <div
              key={formattedDate}
              className={cn(
                "border p-1.5 h-32 relative transition-all duration-200 hover:bg-muted/20",
                !isCurrentMonth && "bg-background-alt opacity-50",
                isToday && "bg-primary/5 border-primary",
                "rounded-lg shadow-sm cursor-pointer"
              )}
              onClick={() => {
                // Notify parent about date selection (if provided)
                onSelectDate?.(cloneDay);
                // Switch to the clicked day
                setCurrentDate(cloneDay);
                setView('day');
              }}
            >
              <div className="flex justify-between">
                <span
                  className={cn(
                    "text-sm font-medium rounded-full w-6 h-6 flex items-center justify-center",
                    !isCurrentMonth && "text-muted-foreground",
                    isToday && "text-primary bg-primary/10 font-bold"
                  )}
                >
                  {format(cloneDay, 'd')}
                </span>
              </div>
              
              {/* Render appointments */}
              <div className="overflow-y-auto max-h-[80%] mt-1.5 pr-0.5 custom-scrollbar">
                {dayAppointments.slice(0, 3).map(appointment => (
                  <div
                    key={appointment.id}
                    className="mb-1.5 p-1.5 text-xs rounded-md bg-primary/10 border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors hover:shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewAppointment(appointment.id);
                    }}
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-2 h-2 rounded-full mr-1 flex-shrink-0" 
                        style={{ backgroundColor: getStatusColor(appointment.status) }} 
                      />
                      <span className="font-medium">{appointment.time}</span>
                    </div>
                    <div className="truncate">{appointment.customerName}</div>
                  </div>
                ))}
                {dayAppointments.length > 3 && (
                  <div className="text-xs text-center text-muted-foreground py-0.5 bg-muted/20 rounded-md">
                    +{dayAppointments.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );

          day = addDays(day, 1);
        }

        rows.push(
          <div key={`row-${rows.length}`} className="grid grid-cols-7 gap-2 mb-2">
            {days}
          </div>
        );

        days = [];
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
        <div className="grid grid-cols-8 mb-3 rounded-t-lg overflow-hidden border shadow-sm">
          <div className="h-16 flex items-end justify-center p-2 font-medium text-muted-foreground bg-muted/10">
            <span className="text-xs">Hour</span>
          </div>
          {weekDays.map((day) => {
            const isToday = isSameDay(day, new Date());
            
            return (
              <div 
                key={format(day, 'yyyy-MM-dd')} 
                className={cn(
                  "h-16 flex flex-col items-center justify-center p-2 cursor-pointer hover:bg-background-alt transition-colors relative",
                  isToday && "bg-primary/5",
                  "border-l"
                )}
              >
                <span className="text-sm font-medium">{format(day, 'EEE')}</span>
                <span className={cn(
                  "text-lg font-semibold mt-1 flex items-center justify-center w-8 h-8 rounded-full", 
                  isToday && "text-primary bg-primary/10"
                )}>
                  {format(day, 'd')}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Time slots */}
        <div className="grid grid-cols-8 gap-0 rounded-b-lg overflow-hidden border shadow-sm">
          {hours.map((hour, hourIndex) => (
            <React.Fragment key={hour}>
              {/* Hour column */}
              <div className={cn(
                "p-2 border-r text-xs text-muted-foreground h-28 flex items-start justify-end bg-muted/10",
                hourIndex === hours.length - 1 && "rounded-bl-lg"
              )}>
                {hour}:00
              </div>
              
              {/* Day columns */}
              {weekDays.map((day, dayIndex) => {
                const dayAppointments = getAppointmentsForTimeSlot(day, hour);
                const isLastHour = hourIndex === hours.length - 1;
                const isLastDay = dayIndex === weekDays.length - 1;
                
                return (
                  <div 
                    key={`${format(day, 'yyyy-MM-dd')}-${hour}`}
                    className={cn(
                      "border-t border-l p-1 h-28 relative hover:bg-muted/10 transition-colors",
                      isLastHour && isLastDay && "rounded-br-lg"
                    )}
                  >
                    {dayAppointments.length === 0 ? (
                      <div className="h-full w-full"></div>
                    ) : (
                      dayAppointments.map((appointment, index) => (
                        <div
                          key={appointment.id}
                          className={`p-1.5 rounded-md bg-primary/10 border border-primary/20 
                                   text-xs cursor-pointer hover:bg-primary/20 transition-colors overflow-hidden hover:shadow-sm
                                   ${index > 1 ? 'hidden md:block' : ''}`}
                          style={{
                            maxHeight: `${Math.floor(100 / Math.min(dayAppointments.length, 3))}%`
                          }}
                          onClick={() => onViewAppointment(appointment.id)}
                        >
                          <div className="flex items-center mb-0.5">
                            <div className="w-2 h-2 rounded-full mr-1 flex-shrink-0" style={{ backgroundColor: getStatusColor(appointment.status) }} />
                            <span className="font-medium truncate">{appointment.time}</span>
                          </div>
                          <div className="truncate">{appointment.customerName}</div>
                          {index === 0 && dayAppointments.length > 3 && (
                            <div className="text-[10px] text-center text-muted-foreground mt-0.5 bg-muted/20 rounded py-0.5">
                              +{dayAppointments.length - 2} more
                            </div>
                          )}
                        </div>
                      ))
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

  // Day View
  const renderDayView = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM
    const dayAppointments = getAppointmentsForDate(currentDate);

    return (
      <div className="flex flex-col">
        <div className="text-center mb-4 bg-muted/10 py-3 rounded-lg shadow-sm">
          <div className="font-medium text-muted-foreground">{format(currentDate, 'EEEE')}</div>
          <div className="text-2xl font-bold">{format(currentDate, 'MMMM d, yyyy')}</div>
        </div>
        
        <div className="grid grid-cols-12 gap-4">
          {/* Time slots */}
          <div className="col-span-1">
            {hours.map((hour, index) => (
              <div 
                key={hour} 
                className={cn(
                  "h-28 flex items-start justify-end pr-2 text-sm text-muted-foreground",
                  index === 0 && "pt-1"
                )}
              >
                {hour}:00
              </div>
            ))}
          </div>
          
          {/* Appointments */}
          <div className="col-span-11 border-l rounded-r-lg overflow-hidden shadow-sm">
            {hours.map((hour, index) => {
              const hourAppointments = dayAppointments.filter(appointment => {
                const appointmentHour = parseInt(appointment.time.split(':')[0], 10);
                return appointmentHour === hour;
              });
              
              return (
                <div key={hour} className={cn(
                  "h-28 relative hover:bg-muted/10 transition-colors",
                  index === 0 ? "rounded-tr-lg" : "border-t",
                )}>
                  {hourAppointments.map((appointment, idx) => {
                    // Calculate width based on number of appointments in this hour
                    const width = Math.min(100 / Math.max(hourAppointments.length, 2), 50);
                    
                    return (
                      <div
                        key={appointment.id}
                        className="absolute inset-y-0 py-2 px-3 m-1 rounded-lg bg-primary/10 border border-primary/20 
                                 cursor-pointer hover:bg-primary/20 transition-colors overflow-hidden flex flex-col hover:shadow"
                        style={{
                          left: `${idx * width}%`,
                          width: `calc(${width}% - 8px)`,
                          maxWidth: '350px'
                        }}
                        onClick={() => onViewAppointment(appointment.id)}
                      >
                        {/* Header */}
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: getStatusColor(appointment.status) }} />
                          <span className="font-semibold text-sm">{appointment.time}</span>
                          <Badge variant="outline" className="ml-auto text-[10px] px-1.5 py-0 h-5 whitespace-nowrap rounded-md">
                            {appointment.status}
                          </Badge>
                        </div>
                        
                        {/* Content */}
                        <div className="overflow-hidden flex-1 min-h-0">
                          <div className="font-medium text-sm mb-1 truncate">{appointment.customerName}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">
                            {appointment.services.map(s => s.serviceName).join(', ')}
                          </div>
                        </div>
                        
                        {/* Footer */}
                        <div className="mt-1 pt-1 border-t border-primary/10 flex justify-between items-center flex-shrink-0">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {appointment.services.reduce((total, svc) => total + svc.duration, 0)} min
                          </span>
                          <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1.5 -my-1 rounded-full" onClick={(e) => {
                            e.stopPropagation();
                            onViewAppointment(appointment.id);
                          }}>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
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
      <div className="space-y-4 custom-scrollbar overflow-y-auto max-h-[75vh]">
        {periodAppointments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground rounded-lg border p-8">
            No appointments scheduled for this period
          </div>
        ) : (
          periodAppointments.map(({ date, appointments }) => (
            <div key={format(date, 'yyyy-MM-dd')} className="border rounded-lg overflow-hidden shadow-sm">
              <div className={cn(
                "bg-muted/30 px-4 py-2 font-medium flex justify-between items-center border-b",
                isSameDay(date, new Date()) && "bg-primary/10"
              )}>
                <span className="text-lg">{format(date, 'EEEE, MMMM d')}</span>
                <Badge variant="outline" className="rounded-full">
                  {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <div className="divide-y">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-4 hover:bg-muted/10 transition-colors cursor-pointer flex items-center gap-6"
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
                      <div className="text-sm text-muted-foreground mt-1 truncate">
                        {appointment.services.map(s => s.serviceName).join(', ')}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 text-sm">
                      <Badge variant="outline" className={cn(
                        "rounded-full",
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
    <div className="p-6 bg-card rounded-xl shadow-sm border">
      {renderHeader()}
      <div className="mt-6">
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
        {view === 'list' && renderListView()}
      </div>
    </div>
  );
}; 