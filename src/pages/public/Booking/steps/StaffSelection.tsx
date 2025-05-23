import React from 'react';
import { motion } from 'framer-motion';
import { staffData } from '@/mocks';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBooking } from '../BookingContext';

interface StaffSelectionProps {
  onNext: () => void;
  onBack: () => void;
}

export const StaffSelection: React.FC<StaffSelectionProps> = () => {
  const { selectedStaffId, setSelectedStaffId, selectedServices, bookingFlow } = useBooking();

  // Filter staff based on selected services if in service-first flow
  const availableStaff = bookingFlow === 'service-first'
    ? staffData.filter(staff =>
        selectedServices.every(service =>
          staff.services.includes(service.id)
        )
      )
    : staffData;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Choose Your Barber</h2>
        <p className="text-muted-foreground">
          Select a staff member for your appointment
        </p>
      </div>

      <motion.div
        variants={{
          animate: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        initial="initial"
        animate="animate"
        className="grid md:grid-cols-2 gap-4"
      >
        {availableStaff.map((staff) => (
          <motion.div
            key={staff.id}
            variants={{
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 }
            }}
          >
            <Button
              variant={selectedStaffId === staff.id ? "default" : "outline"}
              className="w-full h-auto p-4 justify-between group"
              onClick={() => setSelectedStaffId(staff.id)}
              disabled={!staff.isAvailable}
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={staff.image} />
                  <AvatarFallback>
                    {staff.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="font-medium">{staff.name}</div>
                  <div className={`text-sm ${
                    selectedStaffId === staff.id
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground"
                  }`}>
                    {staff.position}
                  </div>
                  {bookingFlow === 'staff-first' && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {staff.services.length} services available
                    </div>
                  )}
                </div>
              </div>
              <Badge 
                variant={selectedStaffId === staff.id ? "secondary" : "outline"}
                className={`${
                  selectedStaffId === staff.id 
                    ? "bg-primary-foreground/10 text-primary-foreground" 
                    : "text-muted-foreground"
                }`}
              >
                {staff.isAvailable ? 'Available' : 'Unavailable'}
              </Badge>
            </Button>
          </motion.div>
        ))}
      </motion.div>

      {availableStaff.length === 0 && bookingFlow === 'service-first' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <p className="text-muted-foreground">
            No staff members available for the selected services.
            Please choose different services or try another time.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};