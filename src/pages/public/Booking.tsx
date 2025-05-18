import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, User, Scissors, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { staffData, serviceData } from '@/mocks';
import { createTimeSlots, formatCurrency } from '@/utils';
import { useToast } from '@/hooks/use-toast';

const steps = [
  { id: 'service', title: 'Choose Service' },
  { id: 'staff', title: 'Select Staff' },
  { id: 'datetime', title: 'Pick Date & Time' },
  { id: 'details', title: 'Your Details' },
  { id: 'confirm', title: 'Confirm' },
];

export const Booking: React.FC = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  // Get available time slots
  const timeSlots = createTimeSlots('09:00', '20:00', 30, [
    { start: '12:00', end: '13:00' },
  ]);

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      // Submit booking
      console.log('Booking submitted:', {
        service: selectedService,
        staff: selectedStaff,
        date: selectedDate,
        time: selectedTime,
        customer: customerDetails,
      });

      toast({
        title: 'Booking Confirmed!',
        description: 'Your appointment has been scheduled successfully.',
      });

      // Reset form
      setCurrentStep(0);
      setSelectedService(null);
      setSelectedStaff(null);
      setSelectedDate(undefined);
      setSelectedTime(null);
      setCustomerDetails({
        name: '',
        email: '',
        phone: '',
        notes: '',
      });
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const isNextDisabled = () => {
    switch (currentStep) {
      case 0:
        return !selectedService;
      case 1:
        return !selectedStaff;
      case 2:
        return !selectedDate || !selectedTime;
      case 3:
        return !customerDetails.name || !customerDetails.phone;
      default:
        return false;
    }
  };

  const getSelectedService = () => {
    return serviceData.find((service) => service.id === selectedService);
  };

  const getSelectedStaff = () => {
    return staffData.find((staff) => staff.id === selectedStaff);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center text-white">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: 'url(https://images.pexels.com/photos/3998429/pexels-photo-3998429.jpeg)',
          }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Book Your Appointment</h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto">
            Schedule your next grooming experience with our expert barbers
          </p>
        </div>
      </section>

      {/* Booking Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted" />
                
                <div className="flex items-center justify-between relative w-full">
                  {steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={cn(
                        'flex flex-col items-center relative bg-background px-3',
                        index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                      )}
                    >
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full border-2 flex items-center justify-center mb-2 font-medium',
                          index <= currentStep
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-muted bg-background'
                        )}
                      >
                        {index + 1}
                      </div>
                      <span className="text-sm hidden md:block">{step.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step Content */}
            <Card>
              <CardContent className="p-6">
                {/* Step 1: Choose Service */}
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-semibold">Choose a Service</h2>
                      <p className="text-muted-foreground">
                        Select the service you'd like to book
                      </p>
                    </div>

                    <RadioGroup
                      value={selectedService || ''}
                      onValueChange={setSelectedService}
                      className="grid gap-4"
                    >
                      {serviceData.map((service) => (
                        <Label
                          key={service.id}
                          className={cn(
                            'flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors',
                            selectedService === service.id
                              ? 'border-primary bg-primary/5'
                              : 'hover:bg-muted/50'
                          )}
                        >
                          <div className="flex items-start gap-4">
                            <RadioGroupItem value={service.id} id={service.id} className="mt-1" />
                            <div>
                              <div className="font-medium">{service.name}</div>
                              <div className="text-sm text-muted-foreground max-w-md">
                                {service.description}
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-sm">
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                  <span>{service.duration} min</span>
                                </div>
                                <div className="font-medium">
                                  {formatCurrency(service.price)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {/* Step 2: Select Staff */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-semibold">Choose Your Barber</h2>
                      <p className="text-muted-foreground">
                        Select a staff member for your appointment
                      </p>
                    </div>

                    <RadioGroup
                      value={selectedStaff || ''}
                      onValueChange={setSelectedStaff}
                      className="grid gap-4"
                    >
                      {staffData.map((staff) => (
                        <Label
                          key={staff.id}
                          className={cn(
                            'flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors',
                            selectedStaff === staff.id
                              ? 'border-primary bg-primary/5'
                              : 'hover:bg-muted/50'
                          )}
                        >
                          <div className="flex items-start gap-4">
                            <RadioGroupItem value={staff.id} id={staff.id} className="mt-1" />
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
                              <div>
                                <div className="font-medium">{staff.name}</div>
                                <div className="text-sm text-muted-foreground">{staff.position}</div>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant={staff.isAvailable ? "default" : "outline"}>
                                    {staff.isAvailable ? 'Available' : 'Unavailable'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {/* Step 3: Pick Date & Time */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-semibold">Choose Date & Time</h2>
                      <p className="text-muted-foreground">
                        Select your preferred appointment date and time
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label className="mb-2 block">Date</Label>
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          className="border rounded-md"
                          disabled={(date) => {
                            // Disable past dates and Sundays
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today || date.getDay() === 0;
                          }}
                        />
                      </div>

                      <div>
                        <Label className="mb-2 block">Time</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {timeSlots.map((time) => (
                            <Button
                              key={time}
                              variant={selectedTime === time ? "default" : "outline"}
                              className="w-full"
                              onClick={() => setSelectedTime(time)}
                            >
                              {format(new Date(`2000-01-01T${time}`), 'h:mm a')}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Customer Details */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-semibold">Your Details</h2>
                      <p className="text-muted-foreground">
                        Please provide your contact information
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={customerDetails.name}
                          onChange={(e) =>
                            setCustomerDetails({ ...customerDetails, name: e.target.value })
                          }
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="email">Email (Optional)</Label>
                        <Input
                          id="email"
                          type="email"
                          value={customerDetails.email}
                          onChange={(e) =>
                            setCustomerDetails({ ...customerDetails, email: e.target.value })
                          }
                          placeholder="Enter your email address"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={customerDetails.phone}
                          onChange={(e) =>
                            setCustomerDetails({ ...customerDetails, phone: e.target.value })
                          }
                          placeholder="Enter your phone number"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Input
                          id="notes"
                          value={customerDetails.notes}
                          onChange={(e) =>
                            setCustomerDetails({ ...customerDetails, notes: e.target.value })
                          }
                          placeholder="Any special requests or notes"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5: Confirmation */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-semibold">Confirm Your Booking</h2>
                      <p className="text-muted-foreground">
                        Please review your appointment details
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                          <Scissors className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <div className="font-medium">Service</div>
                            <div className="text-sm text-muted-foreground">
                              {getSelectedService()?.name}
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span>{getSelectedService()?.duration} min</span>
                              </div>
                              <div className="font-medium">
                                {formatCurrency(getSelectedService()?.price || 0)}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                          <User className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <div className="font-medium">Staff</div>
                            <div className="text-sm text-muted-foreground">
                              {getSelectedStaff()?.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {getSelectedStaff()?.position}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                          <CalendarIcon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <div className="font-medium">Date & Time</div>
                            <div className="text-sm text-muted-foreground">
                              {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {selectedTime && format(new Date(`2000-01-01T${selectedTime}`), 'h:mm a')}
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
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
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={handleNext} disabled={isNextDisabled()}>
                    {currentStep === steps.length - 1 ? (
                      'Confirm Booking'
                    ) : (
                      <>
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};