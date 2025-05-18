import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import { Calendar } from './Fullcalendar';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { createTimeSlots } from '@/utils';
import { useBooking } from '../BookingContext';

interface DateTimeSelectionProps {
  onNext: () => void;
  onBack: () => void;
}

export const DateTimeSelection: React.FC<DateTimeSelectionProps> = () => {
  const { selectedDate, setSelectedDate, selectedTime, setSelectedTime, totalDuration } = useBooking();

  // Get available time slots
  const timeSlots = createTimeSlots('09:00', '20:00', 30, [
    { start: '12:00', end: '13:00' },
  ]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Choose Date & Time</h2>
        <p className="text-muted-foreground">
          Select your preferred appointment date and time
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          variants={{
            initial: { opacity: 0, x: -20 },
            animate: { opacity: 1, x: 0 }
          }}
          initial="initial"
          animate="animate"
          className="w-full"
        >
          <div className="space-y-2">
            <h3 className="font-medium">Select Date</h3>
            <div className="p-4 border rounded-lg bg-card w-full">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="w-full"
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today || date.getDay() === 0;
                }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={{
            initial: { opacity: 0, x: 20 },
            animate: { opacity: 1, x: 0 }
          }}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
        >
          <div className="space-y-2">
            <h3 className="font-medium">Select Time</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Duration: {totalDuration} minutes
            </p>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((time) => {
                const isAvailable = Math.random() > 0.3; // Simulate availability
                return (
                  <TooltipProvider key={time}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div
                          whileHover={{ scale: isAvailable ? 1.05 : 1 }}
                          whileTap={{ scale: isAvailable ? 0.95 : 1 }}
                        >
                          <Button
                            variant={selectedTime === time ? "default" : "outline"}
                            className={`w-full ${!isAvailable && "opacity-50 cursor-not-allowed"}`}
                            onClick={() => isAvailable && setSelectedTime(time)}
                            disabled={!isAvailable}
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            {format(new Date(`2000-01-01T${time}`), 'h:mm a')}
                          </Button>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isAvailable ? 'Available' : 'Booked'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};