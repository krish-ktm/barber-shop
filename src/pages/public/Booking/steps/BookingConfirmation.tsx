import React, { useState } from 'react';
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
import { createBooking, BookingRequest } from '@/api/services/bookingService';

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

  // Get client timezone
  const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Find selected staff from mock data (will be replaced with API data)
  const selectedStaff = staffData.find(staff => staff.id === selectedStaffId);

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
        customer_email: customerDetails.email || '',
        customer_phone: customerDetails.phone,
        service_id: selectedServices[0].id, // For now, just use the first service
        staff_id: selectedStaffId,
        date: formattedDate,
        time: selectedTime,
        notes: customerDetails.notes,
        timezone: clientTimezone
      };

      // Submit booking to API
      const response = await createBooking(bookingRequest);

      if (response.success) {
        setIsSuccess(true);
        setBookingId(response.appointment.id);
        if (response.appointment.timezone) {
          setBookingTimezone(response.appointment.timezone);
        }
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
        
        <div className="w-full max-w-md p-6 border rounded-lg bg-card mt-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium">{format(selectedDate!, 'MMMM d, yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time:</span>
              <span className="font-medium">{format(new Date(`2000-01-01T${selectedTime}`), 'h:mm a')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service:</span>
              <span className="font-medium">{selectedServices[0].name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Staff:</span>
              <span className="font-medium">{selectedStaff?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Timezone:</span>
              <span className="font-medium">{bookingTimezone || clientTimezone}</span>
            </div>
          </div>
        </div>
        
        <Button onClick={handleStartOver} className="mt-6">
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
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium">Date & Time</h3>
              <p className="text-sm text-muted-foreground">
                {selectedDate && format(selectedDate, 'MMMM d, yyyy')} at {selectedTime && format(new Date(`2000-01-01T${selectedTime}`), 'h:mm a')}
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
              <p className="text-sm text-muted-foreground">{clientTimezone}</p>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-4">
            <Scissors className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium">Services</h3>
            </div>
          </div>
          
          {selectedServices.map(service => (
            <div key={service.id} className="flex items-center justify-between pl-9">
              <span className="text-sm">{service.name}</span>
              <span className="text-sm font-medium">{formatCurrency(service.price)}</span>
            </div>
          ))}
          
          <Separator />
          
          <div className="flex items-center justify-between pl-9">
            <span className="font-medium">Total</span>
            <span className="font-bold">{formatCurrency(totalPrice)}</span>
          </div>
        </div>

        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-4">
            <User className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium">Staff</h3>
            </div>
          </div>
          
          <div className="flex items-center gap-3 pl-9">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={selectedStaff?.image} alt={selectedStaff?.name} />
              <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{selectedStaff?.name}</p>
              <p className="text-xs text-muted-foreground">
                {selectedStaff ? 'Barber' : ''}
              </p>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-4">
            <User className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium">Customer Information</h3>
            </div>
          </div>
          
          <div className="space-y-2 pl-9">
            <p className="text-sm"><span className="text-muted-foreground">Name:</span> {customerDetails?.name}</p>
            <p className="text-sm"><span className="text-muted-foreground">Phone:</span> {customerDetails?.phone}</p>
            {customerDetails?.email && (
              <p className="text-sm"><span className="text-muted-foreground">Email:</span> {customerDetails.email}</p>
            )}
            {customerDetails?.notes && (
              <p className="text-sm"><span className="text-muted-foreground">Notes:</span> {customerDetails.notes}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button 
          onClick={handleSubmitBooking} 
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
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