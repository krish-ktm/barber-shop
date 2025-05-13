import React from 'react';
import { formatTime } from '@/utils';
import { Appointment } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { staffData } from '@/mocks';
import { cn } from '@/lib/utils';

interface AppointmentListProps {
  appointments: Appointment[];
  title: string;
  className?: string;
}

export const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  title,
  className,
}) => {
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
              className="border-b pb-3 last:border-0 last:pb-0 flex items-center justify-between"
            >
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
                </div>
              </div>
              
              <div>
                <span
                  className={cn(
                    'text-xs px-2 py-1 rounded-full',
                    getStatusStyle(appointment.status)
                  )}
                >
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};