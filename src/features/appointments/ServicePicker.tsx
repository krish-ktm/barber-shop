import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { serviceData } from '@/mocks';
import { ChevronDown, ChevronRight, Trash } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { formatCurrency } from '@/utils';

interface ServicePickerProps {
  selectedServices: string[];
  onServiceSelect: (serviceId: string) => void;
}

export const ServicePicker: React.FC<ServicePickerProps> = ({ 
  selectedServices,
  onServiceSelect,
}) => {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  // Get unique categories from services
  const categories = Array.from(new Set(serviceData.map(service => service.category)));

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getSelectedServicesCount = (category: string) => {
    return selectedServices.filter(serviceId => {
      const selectedService = serviceData.find(s => s.id === serviceId);
      return selectedService?.category === category;
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
                  {serviceData
                    .filter(s => s.category === category)
                    .map((s) => {
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
            const selectedService = serviceData.find(s => s.id === serviceId);
            if (!selectedService) return null;
            
            return (
              <div key={serviceId} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span>{selectedService.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {selectedService.category}
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