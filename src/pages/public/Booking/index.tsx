import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookingProvider, useBooking } from './BookingContext';
import { ServiceSelection } from './steps/ServiceSelection';
import { StaffSelection } from './steps/StaffSelection';
import { DateTimeSelection } from './steps/DateTimeSelection';
import { CustomerDetails } from './steps/CustomerDetails';
import { BookingConfirmation } from './steps/BookingConfirmation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Calendar, CheckCircle2, Info, Scissors, User } from 'lucide-react';
import { formatCurrency } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const BookingContent: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { 
    selectedServices, 
    selectedStaffId,
    totalPrice, 
    bookingFlow, 
    setBookingFlow,
    setSelectedServices,
    setSelectedStaffId
  } = useBooking();

  // Reset function for changing flow
  const resetSelection = () => {
    setSelectedServices([]);
    setSelectedStaffId(null);
    setCurrentStep(0);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      // Scroll to top on mobile when changing steps
      if (window.innerWidth < 768) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // Scroll to top on mobile when changing steps
      if (window.innerWidth < 768) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const steps = bookingFlow === 'service-first' 
    ? [
        { id: 'service', title: 'Choose Services', icon: Scissors, component: ServiceSelection },
        { id: 'staff', title: 'Select Staff', icon: User, component: StaffSelection },
        { id: 'datetime', title: 'Pick Date & Time', icon: Calendar, component: DateTimeSelection },
        { id: 'details', title: 'Your Details', icon: Info, component: CustomerDetails },
        { id: 'confirm', title: 'Confirm', icon: CheckCircle2, component: BookingConfirmation },
      ]
    : [
        { id: 'staff', title: 'Select Staff', icon: User, component: StaffSelection },
        { id: 'service', title: 'Choose Services', icon: Scissors, component: ServiceSelection },
        { id: 'datetime', title: 'Pick Date & Time', icon: Calendar, component: DateTimeSelection },
        { id: 'details', title: 'Your Details', icon: Info, component: CustomerDetails },
        { id: 'confirm', title: 'Confirm', icon: CheckCircle2, component: BookingConfirmation },
      ];

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div>
      {/* Hero Section */}
      <motion.section 
        className="relative h-[30vh] md:h-[40vh] flex items-center justify-center text-white"
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
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Book Your Appointment</h1>
          <p className="text-lg md:text-xl text-gray-200">
            Choose your preferred booking method below
          </p>
        </div>
      </motion.section>

      <section className="py-8 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Booking Flow Selection */}
            {currentStep === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold text-center mb-4">How would you like to book?</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant={bookingFlow === 'service-first' ? 'default' : 'outline'}
                          className="w-full h-auto p-6 flex flex-col items-center gap-4"
                          onClick={() => {
                            if (bookingFlow !== 'service-first') {
                              setBookingFlow('service-first');
                              resetSelection();
                            }
                          }}
                        >
                          <Scissors className="h-8 w-8" />
                          <div className="space-y-2 text-center">
                            <div className="font-semibold">Choose Service First</div>
                            <p className="text-sm opacity-80">
                              Browse our services and find the perfect staff member for your needs
                            </p>
                          </div>
                        </Button>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant={bookingFlow === 'staff-first' ? 'default' : 'outline'}
                          className="w-full h-auto p-6 flex flex-col items-center gap-4"
                          onClick={() => {
                            if (bookingFlow !== 'staff-first') {
                              setBookingFlow('staff-first');
                              resetSelection();
                            }
                          }}
                        >
                          <User className="h-8 w-8" />
                          <div className="space-y-2 text-center">
                            <div className="font-semibold">Choose Staff First</div>
                            <p className="text-sm opacity-80">
                              Select your preferred staff member and see their available services
                            </p>
                          </div>
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Progress Steps - Mobile */}
            <div className="md:hidden mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    {currentStep + 1}
                  </div>
                  <span className="font-medium">{steps[currentStep].title}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Step {currentStep + 1} of {steps.length}
                </div>
              </div>
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <motion.div 
                  className="absolute left-0 top-0 h-full bg-primary"
                  initial={{ width: '0%' }}
                  animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </div>
            </div>

            {/* Progress Steps - Desktop */}
            <div className="hidden md:block mb-12">
              <div className="relative">
                {/* Progress Bar */}
                <div className="absolute left-0 top-[38px] w-full">
                  <div className="h-1 bg-muted w-full absolute"></div>
                  <motion.div 
                    className="h-1 bg-primary absolute"
                    initial={{ width: '0%' }}
                    animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  ></motion.div>
                </div>
                
                {/* Steps */}
                <div className="flex items-center justify-between relative w-full">
                  {steps.map((step, index) => {
                    const StepIcon = step.icon;
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;
                    const isClickable = index <= currentStep;
                    
                    return (
                      <motion.div
                        key={step.id}
                        className={`flex flex-col items-center relative z-10 ${
                          isActive ? 'text-primary' :
                          isCompleted ? 'text-primary' :
                          'text-muted-foreground'
                        }`}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => isClickable && setCurrentStep(index)}
                        style={{ cursor: isClickable ? 'pointer' : 'default' }}
                      >
                        <div className="mb-2 px-1.5 py-1 rounded-full bg-background">
                          <motion.div
                            className={`w-14 h-14 rounded-full border-2 flex items-center justify-center shadow-sm ${
                              isActive
                                ? 'border-primary bg-primary/10 text-primary'
                                : isCompleted
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-muted bg-muted/20'
                            }`}
                            whileHover={isClickable ? { scale: 1.05, boxShadow: '0 0 0 4px rgba(var(--primary), 0.2)' } : {}}
                            whileTap={isClickable ? { scale: 0.98 } : {}}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-6 w-6" />
                            ) : (
                              <>
                                <StepIcon className="h-6 w-6" />
                                <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                  {index + 1}
                                </span>
                              </>
                            )}
                          </motion.div>
                        </div>
                        
                        <div className="text-center space-y-1">
                          <span className="text-sm font-medium block">{step.title}</span>
                          <span className="text-xs text-muted-foreground block">
                            {index === 0 ? 'Start' :
                              index === steps.length - 1 ? 'Finish' :
                              `Step ${index + 1}`}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step Content */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-card border rounded-lg p-4 md:p-6 shadow-sm mb-20"
            >
              <CurrentStepComponent onNext={handleNext} onBack={handleBack} />
            </motion.div>

            {/* Navigation */}
            <motion.div 
              className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="container mx-auto max-w-4xl">
                <div className="flex items-center justify-between gap-4">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>

                  <div className="flex items-center gap-6 flex-1 justify-end">
                    {currentStep === 0 && (
                      bookingFlow === 'service-first' ? (
                        selectedServices.length > 0 && (
                          <div className="text-right">
                            <div className="font-medium">Selected Services ({selectedServices.length})</div>
                            <div className="text-sm text-muted-foreground">
                              Total: {formatCurrency(totalPrice)}
                            </div>
                          </div>
                        )
                      ) : (
                        selectedStaffId && (
                          <div className="text-right">
                            <div className="font-medium">Staff Selected</div>
                            <div className="text-sm text-muted-foreground">
                              Ready to choose services
                            </div>
                          </div>
                        )
                      )
                    )}

                    {currentStep === 1 && (
                      bookingFlow === 'service-first' ? (
                        selectedStaffId && (
                          <div className="text-right">
                            <div className="font-medium">Staff Selected</div>
                            <div className="text-sm text-muted-foreground">
                              Ready for date & time
                            </div>
                          </div>
                        )
                      ) : (
                        selectedServices.length > 0 && (
                          <div className="text-right">
                            <div className="font-medium">Selected Services ({selectedServices.length})</div>
                            <div className="text-sm text-muted-foreground">
                              Total: {formatCurrency(totalPrice)}
                            </div>
                          </div>
                        )
                      )
                    )}

                    {currentStep < steps.length - 1 && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          onClick={handleNext}
                          disabled={
                            (currentStep === 0 && bookingFlow === 'service-first' && selectedServices.length === 0) ||
                            (currentStep === 0 && bookingFlow === 'staff-first' && !selectedStaffId) ||
                            (currentStep === 1 && bookingFlow === 'service-first' && !selectedStaffId) ||
                            (currentStep === 1 && bookingFlow === 'staff-first' && selectedServices.length === 0)
                          }
                        >
                          Next
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export const Booking: React.FC = () => {
  return (
    <BookingProvider>
      <BookingContent />
    </BookingProvider>
  );
};