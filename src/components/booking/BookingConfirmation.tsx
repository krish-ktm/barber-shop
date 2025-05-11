import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { CheckCircle, Calendar, Clock, User, Phone, Mail, FileText, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BookingData {
  serviceId?: string;
  serviceName?: string;
  serviceDuration?: number;
  servicePrice?: number;
  barberId?: string;
  barberName?: string;
  date?: Date;
  timeSlot?: string;
  customer?: {
    name: string;
    phone: string;
    email?: string;
    notes?: string;
  };
}

interface BookingConfirmationProps {
  bookingId: string;
  bookingData: BookingData;
  onNewBooking: () => void;
}

export default function BookingConfirmation({ 
  bookingId, 
  bookingData, 
  onNewBooking 
}: BookingConfirmationProps) {
  const formatTimeDisplay = (timeSlot?: string) => {
    if (!timeSlot) return '';
    
    const [hour, minute] = timeSlot.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-50 text-green-500 mb-6">
        <CheckCircle className="h-8 w-8" />
      </div>
      
      <h2 className="text-2xl font-bold mb-2 text-center">Booking Confirmed!</h2>
      <p className="text-muted-foreground mb-6 text-center">
        Your appointment has been successfully booked. We've sent the details to your phone.
      </p>
      
      <div className="w-full max-w-md p-6 border rounded-lg mb-8">
        <div className="flex justify-between mb-6">
          <h3 className="font-semibold">Booking Details</h3>
          <span className="text-sm font-medium text-muted-foreground">#{bookingId}</span>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <Calendar className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">
                {bookingData.date ? format(bookingData.date, 'EEEE, MMMM d, yyyy') : 'Not specified'}
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Clock className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Time</p>
              <p className="font-medium">{formatTimeDisplay(bookingData.timeSlot)}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <User className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Barber</p>
              <p className="font-medium">{bookingData.barberName || 'Not specified'}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <FileText className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Service</p>
              <p className="font-medium">{bookingData.serviceName || 'Not specified'}</p>
              <p className="text-sm">${bookingData.servicePrice} • {bookingData.serviceDuration} mins</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Phone className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Contact</p>
              <p className="font-medium">{bookingData.customer?.name}</p>
              <p className="text-sm">{bookingData.customer?.phone}</p>
              {bookingData.customer?.email && (
                <p className="text-sm">{bookingData.customer.email}</p>
              )}
            </div>
          </div>
          
          {bookingData.customer?.notes && (
            <div className="flex items-start">
              <Mail className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="text-sm">{bookingData.customer.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 w-full max-w-md">
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center" 
          onClick={onNewBooking}
        >
          Book Another Appointment
        </Button>
        <Link to="/" className="w-full">
          <Button className="w-full">
            Return to Home
          </Button>
        </Link>
      </div>
      
      <div className="mt-8 p-4 border rounded-lg bg-muted/30 w-full max-w-md">
        <h4 className="font-medium mb-2 flex items-center">
          <XCircle className="h-4 w-4 text-destructive mr-2" />
          Cancellation Policy
        </h4>
        <p className="text-sm text-muted-foreground">
          Cancellations must be made at least 24 hours before your appointment to avoid a 
          cancellation fee. No-shows will be charged the full price of the service.
        </p>
      </div>
    </div>
  );
}