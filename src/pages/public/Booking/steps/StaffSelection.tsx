import React from 'react';
import { motion } from 'framer-motion';
import { staffData } from '@/mocks';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBooking } from '../BookingContext';
import { Scissors, User } from 'lucide-react';

export const StaffSelection: React.FC = () => {
  const { selectedStaffId, setSelectedStaffId, selectedServices, bookingFlow } = useBooking();

  // Filter staff by selected services if in service-first flow
  const availableStaff = bookingFlow === 'service-first' && selectedServices.length > 0
    ? staffData.filter(staff =>
        selectedServices.every(service => staff.services.includes(service.id))
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
                  {staff.isAvailable ? 'Available' : 'Limited'}
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
                  <span>{staff.services.length}</span>
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

      {availableStaff.length === 0 && (
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