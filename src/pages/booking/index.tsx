import { useState } from 'react';
import { services } from '@/data/services';
import { barbers } from '@/data/barbers';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CalendarIcon, 
  Clock, 
  CheckCircle2,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import BookingSteps from '@/components/booking/BookingSteps';
import ServiceList from '@/components/booking/ServiceList';
import BarberList from '@/components/booking/BarberList';
import DateSelection from '@/components/booking/DateSelection';
import TimeSelection from '@/components/booking/TimeSelection';
import CustomerForm from '@/components/booking/CustomerForm';
import BookingConfirmation from '@/components/booking/BookingConfirmation';

type BookingData = {
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
};

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({});
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingId, setBookingId] = useState('');

  // Step handlers
  const selectService = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    setBookingData({
      ...bookingData,
      serviceId,
      serviceName: service?.name,
      serviceDuration: service?.duration,
      servicePrice: service?.price,
    });
    setCurrentStep(2);
  };

  const selectBarber = (barberId: string) => {
    const barber = barbers.find((b) => b.id === barberId);
    setBookingData({
      ...bookingData,
      barberId,
      barberName: barber?.name,
    });
    setCurrentStep(3);
  };

  const selectDate = (date: Date) => {
    setBookingData({
      ...bookingData,
      date,
    });
    setCurrentStep(4);
  };

  const selectTime = (timeSlot: string) => {
    setBookingData({
      ...bookingData,
      timeSlot,
    });
    setCurrentStep(5);
  };

  const submitCustomerInfo = (customerData: BookingData['customer']) => {
    setBookingData({
      ...bookingData,
      customer: customerData,
    });
    // Generate a random booking ID
    setBookingId(`BK${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`);
    setBookingComplete(true);
    setCurrentStep(6);
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetBooking = () => {
    setBookingData({});
    setBookingComplete(false);
    setCurrentStep(1);
  };

  return (
    <div className="container max-w-5xl py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Book Your Appointment</h1>
      
      {/* Progress Steps */}
      <BookingSteps currentStep={currentStep} />
      
      {/* Main Content */}
      <Card className="mt-8 border-0 shadow-md">
        <CardContent className="pt-6">
          {/* Step 1: Service Selection */}
          {currentStep === 1 && (
            <ServiceList 
              services={services} 
              onSelect={selectService} 
            />
          )}
          
          {/* Step 2: Barber Selection */}
          {currentStep === 2 && (
            <BarberList 
              barbers={barbers} 
              onSelect={selectBarber} 
              selectedService={bookingData.serviceId}
            />
          )}
          
          {/* Step 3: Date Selection */}
          {currentStep === 3 && (
            <DateSelection 
              onSelectDate={selectDate} 
              barberId={bookingData.barberId}
            />
          )}
          
          {/* Step 4: Time Selection */}
          {currentStep === 4 && (
            <TimeSelection 
              onSelectTime={selectTime} 
              barberId={bookingData.barberId}
              date={bookingData.date}
              serviceDuration={bookingData.serviceDuration}
            />
          )}
          
          {/* Step 5: Customer Information */}
          {currentStep === 5 && (
            <CustomerForm 
              onSubmit={submitCustomerInfo}
            />
          )}
          
          {/* Step 6: Confirmation */}
          {currentStep === 6 && (
            <BookingConfirmation 
              bookingId={bookingId}
              bookingData={bookingData} 
              onNewBooking={resetBooking}
            />
          )}
          
          {/* Navigation Buttons */}
          {currentStep > 1 && currentStep < 6 && (
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={goToPreviousStep}
                className="flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}