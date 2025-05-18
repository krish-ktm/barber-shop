import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, Clock, Scissors, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { staffData } from '@/mocks';
import { formatCurrency } from '@/utils';
import { useBooking } from '../BookingContext';
import { useToast } from '@/hooks/use-toast';

interface BookingConfirmationProps {
  onNext: () => void;
  onBack: () => void;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = () => {
  const { toast } = useToast();
  const {
    selectedServices,
    selectedStaffId,
    selectedDate,
    selectedTime,
    customerDetails,
    totalDuration,
    totalPrice,
  } = useBooking();

  const selectedStaff = staffData.find(staff => staff.id === selectedStaffId);

  const handleConfirm = () => {
    toast({
      title: 'Booking Confirmed! 🎉',
      description: 'Your appointment has been scheduled successfully.',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Confirm Your Booking</h2>
        <p className="text-muted-foreground">
          Please review your appointment details
        </p>
      </div>

      <motion.div 
        className="space-y-6"
        variants={{
          animate: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        initial="initial"
        animate="animate"
      >
        <motion.div
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 }
          }}
          className="space-y-4"
        >
          <motion.div
            className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg"
            whileHover={{ scale: 1.02 }}
          >
            <Scissors className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-medium">Selected Services</div>
              <div className="space-y-2 mt-2">
                {selectedServices.map((service) => (
                  <div key={service.id} className="flex justify-between text-sm">
                    <span>{service.name}</span>
                    <span className="text-muted-foreground">
                      {formatCurrency(service.price)}
                    </span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between text-sm font-medium">
                  <span>Total Duration:</span>
                  <span>{totalDuration} min</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Total Price:</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {selectedStaff && (
            <motion.div
              className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg"
              whileHover={{ scale: 1.02 }}
            >
              <User className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedStaff.image} />
                  <AvatarFallback>
                    {selectedStaff.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{selectedStaff.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedStaff.position}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg"
            whileHover={{ scale: 1.02 }}
          >
            <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Date & Time</div>
              <div className="text-sm text-muted-foreground">
                {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
              </div>
              <div className="text-sm text-muted-foreground">
                {selectedTime && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {format(new Date(`2000-01-01T${selectedTime}`), 'h:mm a')}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <Separator />

          <motion.div
            variants={{
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 }
            }}
            className="space-y-2"
          >
            <div className="font-medium">Customer Details</div>
            <div className="text-sm text-muted-foreground">
              <div>{customerDetails.name}</div>
              <div>{customerDetails.phone}</div>
              {customerDetails.email && <div>{customerDetails.email}</div>}
              {customerDetails.notes && (
                <div className="mt-2">
                  <span className="font-medium">Notes: </span>
                  {customerDetails.notes}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button onClick={handleConfirm} className="w-full">
          Confirm Booking
        </Button>
      </motion.div>
    </motion.div>
  );
};