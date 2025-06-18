import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, CheckCircle, Clock, Scissors, User, Globe } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { staffData } from '@/mocks';
import { formatCurrency } from '@/utils';
import { useBooking } from '../BookingContext';
import { useToast } from '@/hooks/use-toast';
import { createBooking, BookingRequest, BookingResponse, getStaffDetails, BookingStaff } from '@/api/services/bookingService';

export const BookingConfirmation: React.FC = () => {
  const { toast } = useToast();
  const { 
    selectedStaffId, 
    selectedServices, 
    selectedDate, 
    selectedTime, 
    customerDetails, 
    totalDuration, 
    totalPrice,
    setSelectedServices,
    setSelectedStaffId,
    setSelectedDate,
    setSelectedTime,
    setFirstSelection,
    setBookingFlow,
    setCustomerDetails
  } = useBooking();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookingTimezone, setBookingTimezone] = useState<string | null>(null);
  const [bookingResponse, setBookingResponse] = useState<BookingResponse | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<BookingStaff | null>(null);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);

  // Get client timezone
  const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Fetch selected staff details
  useEffect(() => {
    const fetchStaffDetails = async () => {
      if (!selectedStaffId) return;
      
      setIsLoadingStaff(true);
      try {
        // Try to get staff details from API
        const response = await getStaffDetails(selectedStaffId);
        
        if (response && response.success && response.staff) {
          setSelectedStaff(response.staff);
        } else {
          // Fallback to mock data
          const mockStaff = staffData.find(staff => staff.id === selectedStaffId);
          setSelectedStaff(mockStaff as unknown as BookingStaff || null);
        }
      } catch (error) {
        console.error("Error fetching staff details:", error);
        // Fallback to mock data
        const mockStaff = staffData.find(staff => staff.id === selectedStaffId);
        setSelectedStaff(mockStaff as unknown as BookingStaff || null);
      } finally {
        setIsLoadingStaff(false);
      }
    };

    fetchStaffDetails();
  }, [selectedStaffId]);

  const handleSubmitBooking = async () => {
    if (!selectedStaffId || !selectedServices.length || !selectedDate || !selectedTime || !customerDetails) {
      toast({
        title: "Missing information",
        description: "Please complete all required fields before confirming your booking.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Format date for API
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');

      // Create booking request
      const bookingRequest: BookingRequest = {
        customer_name: customerDetails.name,
        customer_phone: customerDetails.phone,
        service_id: selectedServices[0].id, // For now, just use the first service
        staff_id: selectedStaffId,
        date: formattedDate,
        time: selectedTime,
        timezone: clientTimezone
      };

      // Only add email if it's provided and valid
      if (customerDetails.email && customerDetails.email.includes('@')) {
        bookingRequest.customer_email = customerDetails.email;
      }

      // Add notes if provided
      if (customerDetails.notes) {
        bookingRequest.notes = customerDetails.notes;
      }

      // Submit booking to API
      const response = await createBooking(bookingRequest);

      if (response.success) {
        setIsSuccess(true);
        setBookingId(response.appointment.id);
        if (response.appointment.timezone) {
          setBookingTimezone(response.appointment.timezone);
        }
        setBookingResponse(response);
        toast({
          title: "Booking confirmed!",
          description: "Your appointment has been successfully booked.",
        });
      } else {
        throw new Error("Failed to create booking");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      toast({
        title: "Booking failed",
        description: "There was a problem creating your booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartOver = () => {
    // Reset all booking state
    setSelectedServices([]);
    setSelectedStaffId(null);
    setSelectedDate(undefined);
    setSelectedTime(null);
    setFirstSelection(null);
    setBookingFlow(null);
    setCustomerDetails({
      name: '',
      email: '',
      phone: '',
      notes: ''
    });
  };

  // Format time for display in 12-hour format
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

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center py-8 space-y-6 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
          <p className="text-muted-foreground">
            Your appointment has been successfully booked.
          </p>
          {bookingId && (
            <p className="text-sm font-medium mt-2">
              Booking ID: {bookingId}
            </p>
          )}
        </div>
        
        <div className="w-full max-w-md p-6 border rounded-lg bg-card mt-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium">{format(selectedDate!, 'MMMM d, yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time:</span>
              <span className="font-medium">
                {bookingResponse?.appointment?.display_time || formatDisplayTime(selectedTime!)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service:</span>
              <span className="font-medium">{selectedServices[0].name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Staff:</span>
              <span className="font-medium">{selectedStaff?.name || "Selected Staff"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Timezone:</span>
              <span className="font-medium">{bookingTimezone || clientTimezone}</span>
            </div>
          </div>
        </div>
        
        <Button onClick={handleStartOver} className="mt-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
          Book Another Appointment
        </Button>
      </motion.div>
    );
  }

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
          Please review your booking details before confirming
        </p>
      </div>

      <div className="space-y-6">
        <div className="border rounded-lg p-4 space-y-4 bg-card/50 shadow-sm">
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium">Date & Time</h3>
              <p className="text-sm text-muted-foreground">
                {selectedDate && format(selectedDate, 'MMMM d, yyyy')} at {selectedTime && formatDisplayTime(selectedTime)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium">Duration</h3>
              <p className="text-sm text-muted-foreground">{totalDuration} minutes</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Globe className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium">Timezone</h3>
              <p className="text-sm text-muted-foreground">
                {bookingTimezone || clientTimezone}
                {clientTimezone !== bookingTimezone && (
                  <span className="block text-xs">(Your timezone: {clientTimezone})</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4 space-y-4 bg-card/50 shadow-sm">
          <div className="flex items-center gap-4">
            <Scissors className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium">Services</h3>
            </div>
          </div>
          
          <div className="pl-9 space-y-3">
            {selectedServices.map((service) => (
              <div key={service.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{service.name}</p>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{service.duration} min</span>
                  </div>
                </div>
                <span className="font-medium">{formatCurrency(service.price)}</span>
              </div>
            ))}
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Total</span>
              <span className="font-bold text-lg">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Enhanced Staff Card */}
        <div className="border rounded-lg p-4 bg-card/50 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <User className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium">Staff</h3>
            </div>
          </div>
          
          {isLoadingStaff ? (
            <div className="flex justify-center py-4">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-muted h-12 w-12"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ) : selectedStaff ? (
            <div className="pl-9">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border">
                  <AvatarImage src={selectedStaff.image} alt={selectedStaff.name} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedStaff.name?.charAt(0) || <User className="h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedStaff.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedStaff.position}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="pl-9 text-muted-foreground">No staff selected</div>
          )}
        </div>

        <div className="border rounded-lg p-4 space-y-4 bg-card/50 shadow-sm">
          <div className="flex items-center gap-4">
            <User className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium">Customer Details</h3>
            </div>
          </div>
          
          <div className="pl-9 space-y-2">
            <div className="grid grid-cols-[100px_1fr]">
              <span className="text-muted-foreground">Name:</span>
              <span>{customerDetails.name}</span>
            </div>
            {customerDetails.email && (
              <div className="grid grid-cols-[100px_1fr]">
                <span className="text-muted-foreground">Email:</span>
                <span>{customerDetails.email}</span>
              </div>
            )}
            <div className="grid grid-cols-[100px_1fr]">
              <span className="text-muted-foreground">Phone:</span>
              <span>{customerDetails.phone}</span>
            </div>
            {customerDetails.notes && (
              <div className="grid grid-cols-[100px_1fr]">
                <span className="text-muted-foreground">Notes:</span>
                <span>{customerDetails.notes}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button 
          onClick={handleSubmitBooking} 
          disabled={isSubmitting} 
          className="w-full h-12 text-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md"
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Processing...
            </>
          ) : (
            'Confirm Booking'
          )}
        </Button>
      </div>
    </motion.div>
  );
};