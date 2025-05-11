import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { ArrowRight, Clock } from 'lucide-react';
import { barbers } from '@/data/barbers';
import { bookings } from '@/data/bookings';

interface TimeSelectionProps {
  onSelectTime: (timeSlot: string) => void;
  barberId?: string;
  date?: Date;
  serviceDuration?: number;
}

export default function TimeSelection({ 
  onSelectTime, 
  barberId, 
  date, 
  serviceDuration = 30 
}: TimeSelectionProps) {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  // Get barber details
  const barber = barbers.find(b => b.id === barberId);
  
  // Generate time slots based on barber's working hours
  const generateTimeSlots = () => {
    if (!barber || !date) return [];
    
    const slots: string[] = [];
    const [startHour, startMinute] = barber.workHours.start.split(':').map(Number);
    const [endHour, endMinute] = barber.workHours.end.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMinute = startMinute;
    
    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      slots.push(`${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`);
      
      currentMinute += 30; // 30-minute intervals
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }
    
    return slots;
  };
  
  const timeSlots = generateTimeSlots();
  
  // Check if a time slot is booked (in a real app, this would connect to a database)
  const isTimeSlotBooked = (timeSlot: string) => {
    if (!date) return false;
    
    const dateString = format(date, 'yyyy-MM-dd');
    
    // Check if there's a booking for this barber, date, and time
    return bookings.some(booking => 
      booking.barberId === barberId &&
      booking.date === dateString &&
      booking.timeSlot === timeSlot &&
      booking.status !== 'cancelled'
    );
  };
  
  // Check if a time slot is in the past
  const isTimeSlotInPast = (timeSlot: string) => {
    if (!date) return false;
    
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [hour, minute] = timeSlot.split(':').map(Number);
    const slotDate = new Date(date);
    slotDate.setHours(hour, minute, 0, 0);
    
    // If the date is today, check if the time is in the past
    if (date.getTime() === today.getTime()) {
      return slotDate <= now;
    }
    
    return false;
  };
  
  const formatDisplayTime = (timeSlot: string) => {
    const [hour, minute] = timeSlot.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Select a Time</h2>
        <p className="text-muted-foreground">
          Choose an available time slot for {format(date || new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {timeSlots.map((timeSlot) => {
              const isBooked = isTimeSlotBooked(timeSlot);
              const isPast = isTimeSlotInPast(timeSlot);
              const isDisabled = isBooked || isPast;
              
              return (
                <Button
                  key={timeSlot}
                  variant={selectedTime === timeSlot ? "default" : "outline"}
                  disabled={isDisabled}
                  onClick={() => setSelectedTime(timeSlot)}
                  className="h-12"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDisplayTime(timeSlot)}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button
          onClick={() => selectedTime && onSelectTime(selectedTime)}
          disabled={!selectedTime}
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}