import React from 'react';
import { motion } from 'framer-motion';
import { useBooking } from '../BookingContext';
import { ServiceSelection } from './ServiceSelection';
import { StaffSelection } from './StaffSelection';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface SecondSelectionStepProps {
  onNext: () => void;
  onBack: () => void;
}

export const SecondSelectionStep: React.FC<SecondSelectionStepProps> = ({ onNext, onBack }) => {
  const { 
    bookingFlow, 
    selectedServices, 
    selectedStaffId,
    setBookingFlow
  } = useBooking();

  // Determine if we can move to the next step
  const canProceed = 
    (bookingFlow === 'service-first' && selectedStaffId) ||
    (bookingFlow === 'staff-first' && selectedServices.length > 0);

  // Handle going back to the first step
  const handleBack = () => {
    setBookingFlow(null); // Reset the booking flow
    onBack(); // Go back to previous step
  };

  const renderServiceFirstFlow = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Choose Your Barber</h2>
          <p className="text-muted-foreground">
            Select a staff member who can perform your chosen services
          </p>
        </div>
        <StaffSelection hideHeading={true} />
      </div>
    );
  };

  const renderStaffFirstFlow = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Choose Services</h2>
          <p className="text-muted-foreground">
            Select services you'd like to book with your chosen staff member
          </p>
        </div>
        <ServiceSelection hideHeading={true} />
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {bookingFlow === 'service-first' ? renderServiceFirstFlow() : renderStaffFirstFlow()}

      <div className="flex justify-between items-center mt-6">
        <Button 
          variant="outline"
          onClick={handleBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <Button 
          onClick={onNext}
          disabled={!canProceed}
        >
          Next Step
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}; 