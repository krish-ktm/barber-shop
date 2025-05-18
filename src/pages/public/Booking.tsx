import React, { useState } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {   ArrowRight,   ArrowLeft,   Calendar as CalendarIcon,   Clock,   User,   Scissors,  CheckCircle2,  Info,  Star,  Clock3,  BadgeCheck} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Separator } from '@/components/ui/separator';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { staffData, serviceData } from '@/mocks';
import { createTimeSlots, formatCurrency } from '@/utils';
import { useToast } from '@/hooks/use-toast';

const steps = [
  { id: 'service', title: 'Choose Service', icon: Scissors },
  { id: 'staff', title: 'Select Staff', icon: User },
  { id: 'datetime', title: 'Pick Date & Time', icon: CalendarIcon },
  { id: 'details', title: 'Your Details', icon: Info },
  { id: 'confirm', title: 'Confirm', icon: CheckCircle2 },
];

// Animation variants
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const slideIn = {
  initial: { x: 20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -20, opacity: 0 }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

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
        title: 'Booking Confirmed! 🎉',
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

  // Group services by category
  const groupedServices = serviceData.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, typeof serviceData>);

  return (
    <div>
      {/* Hero Section */}
      <motion.section 
        className="relative h-[40vh] flex items-center justify-center text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: 'url(https://images.pexels.com/photos/3998429/pexels-photo-3998429.jpeg)',
          }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Book Your Appointment
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl max-w-2xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Schedule your next grooming experience with our expert barbers
          </motion.p>
        </div>
      </motion.section>

      {/* Booking Section */}
      <section className="py-12 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Progress Steps */}
            <div className="mb-12">
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted" />
                
                <div className="flex items-center justify-between relative w-full">
                  {steps.map((step, index) => {
                    const StepIcon = step.icon;
                    return (
                      <motion.div
                        key={step.id}
                        className={cn(
                          'flex flex-col items-center relative bg-background px-3',
                          index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                        )}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <motion.div
                          className={cn(
                            'w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2',
                            index <= currentStep
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-muted bg-background'
                          )}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <StepIcon className="h-5 w-5" />
                        </motion.div>
                        <span className="text-sm font-medium hidden md:block">{step.title}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step Content */}
            <Card className="border-2">
              <CardContent className="p-6 md:p-8">
                <AnimatePresence mode="wait">
                  {/* Step 1: Choose Service */}
                  {currentStep === 0 && (
                    <motion.div
                      key="step-1"
                      {...fadeIn}
                      transition={{ duration: 0.4 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <h2 className="text-2xl font-semibold">Choose a Service</h2>
                        <p className="text-muted-foreground">
                          Select the service you'd like to book
                        </p>
                      </div>

                      <motion.div 
                        variants={staggerChildren}
                        initial="initial"
                        animate="animate"
                        className="space-y-8"
                      >
                        {Object.entries(groupedServices).map(([category, services]) => (
                          <div key={category} className="space-y-4">
                            <h3 className="text-lg font-semibold capitalize">{category}</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                              {services.map((service) => (
                                <motion.div
                                  key={service.id}
                                  variants={slideIn}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                                                    <label                                    className={cn(                                      'flex flex-col h-full p-4 rounded-lg border-2 cursor-pointer transition-all duration-200',                                      selectedService === service.id                                        ? 'border-primary bg-primary/5 shadow-lg'                                        : 'hover:border-primary/50 hover:bg-muted/50'                                    )}                                  >                                    <div className="flex items-start gap-4">                                      <input                                        type="radio"                                        value={service.id}                                        id={service.id}                                        className="mt-1"                                        checked={selectedService === service.id}                                        onChange={() => setSelectedService(service.id)}                                      />                                      <div className="flex-1">                                        <div className="flex items-start justify-between mb-2">                                          <div>                                            <div className="font-medium">{service.name}</div>                                            <div className="text-sm text-muted-foreground">                                              {service.description}                                            </div>                                          </div>                                          <Badge variant="secondary" className="ml-2 shrink-0">                                            {formatCurrency(service.price)}                                          </Badge>                                        </div>                                        <div className="flex items-center gap-4 mt-4">                                          <div className="flex items-center text-sm text-muted-foreground">                                            <Clock3 className="h-4 w-4 mr-1" />                                            {service.duration} min                                          </div>                                          <div className="flex items-center text-sm text-muted-foreground">                                            <Star className="h-4 w-4 mr-1" />                                            4.9                                          </div>                                          <div className="flex items-center text-sm text-muted-foreground">                                            <BadgeCheck className="h-4 w-4 mr-1" />                                            Popular                                          </div>                                        </div>                                      </div>                                    </div>                                  </label>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Step 2: Select Staff */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step-2"
                      {...fadeIn}
                      transition={{ duration: 0.4 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <h2 className="text-2xl font-semibold">Choose Your Barber</h2>
                        <p className="text-muted-foreground">
                          Select a staff member for your appointment
                        </p>
                      </div>

                      <motion.div
                        variants={staggerChildren}
                        initial="initial"
                        animate="animate"
                        className="grid md:grid-cols-2 gap-4"
                      >
                        {staffData.map((staff) => (
                          <motion.div
                            key={staff.id}
                            variants={slideIn}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                                                        <label                              className={cn(                                'flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all duration-200',                                selectedStaff === staff.id                                  ? 'border-primary bg-primary/5 shadow-lg'                                  : 'hover:border-primary/50 hover:bg-muted/50'                              )}                            >                              <input                                type="radio"                                value={staff.id}                                id={staff.id}                                className="mt-1 mr-4"                                checked={selectedStaff === staff.id}                                onChange={() => setSelectedStaff(staff.id)}                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-4 mb-3">
                                  <Avatar className="h-12 w-12">
                                    <AvatarImage src={staff.image} alt={staff.name} />
                                    <AvatarFallback>
                                      {staff.name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{staff.name}</div>
                                    <div className="text-sm text-muted-foreground">{staff.position}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant={staff.isAvailable ? "default" : "secondary"}>
                                        {staff.isAvailable ? 'Available' : 'Unavailable'}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">{staff.bio}</p>
                              </div>
                            </label>
                          </motion.div>
                        ))}
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Step 3: Pick Date & Time */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step-3"
                      {...fadeIn}
                      transition={{ duration: 0.4 }}
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
                          variants={slideIn}
                          initial="initial"
                          animate="animate"
                        >
                          <Label className="mb-3 block">Select Date</Label>
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="border rounded-md"
                            disabled={(date) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              return date < today || date.getDay() === 0;
                            }}
                          />
                        </motion.div>

                        <motion.div
                          variants={slideIn}
                          initial="initial"
                          animate="animate"
                          transition={{ delay: 0.2 }}
                        >
                          <Label className="mb-3 block">Select Time</Label>
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
                                          className={cn(
                                            "w-full",
                                            !isAvailable && "opacity-50 cursor-not-allowed"
                                          )}
                                          onClick={() => isAvailable && setSelectedTime(time)}
                                          disabled={!isAvailable}
                                        >
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
                        </motion.div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Customer Details */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step-4"
                      {...fadeIn}
                      transition={{ duration: 0.4 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <h2 className="text-2xl font-semibold">Your Details</h2>
                        <p className="text-muted-foreground">
                          Please provide your contact information
                        </p>
                      </div>

                      <motion.div 
                        className="space-y-4"
                        variants={staggerChildren}
                        initial="initial"
                        animate="animate"
                      >
                        <motion.div variants={slideIn} className="grid gap-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={customerDetails.name}
                            onChange={(e) =>
                              setCustomerDetails({ ...customerDetails, name: e.target.value })
                            }
                            placeholder="Enter your full name"
                          />
                        </motion.div>

                        <motion.div variants={slideIn} className="grid gap-2">
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
                        </motion.div>

                        <motion.div variants={slideIn} className="grid gap-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={customerDetails.phone}
                            onChange={(e) =>
                              setCustomerDetails({ ...customerDetails, phone: e.target.value })
                            }
                            placeholder="Enter your phone number"
                          />
                        </motion.div>

                        <motion.div variants={slideIn} className="grid gap-2">
                          <Label htmlFor="notes">Notes (Optional)</Label>
                          <Input
                            id="notes"
                            value={customerDetails.notes}
                            onChange={(e) =>
                              setCustomerDetails({ ...customerDetails, notes: e.target.value })
                            }
                            placeholder="Any special requests or notes"
                          />
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Step 5: Confirmation */}
                  {currentStep === 4 && (
                    <motion.div
                      key="step-5"
                      {...fadeIn}
                      transition={{ duration: 0.4 }}
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
                        variants={staggerChildren}
                        initial="initial"
                        animate="animate"
                      >
                        <motion.div variants={slideIn} className="space-y-4">
                          <motion.div
                            className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg"
                            whileHover={{ scale: 1.02 }}
                          >
                            <Scissors className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <div>
                              <div className="font-medium">Service</div>
                              <div className="text-sm text-muted-foreground">
                                {getSelectedService()?.name}
                              </div>
                              <div className="flex items-center gap-4 mt-1">
                                <Badge variant="secondary" className="font-normal">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {getSelectedService()?.duration} min
                                </Badge>
                                <Badge variant="secondary" className="font-normal">
                                  {formatCurrency(getSelectedService()?.price || 0)}
                                </Badge>
                              </div>
                            </div>
                          </motion.div>

                          <motion.div
                            className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg"
                            whileHover={{ scale: 1.02 }}
                          >
                            <User className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <div className="flex items-start gap-4">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={getSelectedStaff()?.image} />
                                <AvatarFallback>
                                  {getSelectedStaff()?.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{getSelectedStaff()?.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {getSelectedStaff()?.position}
                                </div>
                              </div>
                            </div>
                          </motion.div>

                          <motion.div
                            className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg"
                            whileHover={{ scale: 1.02 }}
                          >
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
                          </motion.div>

                          <Separator />

                          <motion.div variants={slideIn} className="space-y-2">
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
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <motion.div 
                  className="flex items-center justify-between mt-8 pt-6 border-t"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                                    <motion.div                    whileHover={{ scale: 1.05 }}                    whileTap={{ scale: 0.95 }}                  >                    <Button                       onClick={handleNext}                       disabled={isNextDisabled()}                    >
                                          {currentStep === steps.length - 1 ? (                        'Confirm Booking'                      ) : (                        <>                          Next                          <ArrowRight className="h-4 w-4 ml-2" />                        </>                      )}                    </Button>                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};