import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, User, Scissors, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { appointmentData } from '@/mocks';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface AppointmentDetailsDialogProps {
  appointmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AppointmentDetailsDialog: React.FC<AppointmentDetailsDialogProps> = ({
  appointmentId,
  open,
  onOpenChange,
}) => {
  // Find the appointment
  const appointment = appointmentData.find(a => a.id === appointmentId);

  if (!appointment) {
    return null;
  }

  // Status badge colors
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'secondary';
      case 'scheduled':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'no-show':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Appointment Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{appointment.customerName}</h3>
            <Badge variant={getStatusBadgeVariant(appointment.status)} className="capitalize">
              {appointment.status}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(appointment.date), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Time</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.time} - {appointment.endTime}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Staff</p>
                <p className="text-sm text-muted-foreground">{appointment.staffName}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <Scissors className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Services</p>
                <div className="space-y-1 mt-1">
                  {appointment.services.map((service) => (
                    <div key={service.serviceId} className="flex justify-between text-sm">
                      <span>{service.serviceName}</span>
                      <span className="text-muted-foreground">
                        ${service.price.toFixed(2)} · {service.duration} min
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between font-medium mt-2">
                    <span>Total</span>
                    <span>${appointment.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {appointment.notes && (
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Notes</p>
                  <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button>Edit Appointment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 