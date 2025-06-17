import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { staffData } from '@/mocks';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBooking } from '../BookingContext';
import { Loader2, Scissors, User } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getBookingStaff, BookingStaff } from '@/api/services/bookingService';

interface StaffSelectionProps {
  hideHeading?: boolean;
}

export const StaffSelection: React.FC<StaffSelectionProps> = ({ hideHeading = false }) => {
  const { selectedStaffId, setSelectedStaffId, selectedServices, bookingFlow } = useBooking();
  const [staffList, setStaffList] = useState<BookingStaff[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStaff = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // If we're in service-first flow and have selected services, pass the first service ID
        const serviceId = bookingFlow === 'service-first' && selectedServices.length > 0 
          ? selectedServices[0].id 
          : undefined;
          
        const response = await getBookingStaff(serviceId);
        
        if (response.success) {
          console.log('Staff data:', response.staff);
          setStaffList(response.staff);
        } else {
          setError('Failed to load staff members');
          // Fallback to mock data
          setStaffList(staffData as unknown as BookingStaff[]);
        }
      } catch (err) {
        console.error('Error fetching staff:', err);
        setError('Failed to load staff members');
        // Fallback to mock data
        setStaffList(staffData as unknown as BookingStaff[]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaff();
  }, [bookingFlow, selectedServices]);

  // Filter staff by selected services if in service-first flow
  const availableStaff = bookingFlow === 'service-first' && selectedServices.length > 0
    ? staffList.filter(staff =>
        selectedServices.every(service => 
          staff.services.includes(service.id)
        )
      )
    : staffList;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p>Loading staff members...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {!hideHeading && (
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Choose Your Barber</h2>
          <p className="text-muted-foreground">
            Select a staff member for your appointment
          </p>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
        {availableStaff.map((staff) => (
          <Button
            key={staff.id}
            variant={selectedStaffId === staff.id ? "default" : "outline"}
            className={`w-full h-auto p-3 text-left flex items-start gap-3 ${selectedStaffId === staff.id ? "" : "hover:border-primary/50"}`}
            onClick={() => setSelectedStaffId(staff.id)}
          >
            <Avatar className="h-12 w-12 border shrink-0 mt-0.5">
              <AvatarImage src={staff.image} alt={staff.name} />
              <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between w-full">
                <span className={`font-medium truncate ${selectedStaffId === staff.id ? "text-primary-foreground" : ""}`}>
                  {staff.name}
                </span>
                <Badge 
                  variant={selectedStaffId === staff.id ? "outline" : "secondary"} 
                  className={`shrink-0 ${selectedStaffId === staff.id ? "border-primary-foreground/30 text-primary-foreground" : ""}`}
                >
                  Available
                </Badge>
              </div>
              <span className={`text-xs truncate ${selectedStaffId === staff.id 
                ? "text-primary-foreground" 
                : "text-muted-foreground"
              }`}>
                {staff.position}
              </span>
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                <Badge 
                  variant="outline"
                  className={`text-xs py-0 h-5 px-1.5 flex items-center gap-1 ${
                    selectedStaffId === staff.id 
                      ? "border-primary-foreground/30 text-primary-foreground" 
                      : ""
                  }`}
                >
                  <Scissors className="h-2.5 w-2.5" />
                  <span>{Array.isArray(staff.services) ? staff.services.length : 0}</span>
                </Badge>
                {selectedServices.length > 0 && bookingFlow === 'service-first' && (
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      selectedStaffId === staff.id 
                        ? "bg-primary-foreground/20 text-primary-foreground" 
                        : ""
                    }`}
                  >
                    All selected services
                  </Badge>
                )}
              </div>
            </div>
          </Button>
        ))}
      </div>

      {availableStaff.length === 0 && !isLoading && (
        <div className="text-center py-8 border rounded-lg p-4">
          <p className="text-muted-foreground">
            No staff members available for the selected services.
            Please choose different services or try another time.
          </p>
        </div>
      )}
    </motion.div>
  );
};