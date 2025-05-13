import { format, isToday, isTomorrow, isYesterday } from 'date-fns';

/**
 * Formats a date in a human-readable way
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return 'Today';
  }
  
  if (isTomorrow(date)) {
    return 'Tomorrow';
  }
  
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  
  return format(date, 'MMM d, yyyy');
};

/**
 * Formats a time in 12-hour format
 * @param timeString - Time string in 24-hour format (HH:MM)
 * @returns Formatted time string in 12-hour format
 */
export const formatTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Formats a full datetime
 * @param dateString - ISO date string
 * @param timeString - Time string in 24-hour format (HH:MM)
 * @returns Formatted datetime string
 */
export const formatDateTime = (dateString: string, timeString: string): string => {
  return `${formatDate(dateString)} at ${formatTime(timeString)}`;
};

/**
 * Creates time slots for a day
 * @param openingTime - Opening time in 24-hour format (HH:MM)
 * @param closingTime - Closing time in 24-hour format (HH:MM)
 * @param slotDuration - Duration of each slot in minutes
 * @param breaks - Array of break periods
 * @returns Array of available time slots
 */
export const createTimeSlots = (
  openingTime: string,
  closingTime: string,
  slotDuration: number,
  breaks: { start: string; end: string }[] = []
): string[] => {
  const slots: string[] = [];
  
  const [openHour, openMinute] = openingTime.split(':').map(Number);
  const [closeHour, closeMinute] = closingTime.split(':').map(Number);
  
  const openMinutes = openHour * 60 + openMinute;
  const closeMinutes = closeHour * 60 + closeMinute;
  
  // Convert breaks to minutes
  const breakPeriods = breaks.map(breakTime => {
    const [startHour, startMinute] = breakTime.start.split(':').map(Number);
    const [endHour, endMinute] = breakTime.end.split(':').map(Number);
    
    return {
      start: startHour * 60 + startMinute,
      end: endHour * 60 + endMinute
    };
  });
  
  // Create slots
  for (let time = openMinutes; time < closeMinutes; time += slotDuration) {
    // Check if the current time falls within a break
    const isBreakTime = breakPeriods.some(
      breakPeriod => time >= breakPeriod.start && time < breakPeriod.end
    );
    
    if (!isBreakTime) {
      const hour = Math.floor(time / 60);
      const minute = time % 60;
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }
  }
  
  return slots;
};