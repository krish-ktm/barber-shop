import React, { useState, useRef, useEffect } from 'react';
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, addWeeks, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight, LayoutGrid, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Appointment } from '@/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { staffData } from '@/mocks';

interface CalendarViewProps {
  appointments: Appointment[];
  onViewAppointment: (id: string) => void;
  onAddAppointment: () => void;
}

type ViewType = 'week' | 'day';

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

export const CalendarView: React.FC<CalendarViewProps> = ({
  appointments,
  onViewAppointment,
  onAddAppointment,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('week');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to current time on mount
    if (scrollContainerRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      const scrollPosition = (currentHour - 8) * 96; // 96px per hour
      scrollContainerRef.current.scrollTop = scrollPosition;
    }
  }, []);

  const getDaysToShow = () => {
    if (view === 'day') {
      return [currentDate];
    }
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  };

  const navigate = (direction: 'prev' | 'next') => {
    if (view === 'day') {
      setCurrentDate(direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1));
    } else {
      setCurrentDate(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  const getAppointmentsForDateAndHour = (date: Date, hour: number) => {
    return appointments.filter(appointment => {
      const appointmentDate = parseISO(appointment.date);
      const [appointmentHour] = appointment.time.split(':').map(Number);
      return isSameDay(appointmentDate, date) && appointmentHour === hour;
    });
  };

  const renderTimeSlot = (date: Date, hour: number) => {
    const slotAppointments = getAppointmentsForDateAndHour(date, hour);
    
    if (slotAppointments.length === 0) {
      return (
        <div 
          className="h-24 border-b border-r p-1 hover:bg-accent/5 transition-colors cursor-pointer"
          onClick={onAddAppointment}
        />
      );
    }

    return (
      <div className="h-24 border-b border-r p-1 relative">
        <div className="space-y-1">
          {slotAppointments.map(appointment => (
            <button
              key={appointment.id}
              onClick={() => onViewAppointment(appointment.id)}
              className={cn(
                "w-full text-left px-2 py-1 rounded text-xs",
                "hover:bg-accent/10 transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
              )}
              style={{
                backgroundColor: staffData.find(s => s.id === appointment.staffId)?.color || '#000000',
                color: '#ffffff'
              }}
            >
              <div className="font-medium truncate">{appointment.customerName}</div>
              <div className="text-[10px] opacity-90 truncate">
                {appointment.time} • {appointment.staffName}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const days = getDaysToShow();

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={goToToday}
              className="ml-2"
            >
              Today
            </Button>
            <h2 className="text-lg font-semibold ml-4">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
          </div>

          <Tabs value={view} onValueChange={(v) => setView(v as ViewType)}>
            <TabsList>
              <TabsTrigger value="day">
                <Clock className="h-4 w-4 mr-2" />
                Day
              </TabsTrigger>
              <TabsTrigger value="week">
                <LayoutGrid className="h-4 w-4 mr-2" />
                Week
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-[auto_repeat(7,1fr)]">
          <div className="w-16" /> {/* Time column header */}
          {days.map((day, index) => (
            <div
              key={index}
              className={cn(
                "text-center py-2",
                isSameDay(day, new Date()) && "bg-accent/5 font-bold"
              )}
            >
              <div className="text-sm">{format(day, 'EEE')}</div>
              <div className="text-xl">{format(day, 'd')}</div>
            </div>
          ))}
        </div>
      </div>

      <ScrollArea ref={scrollContainerRef} className="flex-1">
        <div className="grid grid-cols-[auto_repeat(7,1fr)]">
          {/* Time labels */}
          <div className="w-16">
            {HOURS.map(hour => (
              <div key={hour} className="h-24 text-sm text-muted-foreground pr-2 text-right">
                {format(new Date().setHours(hour), 'h a')}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          {days.map((day, dayIndex) => (
            <div key={dayIndex} className="relative">
              {HOURS.map(hour => (
                <React.Fragment key={hour}>
                  {renderTimeSlot(day, hour)}
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};