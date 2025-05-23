import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { serviceData, staffData } from '@/mocks';
import { formatCurrency } from '@/utils';
import { useBooking } from '../BookingContext';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ServiceSelectionProps {
  onNext: () => void;
  onBack: () => void;
}

export const ServiceSelection: React.FC<ServiceSelectionProps> = () => {
  const { selectedServices, setSelectedServices, selectedStaffId, bookingFlow } = useBooking();
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  // Get available services based on selected staff if in staff-first flow
  const availableServices = bookingFlow === 'staff-first' && selectedStaffId
    ? serviceData.filter(service => 
        staffData.find(staff => staff.id === selectedStaffId)?.services.includes(service.id)
      )
    : serviceData;

  // Group services by category
  const groupedServices = availableServices.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, typeof serviceData>);

  const handleServiceToggle = (service: typeof serviceData[0]) => {
    setSelectedServices(
      selectedServices.some(s => s.id === service.id)
        ? selectedServices.filter(s => s.id !== service.id)
        : [...selectedServices, service]
    );
  };

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getSelectedServicesCount = (category: string) => {
    return selectedServices.filter(service => service.category === category).length;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Choose Your Services</h2>
        <p className="text-muted-foreground">
          {bookingFlow === 'staff-first' 
            ? `Select from services offered by your chosen staff member`
            : 'Select one or more services you\'d like to book'}
        </p>
      </div>

      <motion.div 
        variants={{
          animate: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        initial="initial"
        animate="animate"
        className="space-y-4"
      >
        {Object.entries(groupedServices).map(([category, services]) => {
          const selectedCount = getSelectedServicesCount(category);
          return (
            <Collapsible
              key={category}
              open={openCategories[category]}
              onOpenChange={() => toggleCategory(category)}
              className="border rounded-lg"
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <span className="font-medium capitalize">
                    {category}
                  </span>
                  {selectedCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedCount} selected
                    </Badge>
                  )}
                </div>
                {openCategories[category] ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 pt-0">
                <div className="grid gap-2">
                  {services.map((service) => (
                    <motion.div
                      key={service.id}
                      variants={{
                        initial: { opacity: 0, y: 20 },
                        animate: { opacity: 1, y: 0 }
                      }}
                    >
                      <Button
                        variant={selectedServices.some(s => s.id === service.id) ? "default" : "outline"}
                        className="w-full justify-between group"
                        onClick={() => handleServiceToggle(service)}
                      >
                        <div className="flex items-center gap-2">
                          <span>{service.name}</span>
                          <span className={`text-sm ${
                            selectedServices.some(s => s.id === service.id)
                              ? "text-primary-foreground/80"
                              : "text-muted-foreground"
                          }`}>
                            {service.duration} min
                          </span>
                        </div>
                        <span className={selectedServices.some(s => s.id === service.id) ? "text-primary-foreground" : "text-muted-foreground"}>
                          {formatCurrency(service.price)}
                        </span>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </motion.div>
    </motion.div>
  );
};