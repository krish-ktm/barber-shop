import React from 'react';
import { formatTime } from '@/utils';
import { Appointment } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { staffData } from '@/mocks';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Calendar, CheckCheck } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

interface AppointmentListProps {
  appointments: Appointment[];
  title: string;
  className?: string;
  showActions?: boolean;
}

export const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  title,
  className,
  showActions = true
}) => {
  const { toast } = useToast();

  // Get staff images
  const getStaffImage = (staffId: string) => {
    const staff = staffData.find(s => s.id === staffId);
    return staff?.image;
  };

  // Status badge styles
  const getStatusStyle = (status: Appointment['status']) => {
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

  // Quick actions handlers
  const handleConfirm = (appointment: Appointment) => {
    toast({
      title: "Appointment Confirmed",
      description: `Confirmed appointment for ${appointment.customerName}`
    });
  };

  const handleComplete = (appointment: Appointment) => {
    toast({
      title: "Appointment Completed",
      description: `Marked appointment for ${appointment.customerName} as completed`
    });
  };

  const handleCancel = (appointment: Appointment) => {
    toast({
      title: "Appointment Cancelled",
      description: `Cancelled appointment for ${appointment.customerName}`
    });
  };

  const handleReschedule = (appointment: Appointment) => {
    toast({
      title: "Reschedule Initiated",
      description: `Initiating reschedule for ${appointment.customerName}`
    });
  };

  // Render action buttons based on appointment status
  const renderActions = (appointment: Appointment) => {
    if (!showActions) return null;
    
    switch (appointment.status) {
      case 'scheduled':
        return (
          <div className="flex gap-1 mt-2">
            <TooltipProvider>
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
            
            <TooltipProvider>
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
            
            <TooltipProvider>
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
          </div>
        );
      
      case 'confirmed':
        return (
          <div className="flex gap-1 mt-2">
            <TooltipProvider>
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
            
            <TooltipProvider>
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
            
            <TooltipProvider>
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
          </div>
        );
        
      default:
        return null;
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
                    <AvatarImage src={getStaffImage(appointment.staffId)} />
                    <AvatarFallback>
                      {appointment.staffName
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
                    {appointment.services && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {appointment.services.map(service => service.serviceName).join(', ')}
                      </div>
                    )}
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