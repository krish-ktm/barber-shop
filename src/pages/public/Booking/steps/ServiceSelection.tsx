import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useBooking } from '../BookingContext';
import { Button } from '@/components/ui/button';
import { serviceData, staffData } from '@/mocks';
import { ChevronDown, ChevronRight, Clock } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils';

export const ServiceSelection: React.FC = () => {
  const { selectedServices, setSelectedServices, selectedStaffId, bookingFlow } = useBooking();
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  // Filter services based on selected staff if in staff-first flow
  const filteredServices = bookingFlow === 'staff-first' && selectedStaffId
    ? serviceData.filter(service => {
        const selectedStaff = staffData.find(staff => staff.id === selectedStaffId);
        return selectedStaff ? selectedStaff.services.includes(service.id) : false;
      })
    : serviceData;

  // Group services by category
  const groupedServices = filteredServices.reduce((acc, service) => {
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
          Select one or more services you'd like to book
        </p>
      </div>

      {Object.keys(groupedServices).length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No services available for the selected staff member.
            Please choose a different staff member.
          </p>
        </div>
      ) : (
        Object.entries(groupedServices).map(([category, services]) => {
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
                  <span className="font-medium">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </span>
                  {selectedCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                      {selectedCount}
                    </span>
                  )}
                </div>
                {openCategories[category] ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
                  {services.map((service) => {
                    const isSelected = selectedServices.some(s => s.id === service.id);
                    return (
                      <Button
                        key={service.id}
                        variant={isSelected ? "default" : "outline"}
                        className={`w-full p-3 h-auto text-left flex flex-col ${isSelected ? "" : "hover:border-primary/50"}`}
                        onClick={() => handleServiceToggle(service)}
                      >
                        <div className="flex items-start justify-between w-full">
                          <div className="flex flex-col">
                            <span className="font-medium truncate max-w-[180px] sm:max-w-[250px]">{service.name}</span>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                              <span className="text-xs text-muted-foreground">{service.duration} min</span>
                            </div>
                          </div>
                          <span className={`text-base font-medium shrink-0 ${isSelected ? "text-primary-foreground" : ""}`}>
                            {formatCurrency(service.price)}
                          </span>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })
      )}
    </motion.div>
  );
};