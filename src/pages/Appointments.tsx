import React, { useState } from 'react';
import { Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { PageHeader } from '@/components/layout';
import { AppointmentList } from '@/features/appointments/AppointmentList';
import { appointmentData } from '@/mocks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export const Appointments: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Get appointment count for a specific date
  const getAppointmentCount = (date: Date) => {
    return appointmentData.filter(
      appointment => appointment.date === format(date, 'yyyy-MM-dd')
    ).length;
  };

  // Navigate to previous/next day
  const goToPreviousDay = () => setSelectedDate(prev => subDays(prev, 1));
  const goToNextDay = () => setSelectedDate(prev => addDays(prev, 1));
  const goToToday = () => setSelectedDate(new Date());

  // Filter appointments by date and status
  const getFilteredAppointments = (status?: string[]) => {
    return appointmentData
      .filter((appointment) => appointment.date === format(selectedDate, 'yyyy-MM-dd'))
      .filter((appointment) => 
        status ? status.includes(appointment.status) : true
      )
      .sort((a, b) => {
        const timeA = a.time.split(':').map(Number);
        const timeB = b.time.split(':').map(Number);
        return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
      });
  };

  const upcoming = getFilteredAppointments(['scheduled', 'confirmed']);
  const completed = getFilteredAppointments(['completed']);
  const cancelled = getFilteredAppointments(['cancelled', 'no-show']);

  // Get total appointments for the selected date
  const totalAppointments = getAppointmentCount(selectedDate);

  return (
    <div>
      <PageHeader
        title="Appointments"
        description="Manage your appointments and bookings"
        action={{
          label: "New Appointment",
          onClick: () => {
            // Handle new appointment action
            alert('New appointment clicked');
          },
          icon: <Plus className="h-4 w-4 mr-2" />,
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousDay}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'justify-start text-left font-normal',
                    !selectedDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, 'PPP')
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
                  modifiers={{
                    hasAppointments: (date) => getAppointmentCount(date) > 0,
                  }}
                  modifiersStyles={{
                    hasAppointments: {
                      fontWeight: 'bold',
                      textDecoration: 'underline',
                    },
                  }}
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              size="icon"
              onClick={goToNextDay}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {!isSameDay(selectedDate, new Date()) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={goToToday}
                className="h-8"
              >
                Today
              </Button>
            )}
          </div>

          <Badge variant="secondary" className="h-8">
            {totalAppointments} appointment{totalAppointments !== 1 ? 's' : ''}
          </Badge>
        </div>
      </PageHeader>
      
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completed.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({cancelled.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          <AppointmentList 
            appointments={upcoming}
            showActions
          />
        </TabsContent>
        
        <TabsContent value="completed">
          <AppointmentList 
            appointments={completed}
          />
        </TabsContent>
        
        <TabsContent value="cancelled">
          <AppointmentList 
            appointments={cancelled}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};