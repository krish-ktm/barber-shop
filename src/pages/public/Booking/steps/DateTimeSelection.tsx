import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, addDays, startOfDay } from 'date-fns';
import { Clock, Loader2, Info } from 'lucide-react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getBookingSlots, BookingSlot } from '@/api/services/bookingService';

export const DateTimeSelection: React.FC = () => {
  const { 
    selectedDate, 
    setSelectedDate, 
    selectedTime, 
    setSelectedTime, 
    totalDuration,
    selectedStaffId,
    selectedServices 
  } = useBooking();

  const [availableSlots, setAvailableSlots] = useState<BookingSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [businessTimezone, setBusinessTimezone] = useState<string | null>(null);
  const [slotDuration, setSlotDuration] = useState<number | null>(null);
  
  // Get client timezone
  const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Format date for API
  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  
  // Fetch available time slots when date or staff changes
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!selectedDate || !selectedStaffId || !selectedServices.length) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Use the first service for now
        const serviceId = selectedServices[0].id;
        
        const response = await getBookingSlots(
          formattedDate,
          selectedStaffId,
          serviceId
        );

        if (response.success) {
          console.log('Available slots:', response.slots);
          setAvailableSlots(response.slots);
          
          // Store business timezone if provided
          if (response.businessTimezone) {
            setBusinessTimezone(response.businessTimezone);
          }
          
          // Store slot duration if provided
          if (response.slotDuration) {
            setSlotDuration(response.slotDuration);
          }
          
          // If the currently selected time is no longer available, clear it
          if (selectedTime && !response.slots.find(slot => slot.time === selectedTime && slot.available)) {
            setSelectedTime(null);
          }
        } else {
          setError(response.message || 'Failed to fetch available time slots');
          // Fallback to mock data
          setAvailableSlots(createTimeSlots(
            '09:00',
            '20:00',
            30,
            [{ start: '12:00', end: '13:00' }],
            businessHoursData.shopClosures,
            formattedDate
          ).map(time => ({
            time,
            end_time: '', // We don't have this in mock data
            available: getSlotAvailability(time)
          })));
        }
      } catch (err) {
        console.error('Error fetching time slots:', err);
        setError('Failed to fetch available time slots');
        
        // Fallback to mock data
        setAvailableSlots(createTimeSlots(
          '09:00',
          '20:00',
          30,
          [{ start: '12:00', end: '13:00' }],
          businessHoursData.shopClosures,
          formattedDate
        ).map(time => ({
          time,
          end_time: '', // We don't have this in mock data
          available: getSlotAvailability(time)
        })));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableSlots();
  }, [selectedDate, selectedStaffId, selectedServices, formattedDate, selectedTime]);

  // Generate a consistent random seed based on the selected date
  const getDateSeed = (date: Date) => {
    return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  };

  // Determine availability based on the time slot and selected date
  // This is used as a fallback when API fails
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
    const slotIndex = createTimeSlots(
      '09:00',
      '20:00',
      30,
      [{ start: '12:00', end: '13:00' }],
      businessHoursData.shopClosures,
      formattedDate
    ).indexOf(time);
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

  // Format time for display, considering timezone
  const formatDisplayTime = (timeString: string) => {
    try {
      // Create a date object with the time string
      const dateWithTime = new Date(`2000-01-01T${timeString}`);
      // Format it in 12-hour format
      return format(dateWithTime, 'h:mm a');
    } catch (err) {
      console.error('Error formatting time:', err);
      return timeString.substring(0, 5); // Fallback to just showing HH:MM
    }
  };

  // Display time in business timezone
  const getDisplayTimeInBusinessTimezone = (slot: BookingSlot) => {
    // If the API provides formatted display times, use those
    if (slot.displayTime) {
      return slot.displayTime;
    }
    
    // Otherwise format the time ourselves
    return formatDisplayTime(slot.time);
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
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          {businessTimezone && (
            <div className="flex items-center">
              <Info className="h-3 w-3 mr-1" />
              <span>Shop timezone: {businessTimezone}</span>
            </div>
          )}
          <div className="flex items-center">
            <Info className="h-3 w-3 mr-1" />
            <span>Your timezone: {clientTimezone}</span>
          </div>
          {slotDuration && (
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>Slot duration: {slotDuration} minutes</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
              {businessTimezone && (
                <span className="ml-2">(Times shown in shop's timezone)</span>
              )}
            </p>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading available time slots...</span>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot) => (
                  <TooltipProvider key={slot.time}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div
                          whileHover={{ scale: slot.available ? 1.05 : 1 }}
                          whileTap={{ scale: slot.available ? 0.95 : 1 }}
                        >
                          <Button
                            variant={selectedTime === slot.time ? "default" : "outline"}
                            className={`w-full ${!slot.available && "opacity-50 cursor-not-allowed"}`}
                            onClick={() => slot.available && setSelectedTime(slot.time)}
                            disabled={!slot.available}
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            {getDisplayTimeInBusinessTimezone(slot)}
                          </Button>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {slot.available 
                          ? `Available (${getDisplayTimeInBusinessTimezone(slot)} - ${slot.displayEndTime || formatDisplayTime(slot.end_time)})` 
                          : 'Booked'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};