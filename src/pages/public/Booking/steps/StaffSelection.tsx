import React, { useState, useEffect, useRef } from 'react';
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
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    const fetchStaff = async () => {
      // Skip fetching if we've already fetched staff data and no service selection has changed
      if (hasFetchedRef.current && !(bookingFlow === 'service-first' && selectedServices.length > 0)) {
        return;
      }
      
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
        hasFetchedRef.current = true;
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

  // Handle staff selection without memoization to prevent unnecessary re-renders
  const handleStaffSelect = (staffId: string) => {
    setSelectedStaffId(staffId);
  };

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
        {availableStaff.map((staff) => {
          const isSelected = selectedStaffId === staff.id;
          return (
            <motion.div
              key={`staff-${staff.id}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant={isSelected ? "default" : "outline"}
                className={`w-full h-auto p-3 text-left flex items-start gap-3 transition-all duration-200 ${
                  isSelected 
                    ? "bg-gradient-to-r from-primary to-primary/90 shadow-md" 
                    : "hover:border-primary/50 hover:shadow-sm"
                }`}
                onClick={(e) => {
                  e.preventDefault(); // Prevent default button behavior
                  e.stopPropagation(); // Stop event propagation
                  handleStaffSelect(staff.id);
                }}
                type="button" // Explicitly set type to button
              >
                <Avatar className={`h-12 w-12 border shrink-0 mt-0.5 ${isSelected ? "ring-2 ring-primary-foreground/30" : ""}`}>
                  <AvatarImage src={staff.image} alt={staff.name} />
                  <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between w-full">
                    <span className={`font-medium truncate ${isSelected ? "text-primary-foreground" : ""}`}>
                      {staff.name}
                    </span>
                    <Badge 
                      variant={isSelected ? "outline" : "secondary"} 
                      className={`shrink-0 ${
                        isSelected 
                          ? "border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10" 
                          : ""
                      }`}
                    >
                      Available
                    </Badge>
                  </div>
                  <span className={`text-xs truncate ${
                    isSelected 
                      ? "text-primary-foreground/90" 
                      : "text-muted-foreground"
                  }`}>
                    {staff.position}
                  </span>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    <Badge 
                      variant="outline"
                      className={`text-xs py-0 h-5 px-1.5 flex items-center gap-1 ${
                        isSelected 
                          ? "border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10" 
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
                          isSelected 
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
            </motion.div>
          );
        })}
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