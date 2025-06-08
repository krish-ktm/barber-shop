import React from 'react';
import { 
  Calendar,
  Clock,
  MoreVertical,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Scissors
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

interface AppointmentListProps {
  appointments: Appointment[];
  showActions?: boolean;
  isStaffView?: boolean;
  onViewAppointment?: (appointmentId: string) => void;
  staffList?: Staff[];
}

export const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  showActions = false,
  isStaffView = false,
  onViewAppointment,
  staffList = [],
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

  const maskEmail = (email: string = '') => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    if (!username || !domain) return 'xxxx@xxxx.xxx';
    return `${username.charAt(0)}***@${domain}`;
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
              
              {showActions && appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                <div className="flex items-center sm:self-start">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Completed
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Calendar className="mr-2 h-4 w-4" />
                        Reschedule
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancel Appointment
                      </DropdownMenuItem>
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