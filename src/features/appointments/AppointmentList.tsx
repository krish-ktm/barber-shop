import React from 'react';
import { 
  Calendar,
  Clock,
  MoreVertical,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Scissors,
  CheckCheck,
  AlertTriangle
} from 'lucide-react';
import { Appointment } from '@/types';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { formatTime, formatCurrency } from '@/utils';
import { Staff } from '@/api/services/appointmentService';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface AppointmentListProps {
  appointments: Appointment[];
  showActions?: boolean;
  isStaffView?: boolean;
  onViewAppointment?: (appointmentId: string) => void;
  staffList?: Staff[];
  onStatusChange?: (appointmentId: string, status: Appointment['status']) => void;
}

export const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  showActions = false,
  isStaffView = false,
  onViewAppointment,
  staffList = [],
  onStatusChange,
}) => {
  const getStaffImage = (staffId: string) => {
    const staff = staffList.find(s => s.id === staffId);
    return staff?.avatar || null;
  };

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

  const maskPhoneNumber = (phone: string) => {
    return `XXX-XXX-${phone.slice(-4)}`;
  };

  const maskEmail = (email: string | undefined | null = ''): string => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    if (!username || !domain) return 'xxxx@xxxx.xxx';
    return `${username.charAt(0)}***@${domain}`;
  };

  // Render action buttons based on appointment status
  const renderStatusButtons = (appointment: Appointment) => {
    if (!showActions || !onStatusChange) return null;
    
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
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(appointment.id, 'confirmed');
                    }}
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
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
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(appointment.id, 'cancelled');
                    }}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Cancel</TooltipContent>
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
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(appointment.id, 'completed');
                    }}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(appointment.id, 'no-show');
                    }}
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>No Show</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(appointment.id, 'cancelled');
                    }}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Cancel</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
        
      default:
        return null;
    }
  };

  if (appointments.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
          <Calendar className="h-12 w-12 mb-2" />
          <p className="font-medium">No appointments found</p>
          <p className="text-sm">Try adjusting your filters or selecting a different date</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <Card 
          key={appointment.id} 
          className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onViewAppointment && onViewAppointment(appointment.id)}
        >
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start space-x-4">
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarImage src={getStaffImage(appointment.staffId)} />
                  <AvatarFallback>
                    {appointment.staffName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold truncate">{appointment.customerName}</h3>
                    <Badge variant="outline" className={getStatusStyle(appointment.status)}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 shrink-0" />
                      <span>{formatTime(appointment.time)} - {formatTime(appointment.endTime)}</span>
                    </div>
                    {!isStaffView && (
                      <div className="flex items-center">
                        <Scissors className="mr-2 h-4 w-4 shrink-0" />
                        <span>{appointment.staffName}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Phone className="mr-2 h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {!isStaffView ? appointment.customerPhone : maskPhoneNumber(appointment.customerPhone)}
                      </span>
                    </div>
                    {appointment.customerEmail && (
                      <div className="flex items-center">
                        <Mail className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">
                          {!isStaffView ? appointment.customerEmail : maskEmail(appointment.customerEmail)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {showActions && (
                <div className="flex items-center sm:self-start">
                  {renderStatusButtons(appointment)}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      {appointment.status === 'scheduled' && (
                        <DropdownMenuItem onSelect={(e) => {
                          e.preventDefault();
                          if (onStatusChange) onStatusChange(appointment.id, 'confirmed');
                        }}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Confirm Appointment
                        </DropdownMenuItem>
                      )}
                      
                      {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                        <DropdownMenuItem onSelect={(e) => {
                          e.preventDefault();
                          if (onStatusChange) onStatusChange(appointment.id, 'completed');
                        }}>
                          <CheckCheck className="mr-2 h-4 w-4" />
                          Mark as Completed
                        </DropdownMenuItem>
                      )}
                      
                      {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                        <DropdownMenuItem onSelect={(e) => {
                          e.preventDefault();
                          if (onStatusChange) onStatusChange(appointment.id, 'no-show');
                        }}>
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Mark as No-Show
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem>
                        <Calendar className="mr-2 h-4 w-4" />
                        Reschedule
                      </DropdownMenuItem>
                      
                      {(appointment.status !== 'cancelled' && appointment.status !== 'completed') && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onSelect={(e) => {
                              e.preventDefault();
                              if (onStatusChange) onStatusChange(appointment.id, 'cancelled');
                            }}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Appointment
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Services</h4>
              <div className="space-y-1">
                {appointment.services.map((service) => (
                  <div 
                    key={service.serviceId} 
                    className="flex justify-between text-sm"
                  >
                    <span>{service.serviceName}</span>
                    <span className="text-muted-foreground">
                      {formatCurrency(service.price)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-medium pt-2 border-t mt-2">
                  <span>Total</span>
                  <span>{formatCurrency(appointment.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};