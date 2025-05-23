import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookingProvider, useBooking } from './BookingContext';
import { ServiceStaffTabs } from './steps/ServiceStaffTabs';
import { DateTimeSelection } from './steps/DateTimeSelection';
import { CustomerDetails } from './steps/CustomerDetails';
import { BookingConfirmation } from './steps/BookingConfirmation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Calendar, CheckCircle2, Info, Scissors } from 'lucide-react';
import { formatCurrency } from '@/utils';

const BookingContent: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { selectedServices, totalPrice } = useBooking();

  const steps = [
    { id: 'selection', title: 'Services & Staff', icon: Scissors, component: ServiceStaffTabs },
    { id: 'datetime', title: 'Pick Date & Time', icon: Calendar, component: DateTimeSelection },
    { id: 'details', title: 'Your Details', icon: Info, component: CustomerDetails },
    { id: 'confirm', title: 'Confirm', icon: CheckCircle2, component: BookingConfirmation },
  ];

  const CurrentStepComponent = steps[currentStep].component;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <section className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Book an Appointment</h1>
          <p className="text-muted-foreground">
            Schedule your next visit with us
          </p>
        </div>

        {/* Desktop Step Indicators */}
        <div className="hidden md:block relative mb-8">
          <div className="absolute left-0 top-[38px] w-full">
            <div className="h-1 bg-muted w-full absolute"></div>
            <motion.div 
              className="h-1 bg-primary absolute"
              initial={{ width: '0%' }}
              animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            ></motion.div>
          </div>
          
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

        {/* Mobile Step Indicator */}
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

        <div className="relative">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-card border rounded-lg p-6"
          >
            <div className="space-y-6">
              <CurrentStepComponent onNext={handleNext} onBack={handleBack} />

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