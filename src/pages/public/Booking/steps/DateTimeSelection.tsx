import React from 'react';
import { motion } from 'framer-motion';
import { format, addDays, startOfDay } from 'date-fns';
import { Clock } from 'lucide-react';
import { Calendar } from './Fullcalendar';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { createTimeSlots, isShopClosed } from '@/utils/dates';
import { useBooking } from '../BookingContext';
import { businessHoursData } from '@/mocks';

interface DateTimeSelectionProps {
  onNext: () => void;
  onBack: () => void;
}

export const DateTimeSelection: React.FC<DateTimeSelectionProps> = () => {
  const { selectedDate, setSelectedDate, selectedTime, setSelectedTime, totalDuration } = useBooking();

  // Get available time slots
  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const timeSlots = createTimeSlots(
    '09:00',
    '20:00',
    30, 
    [{ start: '12:00', end: '13:00' }],
    businessHoursData.shopClosures,
    formattedDate
  );

  // Generate a consistent random seed based on the selected date
  const getDateSeed = (date: Date) => {
    return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  };

  // Determine availability based on the time slot and selected date
  const getSlotAvailability = (time: string) => {
    if (!selectedDate) return false;

    // Convert time to minutes for easier comparison
    const [hours, minutes] = time.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;

    // Make slots unavailable if they're too close to the current time
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    // If the selected date is today, make past slots unavailable
    if (selectedDate.toDateString() === now.toDateString()) {
      if (timeInMinutes <= currentTimeInMinutes + 30) {
        return false;
      }
    }

    // Check if the shop is closed on this date and time
    if (isShopClosed(formattedDate, businessHoursData.shopClosures, time)) {
      return false;
    }

    // Use the date seed to generate consistent availability
    const seed = getDateSeed(selectedDate);
    const slotIndex = timeSlots.indexOf(time);
    return (seed + slotIndex) % 3 !== 0; // Makes roughly 1/3 of slots unavailable
  };
  
  // Check if a date should be disabled in the calendar
  const isDateDisabled = (date: Date) => {
    // Disable dates in the past
    if (date < startOfDay(new Date())) {
      return true;
    }
    
    // Disable dates too far in the future (30 days)
    if (date > addDays(new Date(), 30)) {
      return true;
    }
    
    // Disable weekly days off (Sunday in this case)
    const dayOfWeek = date.getDay(); // 0 is Sunday
    if (businessHoursData.daysOff.includes(dayOfWeek)) {
      return true;
    }
    
    // Disable full-day shop closures
    const dateStr = format(date, 'yyyy-MM-dd');
    if (isShopClosed(dateStr, businessHoursData.shopClosures)) {
      return true;
    }
    
    return false;
  };

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
                disabled={isDateDisabled}
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
                const isAvailable = getSlotAvailability(time);
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