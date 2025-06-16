import React from 'react';
import { formatTime } from '@/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  CheckCheck, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { updateAppointmentStatus } from '@/api/services/appointmentService';

// Define a simplified appointment type that works with both the API and mock data
export interface SimpleAppointment {
  id: string;
  customerName: string;
  staffId: string;
  staffName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  services: string[] | { serviceId: string; serviceName: string }[];
}

interface AppointmentListProps {
  appointments: SimpleAppointment[];
  title: string;
  className?: string;
  showActions?: boolean;
  onRefresh?: () => void;
}

export const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  title,
  className,
  showActions = true,
  onRefresh
}) => {
  const { toast } = useToast();
  const [loadingStates, setLoadingStates] = React.useState<Record<string, boolean>>({});

  // Status badge styles
  const getStatusStyle = (status: SimpleAppointment['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Quick actions handlers with API integration
  const handleStatusChange = async (appointmentId: string, newStatus: SimpleAppointment['status']) => {
    try {
      setLoadingStates(prev => ({ ...prev, [appointmentId]: true }));
      
      const response = await updateAppointmentStatus(appointmentId, newStatus);
      
      if (response.success) {
        toast({
          title: "Status Updated",
          description: `Appointment status changed to ${newStatus}`
        });
        
        // Refresh the data if a callback is provided
        if (onRefresh) {
          onRefresh();
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to update appointment status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast({
        title: "Error",
        description: "An error occurred while updating the appointment status",
        variant: "destructive"
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [appointmentId]: false }));
    }
  };

  const handleConfirm = (appointment: SimpleAppointment) => {
    handleStatusChange(appointment.id, 'confirmed');
  };

  const handleComplete = (appointment: SimpleAppointment) => {
    handleStatusChange(appointment.id, 'completed');
  };

  const handleCancel = (appointment: SimpleAppointment) => {
    handleStatusChange(appointment.id, 'cancelled');
  };

  const handleNoShow = (appointment: SimpleAppointment) => {
    handleStatusChange(appointment.id, 'no-show');
  };

  const handleReschedule = (appointment: SimpleAppointment) => {
    toast({
      title: "Reschedule Initiated",
      description: `Please use the appointments page to reschedule for ${appointment.customerName}`
    });
  };

  // Render action buttons based on appointment status
  const renderActions = (appointment: SimpleAppointment) => {
    if (!showActions) return null;
    
    const isLoading = loadingStates[appointment.id] || false;
    
    if (isLoading) {
      return (
        <div className="flex justify-center mt-2">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      );
    }
    
    const buttons = [];
    
    // Confirm button for scheduled appointments
    if (appointment.status === 'scheduled') {
      buttons.push(
        <TooltipProvider key="confirm">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-7 w-7" 
                onClick={() => handleConfirm(appointment)}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Confirm</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    // Complete button for scheduled/confirmed appointments
    if (appointment.status === 'scheduled' || appointment.status === 'confirmed') {
      buttons.push(
        <TooltipProvider key="complete">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-7 w-7" 
                onClick={() => handleComplete(appointment)}
              >
                <CheckCheck className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Complete</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    // No-show button for scheduled/confirmed appointments
    if (appointment.status === 'scheduled' || appointment.status === 'confirmed') {
      buttons.push(
        <TooltipProvider key="no-show">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-7 w-7" 
                onClick={() => handleNoShow(appointment)}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>No Show</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    // Cancel button for appointments that aren't already cancelled or completed
    if (appointment.status !== 'cancelled' && appointment.status !== 'completed' && appointment.status !== 'no-show') {
      buttons.push(
        <TooltipProvider key="cancel">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-7 w-7" 
                onClick={() => handleCancel(appointment)}
              >
                <XCircle className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Cancel</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    // Reschedule button for scheduled/confirmed appointments
    if (appointment.status === 'scheduled' || appointment.status === 'confirmed') {
      buttons.push(
        <TooltipProvider key="reschedule">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => handleReschedule(appointment)}
              >
                <Calendar className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reschedule</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    return buttons.length > 0 ? (
      <div className="flex gap-1 mt-2">
        {buttons}
      </div>
    ) : null;
  };

  // Helper function to get service names regardless of format
  const getServiceNames = (services: SimpleAppointment['services']) => {
    if (!services || services.length === 0) return '';
    
    if (typeof services[0] === 'string') {
      return services.join(', ');
    } else {
      return (services as { serviceId: string; serviceName: string }[])
        .map(service => service.serviceName)
        .join(', ');
    }
  };

  return (
    <Card className={cn('p-4', className)}>
      <h3 className="font-semibold mb-4">{title}</h3>
      
      {appointments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center p-4">
          No appointments to display
        </p>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="border-b pb-3 last:border-0 last:pb-0"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {appointment.customerName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <p className="font-medium">{appointment.customerName}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{formatTime(appointment.time)}</span>
                      <span>•</span>
                      <span>{appointment.staffName}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {getServiceNames(appointment.services)}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <span
                    className={cn(
                      'text-xs px-2 py-1 rounded-full',
                      getStatusStyle(appointment.status)
                    )}
                  >
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                  
                  {renderActions(appointment)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};