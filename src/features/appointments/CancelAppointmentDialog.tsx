import React from 'react';
import { XCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Appointment } from '@/types';
import { useApi } from '@/hooks/useApi';
import { updateAppointmentStatus, updateAppointmentStatusDirect } from '@/api/services/appointmentService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface CancelAppointmentDialogProps {
  appointment: Appointment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelComplete?: (appointmentId: string) => void;
}

export const CancelAppointmentDialog: React.FC<CancelAppointmentDialogProps> = ({
  appointment,
  open,
  onOpenChange,
  onCancelComplete,
}) => {
  const { toast } = useToast();
  
  // API hook for cancelling
  const {
    loading: isCancelling
  } = useApi(updateAppointmentStatus);
  
  const handleCancel = async () => {
    try {
      // Call the parent's callback with the appointment ID immediately
      if (onCancelComplete && appointment && appointment.id) {
        onCancelComplete(appointment.id);
      }
      
      // Close the dialog immediately for better UX
      onOpenChange(false);
      
      // Then make the actual API call using the direct function
      await updateAppointmentStatusDirect(appointment.id, 'cancelled');
      
      toast({
        title: 'Appointment Cancelled',
        description: 'The appointment has been successfully cancelled.',
      });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel appointment. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            Cancel Appointment
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this appointment? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-3">
          <div className="bg-muted/50 p-3 rounded-md space-y-2">
            <p className="font-medium">{appointment.customerName}</p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(appointment.date), 'MMMM d, yyyy')} at {appointment.time}
            </p>
            <p className="text-sm text-muted-foreground">
              Services: {appointment.services.map(s => s.serviceName).join(', ')}
            </p>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Cancelling this appointment will free up the time slot and notify relevant staff.
          </p>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenChange(false);
            }}
          >
            Keep Appointment
          </Button>
          <Button
            variant="destructive"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCancel();
            }}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              'Cancel Appointment'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 