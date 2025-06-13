import React, { useState } from 'react';
import { format, addDays } from 'date-fns';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Appointment } from '@/types';
import { useApi } from '@/hooks/useApi';
import { rescheduleAppointment } from '@/api/services/appointmentService';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RescheduleAppointmentDialogProps {
  appointment: Appointment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRescheduleComplete?: () => void;
}

export const RescheduleAppointmentDialog: React.FC<RescheduleAppointmentDialogProps> = ({
  appointment,
  open,
  onOpenChange,
  onRescheduleComplete,
}) => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(appointment.date));
  const [selectedTime, setSelectedTime] = useState<string>(appointment.time);
  
  // Available time slots (in a real app, these would come from an API)
  const availableTimeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];
  
  // API hook for rescheduling
  const {
    loading: isRescheduling,
    execute: executeReschedule
  } = useApi(rescheduleAppointment);
  
  const handleReschedule = async () => {
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      await executeReschedule(appointment.id, formattedDate, selectedTime);
      
      toast({
        title: 'Appointment Rescheduled',
        description: `Appointment rescheduled to ${format(selectedDate, 'MMMM d, yyyy')} at ${selectedTime}`,
      });
      
      onOpenChange(false);
      
      // Refresh parent component if callback provided
      if (onRescheduleComplete) {
        onRescheduleComplete();
      }
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to reschedule appointment. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <DialogDescription>
            Select a new date and time for this appointment.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Current Appointment</h3>
              <p className="text-sm text-muted-foreground">
                {format(new Date(appointment.date), 'MMMM d, yyyy')} at {appointment.time}
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Select New Date</h3>
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) => date < new Date() || date > addDays(new Date(), 60)}
                initialFocus
              />
            </div>
            
            <div className="space-y-2 pb-4">
              <h3 className="text-sm font-medium">Select New Time</h3>
              <div className="grid grid-cols-3 gap-2">
                {availableTimeSlots.map((time) => (
                  <Button
                    key={time}
                    type="button"
                    variant={selectedTime === time ? "default" : "outline"}
                    className={cn(
                      "text-center",
                      selectedTime === time && "font-semibold"
                    )}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="mt-4">
          <Button 
            variant="outline" 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleReschedule} 
            disabled={isRescheduling || !selectedDate || !selectedTime}
          >
            {isRescheduling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rescheduling...
              </>
            ) : (
              'Reschedule Appointment'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 