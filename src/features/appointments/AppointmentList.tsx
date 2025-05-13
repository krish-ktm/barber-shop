import React from 'react';
import { format } from 'date-fns';
import { 
  Calendar,
  Clock,
  MoreVertical,
  Phone,
  Mail,
  CheckCircle,
  XCircle
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
import { staffData } from '@/mocks';
import { formatTime, formatCurrency } from '@/utils';

interface AppointmentListProps {
  appointments: Appointment[];
  showActions?: boolean;
}

export const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  showActions = false,
}) => {
  // Get staff image
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

  if (appointments.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No appointments found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <Card key={appointment.id} className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={getStaffImage(appointment.staffId)} />
                <AvatarFallback>
                  {appointment.staffName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold">{appointment.customerName}</h3>
                  <Badge variant="outline" className={getStatusStyle(appointment.status)}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>{format(new Date(appointment.date), 'MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>{formatTime(appointment.time)} - {formatTime(appointment.endTime)}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4" />
                    <span>{appointment.customerPhone}</span>
                  </div>
                  {appointment.customerEmail && (
                    <div className="flex items-center">
                      <Mail className="mr-2 h-4 w-4" />
                      <span>{appointment.customerEmail}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
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
            </div>
            
            {showActions && appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
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
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};