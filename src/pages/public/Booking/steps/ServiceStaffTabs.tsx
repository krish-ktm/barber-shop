import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceSelection } from './ServiceSelection';
import { StaffSelection } from './StaffSelection';
import { useBooking } from '../BookingContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ServiceStaffTabsProps {
  onNext: () => void;
  onBack: () => void;
}

export const ServiceStaffTabs: React.FC<ServiceStaffTabsProps> = ({ onNext, onBack }) => {
  const { 
    selectedServices, 
    selectedStaffId, 
    firstSelection, 
    setFirstSelection,
    setBookingFlow,
    setSelectedServices,
    setSelectedStaffId
  } = useBooking();
  const [activeTab, setActiveTab] = useState<string>("services");
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Handle tab selection
  const handleTabChange = (value: string) => {
    // If we have selections and are changing tabs, show confirmation
    if ((value === 'services' && selectedStaffId) || 
        (value === 'staff' && selectedServices.length > 0)) {
      setShowConfirmation(true);
    } else {
      completeTabChange(value);
    }
  };

  // Completes the tab change after confirmation or when no confirmation is needed
  const completeTabChange = (value: string) => {
    if (value === 'services') {
      setFirstSelection('service');
      setSelectedStaffId(null); // Clear selected staff when switching to services tab
    } else if (value === 'staff') {
      setFirstSelection('staff');
      setSelectedServices([]); // Clear selected services when switching to staff tab
    }
    
    setActiveTab(value);
    setShowConfirmation(false);
  };

  // Handle cancellation of tab change
  const handleCancelTabChange = () => {
    setShowConfirmation(false);
  };

  // Handle "Next" button click
  const handleNext = () => {
    // Set the booking flow based on current selection
    if (activeTab === 'services' && selectedServices.length > 0) {
      setBookingFlow('service-first');
      onNext(); // Proceed to next step
    } else if (activeTab === 'staff' && selectedStaffId) {
      setBookingFlow('staff-first');
      onNext(); // Proceed to next step
    }
  };

  // Determine if we can proceed to next step
  const canProceed = 
    (activeTab === 'services' && selectedServices.length > 0) ||
    (activeTab === 'staff' && selectedStaffId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Choose Your Booking Method</h2>
        <p className="text-muted-foreground">
          Select a service or choose your preferred staff member to start
        </p>
      </div>

      {showConfirmation && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Changing tabs will clear your current selections. Are you sure?
          </AlertDescription>
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancelTabChange}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => completeTabChange(activeTab === 'services' ? 'staff' : 'services')}
            >
              Continue
            </Button>
          </div>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="services">
            By Service {selectedServices.length > 0 && `(${selectedServices.length})`}
          </TabsTrigger>
          <TabsTrigger value="staff">
            By Staff {selectedStaffId && '(1)'}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="services" className="mt-6">
          <ServiceSelection />
        </TabsContent>
        <TabsContent value="staff" className="mt-6">
          <StaffSelection />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-6">
        <Button 
          onClick={handleNext}
          disabled={!canProceed}
        >
          Next Step
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}; 