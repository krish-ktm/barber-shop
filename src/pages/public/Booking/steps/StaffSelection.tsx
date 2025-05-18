import React from 'react';
import { motion } from 'framer-motion';
import { staffData } from '@/mocks';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBooking } from '../BookingContext';

interface StaffSelectionProps {
  onNext: () => void;
  onBack: () => void;
}

export const StaffSelection: React.FC<StaffSelectionProps> = () => {
  const { selectedStaffId, setSelectedStaffId, selectedServices } = useBooking();

  // Filter staff who can perform all selected services
  const availableStaff = staffData.filter(staff =>
    selectedServices.every(service =>
      staff.services.includes(service.id)
    )
  );

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
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`cursor-pointer transition-all duration-200 ${
                selectedStaffId === staff.id
                  ? 'border-primary bg-primary/5 shadow-lg'
                  : 'hover:border-primary/50 hover:bg-muted/50'
              }`}
              onClick={() => setSelectedStaffId(staff.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={staff.image} alt={staff.name} />
                    <AvatarFallback>
                      {staff.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{staff.name}</div>
                    <div className="text-sm text-muted-foreground">{staff.position}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={staff.isAvailable ? "default" : "secondary"}>
                        {staff.isAvailable ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mt-4 line-clamp-2">
                  {staff.bio}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {availableStaff.length === 0 && (
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