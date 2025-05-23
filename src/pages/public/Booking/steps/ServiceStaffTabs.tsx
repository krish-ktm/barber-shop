import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceSelection } from './ServiceSelection';
import { StaffSelection } from './StaffSelection';
import { useBooking } from '../BookingContext';

interface ServiceStaffTabsProps {
  onNext: () => void;
  onBack: () => void;
}

export const ServiceStaffTabs: React.FC<ServiceStaffTabsProps> = ({ onNext, onBack }) => {
  const { 
    selectedServices, 
    selectedStaffId, 
    firstSelection, 
    setFirstSelection 
  } = useBooking();
  const [activeTab, setActiveTab] = useState<string>("services");

  // Handle automatic tab switching based on selection
  useEffect(() => {
    if (selectedServices.length > 0 && !firstSelection) {
      setFirstSelection('service');
    } else if (selectedStaffId && !firstSelection) {
      setFirstSelection('staff');
    }

    // Switch to staff tab after service selection
    if (selectedServices.length > 0 && firstSelection === 'service' && !selectedStaffId) {
      setActiveTab('staff');
    }
    // Switch to services tab after staff selection
    else if (selectedStaffId && firstSelection === 'staff' && selectedServices.length === 0) {
      setActiveTab('services');
    }
  }, [selectedServices, selectedStaffId, firstSelection, setFirstSelection]);

  // Determine if we can proceed to next step
  const canProceed = selectedServices.length > 0 && selectedStaffId;

  // Auto-proceed to next step when both selections are made
  useEffect(() => {
    if (canProceed) {
      onNext();
    }
  }, [canProceed, onNext]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Choose Services & Staff</h2>
        <p className="text-muted-foreground">
          {firstSelection === 'service' 
            ? "Select your desired services, then choose your preferred staff member"
            : firstSelection === 'staff'
            ? "Select your preferred staff member, then choose your desired services"
            : "Select your desired services and preferred staff member"}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="services">
            Services {selectedServices.length > 0 && `(${selectedServices.length})`}
          </TabsTrigger>
          <TabsTrigger value="staff">
            Staff {selectedStaffId && '(1)'}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="services" className="mt-6">
          <ServiceSelection onNext={() => setActiveTab('staff')} onBack={onBack} />
        </TabsContent>
        <TabsContent value="staff" className="mt-6">
          <StaffSelection onNext={onNext} onBack={() => setActiveTab('services')} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}; 