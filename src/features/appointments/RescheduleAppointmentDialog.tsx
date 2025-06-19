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
import { rescheduleAppointment, Appointment as ApiAppointment } from '@/api/services/appointmentService';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

// Add direct function for reschedule
import { post } from '@/api/apiClient';

// Direct function for rescheduling without loading state
const rescheduleAppointmentDirect = async (
  id: string,
  date: string,
  time: string
) => {
  return post(`/appointments/${id}/reschedule`, { date, time });
};

interface RescheduleAppointmentDialogProps {
  appointment: Appointment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRescheduleComplete?: (updatedAppointment: ApiAppointment) => void;
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
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Available time slots (in a real app, these would come from an API)
  const availableTimeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];
  
  // API hook for rescheduling
  const {
    loading: isRescheduling
  } = useApi(rescheduleAppointment);
  
  const handleReschedule = async () => {
    try {
      setIsProcessing(true);
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Create an optimistic update of the appointment
      const optimisticAppointment = {
        id: appointment.id,
        date: formattedDate,
        time: selectedTime,
        // Add missing properties required by ApiAppointment
        customer_id: appointment.customerId,
        staff_id: appointment.staffId,
        end_time: appointment.endTime,
        total_amount: appointment.totalAmount,
        customer_name: appointment.customerName,
        customer_phone: appointment.customerPhone,
        customer_email: appointment.customerEmail,
        staff_name: appointment.staffName,
        status: appointment.status,
        // Convert services to API format
        appointmentServices: appointment.services.map(service => ({
          service_id: service.serviceId,
          service_name: service.serviceName,
          price: service.price,
          duration: service.duration
        }))
      } as ApiAppointment;
      
      // Make the actual API call using the direct function
      await rescheduleAppointmentDirect(appointment.id, formattedDate, selectedTime);
      
      // Call the parent's callback with the optimistic update after successful API call
      if (onRescheduleComplete) {
        onRescheduleComplete(optimisticAppointment);
      }
      
      // Close the dialog after successful API call
      onOpenChange(false);
      
      toast({
        title: 'Appointment Rescheduled',
        description: `Appointment rescheduled to ${format(selectedDate, 'MMMM d, yyyy')} at ${selectedTime}`,
      });
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      setIsProcessing(false);
      toast({
        title: 'Error',
        description: 'Failed to reschedule appointment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Reset processing state when dialog is closed
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsProcessing(false);
    }
    onOpenChange(open);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
            
            {isProcessing && (
              <div className="flex items-center justify-center py-2 bg-muted/30 rounded-md">
                <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                <span className="text-sm">Processing rescheduling...</span>
              </div>
            )}
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Select New Date</h3>
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) => date < new Date() || date > addDays(new Date(), 60) || isProcessing}
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
                    disabled={isProcessing}
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
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleReschedule} 
            disabled={isProcessing || isRescheduling || !selectedDate || !selectedTime}
          >
            {isProcessing ? 'Rescheduling...' : 'Reschedule Appointment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 