import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Trash } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { formatCurrency } from '@/utils';
import { Service } from '@/api/services/appointmentService';

interface ServicePickerProps {
  selectedServices: string[];
  onServiceSelect: (serviceId: string) => void;
  serviceList: Service[];
}

export const ServicePicker: React.FC<ServicePickerProps> = ({ 
  selectedServices,
  onServiceSelect,
  serviceList
}) => {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  // For the API services that don't have categories, we'll group them all as "Other"
  const categories = ['Other']; // Default to a single category if no categories are defined

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getSelectedServicesCount = (category: string) => {
    // For this implementation, we return the total count regardless of category
    // since we're not using categories from the API
    return selectedServices.filter(serviceId => {
      const selectedService = serviceList.find(s => s.id === serviceId);
      return selectedService !== undefined;
    }).length;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {categories.map((category) => {
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
              <CollapsibleContent className="p-2">
                <div className="grid gap-2">
                  {serviceList.map((s) => {
                    const isSelected = selectedServices.includes(s.id);
                    return (
                      <Button
                        key={s.id}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        className="w-full justify-between group"
                        onClick={() => onServiceSelect(s.id)}
                      >
                        <span>{s.name}</span>
                        <span className={isSelected ? "text-primary-foreground" : "text-muted-foreground"}>
                          {formatCurrency(s.price)}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>

      {selectedServices.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="text-sm font-medium">Selected Services</div>
          {selectedServices.map((serviceId) => {
            const selectedService = serviceList.find(s => s.id === serviceId);
            if (!selectedService) return null;
            
            return (
              <div key={serviceId} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span>{selectedService.name}</span>
                  <span className="text-xs text-muted-foreground">
                    Services
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">
                    {formatCurrency(selectedService.price)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onServiceSelect(serviceId)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}; 