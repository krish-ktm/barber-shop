import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, User, Scissors, MessageSquare, Phone, CheckCircle, XCircle, AlertTriangle, CheckCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Appointment } from '@/types';

interface AppointmentDetailsDialogProps {
  appointment: Appointment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isStaffView?: boolean;
  onStatusChange?: (appointmentId: string, status: Appointment['status']) => void;
}

export const AppointmentDetailsDialog: React.FC<AppointmentDetailsDialogProps> = ({
  appointment,
  open,
  onOpenChange,
  isStaffView = false,
  onStatusChange,
}) => {
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

  const handleUpdateStatus = (newStatus: Appointment['status'], e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Close the dialog immediately for better UX
    onOpenChange(false);
    
    // Then update the status
    if (onStatusChange) {
      // Small delay to ensure the dialog is closed first
      setTimeout(() => {
        onStatusChange(appointment.id, newStatus);
      }, 10);
    } else {
      // Fallback for components that don't provide onStatusChange
      console.log(`Update appointment ${appointment.id} status to: ${newStatus}`);
    }
  };

  const renderStatusActions = () => {
    switch (appointment.status) {
      case 'scheduled':
        return (
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="default" 
              onClick={(e) => handleUpdateStatus('confirmed', e)}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirm
            </Button>
            <Button 
              variant="outline" 
              onClick={(e) => handleUpdateStatus('completed', e)}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Complete
            </Button>
            <Button 
              variant="outline" 
              onClick={(e) => handleUpdateStatus('no-show', e)}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              No Show
            </Button>
            <Button 
              variant="destructive" 
              onClick={(e) => handleUpdateStatus('cancelled', e)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        );
      
      case 'confirmed':
        return (
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="default" 
              onClick={(e) => handleUpdateStatus('completed', e)}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Complete
            </Button>
            <Button 
              variant="outline" 
              onClick={(e) => handleUpdateStatus('no-show', e)}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              No Show
            </Button>
            <Button 
              variant="destructive" 
              onClick={(e) => handleUpdateStatus('cancelled', e)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        );
        
      case 'completed':
      case 'cancelled':
      case 'no-show':
        return null;
        
      default:
        return null;
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
            {isStaffView && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Contact</p>
                  <p className="text-sm text-muted-foreground">{appointment.customerPhone}</p>
                  <p className="text-sm text-muted-foreground">{appointment.customerEmail}</p>
                </div>
              </div>
            )}

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

            {!isStaffView && (
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Staff</p>
                  <p className="text-sm text-muted-foreground">{appointment.staffName}</p>
                </div>
              </div>
            )}

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
                        ${Number(service.price).toFixed(2)} · {service.duration} min
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between font-medium mt-2">
                    <span>Total</span>
                    <span>${Number(appointment.totalAmount).toFixed(2)}</span>
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

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between space-y-2 sm:space-y-0">
          {onStatusChange && (appointment.status === 'scheduled' || appointment.status === 'confirmed') ? (
            <>
              <div className="flex gap-2 flex-wrap">
                {renderStatusActions()}
              </div>
              <Button variant="ghost" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenChange(false);
              }}>
                Close
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenChange(false);
            }}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 