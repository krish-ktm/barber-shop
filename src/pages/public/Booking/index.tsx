import React, { useState } from 'react';
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

const steps = [
  { id: 'service', title: 'Choose Services', icon: Scissors, component: ServiceSelection },
  { id: 'staff', title: 'Select Staff', icon: User, component: StaffSelection },
  { id: 'datetime', title: 'Pick Date & Time', icon: Calendar, component: DateTimeSelection },
  { id: 'details', title: 'Your Details', icon: Info, component: CustomerDetails },
  { id: 'confirm', title: 'Confirm', icon: CheckCircle2, component: BookingConfirmation },
];

const BookingContent: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { selectedServices, totalPrice } = useBooking();

  const CurrentStepComponent = steps[currentStep].component;

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
            Choose your services and preferred time slot
          </p>
        </div>
      </motion.section>

      <section className="py-8 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
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
                    {currentStep === 0 && selectedServices.length > 0 && (
                      <div className="text-right">
                        <div className="font-medium">Selected Services ({selectedServices.length})</div>
                        <div className="text-sm text-muted-foreground">
                          Total: {formatCurrency(totalPrice)}
                        </div>
                      </div>
                    )}

                    {currentStep < steps.length - 1 && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          onClick={handleNext}
                          disabled={currentStep === 0 && selectedServices.length === 0}
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